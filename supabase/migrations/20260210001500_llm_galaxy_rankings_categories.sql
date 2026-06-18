-- Enrich LLM Galaxy with benchmark snapshots + capability ranking scores + category tags.

update public.llm_models
set benchmarks = coalesce(benchmarks, '{}'::jsonb) || jsonb_build_object(
  'mmlu', 89.2,
  'gsm8k', 95.1,
  'humaneval', 92.4,
  'truthfulqa', 78.6,
  'mtbench', 8.9,
  'arena_elo', 1345,
  'coding_score', 94,
  'voice_score', 90,
  'video_score', 82,
  'stt_score', 91,
  'tts_score', 90,
  's2s_score', 88,
  'image_gen_score', 80,
  'video_gen_score', 74,
  'reasoning_score', 93,
  'chatbot_score', 94,
  'agents_score', 93,
  'rag_score', 90,
  'general_score', 93
),
use_cases = array[
  'Coding','Reasoning','Agents','Chatbots','Multimodal','Enterprise','RAG',
  'Voice','Speech to Text','Text to Speech','Speech to Speech','Image Generation','Video Understanding'
]
where slug = 'gpt';

update public.llm_models
set benchmarks = coalesce(benchmarks, '{}'::jsonb) || jsonb_build_object(
  'mmlu', 88.4,
  'gsm8k', 94.6,
  'humaneval', 90.8,
  'truthfulqa', 81.2,
  'mtbench', 8.8,
  'arena_elo', 1328,
  'coding_score', 92,
  'voice_score', 70,
  'video_score', 72,
  'stt_score', 68,
  'tts_score', 66,
  's2s_score', 63,
  'image_gen_score', 70,
  'video_gen_score', 62,
  'reasoning_score', 92,
  'chatbot_score', 93,
  'agents_score', 90,
  'rag_score', 91,
  'general_score', 92
),
use_cases = array[
  'Long context','Analysis','Safety','Coding','Chatbots','Enterprise','RAG','Multimodal','Agents'
]
where slug = 'claude';

update public.llm_models
set benchmarks = coalesce(benchmarks, '{}'::jsonb) || jsonb_build_object(
  'mmlu', 87.9,
  'gsm8k', 93.2,
  'humaneval', 89.7,
  'truthfulqa', 76.5,
  'mtbench', 8.6,
  'arena_elo', 1312,
  'coding_score', 90,
  'voice_score', 88,
  'video_score', 85,
  'stt_score', 87,
  'tts_score', 86,
  's2s_score', 83,
  'image_gen_score', 86,
  'video_gen_score', 80,
  'reasoning_score', 90,
  'chatbot_score', 91,
  'agents_score', 90,
  'rag_score', 88,
  'general_score', 90
),
use_cases = array[
  'Multimodal','Research','Scale','Agents','RAG','Chatbots','Enterprise',
  'Voice','Speech to Text','Text to Speech','Image Generation','Video Understanding','Coding'
]
where slug = 'gemini';

update public.llm_models
set benchmarks = coalesce(benchmarks, '{}'::jsonb) || jsonb_build_object(
  'mmlu', 84.3,
  'gsm8k', 89.1,
  'humaneval', 86.8,
  'truthfulqa', 71.2,
  'mtbench', 8.1,
  'arena_elo', 1258,
  'coding_score', 88,
  'voice_score', 52,
  'video_score', 60,
  'stt_score', 45,
  'tts_score', 43,
  's2s_score', 40,
  'image_gen_score', 58,
  'video_gen_score', 48,
  'reasoning_score', 85,
  'chatbot_score', 86,
  'agents_score', 84,
  'rag_score', 86,
  'general_score', 85
),
use_cases = array[
  'Open source','Fine-tuning','Enterprise','RAG','Agents','Chatbots','Coding','Multimodal','Reasoning'
]
where slug = 'llama';

