-- Ensure every tracked model has a company-identifiable logo URL sourced from official domains.

update public.llm_models set logo = coalesce(logo, 'https://logo.clearbit.com/openai.com') where slug in ('gpt', 'gpt-oss') and (logo is null or logo = '');
update public.llm_models set logo = coalesce(logo, 'https://logo.clearbit.com/anthropic.com') where slug = 'claude' and (logo is null or logo = '');
update public.llm_models set logo = coalesce(logo, 'https://logo.clearbit.com/google.com') where slug = 'gemini' and (logo is null or logo = '');
update public.llm_models set logo = coalesce(logo, 'https://logo.clearbit.com/meta.com') where slug = 'llama' and (logo is null or logo = '');
update public.llm_models set logo = coalesce(logo, 'https://logo.clearbit.com/huggingface.co') where slug = 'qwen' and (logo is null or logo = '');
update public.llm_models set logo = coalesce(logo, 'https://logo.clearbit.com/deepseek.com') where slug = 'deepseek' and (logo is null or logo = '');
update public.llm_models set logo = coalesce(logo, 'https://logo.clearbit.com/mistral.ai') where slug = 'mistral' and (logo is null or logo = '');
update public.llm_models set logo = coalesce(logo, 'https://logo.clearbit.com/microsoft.com') where slug = 'phi' and (logo is null or logo = '');
update public.llm_models set logo = coalesce(logo, 'https://logo.clearbit.com/x.ai') where slug = 'grok' and (logo is null or logo = '');
update public.llm_models set logo = coalesce(logo, 'https://logo.clearbit.com/nvidia.com') where slug = 'nemotron' and (logo is null or logo = '');
update public.llm_models set logo = coalesce(logo, 'https://logo.clearbit.com/moonshot.ai') where slug = 'kimi' and (logo is null or logo = '');

-- Generic fallback for future rows without logos.
update public.llm_models set logo = 'https://logo.clearbit.com/' || lower(regexp_replace(company, '[^a-zA-Z0-9]', '', 'g')) || '.com'
where (logo is null or logo = '') and company is not null;
