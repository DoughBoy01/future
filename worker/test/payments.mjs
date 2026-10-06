// End-to-end check of the booking + payment flow against a local Worker and a fake Stripe.
// Run: npm run test:payments
import { spawn, execFileSync } from 'node:child_process';
import { openSync } from 'node:fs';
import { createHmac } from 'node:crypto';
import { startFakeStripe } from './fake-stripe.mjs';

const WORKER = 'http://localhost:8799';
const SECRET = 'whsec_local_test_only';
const results = [];
const check = (name, ok, detail = '') => {
  results.push(ok);
  console.log(`${ok ? '  ✓' : '  ✗'} ${name}${ok ? '' : `  ← ${detail}`}`);
};

// The dev server closes idle keep-alive sockets while slow `wrangler d1` calls run; retry once on a stale one.
const http = async (url, init) => {
  try { return await fetch(url, init); } catch { return fetch(url, init); }
};
const d1 = (sql) =>
  JSON.parse(execFileSync('npx', ['wrangler', 'd1', 'execute', 'futureedge-db', '--local', '--json', '--command', sql], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }))[0].results;
const post = (path, body, headers = {}) =>
  http(WORKER + path, { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: typeof body === 'string' ? body : JSON.stringify(body) });

const sign = (payload) => {
  const t = Math.floor(Date.now() / 1000);
  return `t=${t},v1=${createHmac('sha256', SECRET).update(`${t}.${payload}`).digest('hex')}`;
};
const webhook = (event, signature) => {
  const payload = JSON.stringify(event);
  return post('/api/stripe/webhook', payload, { 'stripe-signature': signature ?? sign(payload) });
};
const completed = (session) => ({ id: `evt_${Math.random().toString(36).slice(2)}`, object: 'event', type: 'checkout.session.completed', data: { object: session } });

const stripe = await startFakeStripe(12111);
const worker = spawn('npx', ['wrangler', 'dev', '--port', '8799', '--inspector-port', '9339',
  '--var', 'STRIPE_SECRET_KEY:sk_test_fake', '--var', `STRIPE_WEBHOOK_SECRET:${SECRET}`, '--var', 'STRIPE_API_BASE:http://localhost:12111'], { stdio: ['ignore', openSync(process.env.WORKER_LOG ?? '/dev/null', 'w'), 'inherit'] });
const cleanup = () => { worker.kill(); stripe.close(); };
process.on('exit', cleanup);

for (let i = 0; i < 40; i++) {
  if (await fetch(WORKER + '/api/health').then((r) => r.ok).catch(() => false)) break;
  await new Promise((r) => setTimeout(r, 1000));
}

const [camp] = d1("select c.id, c.slug, c.capacity, c.enrolled, c.price_cents, c.organisation_id from camp c where c.status='published' and c.start_date > date('now') and c.capacity - c.enrolled >= 5 and c.early_bird_cents is null limit 1");
const [org] = d1(`select commission_rate, stripe_account_id, stripe_status from organisation where id='${camp.organisation_id}'`);
d1("delete from discount_code where code='TEST10'");
d1("insert into discount_code (id, code, kind, value, active, uses) values ('dc_test', 'TEST10', 'percent', 10, 1, 0)");

