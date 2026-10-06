import type { Bindings } from '../env';

interface Message {
  to: string;
  subject: string;
  text: string;
}

/**
 * Single seam for outbound email. Transactional email (receipts, invites) is wired
 * to Cloudflare Email Service in its own step; until then messages are logged so
 * flows like password reset can be exercised end to end in development.
 */
export async function sendEmail(_env: Bindings, message: Message): Promise<void> {
  console.log(`[email:not-sent] to=${message.to} subject="${message.subject}"\n${message.text}`);
}
