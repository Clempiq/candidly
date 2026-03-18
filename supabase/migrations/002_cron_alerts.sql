-- Enable pg_cron: Dashboard → Database → Extensions → pg_cron
-- Then run the cron schedule below, OR use Supabase's built-in scheduled functions:
-- Dashboard → Edge Functions → check-alerts → Schedule → every 1 hour (free plan)

/*
SELECT cron.schedule(
  'check-job-alerts',
  '0 * * * *',
  $$
    SELECT net.http_post(
      url := current_setting('app.supabase_url') || '/functions/v1/check-alerts',
      headers := jsonb_build_object('Content-Type','application/json'),
      body := '{}'::jsonb
    )
  $$
);
*/