try {
  console.log('Config & pricing');
  check('payments enabled when a key is present', (await http(WORKER + '/api/config').then((r) => r.json())).paymentsEnabled === true);
  const q = await post('/api/bookings/quote', { campId: camp.id, quantity: 2, discountCode: 'test10' }).then((r) => r.json());
  check('quote applies 10% discount (case-insensitive code)', q.subtotalCents === camp.price_cents * 2 && q.totalCents === camp.price_cents * 2 - Math.round(camp.price_cents * 2 * 0.1), JSON.stringify(q));
  check('unknown discount code is rejected (422)', (await post('/api/bookings/quote', { campId: camp.id, quantity: 1, discountCode: 'NOPE' })).status === 422);

  console.log('Guest checkout (platform charge)');
  const attendees = [{ firstName: 'Ada', lastName: 'Lovelace', age: 9 }, { firstName: 'Alan', lastName: 'Lovelace', age: 11 }];
  const bad = await post('/api/bookings', { campId: camp.id, attendees });
  check('guest without contact details is rejected (400)', bad.status === 400);
  const res = await post('/api/bookings', { campId: camp.id, attendees, contact: { name: 'Grace Hopper', email: 'grace@example.test' }, discountCode: 'TEST10' });
  const made = await res.json();
  check('booking created, returns a checkout url', res.status === 201 && made.url?.startsWith('https://checkout.stripe.test/'), JSON.stringify(made));
  const call = stripe.calls.at(-1);
  const expectedTotal = camp.price_cents * 2 - Math.round(camp.price_cents * 2 * 0.1);
  check('Stripe charged the server-computed total (not client-supplied)', call?.body['line_items[0][price_data][unit_amount]'] === String(expectedTotal), JSON.stringify(call?.body));
  check('Stripe session carries the booking id', call?.body['metadata[bookingId]'] === made.bookingId);
  check('no application fee on a platform charge', !('payment_intent_data[application_fee_amount]' in (call?.body ?? {})) && !call?.headers['stripe-account']);
  let [b] = d1(`select status, total_cents, stripe_session_id from booking where id='${made.bookingId}'`);
  check('booking is pending with a session id until paid', b.status === 'pending' && !!b.stripe_session_id && b.total_cents === expectedTotal);
  const [{ n: enrolledBefore }] = d1(`select enrolled n from camp where id='${camp.id}'`);
  check('capacity not consumed before payment', enrolledBefore === camp.enrolled);

  console.log('Webhook security');
  const event = completed({ id: b.stripe_session_id, object: 'checkout.session', payment_status: 'paid', payment_intent: 'pi_test_1', metadata: { bookingId: made.bookingId } });
  check('rejects an event with no signature (400)', (await post('/api/stripe/webhook', JSON.stringify(event))).status === 400);
  check('rejects a forged signature (400)', (await webhook(event, `t=${Math.floor(Date.now() / 1000)},v1=${'0'.repeat(64)}`)).status === 400);
  [b] = d1(`select status from booking where id='${made.bookingId}'`);
  check('forged event did not confirm the booking', b.status === 'pending');

  console.log('Payment confirmation');
  check('valid signed event is accepted (200)', (await webhook(event)).status === 200);
  [b] = d1(`select status, paid_at, stripe_payment_intent_id from booking where id='${made.bookingId}'`);
  check('booking confirmed with payment intent recorded', b.status === 'confirmed' && b.paid_at && b.stripe_payment_intent_id === 'pi_test_1');
  const [{ n: enrolledAfter }] = d1(`select enrolled n from camp where id='${camp.id}'`);
  check('2 places taken', enrolledAfter === camp.enrolled + 2, `${camp.enrolled} → ${enrolledAfter}`);
  const [cm] = d1(`select rate, amount_cents, settlement from commission where booking_id='${made.bookingId}'`);
  check('commission recorded at the organisation rate (owed, platform charge)', cm && cm.rate === org.commission_rate && cm.amount_cents === Math.round(expectedTotal * org.commission_rate) && cm.settlement === 'owed_to_organisation', JSON.stringify(cm));
  check('discount use counted', d1("select uses from discount_code where code='TEST10'")[0].uses === 1);
  await webhook(event);
  check('replayed event changes nothing (idempotent)', d1(`select enrolled n from camp where id='${camp.id}'`)[0].n === camp.enrolled + 2 && d1(`select count(*) n from commission where booking_id='${made.bookingId}'`)[0].n === 1);

  console.log('Post-payment pages');
  const bySession = await http(`${WORKER}/api/bookings/by-session/${b.stripe_session_id ?? d1(`select stripe_session_id s from booking where id='${made.bookingId}'`)[0].s}`).then((r) => r.json());
  check('payment-success lookup by session id works', bySession.booking?.status === 'confirmed' && bySession.booking?.camp?.slug === camp.slug);
  const detail = await http(`${WORKER}/api/bookings/${made.bookingId}`).then((r) => r.json());
  check('guest can open their booking by id', detail.attendees?.length === 2);
  const put = await http(`${WORKER}/api/bookings/${made.bookingId}/attendees`, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ attendees: [{ id: detail.attendees[0].id, allergies: 'Peanuts', emergencyName: 'Charles', emergencyPhone: '+44 20 7946 0000', photoPermission: true }] }) });
  check('child details can be saved after payment', put.status === 200 && d1(`select allergies from attendee where id='${detail.attendees[0].id}'`)[0].allergies === 'Peanuts');
  const foreign = await http(`${WORKER}/api/bookings/${made.bookingId}/attendees`, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ attendees: [{ id: 'not-mine' }] }) });
  check('cannot edit an attendee that is not on this booking (400)', foreign.status === 400);
  check('someone else\'s signed-in booking list needs sign-in (401)', (await http(WORKER + '/api/bookings')).status === 401);

  console.log('Capacity & availability');
  const full = await post('/api/bookings', { campId: camp.id, attendees: Array.from({ length: 10 }, (_, i) => ({ firstName: `K${i}`, lastName: 'T' })).concat(Array.from({ length: 1 }, () => ({ firstName: 'X', lastName: 'Y' }))), contact: { name: 'N', email: 'n@example.test' } });
  check('more than 10 attendees is rejected (400)', full.status === 400);
  d1(`update camp set enrolled = capacity - 1 where id='${camp.id}'`);
  const over = await post('/api/bookings', { campId: camp.id, attendees, contact: { name: 'N', email: 'n@example.test' } });
  check('asking for more places than remain is rejected (409)', over.status === 409, await over.clone().text());
  d1(`update camp set enrolled = ${camp.enrolled + 2} where id='${camp.id}'`);

  console.log('Expiry');
  const m2 = await post('/api/bookings', { campId: camp.id, attendees: [attendees[0]], contact: { name: 'Exp', email: 'exp@example.test' } }).then((r) => r.json());
  const expiredEvt = { id: 'evt_exp', object: 'event', type: 'checkout.session.expired', data: { object: { id: 'x', object: 'checkout.session', metadata: { bookingId: m2.bookingId } } } };
  await webhook(expiredEvt);
  check('abandoned checkout is marked expired and frees nothing', d1(`select status from booking where id='${m2.bookingId}'`)[0].status === 'expired');

  console.log('Stripe Connect (direct charge)');
  d1(`update organisation set stripe_account_id='acct_test_123', stripe_status='active' where id='${camp.organisation_id}'`);
  const m3 = await post('/api/bookings', { campId: camp.id, attendees: [attendees[0]], contact: { name: 'Dir', email: 'dir@example.test' } }).then((r) => r.json());
  const dc = stripe.calls.at(-1);
  check('session created on the connected account', dc.headers['stripe-account'] === 'acct_test_123');
  check('platform fee = commission rate × total', dc.body['payment_intent_data[application_fee_amount]'] === String(Math.round(camp.price_cents * org.commission_rate)), JSON.stringify(dc.body));
  const [b3] = d1(`select charge_type, application_fee_cents from booking where id='${m3.bookingId}'`);
  check('booking records a direct charge and its fee', b3.charge_type === 'direct' && b3.application_fee_cents === Math.round(camp.price_cents * org.commission_rate));
} finally {
  d1(`update organisation set stripe_account_id=${org.stripe_account_id ? `'${org.stripe_account_id}'` : 'null'}, stripe_status='${org.stripe_status}' where id='${camp.organisation_id}'`);
  d1(`update camp set enrolled=${camp.enrolled} where id='${camp.id}'`);
  d1("delete from commission; delete from attendee; delete from booking; delete from discount_code where code='TEST10'");
  cleanup();
}

const failed = results.filter((r) => !r).length;
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exit(failed ? 1 : 0);
