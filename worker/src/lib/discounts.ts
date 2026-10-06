import { and, eq } from 'drizzle-orm';
import { discountCode } from '../db/schema';
import type { Db } from './db';

/** Returns the discount if `code` is usable for `campId` today, otherwise null. */
export async function findValidDiscount(db: Db, code: string, campId: string, today = new Date().toISOString().slice(0, 10)) {
  const [row] = await db
    .select()
    .from(discountCode)
    .where(and(eq(discountCode.code, code.trim().toUpperCase()), eq(discountCode.active, true)))
    .limit(1);
  if (!row) return null;
  if (row.validFrom && today < row.validFrom) return null;
  if (row.validUntil && today > row.validUntil) return null;
  if (row.maxUses != null && row.uses >= row.maxUses) return null;
  if (row.campIds && row.campIds.length && !row.campIds.includes(campId)) return null;
  return row;
}
