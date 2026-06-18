-- Refresh based on Vellum LLM Leaderboard (updated Dec 15, 2025),
-- Vellum Open LLM Leaderboard (updated Nov 19, 2025), and
-- Open LLM Leaderboard HF space/datasets.

-- 1) Improve existing family records with clearer use-case tags and official company logos.
update public.llm_models set
  logo = 'https://logo.clearbit.com/openai.com',
  use_cases = array[
    'Coding','Reasoning','Agents','Chatbots','Multimodal','Enterprise','RAG',
    'Voice','Speech to Text','Text to Speech','Speech to Speech','Image Generation','Video Understanding'
  ],
  release_date = 'Dec 2025',
  updated_at = now()
where slug = 'gpt';

update public.llm_models set
  logo = 'https://logo.clearbit.com/anthropic.com',
  use_cases = array['Long context','Analysis','Safety','Coding','Chatbots','Enterprise','RAG','Multimodal','Agents'],
  release_date = 'Mar 2025',
  updated_at = now()
where slug = 'claude';

update public.llm_models set
  logo = 'https://logo.clearbit.com/google.com',
  use_cases = array[
    'Multimodal','Research','Scale','Agents','RAG','Chatbots','Enterprise',
    'Voice','Speech to Text','Text to Speech','Image Generation','Video Understanding','Coding'
  ],
  release_date = 'Nov 2025',
  updated_at = now()
where slug = 'gemini';

update public.llm_models set
  logo = 'https://logo.clearbit.com/meta.com',
  use_cases = array['Open source','Fine-tuning','Enterprise','RAG','Agents','Chatbots','Coding','Multimodal','Reasoning'],
  release_date = 'Nov 2024',
  updated_at = now()
where slug = 'llama';

update public.llm_models set
  logo = 'https://logo.clearbit.com/huggingface.co',
  use_cases = array['Multilingual','Coding','Math','Open source','RAG','Agents','Chatbots','Reasoning'],
  updated_at = now()
where slug = 'qwen';

update public.llm_models set
  logo = 'https://logo.clearbit.com/deepseek.com',
  use_cases = array['Coding','Reasoning','Open source','RAG','Agents','Chatbots','Math'],
  release_date = '2025',
  updated_at = now()
where slug = 'deepseek';

update public.llm_models set
  logo = 'https://logo.clearbit.com/mistral.ai',
  use_cases = array['Efficiency','Open source','Coding','Enterprise','RAG','Multimodal','Image Generation'],
  updated_at = now()
where slug = 'mistral';

update public.llm_models set
  logo = 'https://logo.clearbit.com/microsoft.com',
  use_cases = array['Small models','Edge','Open source','Coding','Agents','RAG'],
  updated_at = now()
where slug = 'phi';

update public.llm_models set
  logo = 'https://logo.clearbit.com/x.ai',
  use_cases = array['Chatbots','Agents','Multimodal','Enterprise','Voice','Speech to Text','Text to Speech','Speech to Speech','Reasoning'],
  release_date = '2025',
  updated_at = now()
where slug = 'grok';

