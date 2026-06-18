export type DsaQuestionDifficulty = "Beginner" | "Intermediate" | "Advanced" | "Architect";
export type DsaQuestionSource = "LeetCode" | "HackerRank" | "Interview Core" | "Scenario Lab" | "Problem Solving";

export type DsaQuestion = {
  id: string;
  title: string;
  module: string;
  pattern: string;
  source: DsaQuestionSource;
  difficulty: DsaQuestionDifficulty;
  tags: string[];
  prompt: string;
  scenario: string;
  answerSummary: string;
  explanation: string;
  timeComplexity: string;
  spaceComplexity: string;
  complexityReason: string;
  csharpFocus: string;
  pythonFocus: string;
  steps: string[];
};

type ModuleBlueprint = {
  module: string;
  patterns: string[];
  scenarios: string[];
};

type VariantBlueprint = {
  source: DsaQuestionSource;
  difficulty: DsaQuestionDifficulty;
  titleSuffix: string;
  timeComplexity: string;
  spaceComplexity: string;
  complexityReason: string;
  tags: string[];
  answerPrefix: string;
};

const MODULES: ModuleBlueprint[] = [
  {
    module: "Arrays and Strings",
    patterns: ["Two Pointers", "Sliding Window", "Prefix Sum", "Frequency Counting", "In-place Traversal", "Sorting Prep"],
    scenarios: ["log analysis", "text normalization", "inventory lookups"],
  },
  {
    module: "Hashing and Sets",
    patterns: ["Hash Map", "Hash Set", "Counting Table", "Duplicate Detection", "Grouping", "Fast Lookup"],
    scenarios: ["session tracking", "rate limiting", "deduplication"],
  },
  {
    module: "Stacks and Queues",
    patterns: ["Monotonic Stack", "Queue Simulation", "Balanced Symbols", "Undo Flow", "Next Greater Element", "Level Buffer"],
    scenarios: ["browser history", "job scheduling", "stream processing"],
  },
  {
    module: "Linked Lists",
    patterns: ["Fast and Slow Pointer", "Reversal", "Cycle Detection", "Merge Lists", "Pointer Rewiring", "Partitioning"],
    scenarios: ["cache chains", "playlist traversal", "message ordering"],
  },
  {
    module: "Binary Search",
    patterns: ["Answer Space Search", "Lower Bound", "Upper Bound", "Peak Search", "Rotated Search", "Boundary Detection"],
    scenarios: ["capacity planning", "pricing threshold", "latency tuning"],
  },
  {
    module: "Trees and BST",
    patterns: ["DFS Traversal", "BFS Traversal", "BST Property", "Tree Balance", "Path Sum", "Lowest Common Ancestor"],
    scenarios: ["category trees", "permissions hierarchy", "document navigation"],
  },
  {
    module: "Heaps and Priority Queues",
    patterns: ["Top K", "Running Median", "Priority Scheduling", "Merge K Lists", "Greedy Extraction", "Window Heap"],
    scenarios: ["leaderboards", "task dispatch", "alert ranking"],
  },
  {
    module: "Graphs",
    patterns: ["BFS", "DFS", "Topological Sort", "Union Find", "Shortest Path", "Connectivity"],
    scenarios: ["network routing", "dependency graph", "social graph"],
  },
  {
    module: "Recursion and Backtracking",
    patterns: ["Decision Tree", "Subset Generation", "Permutation Search", "Constraint Checking", "State Undo", "Recursive Decomposition"],
    scenarios: ["form generation", "feature combinations", "path exploration"],
  },
  {
    module: "Dynamic Programming",
    patterns: ["1D DP", "2D DP", "Knapsack", "State Compression", "Memoization", "Tabulation"],
    scenarios: ["budget optimization", "capacity matching", "cost minimization"],
  },
  {
    module: "Greedy Algorithms",
    patterns: ["Interval Scheduling", "Local Choice", "Sorting + Sweep", "Resource Allocation", "Min/Max Exchange", "Coverage"],
    scenarios: ["meeting rooms", "shipping batches", "bandwidth allocation"],
  },
  {
    module: "Intervals",
    patterns: ["Merge Intervals", "Sweep Line", "Overlap Counting", "Calendar Booking", "Window Packing", "Boundary Merge"],
    scenarios: ["calendar systems", "bookings", "timeline analytics"],
  },
  {
    module: "Tries and Strings",
    patterns: ["Prefix Tree", "Wildcard Search", "Autocomplete", "Dictionary Walk", "Character Trie", "Prefix Count"],
    scenarios: ["search suggestions", "dictionary engine", "query completion"],
  },
  {
    module: "Bit Manipulation",
    patterns: ["Masking", "XOR Logic", "Bit Count", "State Compression", "Toggle Bits", "Subset Mask"],
    scenarios: ["permissions flags", "compact state", "feature toggles"],
  },
  {
    module: "Math and Logic",
    patterns: ["GCD/LCM", "Prime Logic", "Combinatorics", "Modular Arithmetic", "Pattern Deduction", "Invariant Reasoning"],
    scenarios: ["pagination math", "cycle detection", "distribution logic"],
  },
  {
    module: "Range Queries",
    patterns: ["Prefix Sum", "Difference Array", "Fenwick Tree", "Segment Tree", "Sparse Table", "Offline Query"],
    scenarios: ["analytics dashboard", "live counters", "batch reporting"],
  },
  {
    module: "Design and Architecture",
    patterns: ["Cache-Friendly Access", "Queue Backpressure", "Search Indexing", "Partition Strategy", "Consistency Tradeoff", "Throughput Modeling"],
    scenarios: ["high-traffic API", "realtime feed", "distributed processing"],
  },
  {
    module: "Problem Solving Patterns",
    patterns: ["Brute Force to Optimal", "Pattern Recognition", "Constraint Reframing", "Edge Case Design", "Proof Thinking", "Tradeoff Selection"],
    scenarios: ["interview whiteboard", "production refactor", "incident debugging"],
  },
];

