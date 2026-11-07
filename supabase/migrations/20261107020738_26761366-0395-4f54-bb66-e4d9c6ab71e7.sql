-- Preserve the existing profiles and role system, extending only the public profile fields needed by Panick Monsta.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name text;

CREATE TABLE IF NOT EXISTS public.series (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  synopsis text NOT NULL DEFAULT '',
  genre text NOT NULL DEFAULT 'Drama',
  release_year integer NOT NULL DEFAULT 2026,
  poster_url text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  featured boolean NOT NULL DEFAULT false,
  trending boolean NOT NULL DEFAULT false,
  total_views bigint NOT NULL DEFAULT 0 CHECK (total_views >= 0),
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.series TO anon, authenticated;
GRANT ALL ON public.series TO service_role;
ALTER TABLE public.series ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published series are public; admins manage all series" ON public.series FOR SELECT TO anon, authenticated USING (status = 'published' OR public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins create series" ON public.series FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins update series" ON public.series FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins delete series" ON public.series FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TABLE IF NOT EXISTS public.episodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id uuid NOT NULL REFERENCES public.series(id) ON DELETE CASCADE,
  episode_number integer NOT NULL CHECK (episode_number > 0),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  thumbnail_url text NOT NULL DEFAULT '',
  video_asset_key text,
  duration_seconds integer NOT NULL DEFAULT 0 CHECK (duration_seconds >= 0),
  is_free boolean NOT NULL DEFAULT false,
  coin_price integer NOT NULL DEFAULT 0 CHECK (coin_price >= 0),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  download_enabled boolean NOT NULL DEFAULT false,
  aspect_ratio text NOT NULL DEFAULT 'portrait' CHECK (aspect_ratio IN ('portrait', 'landscape')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (series_id, episode_number)
);
GRANT SELECT ON public.episodes TO anon, authenticated;
GRANT ALL ON public.episodes TO service_role;
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published episodes are public; admins manage all episodes" ON public.episodes FOR SELECT TO anon, authenticated USING ((status = 'published' AND EXISTS (SELECT 1 FROM public.series s WHERE s.id = series_id AND s.status = 'published')) OR public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins create episodes" ON public.episodes FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins update episodes" ON public.episodes FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins delete episodes" ON public.episodes FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TABLE IF NOT EXISTS public.coin_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  coin_amount integer NOT NULL CHECK (coin_amount > 0),
  bonus_coins integer NOT NULL DEFAULT 0 CHECK (bonus_coins >= 0),
  price_idr bigint NOT NULL CHECK (price_idr > 0),
  popular boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.coin_packages TO anon, authenticated;
GRANT ALL ON public.coin_packages TO service_role;
ALTER TABLE public.coin_packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active coin packages are public; admins view all" ON public.coin_packages FOR SELECT TO anon, authenticated USING (active OR public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins create coin packages" ON public.coin_packages FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins update coin packages" ON public.coin_packages FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins delete coin packages" ON public.coin_packages FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TABLE IF NOT EXISTS public.user_wallets (
  user_id uuid PRIMARY KEY,
  balance bigint NOT NULL DEFAULT 0 CHECK (balance >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.user_wallets TO authenticated;
GRANT ALL ON public.user_wallets TO service_role;
ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view their wallet; admins view all" ON public.user_wallets FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TABLE IF NOT EXISTS public.payment_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  package_id uuid REFERENCES public.coin_packages(id) ON DELETE SET NULL,
  reference text NOT NULL UNIQUE,
  provider text NOT NULL DEFAULT 'xendit',
  channel_code text NOT NULL,
  amount_idr bigint NOT NULL CHECK (amount_idr > 0),
  coin_amount integer NOT NULL CHECK (coin_amount > 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'expired', 'unknown')),
  provider_request_id text UNIQUE,
  provider_payment_id text,
  checkout_actions jsonb NOT NULL DEFAULT '[]'::jsonb,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.payment_attempts TO authenticated;
GRANT ALL ON public.payment_attempts TO service_role;
ALTER TABLE public.payment_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view their payment attempts; admins view all" ON public.payment_attempts FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins manage payment attempts" ON public.payment_attempts FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  reference text NOT NULL UNIQUE,
  type text NOT NULL CHECK (type IN ('coin_purchase', 'episode_unlock')),
  title text NOT NULL,
  series_title text,
  episode_number integer,
  coin_amount integer NOT NULL,
  amount_idr bigint,
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'failed')),
  payment_attempt_id uuid REFERENCES public.payment_attempts(id) ON DELETE SET NULL,
  provider_payment_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.transactions TO authenticated;
