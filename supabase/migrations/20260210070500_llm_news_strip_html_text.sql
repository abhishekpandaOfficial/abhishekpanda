-- Clean any HTML artifacts from aggregated news text fields.

update public.llm_news_updates
set
  title = trim(regexp_replace(coalesce(title, ''), '<[^>]+>', ' ', 'g')),
  summary = nullif(trim(regexp_replace(coalesce(summary, ''), '<[^>]+>', ' ', 'g')), ''),
  updated_at = now();