update public.llm_models
set benchmarks = coalesce(benchmarks, '{}'::jsonb) || jsonb_build_object(
  'mmlu', 85.7,
  'gsm8k', 90.2,
  'humaneval', 88.5,
  'truthfulqa', 73.1,
  'mtbench', 8.3,
  'arena_elo', 1276,
  'coding_score', 90,
  'voice_score', 55,
  'video_score', 62,
  'stt_score', 50,
  'tts_score', 47,
  's2s_score', 45,
  'image_gen_score', 60,
  'video_gen_score', 52,
  'reasoning_score', 87,
  'chatbot_score', 88,
  'agents_score', 86,
  'rag_score', 87,
  'general_score', 87
),
use_cases = array[
  'Multilingual','Coding','Math','Open source','RAG','Agents','Chatbots','Reasoning'
]
where slug = 'qwen';

update public.llm_models
set benchmarks = coalesce(benchmarks, '{}'::jsonb) || jsonb_build_object(
  'mmlu', 84.8,
  'gsm8k', 89.7,
  'humaneval', 90.1,
  'truthfulqa', 70.8,
  'mtbench', 8.2,
  'arena_elo', 1269,
  'coding_score', 91,
  'voice_score', 50,
  'video_score', 58,
  'stt_score', 44,
  'tts_score', 42,
  's2s_score', 41,
  'image_gen_score', 56,
  'video_gen_score', 50,
  'reasoning_score', 86,
  'chatbot_score', 87,
  'agents_score', 85,
  'rag_score', 85,
  'general_score', 86
),
use_cases = array[
  'Coding','Reasoning','Open source','RAG','Agents','Chatbots'
]
where slug = 'deepseek';

update public.llm_models
set benchmarks = coalesce(benchmarks, '{}'::jsonb) || jsonb_build_object(
  'mmlu', 82.9,
  'gsm8k', 87.4,
  'humaneval', 85.5,
  'truthfulqa', 69.4,
  'mtbench', 8.0,
  'arena_elo', 1238,
  'coding_score', 87,
  'voice_score', 57,
  'video_score', 66,
  'stt_score', 53,
  'tts_score', 50,
  's2s_score', 48,
  'image_gen_score', 67,
  'video_gen_score', 54,
  'reasoning_score', 84,
  'chatbot_score', 84,
  'agents_score', 83,
  'rag_score', 84,
  'general_score', 83
),
use_cases = array[
  'Efficiency','Open source','Coding','Enterprise','RAG','Multimodal','Image Generation'
]
where slug = 'mistral';

update public.llm_models
set benchmarks = coalesce(benchmarks, '{}'::jsonb) || jsonb_build_object(
  'mmlu', 80.7,
  'gsm8k', 84.9,
  'humaneval', 82.8,
  'truthfulqa', 67.2,
  'mtbench', 7.8,
  'arena_elo', 1212,
  'coding_score', 84,
  'voice_score', 46,
  'video_score', 55,
  'stt_score', 42,
  'tts_score', 40,
  's2s_score', 39,
  'image_gen_score', 52,
  'video_gen_score', 46,
  'reasoning_score', 82,
  'chatbot_score', 82,
  'agents_score', 79,
  'rag_score', 81,
  'general_score', 81
),
use_cases = array[
  'Small models','Edge','Open source','Coding','Agents','RAG'
]
where slug = 'phi';

update public.llm_models
set benchmarks = coalesce(benchmarks, '{}'::jsonb) || jsonb_build_object(
  'mmlu', 83.2,
  'gsm8k', 88.1,
  'humaneval', 84.7,
  'truthfulqa', 70.9,
  'mtbench', 8.4,
  'arena_elo', 1291,
  'coding_score', 86,
  'voice_score', 89,
  'video_score', 72,
  'stt_score', 88,
  'tts_score', 87,
  's2s_score', 86,
  'image_gen_score', 68,
  'video_gen_score', 61,
  'reasoning_score', 85,
  'chatbot_score', 90,
  'agents_score', 88,
  'rag_score', 83,
  'general_score', 86
),
use_cases = array[
  'Chatbots','Agents','Multimodal','Enterprise','Voice','Speech to Text','Text to Speech','Speech to Speech','Reasoning'
]
where slug = 'grok';
