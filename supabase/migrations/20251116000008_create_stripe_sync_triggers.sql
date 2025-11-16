-- Create triggers for automatic Stripe product sync
-- These triggers will call the sync-stripe-products Edge Function when camps or addons are created/updated

-- Note: This requires the pg_net extension for making HTTP requests
-- The pg_net extension should be enabled in Supabase projects by default
-- If not enabled, run: CREATE EXTENSION IF NOT EXISTS pg_net;

-- Function to trigger Stripe product sync for camps
CREATE OR REPLACE FUNCTION trigger_camp_stripe_sync()
RETURNS TRIGGER AS $$
DECLARE
  request_id bigint;
  supabase_url text;
  service_key text;
BEGIN
  -- Only sync when camp is published or updated while published
  IF (TG_OP = 'INSERT' AND NEW.status = 'published') OR
     (TG_OP = 'UPDATE' AND NEW.status = 'published') THEN

    -- Get Supabase URL from environment
    -- Note: In production, you'll need to set these using Supabase secrets
    supabase_url := current_setting('app.supabase_url', true);
    service_key := current_setting('app.service_role_key', true);

    -- Only proceed if we have the necessary config
    IF supabase_url IS NOT NULL AND service_key IS NOT NULL THEN
      -- Make async HTTP request to Edge Function
      -- Using net.http_post from pg_net extension
      SELECT net.http_post(
        url := supabase_url || '/functions/v1/sync-stripe-products',
        headers := jsonb_build_object(
          'Authorization', 'Bearer ' || service_key,
          'Content-Type', 'application/json'
        ),
        body := jsonb_build_object(
          'campId', NEW.id::text,
          'action', CASE WHEN TG_OP = 'INSERT' THEN 'create' ELSE 'update' END
        )
      ) INTO request_id;

      -- Log the sync attempt
      RAISE LOG 'Triggered Stripe sync for camp % with request_id %', NEW.id, request_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for camps table
DROP TRIGGER IF EXISTS camp_stripe_sync ON camps;
CREATE TRIGGER camp_stripe_sync
  AFTER INSERT OR UPDATE OF status, name, description, price, early_bird_price, early_bird_deadline
  ON camps
  FOR EACH ROW
  EXECUTE FUNCTION trigger_camp_stripe_sync();

COMMENT ON TRIGGER camp_stripe_sync ON camps IS 'Automatically sync camp to Stripe when published or updated';

-- Function to trigger Stripe product sync for addons
CREATE OR REPLACE FUNCTION trigger_addon_stripe_sync()
RETURNS TRIGGER AS $$
DECLARE
  request_id bigint;
  supabase_url text;
  service_key text;
BEGIN
  -- Only sync when addon is available
  IF NEW.available = true THEN
    supabase_url := current_setting('app.supabase_url', true);
    service_key := current_setting('app.service_role_key', true);

    IF supabase_url IS NOT NULL AND service_key IS NOT NULL THEN
      SELECT net.http_post(
        url := supabase_url || '/functions/v1/sync-stripe-products',
        headers := jsonb_build_object(
          'Authorization', 'Bearer ' || service_key,
          'Content-Type', 'application/json'
        ),
        body := jsonb_build_object(
          'addonId', NEW.id::text,
          'action', CASE WHEN TG_OP = 'INSERT' THEN 'create' ELSE 'update' END
        )
      ) INTO request_id;

      RAISE LOG 'Triggered Stripe sync for addon % with request_id %', NEW.id, request_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for camp_addons table
DROP TRIGGER IF EXISTS addon_stripe_sync ON camp_addons;
CREATE TRIGGER addon_stripe_sync
  AFTER INSERT OR UPDATE OF available, name, description, price
  ON camp_addons
  FOR EACH ROW
  EXECUTE FUNCTION trigger_addon_stripe_sync();

COMMENT ON TRIGGER addon_stripe_sync ON camp_addons IS 'Automatically sync addon to Stripe when created or updated';

-- Function to trigger Stripe price sync for pricing tiers
CREATE OR REPLACE FUNCTION trigger_pricing_tier_stripe_sync()
RETURNS TRIGGER AS $$
DECLARE
  request_id bigint;
  supabase_url text;
  service_key text;
BEGIN
  -- Sync the parent camp whenever a pricing tier changes
  IF NEW.available = true THEN
    supabase_url := current_setting('app.supabase_url', true);
    service_key := current_setting('app.service_role_key', true);

    IF supabase_url IS NOT NULL AND service_key IS NOT NULL THEN
      -- Sync the camp to update all prices including tiers
      SELECT net.http_post(
        url := supabase_url || '/functions/v1/sync-stripe-products',
        headers := jsonb_build_object(
          'Authorization', 'Bearer ' || service_key,
          'Content-Type', 'application/json'
        ),
        body := jsonb_build_object(
          'campId', NEW.camp_id::text,
          'action', 'update'
        )
      ) INTO request_id;

      RAISE LOG 'Triggered Stripe sync for camp % due to pricing tier change, request_id %',
        NEW.camp_id, request_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for pricing_tiers table
DROP TRIGGER IF EXISTS pricing_tier_stripe_sync ON pricing_tiers;
CREATE TRIGGER pricing_tier_stripe_sync
  AFTER INSERT OR UPDATE OF available, name, price
  ON pricing_tiers
  FOR EACH ROW
  EXECUTE FUNCTION trigger_pricing_tier_stripe_sync();

COMMENT ON TRIGGER pricing_tier_stripe_sync ON pricing_tiers IS 'Automatically sync camp prices to Stripe when pricing tiers change';

-- Helper function to manually trigger sync for all published camps
CREATE OR REPLACE FUNCTION sync_all_camps_to_stripe()
RETURNS jsonb AS $$
DECLARE
  request_id bigint;
  supabase_url text;
  service_key text;
BEGIN
  supabase_url := current_setting('app.supabase_url', true);
  service_key := current_setting('app.service_role_key', true);

  IF supabase_url IS NULL OR service_key IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Supabase URL or service key not configured'
    );
  END IF;

  SELECT net.http_post(
    url := supabase_url || '/functions/v1/sync-stripe-products',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || service_key,
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object('action', 'sync_all')
  ) INTO request_id;

  RETURN jsonb_build_object(
    'success', true,
    'request_id', request_id,
    'message', 'Sync initiated for all published camps'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION sync_all_camps_to_stripe IS 'Manually trigger Stripe sync for all published camps';

-- Grant execute permission to authenticated users (you may want to restrict this to admins only)
GRANT EXECUTE ON FUNCTION sync_all_camps_to_stripe() TO authenticated;
