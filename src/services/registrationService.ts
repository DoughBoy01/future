import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Booking = Database['public']['Tables']['bookings']['Insert'];
type RegistrationForm = Database['public']['Tables']['registration_forms']['Insert'];

export interface CreateRegistrationParams {
  campId: string;
  childId: string;
  parentId: string;
  amountDue: number;
  discountCode?: string;
  discountAmount?: number;
}

export interface CreateMultiChildRegistrationParams {
  campId: string;
  parentId?: string;
  children: Array<{ firstName: string; lastName: string }>;
  unitPrice: number;
  totalAmount: number;
  discountCode?: string;
  discountAmount?: number;
  guestInfo?: {
    name: string;
    email: string;
    phone?: string;
  };
}

export async function createRegistration(params: CreateRegistrationParams) {
  const booking: Booking = {
    camp_id: params.campId,
    child_id: params.childId,
    parent_id: params.parentId,
    status: 'pending',
    payment_status: 'unpaid',
    amount_paid: 0,
    amount_due: params.amountDue,
    discount_code: params.discountCode || null,
    discount_amount: params.discountAmount || 0,
    forms_submitted: false,
    photo_permission: false,
  };

  const { data, error} = await supabase
    .from('bookings')
    .insert(booking)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createMultiChildRegistration(params: CreateMultiChildRegistrationParams) {
  const childIds: string[] = [];
  const bookingIds: string[] = [];
  let parentId = params.parentId;

  if (!parentId && params.guestInfo) {
    // Generate unique guest session ID
    const guestSessionId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

    const { data: parentData, error: parentError } = await supabase
      .from('parents')
      .insert({
        is_guest: true,
        guest_name: params.guestInfo.name,
        guest_email: params.guestInfo.email,
        guest_phone: params.guestInfo.phone || null,
        guest_session_id: guestSessionId,
      })
      .select()
      .single();

    if (parentError) throw parentError;
    parentId = parentData.id;
  }

  if (!parentId) {
    throw new Error('Parent ID is required for registration');
  }

  const perChildAmount = params.totalAmount / params.children.length;

  for (const childEntry of params.children) {
    const temporaryDob = new Date();
    temporaryDob.setFullYear(temporaryDob.getFullYear() - 10);

    const { data: childData, error: childError } = await supabase
      .from('children')
      .insert({
        parent_id: parentId,
        first_name: childEntry.firstName,
        last_name: childEntry.lastName,
        date_of_birth: temporaryDob.toISOString().split('T')[0],
      })
      .select()
      .single();

    if (childError) throw childError;
    childIds.push(childData.id);

    const booking: Booking = {
      camp_id: params.campId,
      child_id: childData.id,
      parent_id: parentId,
      status: 'pending',
      payment_status: 'unpaid',
      amount_paid: 0,
      amount_due: perChildAmount,
      discount_code: params.discountCode || null,
      discount_amount: params.discountAmount ? params.discountAmount / params.children.length : 0,
      forms_submitted: false,
      photo_permission: false,
      form_completed: false,
    };

    const { data: bookingData, error: bookingError } = await supabase
      .from('bookings')
      .insert(booking)
      .select()
      .single();

    if (bookingError) throw bookingError;
    bookingIds.push(bookingData.id);
  }

  return {
    childIds,
    bookingIds,
  };
}

export async function getRegistration(registrationId: string) {
  const { data, error } = await supabase
    .from('registrations')
    .select(`
      *,
      camps(*),
      children(*),
      parents(*)
    `)
    .eq('id', registrationId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function updateRegistrationPaymentStatus(
  registrationId: string,
  paymentStatus: 'unpaid' | 'partial' | 'paid' | 'refunded',
  amountPaid: number
) {
  const { data, error } = await supabase
    .from('registrations')
    .update({
      payment_status: paymentStatus,
      amount_paid: amountPaid,
      status: paymentStatus === 'paid' ? 'confirmed' : 'pending',
      confirmation_date: paymentStatus === 'paid' ? new Date().toISOString() : null,
    })
    .eq('id', registrationId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createOrUpdateRegistrationForm(params: {
  registrationId: string;
  childId: string;
  formData: Record<string, any>;
  completed: boolean;
}) {
  const formRecord: Omit<RegistrationForm, 'id' | 'created_at' | 'updated_at'> = {
    registration_id: params.registrationId,
    child_id: params.childId,
    form_data: params.formData,
    completed: params.completed,
    submitted_at: params.completed ? new Date().toISOString() : null,
  };

  const { data: existing } = await supabase
    .from('registration_forms')
    .select('id')
    .eq('registration_id', params.registrationId)
    .maybeSingle();

  if (existing) {
    const { data, error } = await supabase
      .from('registration_forms')
      .update({
        form_data: params.formData,
        completed: params.completed,
        submitted_at: params.completed ? new Date().toISOString() : null,
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from('registration_forms')
      .insert(formRecord)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export async function getRegistrationForm(registrationId: string) {
  const { data, error } = await supabase
    .from('registration_forms')
    .select('*')
    .eq('registration_id', registrationId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function updateRegistrationFormStatus(registrationId: string, completed: boolean) {
  const { data, error } = await supabase
    .from('registrations')
    .update({
      form_completed: completed,
      form_completed_at: completed ? new Date().toISOString() : null,
      forms_submitted: completed,
    })
    .eq('id', registrationId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getIncompleteRegistrations(parentId: string) {
  const { data, error } = await supabase
    .from('registrations')
    .select(`
      *,
      camps(name, start_date, end_date, location),
      children(first_name, last_name)
    `)
    .eq('parent_id', parentId)
    .eq('form_completed', false)
    .in('payment_status', ['paid', 'partial'])
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function validateDiscountCode(code: string, campId: string) {
  const { data, error } = await supabase
    .from('discount_codes')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('active', true)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const now = new Date();
  const validFrom = new Date(data.valid_from);
  const validUntil = new Date(data.valid_until);

  if (now < validFrom || now > validUntil) {
    return null;
  }

  if (data.max_uses && data.uses_count >= data.max_uses) {
    return null;
  }

  const applicableCamps = data.applicable_camps as string[] | null;
  if (applicableCamps && !applicableCamps.includes(campId)) {
    return null;
  }

  return data;
}
