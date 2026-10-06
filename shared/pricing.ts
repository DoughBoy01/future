export interface PriceableCamp {
  priceCents: number;
  earlyBirdCents: number | null;
  earlyBirdDeadline: string | null;
}

export interface Discount {
  kind: 'percent' | 'amount';
  value: number;
}

export interface Quote {
  unitCents: number;
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
}

export function quote(camp: PriceableCamp, quantity: number, discount?: Discount | null, now = new Date()): Quote {
  const earlyBird =
    camp.earlyBirdCents != null && camp.earlyBirdDeadline != null && new Date(camp.earlyBirdDeadline) > now;
  const unitCents = earlyBird ? camp.earlyBirdCents! : camp.priceCents;
  const subtotalCents = unitCents * quantity;
  const raw = !discount
    ? 0
    : discount.kind === 'percent'
      ? Math.round((subtotalCents * Math.min(discount.value, 100)) / 100)
      : discount.value;
  const discountCents = Math.min(Math.max(raw, 0), subtotalCents);
  return { unitCents, subtotalCents, discountCents, totalCents: subtotalCents - discountCents };
}

/** Platform's share of a charge, in minor units. */
export const platformFee = (totalCents: number, rate: number) => Math.round(totalCents * rate);