const VARIANTS: VariantBlueprint[] = [
  {
    source: "LeetCode",
    difficulty: "Beginner",
    titleSuffix: "Warmup",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1) to O(n)",
    complexityReason: "The first LeetCode-style version should favor a clear linear pass before optimization.",
    tags: ["beginner", "logical", "leetcode", "problem-solving", "csharp", "python"],
    answerPrefix: "Start with the cleanest pass over the input and make the invariant obvious.",
  },
  {
    source: "HackerRank",
    difficulty: "Intermediate",
    titleSuffix: "Implementation Drill",
    timeComplexity: "O(n) to O(n log n)",
    spaceComplexity: "Depends on the helper structure",
    complexityReason: "HackerRank-style drills usually reward implementation discipline and clear input/output handling.",
    tags: ["intermediate", "scenario", "hackerrank", "implementation", "problem-solving", "csharp", "python"],
    answerPrefix: "Solve the implementation flow first, then explain the structure that keeps the solution efficient.",
  },
  {
    source: "Interview Core",
    difficulty: "Intermediate",
    titleSuffix: "Interview Core",
    timeComplexity: "Usually O(n) or O(n log n)",
    spaceComplexity: "Chosen to support the main pattern",
    complexityReason: "This version mirrors standard interview expectations: recognize the pattern and justify the tradeoff.",
    tags: ["interview", "logical", "problem-solving", "pattern", "csharp", "python"],
    answerPrefix: "Name the pattern early, then walk the interviewer through a small example before code.",
  },
  {
    source: "Scenario Lab",
    difficulty: "Advanced",
    titleSuffix: "Real Scenario",
    timeComplexity: "Workload-aware",
    spaceComplexity: "Tradeoff-aware",
    complexityReason: "Scenario questions test whether the algorithm still makes sense under real constraints, not only textbook input.",
    tags: ["advanced", "scenario", "real-world", "tradeoffs", "problem-solving", "csharp", "python"],
    answerPrefix: "Tie the algorithm to a real system scenario and explain why the data structure choice fits production constraints.",
  },
  {
    source: "Problem Solving",
    difficulty: "Architect",
    titleSuffix: "Architect Review",
    timeComplexity: "Scale-aware",
    spaceComplexity: "Scale-aware",
    complexityReason: "Architect-level questions need reasoning about memory, throughput, observability, and long-term maintainability.",
    tags: ["architect", "advanced", "system-thinking", "tradeoffs", "problem-solving", "csharp", "python"],
    answerPrefix: "Defend the approach not only by Big-O, but also by operability, debugging cost, and scale behavior.",
  },
  {
    source: "LeetCode",
    difficulty: "Intermediate",
    titleSuffix: "Blind 75 Style",
    timeComplexity: "O(n) to O(n log n)",
    spaceComplexity: "Pattern-dependent",
    complexityReason: "This variant emphasizes the most repeated interview patterns and fast recognition.",
    tags: ["leetcode", "logical", "pattern", "intermediate", "problem-solving", "csharp", "python"],
    answerPrefix: "Recognize the recurring interview pattern quickly and explain why it fits before coding.",
  },
  {
    source: "HackerRank",
    difficulty: "Beginner",
    titleSuffix: "Warmup Drill",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1) to O(n)",
    complexityReason: "Warmup drills test correctness, clean loops, and simple state tracking.",
    tags: ["beginner", "hackerrank", "warmup", "logical", "csharp", "python"],
    answerPrefix: "Keep the code direct, accurate, and easy to trace with a small sample input.",
  },
  {
    source: "Interview Core",
    difficulty: "Advanced",
    titleSuffix: "Follow-up Heavy",
    timeComplexity: "Optimized for follow-up constraints",
    spaceComplexity: "Tradeoff-aware",
    complexityReason: "Follow-up rounds usually test whether you can adapt the pattern when constraints change.",
    tags: ["advanced", "interview", "follow-up", "problem-solving", "csharp", "python"],
    answerPrefix: "Answer the base problem first, then explain how the approach changes when constraints become stricter.",
  },
  {
    source: "Scenario Lab",
    difficulty: "Intermediate",
    titleSuffix: "Business Scenario",
    timeComplexity: "Input-aware",
    spaceComplexity: "Structure-aware",
    complexityReason: "Business scenarios test whether you can translate algorithmic thinking into real workflows.",
    tags: ["scenario", "business", "intermediate", "problem-solving", "csharp", "python"],
    answerPrefix: "Map the input shape to a real workflow and then pick the smallest structure that solves it clearly.",
  },
  {
    source: "Problem Solving",
    difficulty: "Advanced",
    titleSuffix: "Optimization Review",
    timeComplexity: "Better than brute force",
    spaceComplexity: "Explained explicitly",
    complexityReason: "Optimization reviews check whether you can remove wasted work and defend the new tradeoff.",
    tags: ["advanced", "optimization", "problem-solving", "logical", "csharp", "python"],
    answerPrefix: "Show the wasted work in the first solution, then prove why the optimized path removes it.",
  },
];