GRANT ALL ON public.transactions TO service_role;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view their transactions; admins view all" ON public.transactions FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TABLE IF NOT EXISTS public.episode_entitlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  episode_id uuid NOT NULL REFERENCES public.episodes(id) ON DELETE CASCADE,
  series_id uuid NOT NULL REFERENCES public.series(id) ON DELETE CASCADE,
  episode_number integer NOT NULL,
  source text NOT NULL CHECK (source IN ('coins', 'free')),
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, episode_id)
);
GRANT SELECT ON public.episode_entitlements TO authenticated;
GRANT ALL ON public.episode_entitlements TO service_role;
ALTER TABLE public.episode_entitlements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view their episode access; admins view all" ON public.episode_entitlements FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TABLE IF NOT EXISTS public.watch_progress (
  user_id uuid NOT NULL,
  episode_id uuid NOT NULL REFERENCES public.episodes(id) ON DELETE CASCADE,
  position_seconds integer NOT NULL DEFAULT 0 CHECK (position_seconds >= 0),
  duration_seconds integer NOT NULL DEFAULT 0 CHECK (duration_seconds >= 0),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, episode_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.watch_progress TO authenticated;
GRANT ALL ON public.watch_progress TO service_role;
ALTER TABLE public.watch_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their watch progress" ON public.watch_progress FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  provider_event_id text NOT NULL,
  event_type text NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, provider_event_id)
);
GRANT ALL ON public.webhook_events TO service_role;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.download_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  episode_id uuid NOT NULL REFERENCES public.episodes(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'processing', 'ready', 'failed', 'expired')),
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.download_jobs TO authenticated;
GRANT ALL ON public.download_jobs TO service_role;
ALTER TABLE public.download_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view their download jobs; admins view all" ON public.download_jobs FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TABLE IF NOT EXISTS public.platform_settings (
  setting_key text PRIMARY KEY,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.platform_settings TO service_role;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage platform settings" ON public.platform_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TABLE IF NOT EXISTS public.download_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  platform_name text NOT NULL DEFAULT 'Panick Monsta',
  watermark_text text NOT NULL DEFAULT 'Panick Monsta',
  watermark_logo_url text,
  positions jsonb NOT NULL DEFAULT '[]'::jsonb,
  bulk_first_five_episodes boolean NOT NULL DEFAULT false,
  updated_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.download_settings TO service_role;
