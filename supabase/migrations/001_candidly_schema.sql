-- ============================================================
-- CANDIDLY — Database Schema
-- Run this in your Supabase SQL editor
-- ============================================================

-- ── Profiles (extends auth.users) ──────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email         TEXT,
  full_name     TEXT,
  avatar_url    TEXT,
  reminder_days INTEGER NOT NULL DEFAULT 7,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── Applications ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.applications (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  company_name    TEXT NOT NULL,
  position        TEXT NOT NULL,
  applied_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  url             TEXT,
  status          TEXT NOT NULL DEFAULT 'applied'
                    CHECK (status IN ('applied','interview_scheduled','interview_done','offer','rejected','ghosted','withdrawn')),
  location        TEXT,
  salary_range    TEXT,
  contact_name    TEXT,
  contact_email   TEXT,
  interest_score  INTEGER DEFAULT 3 CHECK (interest_score BETWEEN 1 AND 5),
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS applications_updated_at ON public.applications;
CREATE TRIGGER applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ── Job Alerts ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.job_alerts (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name           TEXT,
  keywords       TEXT NOT NULL,
  location       TEXT,
  contract_type  TEXT,
  distance       INTEGER DEFAULT 20,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  last_checked   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Push Subscriptions ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  subscription JSONB NOT NULL,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_alerts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "profiles: own row" ON public.profiles
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Applications
CREATE POLICY "applications: own rows" ON public.applications
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Job Alerts
CREATE POLICY "job_alerts: own rows" ON public.job_alerts
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Push subscriptions
CREATE POLICY "push_subscriptions: own rows" ON public.push_subscriptions
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON public.applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_applied_date ON public.applications(applied_date DESC);
CREATE INDEX IF NOT EXISTS idx_job_alerts_user_id ON public.job_alerts(user_id);