const uniq = (values: string[]) => [...new Set(values)];

const buildQuestion = (
  moduleBlueprint: ModuleBlueprint,
  pattern: string,
  scenario: string,
  variant: VariantBlueprint,
  index: number,
): DsaQuestion => {
  const sharedTags = [
    moduleBlueprint.module.toLowerCase(),
    pattern.toLowerCase(),
    scenario.toLowerCase(),
  ];

  return {
    id: `DSA-${String(index).padStart(4, "0")}`,
    title: `${moduleBlueprint.module} · ${pattern} · ${variant.titleSuffix}`,
    module: moduleBlueprint.module,
    pattern,
    source: variant.source,
    difficulty: variant.difficulty,
    tags: uniq([...variant.tags, ...sharedTags]),
    prompt: `Solve a ${variant.difficulty.toLowerCase()} ${pattern.toLowerCase()} problem inside ${moduleBlueprint.module.toLowerCase()}. Use the ${scenario} scenario, explain the data flow in simple words, compare the first brute-force idea with the better approach, and prioritize C# and Python solutions.`,
    scenario: `Imagine a ${scenario} workflow where ${moduleBlueprint.module.toLowerCase()} must remain correct, readable, and efficient under real input growth.`,
    answerSummary: `${variant.answerPrefix} For ${pattern.toLowerCase()}, keep the state transition explicit, make edge cases visible, and show how the algorithm behaves on one small traced example.`,
    explanation: `This question belongs to ${moduleBlueprint.module}. The goal is not just to return the final answer, but to explain why ${pattern.toLowerCase()} is the right pattern here. A strong answer starts with the naive path, identifies the wasted work, introduces the better structure, then explains the complexity reason in simple language. The final explanation should be understandable to a beginner but still precise enough for a strong interview round.`,
    timeComplexity: variant.timeComplexity,
    spaceComplexity: variant.spaceComplexity,
    complexityReason: variant.complexityReason,
    csharpFocus: `In C#, use explicit types, clear collections, and readable variable names so the reasoning is easy to defend in a production-style interview.`,
    pythonFocus: `In Python, keep the solution compact but still narrate the state changes, helper structures, and why the code remains easy to reason about.`,
    steps: [
      `Restate the ${scenario} scenario in plain words and define the expected output.`,
      `Write down the brute-force idea for ${pattern.toLowerCase()} and identify where the extra work happens.`,
      `Switch to the better structure or pattern and trace one small example step by step.`,
      `State the time and space complexity and explain the reason behind both values.`,
      `Compare how the same solution would look in C# and Python.`,
    ],
  };
};

export const DSA_QUESTION_BANK: DsaQuestion[] = (() => {
  const out: DsaQuestion[] = [];
  let index = 1;

  for (const moduleBlueprint of MODULES) {
    moduleBlueprint.patterns.forEach((pattern, patternIndex) => {
      const scenario = moduleBlueprint.scenarios[patternIndex % moduleBlueprint.scenarios.length];
      VARIANTS.forEach((variant) => {
        out.push(buildQuestion(moduleBlueprint, pattern, scenario, variant, index++));
      });
    });
  }

  return out;
})();

export const DSA_QUESTION_BANK_STATS = {
  total: DSA_QUESTION_BANK.length,
  tagCount: new Set(DSA_QUESTION_BANK.flatMap((question) => question.tags)).size,
  moduleCount: new Set(DSA_QUESTION_BANK.map((question) => question.module)).size,
};

export const DSA_QUESTION_TAGS = [...new Set(DSA_QUESTION_BANK.flatMap((question) => question.tags))].sort();
