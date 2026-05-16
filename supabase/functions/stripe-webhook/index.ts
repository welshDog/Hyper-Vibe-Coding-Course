// =============================================================
// 🔥 STRIPE WEBHOOK — SUPABASE EDGE FUNCTION
// Listens for Stripe payment events → awards BROski$ tokens
// Deploy: supabase functions deploy stripe-webhook
// =============================================================
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14?target=deno';

// Price ID → tier config (mirrors stripe/products.config.ts)
const PRICE_TO_TIER: Record<string, { tier: string; tokens: number; modules: number[] }> = {
  'price_1TXn1T2LoEeIEPVE2YULkFsI': { tier: 'starter',      tokens: 200,  modules: [1,2,3,4] },
  'price_1TXn1Z2LoEeIEPVEHSj3TDBF': { tier: 'builder',      tokens: 800,  modules: [1,2,3,4,5,6,7,8,9,10,11] },
  'price_1TXn1e2LoEeIEPVE00MmiaYj': { tier: 'builder',      tokens: 800,  modules: [1,2,3,4,5,6,7,8,9,10,11] },
  'price_1TXn1j2LoEeIEPVEjzzhcJny': { tier: 'hyper_legend', tokens: 2500, modules: [1,2,3,4,5,6,7,8,9,10,11,12,13] },
  'price_1TXn1o2LoEeIEPVEWICzEMHV': { tier: 'hyper_legend', tokens: 2500, modules: [1,2,3,4,5,6,7,8,9,10,11,12,13] },
};

serve(async (req: Request) => {
  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
    apiVersion: '2024-04-10',
    httpClient: Stripe.createFetchHttpClient(),
  });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const signature = req.headers.get('stripe-signature');
  const body = await req.text();

  // ✓ Verify the webhook signature — rejects anything not from Stripe
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature ?? '',
      Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''
    );
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err);
    return new Response('Webhook signature invalid', { status: 400 });
  }

  // ✓ Handle successful one-time payment
  if (event.type === 'checkout.session.completed' || event.type === 'payment_intent.succeeded') {
    const session = event.data.object as Stripe.Checkout.Session;
    const customerEmail = session.customer_details?.email ?? (session as any).receipt_email;
    const priceId = (session as any).line_items?.data?.[0]?.price?.id
      ?? (session as any).metadata?.price_id;

    if (customerEmail && priceId && PRICE_TO_TIER[priceId]) {
      await awardTokensAndUnlock(supabase, customerEmail, priceId);
    }
  }

  // ✓ Handle successful subscription creation (monthly plans)
  if (event.type === 'customer.subscription.created' || event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object as Stripe.Invoice;
    const customerEmail = invoice.customer_email;
    const priceId = invoice.lines?.data?.[0]?.price?.id;

    if (customerEmail && priceId && PRICE_TO_TIER[priceId]) {
      await awardTokensAndUnlock(supabase, customerEmail, priceId);
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});

// =============================================================
// CORE: Award BROski$ tokens + unlock modules for a user
// =============================================================
async function awardTokensAndUnlock(
  supabase: ReturnType<typeof createClient>,
  email: string,
  priceId: string
) {
  const config = PRICE_TO_TIER[priceId];
  if (!config) return;

  // 1️⃣ Find the user in Supabase by email
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, broski_tokens, course_tier, unlocked_modules')
    .eq('email', email)
    .single();

  if (profileError || !profile) {
    console.error('❌ Profile not found for email:', email);
    return;
  }

  const userId = profile.id;
  const currentTokens = profile.broski_tokens ?? 0;
  const currentModules: number[] = profile.unlocked_modules ?? [];
  const newModules = [...new Set([...currentModules, ...config.modules])];

  // 2️⃣ Award tokens + upgrade tier + unlock modules
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      broski_tokens: currentTokens + config.tokens,
      course_tier: config.tier,
      unlocked_modules: newModules,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (updateError) {
    console.error('❌ Failed to update profile:', updateError);
    return;
  }

  // 3️⃣ Log the transaction in token_transactions table
  await supabase.from('token_transactions').insert({
    user_id: userId,
    amount: config.tokens,
    transaction_type: 'purchase',
    description: `💰 ${config.tier} tier purchase — Stripe price ${priceId}`,
    metadata: { priceId, tier: config.tier, modulesUnlocked: config.modules },
    created_at: new Date().toISOString(),
  });

  console.log(`✅ Awarded ${config.tokens} BROski$ to ${email} | Tier: ${config.tier} | Modules: ${config.modules.join(', ')}`);
}
