// Minimal stand-in for api.stripe.com so the payment flow can be exercised without real keys.
import { createServer } from 'node:http';

export function startFakeStripe(port) {
  const calls = [];
  const server = createServer((req, res) => {
    let raw = '';
    req.on('data', (d) => (raw += d));
    req.on('end', () => {
      const body = Object.fromEntries(new URLSearchParams(raw));
      calls.push({ method: req.method, path: req.url, headers: req.headers, body });
      res.setHeader('content-type', 'application/json');
      if (req.method === 'POST' && req.url === '/v1/checkout/sessions') {
        const id = `cs_test_${calls.length}${Date.now().toString(36)}`;
        return res.end(JSON.stringify({ id, object: 'checkout.session', url: `https://checkout.stripe.test/c/pay/${id}` }));
      }
      res.statusCode = 404;
      res.end(JSON.stringify({ error: { message: `fake stripe: ${req.method} ${req.url}` } }));
    });
  });
  return new Promise((resolve) => server.listen(port, () => resolve({ calls, close: () => server.close() })));
}
