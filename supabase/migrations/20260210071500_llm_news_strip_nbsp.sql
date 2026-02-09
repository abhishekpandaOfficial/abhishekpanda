-- Normalize residual HTML entities in news text.

update public.llm_news_updates
set
  title = trim(replace(coalesce(title, ''), '&nbsp;', ' ')),
  summary = nullif(trim(replace(coalesce(summary, ''), '&nbsp;', ' ')), ''),
  updated_at = now();
