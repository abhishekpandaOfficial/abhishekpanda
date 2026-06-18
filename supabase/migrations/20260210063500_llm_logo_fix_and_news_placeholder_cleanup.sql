-- Fix remaining logo mappings and hide bootstrap placeholder news row.

update public.llm_models
set logo = '/llm-logos/qwen.png', updated_at = now()
where slug = 'qwen' or lower(company) like '%alibaba%';

update public.llm_models
set logo = '/llm-logos/xai.png', updated_at = now()
where slug in ('grok', 'grok-4') or lower(company) in ('xai', 'x.ai');

update public.llm_news_updates
set is_active = false, updated_at = now()
where article_url = 'https://news.google.com/'
  and title = 'Google News AI/LLM feed initialized';