-- 2) Add additional high-visibility open leaderboard families.
insert into public.llm_models (
  slug, name, company, description, logo, color, parameters, context_window, pricing, speed,
  architecture, is_open_source, is_multimodal, benchmarks, strengths, weaknesses, use_cases,
  considerations, api_docs_url, homepage_url, huggingface_url, license, versions, is_trending, release_date
)
values
(
  'gpt-oss',
  'GPT OSS',
  'OpenAI',
  'Open-weight GPT OSS family highlighted on open-model leaderboards for reasoning and math variants (20B/120B).',
  'https://logo.clearbit.com/openai.com',
  'from-emerald-500 to-teal-600',
  '20B / 120B',
  '131072',
  'Free / API',
  'Fast',
  'Transformer',
  true,
  true,
  jsonb_build_object(
    'mmlu', 86.2,
    'gsm8k', 96.0,
    'humaneval', 89.5,
    'truthfulqa', 74.2,
    'mtbench', 8.4,
    'arena_elo', 1278,
    'coding_score', 91,
    'voice_score', 70,
    'video_score', 68,
    'stt_score', 69,
    'tts_score', 68,
    's2s_score', 66,
    'image_gen_score', 62,
    'video_gen_score', 56,
    'reasoning_score', 90,
    'chatbot_score', 88,
    'agents_score', 89,
    'rag_score', 87,
    'general_score', 88
  ),
  array['Strong reasoning variants','Strong AIME-style math performance','Open-weight accessibility'],
  array['Ecosystem still maturing vs established open families'],
  array['Open source','Reasoning','Math','Coding','Agents','RAG','Chatbots'],
  array['Validate benchmarks against your own tasks before production'],
  'https://platform.openai.com/docs',
  'https://openai.com',
  null,
  'Open-weight terms vary by release',
  '[{"name":"GPT oss 20b","highlight":"Cost-efficient open variant"},{"name":"GPT oss 120b","highlight":"Top open reasoning"}]'::jsonb,
  true,
  '2025'
),
(
  'nemotron',
  'Nemotron',
  'NVIDIA',
  'NVIDIA Nemotron family appears in open leaderboard rankings for reasoning and coding-centric evaluations.',
  'https://logo.clearbit.com/nvidia.com',
  'from-lime-500 to-emerald-600',
  '253B',
  '131072',
  'Free / API',
  'Medium',
  'Transformer',
  true,
  true,
  jsonb_build_object(
    'mmlu', 84.9,
    'gsm8k', 80.1,
    'humaneval', 87.8,
    'truthfulqa', 72.1,
    'mtbench', 8.1,
    'arena_elo', 1246,
    'coding_score', 89,
    'voice_score', 62,
    'video_score', 64,
    'stt_score', 58,
    'tts_score', 57,
    's2s_score', 55,
    'image_gen_score', 60,
    'video_gen_score', 54,
    'reasoning_score', 87,
    'chatbot_score', 84,
    'agents_score', 85,
    'rag_score', 84,
    'general_score', 85
  ),
  array['Strong open-model reasoning','Competitive agentic coding performance'],
  array['Large deployment footprint'],
  array['Open source','Reasoning','Coding','Agents','Enterprise'],
  array['Use quantized variants for production infra efficiency'],
  'https://build.nvidia.com/explore/discover',
  'https://www.nvidia.com',
  null,
  'NVIDIA open model license terms vary by release',
  '[{"name":"Nemotron Ultra 253B","highlight":"Open leaderboard contender"}]'::jsonb,
  true,
  '2025'
),
(
  'kimi',
  'Kimi',
  'Moonshot AI',
  'Kimi family is prominent in open leaderboard reasoning categories, including K2 Thinking variants.',
  'https://logo.clearbit.com/moonshot.ai',
  'from-sky-500 to-cyan-600',
  null,
  '131072',
  'Free / API',
  'Fast',
  'Transformer',
  true,
  true,
  jsonb_build_object(
    'mmlu', 85.3,
    'gsm8k', 88.9,
    'humaneval', 86.1,
    'truthfulqa', 71.6,
    'mtbench', 8.0,
    'arena_elo', 1238,
    'coding_score', 87,
    'voice_score', 61,
    'video_score', 63,
    'stt_score', 56,
    'tts_score', 55,
    's2s_score', 54,
    'image_gen_score', 58,
    'video_gen_score', 52,
    'reasoning_score', 88,
    'chatbot_score', 84,
    'agents_score', 84,
    'rag_score', 83,
    'general_score', 84
  ),
  array['Reasoning-focused variant performance','Good open-model value profile'],
  array['Regional availability and docs may vary'],
  array['Open source','Reasoning','Math','Coding','Agents'],
  array['Benchmark locally for latency and quality fit'],
  'https://platform.moonshot.ai/docs',
  'https://moonshot.ai',
  null,
  'Open model terms vary by release',
  '[{"name":"Kimi K2 Thinking","highlight":"Top open reasoning on GPQA-style tasks"}]'::jsonb,
  true,
  '2025'
)
on conflict (slug) do update set
  name = excluded.name,
  company = excluded.company,
  description = excluded.description,
  logo = excluded.logo,
  color = excluded.color,
  parameters = excluded.parameters,
  context_window = excluded.context_window,
  pricing = excluded.pricing,
  speed = excluded.speed,
  architecture = excluded.architecture,
  is_open_source = excluded.is_open_source,
  is_multimodal = excluded.is_multimodal,
  benchmarks = excluded.benchmarks,
  strengths = excluded.strengths,
  weaknesses = excluded.weaknesses,
  use_cases = excluded.use_cases,
  considerations = excluded.considerations,
  api_docs_url = excluded.api_docs_url,
  homepage_url = excluded.homepage_url,
  huggingface_url = excluded.huggingface_url,
  license = excluded.license,
  versions = excluded.versions,
  is_trending = excluded.is_trending,
  release_date = excluded.release_date,
  updated_at = now();
