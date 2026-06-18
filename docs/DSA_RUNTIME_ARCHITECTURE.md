# DSA Runtime Architecture

This is the DSA-only runtime scaffold for the embedded `dsa-mastery-csharp.html` experience.

## Goal

Enable per-question execution for:

- `C#`
- `Python`
- `Java`

And return:

- stdout/stderr
- compile output
- structured trace events
- complexity explanation metadata

## Current contract

Request:

```json
{
  "language": "csharp",
  "sourceCode": "Console.WriteLine(\"TRACE::{\\\"step\\\":\\\"1\\\"}\");",
  "stdin": "",
  "questionId": "Q001",
  "approachLabel": "Hash Map"
}
```

Response:

```json
{
  "ok": true,
  "status": { "id": 3, "description": "Accepted" },
  "stdout": "regular output without TRACE lines",
  "stderr": "",
  "compileOutput": "",
  "executionMs": 12,
  "memoryKb": 18432,
  "trace": [
    { "step": "1", "title": "Read input", "state": "n=6" }
  ],
  "complexity": {
    "time": "Derived from the chosen algorithmic approach",
    "space": "Derived from helper data structures and recursion depth",
    "reason": "Runtime execution shows behavior, but complexity still depends on the algorithmic approach implemented by the user."
  }
}
```

## Trace protocol

The executor extracts lines prefixed with `TRACE::`.

Example:

```text
TRACE::{"step":"1","title":"Initialize","state":"left=0,right=5"}
TRACE::{"step":"2","title":"Compare","state":"sum=9"}
```

These trace lines are removed from `stdout` and returned separately as structured `trace`.

## Environment variables

- `JUDGE0_API_URL`
- `JUDGE0_API_KEY` (optional if your provider is public/internal-network trusted)
- `JUDGE0_LANG_CSHARP` default `51`
- `JUDGE0_LANG_PYTHON` default `71`
- `JUDGE0_LANG_JAVA` default `62`

## Honest limitation

Execution can produce real trace events only if the code emits them or if a deeper instrumentation layer exists.

That means:

- static complexity inference is still heuristic
- arbitrary user-edited code cannot be transformed into perfect flow diagrams without language-specific AST/runtime instrumentation

## Next step

If you want true live code-to-flow behavior, add language-specific instrumentation:

1. AST parse submitted code
2. inject trace hooks around assignments, loops, and conditionals
3. execute instrumented code
4. convert captured events into animated flow graphs