ALTER TABLE public.download_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage download settings" ON public.download_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE UNIQUE INDEX IF NOT EXISTS transactions_payment_attempt_unique ON public.transactions(payment_attempt_id) WHERE payment_attempt_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS episodes_series_status_order_idx ON public.episodes(series_id, status, episode_number);
CREATE INDEX IF NOT EXISTS transactions_user_created_idx ON public.transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS entitlements_user_unlocked_idx ON public.episode_entitlements(user_id, unlocked_at DESC);
CREATE INDEX IF NOT EXISTS payment_attempts_user_created_idx ON public.payment_attempts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS download_jobs_user_created_idx ON public.download_jobs(user_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DO $$
DECLARE table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY['series','episodes','coin_packages','user_wallets','payment_attempts','watch_progress','download_jobs','platform_settings','download_settings'] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS touch_updated_at ON public.%I', table_name);
    EXECUTE format('CREATE TRIGGER touch_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at()', table_name);
  END LOOP;
END; $$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'username', COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'username'))
  ON CONFLICT (id) DO UPDATE SET
    username = COALESCE(public.profiles.username, EXCLUDED.username),
    display_name = COALESCE(public.profiles.display_name, EXCLUDED.display_name);
  INSERT INTO public.user_wallets (user_id, balance) VALUES (NEW.id, 0) ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.unlock_episode(p_episode_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_episode public.episodes%ROWTYPE;
  v_balance bigint;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  SELECT * INTO v_episode FROM public.episodes WHERE id = p_episode_id AND status = 'published' FOR SHARE;
  IF NOT FOUND OR NOT EXISTS (SELECT 1 FROM public.series s WHERE s.id = v_episode.series_id AND s.status = 'published') THEN
    RAISE EXCEPTION 'Episode not found';
  END IF;
  IF EXISTS (SELECT 1 FROM public.episode_entitlements WHERE user_id = v_user_id AND episode_id = p_episode_id) THEN
    SELECT balance INTO v_balance FROM public.user_wallets WHERE user_id = v_user_id;
    RETURN jsonb_build_object('episode_id', p_episode_id, 'already_unlocked', true, 'balance', COALESCE(v_balance, 0));
  END IF;
  IF v_episode.is_free THEN
    INSERT INTO public.episode_entitlements (user_id, episode_id, series_id, episode_number, source)
    VALUES (v_user_id, p_episode_id, v_episode.series_id, v_episode.episode_number, 'free') ON CONFLICT (user_id, episode_id) DO NOTHING;
    SELECT balance INTO v_balance FROM public.user_wallets WHERE user_id = v_user_id;
    RETURN jsonb_build_object('episode_id', p_episode_id, 'already_unlocked', false, 'balance', COALESCE(v_balance, 0));
  END IF;
  INSERT INTO public.user_wallets (user_id, balance) VALUES (v_user_id, 0) ON CONFLICT (user_id) DO NOTHING;
  SELECT balance INTO v_balance FROM public.user_wallets WHERE user_id = v_user_id FOR UPDATE;
  IF v_balance < v_episode.coin_price THEN RAISE EXCEPTION 'Not enough coins'; END IF;
  UPDATE public.user_wallets SET balance = balance - v_episode.coin_price WHERE user_id = v_user_id RETURNING balance INTO v_balance;
  INSERT INTO public.episode_entitlements (user_id, episode_id, series_id, episode_number, source)
  VALUES (v_user_id, p_episode_id, v_episode.series_id, v_episode.episode_number, 'coins');
  INSERT INTO public.transactions (user_id, reference, type, title, series_title, episode_number, coin_amount, status)
  SELECT v_user_id, 'UNLOCK-' || gen_random_uuid()::text, 'episode_unlock', v_episode.title, s.title, v_episode.episode_number, -v_episode.coin_price, 'completed'
  FROM public.series s WHERE s.id = v_episode.series_id;
  RETURN jsonb_build_object('episode_id', p_episode_id, 'already_unlocked', false, 'balance', v_balance);
END; $$;
REVOKE ALL ON FUNCTION public.unlock_episode(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.unlock_episode(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.credit_xendit_payment(p_attempt_id uuid, p_event_id text, p_provider_payment_id text, p_amount_idr bigint)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_attempt public.payment_attempts%ROWTYPE;
BEGIN
  IF auth.role() <> 'service_role' THEN RAISE EXCEPTION 'Service role required'; END IF;
  INSERT INTO public.webhook_events(provider, provider_event_id, event_type)
  VALUES ('xendit', p_event_id, 'payment.capture') ON CONFLICT (provider, provider_event_id) DO NOTHING;
  IF NOT FOUND THEN RETURN false; END IF;
  SELECT * INTO v_attempt FROM public.payment_attempts WHERE id = p_attempt_id FOR UPDATE;
  IF NOT FOUND OR v_attempt.provider <> 'xendit' THEN RAISE EXCEPTION 'Payment attempt not found'; END IF;
  IF v_attempt.amount_idr <> p_amount_idr THEN RAISE EXCEPTION 'Payment amount mismatch'; END IF;
  IF v_attempt.status = 'paid' THEN RETURN false; END IF;
  IF v_attempt.status <> 'pending' THEN RAISE EXCEPTION 'Payment is not payable'; END IF;
  UPDATE public.payment_attempts SET status = 'paid', provider_payment_id = p_provider_payment_id WHERE id = p_attempt_id;
  UPDATE public.user_wallets SET balance = balance + v_attempt.coin_amount WHERE user_id = v_attempt.user_id;
  INSERT INTO public.user_wallets (user_id, balance) VALUES (v_attempt.user_id, v_attempt.coin_amount) ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO public.transactions (user_id, reference, type, title, coin_amount, amount_idr, status, payment_attempt_id, provider_payment_id)
  SELECT v_attempt.user_id, 'PAY-' || v_attempt.reference, 'coin_purchase', COALESCE(cp.name, 'Coin purchase'), v_attempt.coin_amount, v_attempt.amount_idr, 'completed', v_attempt.id, p_provider_payment_id
  FROM public.coin_packages cp WHERE cp.id = v_attempt.package_id
  UNION ALL
  SELECT v_attempt.user_id, 'PAY-' || v_attempt.reference, 'coin_purchase', 'Coin purchase', v_attempt.coin_amount, v_attempt.amount_idr, 'completed', v_attempt.id, p_provider_payment_id
  WHERE v_attempt.package_id IS NULL;
  RETURN true;
END; $$;
REVOKE ALL ON FUNCTION public.credit_xendit_payment(uuid, text, text, bigint) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.credit_xendit_payment(uuid, text, text, bigint) TO service_role;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM auth.users WHERE lower(email) = lower('junaid.ookay@gmail.com') AND email_confirmed_at IS NOT NULL) THEN
    INSERT INTO public.user_roles (user_id, role)
    SELECT id, 'admin'::public.app_role FROM auth.users
    WHERE lower(email) = lower('junaid.ookay@gmail.com') AND email_confirmed_at IS NOT NULL
    ON CONFLICT DO NOTHING;
  END IF;
END; $$;