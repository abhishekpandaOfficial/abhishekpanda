-- Add source update tracking + latest model-version rows inspired by Vellum/HF leaderboard structure.

create table if not exists public.llm_source_updates (
  id uuid primary key default gen_random_uuid(),
  source_name text not null unique,
  source_url text not null,
  source_updated_on date,
  notes text,
  synced_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.llm_source_updates enable row level security;

drop policy if exists "Public can read llm source updates" on public.llm_source_updates;
create policy "Public can read llm source updates"
  on public.llm_source_updates
  for select
  using (true);

insert into public.llm_source_updates (source_name, source_url, source_updated_on, notes, synced_at)
values
  ('Vellum LLM Leaderboard', 'https://www.vellum.ai/llm-leaderboard', '2025-12-15', 'Main leaderboard refreshed with latest proprietary models and efficiency metrics.', now()),
  ('Vellum Open LLM Leaderboard', 'https://www.vellum.ai/open-llm-leaderboard', '2025-11-19', 'Open model leaderboard updates with reasoning/coding-focused tasks.', now()),
  ('Hugging Face Open LLM Leaderboard', 'https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard#/', '2026-02-09', 'Rolling community benchmark updates.', now())
on conflict (source_name) do update set
  source_url = excluded.source_url,
  source_updated_on = excluded.source_updated_on,
  notes = excluded.notes,
  synced_at = excluded.synced_at,
  updated_at = now();

insert into public.llm_models (
  slug, name, company, description, logo, color, parameters, context_window, pricing, speed,
  architecture, is_open_source, is_multimodal, benchmarks, strengths, weaknesses, use_cases,
  considerations, api_docs_url, homepage_url, huggingface_url, license, versions, is_trending, release_date
)
values
(
  'gpt-5-2', 'GPT 5.2', 'OpenAI',
  'Latest high-end proprietary GPT variant focused on reasoning, coding quality, and agentic workflows.',
  'https://logo.clearbit.com/openai.com', 'from-emerald-500 to-teal-600',
  null, '400k', '$$', 'Fast', 'Transformer', false, true,
  jsonb_build_object('gpqa',92.4,'aime_2025',89.4,'swe_bench',78.5,'bfcl',86.2,'grind',58.0,'livecode',82.0,'aider_polyglot',88.2,'speed_tokens_per_sec',92,'latency_ttft_sec',0.6,'input_cost_per_1m',1.5,'output_cost_per_1m',14,'coding_score',94,'reasoning_score',95,'voice_score',90,'stt_score',91,'tts_score',90,'s2s_score',88,'image_gen_score',81,'video_gen_score',75,'general_score',94),
  array['Top-tier reasoning','Strong code generation and review','Stable enterprise deployment profile'],
  array['Cost can be high for large-scale workloads'],
  array['Reasoning','Coding','Agents','Chatbots','Multimodal','Enterprise','RAG','Voice','Speech to Text','Text to Speech','Speech to Speech','Image Generation','Video Understanding'],
  array['Use eval harness before production rollout'],
  'https://platform.openai.com/docs', 'https://openai.com', null, 'Proprietary',
  '[{"name":"GPT 5.2","highlight":"Top Vellum reasoning score"}]'::jsonb,
  true, 'Dec 2025'
),
(
  'claude-opus-4-5', 'Claude Opus 4.5', 'Anthropic',
  'Flagship Anthropic model with strong coding, long-context analysis, and enterprise reliability.',
  'https://logo.clearbit.com/anthropic.com', 'from-orange-500 to-amber-600',
  null, '200k', '$$$', 'Medium', 'Transformer', false, true,
  jsonb_build_object('gpqa',90.9,'aime_2025',90.8,'swe_bench',80.9,'bfcl',82.0,'grind',55.8,'livecode',78.4,'aider_polyglot',89.4,'speed_tokens_per_sec',72,'latency_ttft_sec',0.9,'input_cost_per_1m',5,'output_cost_per_1m',25,'coding_score',93,'reasoning_score',93,'general_score',92),
  array['Strong instruction-following','Excellent long-context quality','Great coding consistency'],
  array['Higher API cost for high-volume agents'],
  array['Reasoning','Coding','Chatbots','Enterprise','RAG','Multimodal','Agents'],
  array['Prefer for quality-critical enterprise workflows'],
  'https://docs.anthropic.com', 'https://www.anthropic.com', null, 'Proprietary',
  '[{"name":"Claude Opus 4.5","highlight":"Top Aider Polyglot score"}]'::jsonb,
  true, 'Apr 2025'
),
(
  'gemini-3-pro', 'Gemini 3 Pro', 'Google',
  'Google flagship multimodal model optimized for reasoning, math, and broad ecosystem integration.',
  'https://logo.clearbit.com/google.com', 'from-blue-500 to-indigo-600',
  null, '10000000', '$$', 'Fast', 'Multimodal Transformer', false, true,
  jsonb_build_object('gpqa',91.9,'aime_2025',91.8,'swe_bench',74.5,'bfcl',80.4,'grind',57.3,'livecode',79.7,'aider_polyglot',82.2,'speed_tokens_per_sec',128,'latency_ttft_sec',0.7,'input_cost_per_1m',2,'output_cost_per_1m',12,'coding_score',92,'reasoning_score',94,'voice_score',89,'stt_score',88,'tts_score',87,'s2s_score',85,'image_gen_score',87,'video_gen_score',82,'general_score',93),
  array['Excellent math/reasoning benchmark performance','Very strong multimodal capabilities'],
  array['Performance/cost depends on product tier and region'],
  array['Reasoning','Math','Coding','Agents','RAG','Chatbots','Enterprise','Multimodal','Voice','Speech to Text','Text to Speech','Image Generation','Video Generation'],
  array['Validate regional/tenant feature parity'],
  'https://ai.google.dev/gemini-api/docs', 'https://deepmind.google/technologies/gemini/', null, 'Proprietary',
  '[{"name":"Gemini 3 Pro","highlight":"Top AIME 2025 benchmark"}]'::jsonb,
  true, 'Apr 2025'
),
(
  'grok-4', 'Grok 4', 'xAI',
  'xAI frontier model with strong reasoning and live coding capability.',
  'https://logo.clearbit.com/x.ai', 'from-slate-500 to-zinc-700',
  null, null, '$$', 'Fast', 'Transformer', false, true,
  jsonb_build_object('gpqa',87.5,'aime_2025',88.4,'swe_bench',77.4,'bfcl',79.2,'grind',54.0,'livecode',79.0,'aider_polyglot',81.4,'speed_tokens_per_sec',118,'latency_ttft_sec',0.75,'input_cost_per_1m',2.5,'output_cost_per_1m',13,'coding_score',91,'reasoning_score',91,'voice_score',90,'stt_score',89,'tts_score',88,'s2s_score',87,'general_score',90),
  array['Strong coding benchmark profile','Voice and multimodal-first assistant behavior'],
  array['API availability and safety behavior may shift with releases'],
  array['Reasoning','Coding','Chatbots','Agents','Multimodal','Voice','Speech to Text','Text to Speech','Speech to Speech'],
  array['Run custom evals before automating high-risk actions'],
  'https://docs.x.ai', 'https://x.ai', null, 'Proprietary',
  '[{"name":"Grok 4","highlight":"Top-5 Vellum reasoning"}]'::jsonb,
  true, 'Dec 2025'
),
(
  'kimi-k2-thinking', 'Kimi K2 Thinking', 'Moonshot AI',
  'Open model variant frequently appearing in top open reasoning and coding leaderboards.',
  'https://logo.clearbit.com/moonshot.ai', 'from-sky-500 to-cyan-600',
  null, '256k', '$', 'Fast', 'Transformer', true, true,
  jsonb_build_object('gpqa',84.5,'aime_2025',89.8,'swe_bench',71.3,'bfcl',74.0,'grind',56.2,'livecode',83.1,'aider_polyglot',81.0,'speed_tokens_per_sec',79,'latency_ttft_sec',1.0,'input_cost_per_1m',0.6,'output_cost_per_1m',2.5,'coding_score',92,'reasoning_score',90,'general_score',89),
  array['Excellent open coding benchmark scores','Strong reasoning profile for open-weight class'],
  array['Docs/ecosystem may vary by endpoint'],
  array['Open source','Reasoning','Math','Coding','Agents','RAG','Chatbots'],
  array['Validate enterprise policy/compliance fit'],
  'https://platform.moonshot.ai/docs', 'https://moonshot.ai', null, 'Open model terms vary by release',
  '[{"name":"Kimi K2 Thinking","highlight":"Best open LiveCode / SWE-Bench profile"}]'::jsonb,
  true, 'Nov 2025'
),
(
  'nemotron-ultra-253b', 'Nemotron Ultra 253B', 'NVIDIA',
  'Large open model optimized for advanced reasoning and engineering-centric workloads.',
  'https://logo.clearbit.com/nvidia.com', 'from-lime-500 to-emerald-600',
  '253B', '131072', '$', 'Medium', 'Transformer', true, true,
  jsonb_build_object('gpqa',76.0,'aime_2025',80.08,'swe_bench',52.0,'bfcl',70.2,'grind',57.1,'livecode',69.3,'aider_polyglot',73.8,'speed_tokens_per_sec',65,'latency_ttft_sec',1.1,'input_cost_per_1m',0.3,'output_cost_per_1m',1.2,'coding_score',88,'reasoning_score',87,'general_score',86),
  array['Strong GRIND adaptive reasoning score','High capability open model'],
  array['Large footprint for self-hosted deployments'],
  array['Open source','Reasoning','Coding','Agents','Enterprise'],
  array['Plan infra sizing and quantization strategy'],
  'https://build.nvidia.com/explore/discover', 'https://www.nvidia.com', null, 'Open model license terms vary by release',
  '[{"name":"Nemotron Ultra 253B","highlight":"Top open GRIND benchmark"}]'::jsonb,
  true, 'Nov 2025'
),
(
  'gpt-oss-120b', 'GPT oss 120b', 'OpenAI',
  'Open model variant with very strong AIME-style math and broad coding performance.',
  'https://logo.clearbit.com/openai.com', 'from-teal-500 to-cyan-600',
  '120B', '131072', '$', 'Fast', 'Transformer', true, true,
  jsonb_build_object('gpqa',80.1,'aime_2025',96.6,'swe_bench',58.4,'bfcl',72.3,'grind',50.5,'livecode',74.6,'aider_polyglot',76.4,'speed_tokens_per_sec',420,'latency_ttft_sec',0.55,'input_cost_per_1m',0.15,'output_cost_per_1m',0.6,'coding_score',90,'reasoning_score',89,'general_score',88),
  array['Excellent high-school math benchmark scores','Strong open model value profile'],
  array['Tune prompts and tooling for stable agent behavior'],
  array['Open source','Reasoning','Math','Coding','Agents','RAG'],
  array['Use private evals for domain-specific reliability'],
  'https://platform.openai.com/docs', 'https://openai.com', null, 'Open model terms vary by release',
  '[{"name":"GPT oss 120b","highlight":"Top open AIME score"}]'::jsonb,
  true, 'Nov 2025'
),
(
  'gpt-oss-20b', 'GPT oss 20b', 'OpenAI',
  'Efficient open model with strong reasoning and exceptionally high throughput.',
  'https://logo.clearbit.com/openai.com', 'from-cyan-500 to-blue-600',
  '20B', '131072', '$', 'Very Fast', 'Transformer', true, true,
  jsonb_build_object('gpqa',71.5,'aime_2025',96.0,'swe_bench',47.9,'bfcl',66.7,'grind',45.3,'livecode',68.2,'aider_polyglot',70.4,'speed_tokens_per_sec',564,'latency_ttft_sec',0.4,'input_cost_per_1m',0.08,'output_cost_per_1m',0.35,'coding_score',86,'reasoning_score',84,'general_score',83),
  array['Very high speed and low latency','Strong cost-performance open model'],
  array['Lower frontier quality vs larger siblings'],
  array['Open source','Coding','Math','Agents','RAG','Edge'],
  array['Best for cost-sensitive high-volume automation'],
  'https://platform.openai.com/docs', 'https://openai.com', null, 'Open model terms vary by release',
  '[{"name":"GPT oss 20b","highlight":"Cheapest + fastest open-value profile"}]'::jsonb,
  true, 'Nov 2025'
),
(
  'deepseek-r1', 'DeepSeek-R1', 'DeepSeek',
  'Open reasoning/coding model known for strong agentic benchmark performance.',
  'https://logo.clearbit.com/deepseek.com', 'from-fuchsia-500 to-pink-600',
  null, '131072', '$', 'Fast', 'Transformer', true, false,
  jsonb_build_object('gpqa',72.8,'aime_2025',79.8,'swe_bench',49.2,'bfcl',68.5,'grind',53.6,'livecode',72.7,'aider_polyglot',71.0,'speed_tokens_per_sec',140,'latency_ttft_sec',0.65,'input_cost_per_1m',0.25,'output_cost_per_1m',1.0,'coding_score',88,'reasoning_score',87,'general_score',85),
  array['Strong open reasoning + coding balance','Competitive SWE-Bench style performance'],
  array['May require careful safety scaffolding in production'],
  array['Open source','Reasoning','Coding','Agents','RAG','Chatbots'],
  array['Use robust guardrails for production agent loops'],
  'https://huggingface.co/deepseek-ai', 'https://www.deepseek.com', 'https://huggingface.co/deepseek-ai', 'DeepSeek license (varies)',
  '[{"name":"DeepSeek-R1","highlight":"Strong open SWE-Bench profile"}]'::jsonb,
  true, '2025'
),
(
  'llama-4-scout', 'Llama 4 Scout', 'Meta',
  'Open model with very high throughput and low-latency serving profile.',
  'https://logo.clearbit.com/meta.com', 'from-violet-500 to-purple-600',
  null, '131072', 'Free / API', 'Very Fast', 'Transformer', true, true,
  jsonb_build_object('gpqa',69.4,'aime_2025',74.2,'swe_bench',36.5,'bfcl',67.0,'grind',49.8,'livecode',61.3,'aider_polyglot',63.2,'speed_tokens_per_sec',2600,'latency_ttft_sec',0.33,'input_cost_per_1m',0.12,'output_cost_per_1m',0.45,'coding_score',82,'reasoning_score',81,'general_score',80),
  array['Very high speed tokens/sec','Low latency for interactive workloads'],
  array['Benchmark quality lower than largest frontier models'],
  array['Open source','Coding','Chatbots','Agents','Multimodal','Edge'],
  array['Great for throughput-heavy workloads'],
  'https://ai.meta.com/llama/', 'https://ai.meta.com/llama/', 'https://huggingface.co/meta-llama', 'Meta Llama License',
  '[{"name":"Llama 4 Scout","highlight":"Top speed tokens/sec"}]'::jsonb,
  true, '2025'
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
