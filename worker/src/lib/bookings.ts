import { and, eq, inArray, sql } from 'drizzle-orm';
import { attendee, booking, camp, commission, discountCode, organisation } from '../db/schema';
import type { Db } from './db';

/**
 * Marks a booking paid and does everything that follows from that, atomically.
 * Idempotent: Stripe redelivers events, and only the first call changes anything.
 * Returns true if this call confirmed the booking.
 */
export async function confirmBooking(
  db: Db,
  bookingId: string,
  payment: { sessionId: string; paymentIntentId: string | null },
): Promise<boolean> {
  const [claimed] = await db
    .update(booking)
    .set({
      status: 'confirmed',
      paidAt: new Date(),
      stripeSessionId: payment.sessionId,
      stripePaymentIntentId: payment.paymentIntentId,
    })
    .where(and(eq(booking.id, bookingId), inArray(booking.status, ['pending', 'expired'])))
    .returning();
  if (!claimed) return false;

  const [{ n }] = await db
    .select({ n: sql<number>`count(*)` })
    .from(attendee)
    .where(eq(attendee.bookingId, bookingId));
  const [target] = await db
    .select({ organisationId: camp.organisationId, rate: organisation.commissionRate })
    .from(camp)
    .innerJoin(organisation, eq(camp.organisationId, organisation.id))
    .where(eq(camp.id, claimed.campId))
    .limit(1);

  const fee = claimed.chargeType === 'direct' ? claimed.applicationFeeCents : Math.round(claimed.totalCents * (target?.rate ?? 0));
  await db.batch([
    db.update(camp).set({ enrolled: sql`${camp.enrolled} + ${n}` }).where(eq(camp.id, claimed.campId)),
    ...(claimed.discountCode
      ? [db.update(discountCode).set({ uses: sql`${discountCode.uses} + 1` }).where(eq(discountCode.code, claimed.discountCode))]
      : []),
    ...(target
      ? [
          db
            .insert(commission)
            .values({
              bookingId,
              organisationId: target.organisationId,
              rate: target.rate,
              amountCents: fee,
              currency: claimed.currency,
              settlement: claimed.chargeType === 'direct' ? 'collected' : 'owed_to_organisation',
            })
            .onConflictDoNothing(),
        ]
      : []),
  ]);
  return true;
}
