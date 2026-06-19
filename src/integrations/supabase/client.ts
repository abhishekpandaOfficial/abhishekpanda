import type { Database } from './types';

// Check if running on localhost to enable development database simulation
const isLocalhost = typeof window !== "undefined" && 
  (window.location.hostname === "localhost" || 
   window.location.hostname === "127.0.0.1" || 
   window.location.hostname === "::1");

// Helper for local storage mock db tables
const getMockTable = (table: string): any[] => {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(`mock_db_${table}`);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error(`Failed to read mock table ${table}:`, e);
  }

  // Seed default data if empty
  const defaults = getTableDefaults(table);
  if (defaults.length > 0) {
    setMockTable(table, defaults);
    return defaults;
  }
  return [];
};

const setMockTable = (table: string, data: any[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`mock_db_${table}`, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save mock table ${table}:`, e);
  }
};

// Seed values for basic tables
const getTableDefaults = (table: string): any[] => {
  if (table === 'user_roles') {
    return [{ role: 'admin' }];
  }
  if (table === 'admin_mfa_sessions') {
    return [{ 
      fully_verified_at: new Date().toISOString(), 
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() 
    }];
  }
  if (table === 'courses') {
    return [
      {
        id: "course-1",
        title: "DSA Mastery (C#)",
        slug: "dsa-mastery-csharp",
        description: "Master Data Structures and Algorithms with C# from scratch.",
        level: "Intermediate",
        duration: "40 hours",
        is_published: true,
        price: 99,
        created_at: new Date().toISOString()
      },
      {
        id: "course-2",
        title: "Azure Cloud Mastery",
        slug: "azure-mastery",
        description: "Deep dive into Azure App Services, Functions, and DevOps.",
        level: "Advanced",
        duration: "30 hours",
        is_published: true,
        price: 149,
        created_at: new Date().toISOString()
      }
    ];
  }
  if (table === 'contact_requests') {
    return [
      {
        id: "req-1",
        name: "John Doe",
        email: "john@example.com",
        reason: "Business Partnership",
        intent: "Interested in hiring you for enterprise training.",
        created_at: new Date().toISOString(),
        ip_address: "127.0.0.1",
        user_agent: "Chrome"
      },
      {
        id: "req-2",
        name: "Alice Smith",
        email: "alice@example.com",
        reason: "Course Inquiry",
        intent: "Do you offer group discounts for the DSA Mastery course?",
        created_at: new Date().toISOString(),
        ip_address: "127.0.0.1",
        user_agent: "Chrome"
      }
    ];
  }
  if (table === 'ebooks') {
    return [
      {
        id: "ebook-1",
        title: "System Design Blueprint",
        slug: "system-design-blueprint",
        description: "Architecting highly scalable, fault-tolerant distributed systems.",
        is_published: true,
        price: 29,
        created_at: new Date().toISOString()
      }
    ];
  }
  if (table === 'blog_posts') {
    return [
      {
        id: "blog-1",
        title: "Getting Started with Tauri and React",
        slug: "getting-started-tauri-react",
        excerpt: "Learn how to build lightweight, fast desktop apps using Tauri and React.",
        content: "Tauri is a framework for building tiny, blazing fast binaries for all major desktop platforms...",
        is_published: true,
        created_at: new Date().toISOString()
      }
    ];
  }
  if (table === 'page_views') {
    const now = new Date();
    const generateViews = () => {
      const views = [];
      const pages = ['/', '/about', '/blog', '/courses', '/ebooks', '/contact', '/projects'];
      const ips = ['192.168.1.50', '203.0.113.195', '198.51.100.42', '203.0.113.88', '198.51.100.12', '93.184.216.34', '185.190.140.10'];
      const browsers = ['Chrome', 'Safari', 'Firefox', 'Edge'];
      const devices = ['desktop', 'mobile', 'tablet'];
      const locations = ['California, USA', 'London, UK', 'Mumbai, India', 'Sydney, Australia', 'Berlin, Germany', 'Tokyo, Japan', 'Paris, France'];
      
      for (let i = 0; i < 30; i++) {
        const date = new Date(now.getTime() - i * 4 * 60 * 60 * 1000); // spread over last 5 days
        views.push({
          id: `pv-${i}`,
          created_at: date.toISOString(),
          ip_address: ips[i % ips.length],
          page_path: pages[i % pages.length],
          browser: browsers[i % browsers.length],
          device_type: devices[i % devices.length],
          location: locations[i % locations.length],
          user_agent: `Mozilla/5.0 (${devices[i % devices.length] === 'desktop' ? 'Windows NT 10.0; Win64; x64' : 'iPhone; CPU iPhone OS 16_5 like Mac OS X'}) AppleWebKit/537.36`,
          user_email: i % 5 === 0 ? 'guest@example.com' : 'Anonymous'
        });
      }
      return views;
    };
    return generateViews();
  }
  if (table === 'login_audit_logs') {
    const now = new Date();
    return [
      {
        id: "audit-1",
        email: "admin@example.com",
        status: "session_started",
        device_type: "desktop",
        browser: "Chrome",
        user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        created_at: new Date(now.getTime() - 10 * 60 * 1000).toISOString(),
        ip_address: "127.0.0.1",
        failure_reason: null
      },
      {
        id: "audit-2",
        email: "admin@example.com",
        status: "attempt",
        device_type: "desktop",
        browser: "Chrome",
        user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        created_at: new Date(now.getTime() - 11 * 60 * 1000).toISOString(),
        ip_address: "127.0.0.1",
        failure_reason: null
      },
      {
        id: "audit-3",
        email: "intruder@malicious.com",
        status: "failed",
        device_type: "mobile",
        browser: "Firefox",
        user_agent: "Mozilla/5.0 (Android; Mobile; rv:109.0) Gecko/115.0 Firefox/115.0",
        created_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        ip_address: "198.51.100.77",
        failure_reason: "Invalid credentials"
      }
    ];
  }
  if (table === 'portfolio_projects') {
    return [
      {
        id: "proj-chronyx",
        name: "CHRONYX",
        website: "https://www.getchronyx.com/",
        status: "Live",
        summary: "A focused personal operating system for planning, notes, routines, and life-level execution in one calm workspace.",
        stacks: ["React", "TypeScript", "PostgreSQL", "Azure", "OpenAI"],
        logo_icon: "Bot"
      },
      {
        id: "proj-stackcraft",
        name: "StackCraft",
        website: "https://www.stackcraft.io/",
        status: "Live",
        summary: "A stack-first engineering platform to help teams move from architecture decisions to real implementation faster.",
        stacks: ["Next.js", "TypeScript", "Docker", "Kubernetes", "AWS"],
        logo_icon: "Layers"
      },
      {
        id: "proj-llmgalaxy",
        name: "LLM Galaxy",
        website: "https://www.abhishekpanda.com/llm-galaxy",
        status: "Live",
        summary: "A model-intelligence hub for comparing open and closed-source AI models, capability layers, and practical routing decisions.",
        stacks: ["React", "TypeScript", "OpenAI", "Python", "AWS"],
        logo_icon: "Brain"
      },
      {
        id: "proj-newstack",
        name: "NEWSTACK",
        website: "https://www.newstack.live/",
        status: "Live",
        summary: "A modern product and updates surface designed for fast discovery, curated launches, and ecosystem visibility.",
        stacks: ["React", "TypeScript", "MongoDB", "Docker", "AWS"],
        logo_icon: "Globe"
      },
      {
        id: "proj-finioraa",
        name: "FINIORAA",
        website: "https://www.finioraa.com/",
        status: "InDevelopment",
        summary: "A fintech product concept for cleaner money operations, financial awareness, and smart workflow automation.",
        stacks: ["Next.js", "TypeScript", "PostgreSQL", "Azure", "Docker"],
        logo_icon: "Activity"
      },
      {
        id: "proj-backfire",
        name: "BackFire",
        website: "https://www.abhishekpanda.com/backfire-docs.html",
        status: "Todo",
        summary: "A distributed background job runtime concept for reliable retries, scheduling, worker orchestration, and operational visibility.",
        stacks: ["TypeScript", "Docker", "Kubernetes", "PostgreSQL", "Azure"],
        logo_icon: "Rocket"
      },
      {
        id: "proj-groovify",
        name: "Groovify",
        website: "https://groovify-omega.vercel.app/",
        status: "Live",
        summary: "A music-first product concept for curated discovery, private listening flows, and expressive audio experiences.",
        stacks: ["React", "TypeScript", "MongoDB", "AWS", "Docker"],
        logo_icon: "Music"
      },
      {
        id: "proj-scribe",
        name: "Scribe",
        website: "https://scribe-rosy-eight.vercel.app/",
        status: "Live",
        summary: "A writing and documentation workspace built for clean drafting, editing flow, and fast publishing.",
        stacks: ["Next.js", "TypeScript", "MongoDB", "OpenAI", "Docker"],
        logo_icon: "FileText"
      },
      {
        id: "proj-proxinex",
        name: "Proxinex",
        website: "https://www.proxinex.com/",
        status: "Live",
        summary: "A proxy and networking-focused engineering platform built for reliability, control, and distributed routing workflows.",
        stacks: ["React", "TypeScript", "Docker", "Kubernetes", "AWS"],
        logo_icon: "Shield"
      },
      {
        id: "proj-qualyx",
        name: "QUALYX",
        website: "http://getqualyx.com/",
        status: "Live",
        summary: "A quality and delivery governance platform for teams that want measurable engineering confidence and release clarity.",
        stacks: ["React", "TypeScript", "PostgreSQL", "Azure", "OpenAI"],
        logo_icon: "CheckCircle2"
      },
      {
        id: "proj-cognix",
        name: "Cognix",
        website: "https://cognix-drab.vercel.app/",
        status: "Live",
        summary: "An intelligence-first experience for contextual thinking, decision support, and practical AI-native workflows.",
        stacks: ["Next.js", "TypeScript", "OpenAI", "PostgreSQL", "Docker"],
        logo_icon: "Sparkles"
      },
      {
        id: "proj-originxone",
        name: "OriginXOne",
        website: "https://www.originxcloud.com/",
        status: "Live",
        summary: "A cloud operating layer concept for orchestrating platforms, products, and operational workflows from one unified surface.",
        stacks: ["React", "TypeScript", "Azure", "Kubernetes", "PostgreSQL"],
        logo_icon: "Globe"
      },
      {
        id: "proj-openowl",
        name: "OpenOwl",
        website: "https://openowl.in/",
        status: "Live",
        summary: "An AI-first assistant platform focused on intelligent workflows, context-aware guidance, and productized conversational experiences.",
        stacks: ["Next.js", "TypeScript", "OpenAI", "PostgreSQL", "Docker"],
        logo_icon: "Bot"
      }
    ];
  }
  return [];
};

type QueryResult<T = unknown> = Promise<{ data: T | null; error: null }>;

const emptyQueryResult = async <T = unknown>(data: T | null = null): QueryResult<T> => ({
  data,
  error: null,
});

const createQueryBuilder = (table: string) => {
  let operation: 'select' | 'insert' | 'update' | 'delete' = 'select';
  let payload: any = null;
  const filters: { field: string; value: any; op: 'eq' | 'neq' }[] = [];
  let orderField: string | null = null;
  let orderAscending = true;

  const builder: any = {};

  const execute = () => {
    let data = getMockTable(table);

    if (operation === 'select') {
      let filtered = [...data];
      for (const filter of filters) {
        if (filter.op === 'eq') {
          filtered = filtered.filter(row => String(row[filter.field]) === String(filter.value));
        } else if (filter.op === 'neq') {
          filtered = filtered.filter(row => String(row[filter.field]) !== String(filter.value));
        }
      }

      if (orderField) {
        filtered.sort((a, b) => {
          const valA = a[orderField!];
          const valB = b[orderField!];
          if (valA === undefined || valA === null) return 1;
          if (valB === undefined || valB === null) return -1;
          if (valA < valB) return orderAscending ? -1 : 1;
          if (valA > valB) return orderAscending ? 1 : -1;
          return 0;
        });
      }
      return filtered;
    }

    if (operation === 'insert') {
      const rows = Array.isArray(payload) ? payload : [payload];
      const newRows = rows.map((r, index) => ({
        id: r.id || `mock-id-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
        created_at: r.created_at || new Date().toISOString(),
        ...r
      }));
      const updatedData = [...data, ...newRows];
      setMockTable(table, updatedData);
      return newRows;
    }

    if (operation === 'update') {
      const updatedRows: any[] = [];
      const updatedData = data.map(row => {
        let matches = true;
        for (const filter of filters) {
          if (filter.op === 'eq' && String(row[filter.field]) !== String(filter.value)) {
            matches = false;
          }
          if (filter.op === 'neq' && String(row[filter.field]) === String(filter.value)) {
            matches = false;
          }
        }

        if (matches) {
          const updatedRow = { ...row, ...payload };
          updatedRows.push(updatedRow);
          return updatedRow;
        }
        return row;
      });

      setMockTable(table, updatedData);
      return updatedRows;
    }

    if (operation === 'delete') {
      const deletedRows: any[] = [];
      const updatedData = data.filter(row => {
        let matches = true;
        for (const filter of filters) {
          if (filter.op === 'eq' && String(row[filter.field]) !== String(filter.value)) {
            matches = false;
          }
          if (filter.op === 'neq' && String(row[filter.field]) === String(filter.value)) {
            matches = false;
          }
        }

        if (matches) {
          deletedRows.push(row);
          return false; // exclude from updated data (delete it)
        }
        return true;
      });

      setMockTable(table, updatedData);
      return deletedRows;
    }

    return [];
  };

  const proxy = new Proxy(builder, {
    get: (target, key, receiver) => {
      if (key === "then") {
        return (resolve: (value: { data: any; error: any }) => void) => {
          if (!isLocalhost) {
            resolve({ data: null, error: null });
            return;
          }
          try {
            const res = execute();
            resolve({ data: res, error: null });
          } catch (err: any) {
            resolve({ data: null, error: { message: err.message || "Query failed" } });
          }
        };
      }

      if (key === "select") {
        return () => {
          operation = 'select';
          return receiver;
        };
      }

      if (key === "insert") {
        return (arg: any) => {
          operation = 'insert';
          payload = arg;
          return receiver;
        };
      }

      if (key === "update") {
        return (arg: any) => {
          operation = 'update';
          payload = arg;
          return receiver;
        };
      }

      if (key === "delete") {
        return () => {
          operation = 'delete';
          return receiver;
        };
      }

      if (key === "eq") {
        return (field: string, value: any) => {
          filters.push({ field, value, op: 'eq' });
          return receiver;
        };
      }

      if (key === "neq") {
        return (field: string, value: any) => {
          filters.push({ field, value, op: 'neq' });
          return receiver;
        };
      }

      if (key === "order") {
        return (field: string, options?: { ascending?: boolean }) => {
          orderField = field;
          orderAscending = options?.ascending !== false;
          return receiver;
        };
      }

      if (key === "single" || key === "maybeSingle") {
        return () => {
          return {
            then: (resolve: (value: { data: any; error: any }) => void) => {
              if (!isLocalhost) {
                resolve({ data: null, error: null });
                return;
              }
              try {
                const res = execute();
                const item = Array.isArray(res) && res.length > 0 ? res[0] : null;
                resolve({ data: item, error: null });
              } catch (err: any) {
                resolve({ data: null, error: { message: err.message || "Query failed" } });
              }
            }
          };
        };
      }

      if (key === "csv") return () => emptyQueryResult("");

      return () => receiver;
    }
  });

  return proxy;
};

const createChannel = () => ({
  on: () => createChannel(),
  subscribe: () => ({ unsubscribe: () => undefined }),
  unsubscribe: () => undefined,
  send: () => Promise.resolve({ data: null, error: null }),
});

const auth = {
  async getSession() {
    if (isLocalhost) {
      const stored = localStorage.getItem("mock_supabase_session");
      if (stored) {
        try {
          return { data: { session: JSON.parse(stored) }, error: null };
        } catch (e) {}
      }
    }
    return { data: { session: null }, error: null };
  },
  async getUser() {
    if (isLocalhost) {
      const stored = localStorage.getItem("mock_supabase_session");
      if (stored) {
        try {
          const session = JSON.parse(stored);
          return { data: { user: session.user }, error: null };
        } catch (e) {}
      }
    }
    return { data: { user: null }, error: null };
  },
  async signInWithPassword({ email, password }: any) {
    if (isLocalhost) {
      const mockUser = { id: "mock-admin-id", email: email || "admin@example.com" };
      const mockSession = { user: mockUser, access_token: "mock-access-token" };
      localStorage.setItem("mock_supabase_session", JSON.stringify(mockSession));
      return { data: { user: mockUser, session: mockSession }, error: null };
    }
    return { data: { user: null, session: null }, error: { message: "Authentication service is temporarily unavailable" } };
  },
  async signOut() {
    if (isLocalhost) {
      localStorage.removeItem("mock_supabase_session");
    }
    return { error: null };
  },
  onAuthStateChange(callback?: (event: string, session: any) => void) {
    if (isLocalhost && callback) {
      const stored = localStorage.getItem("mock_supabase_session");
      if (stored) {
        try {
          const session = JSON.parse(stored);
          setTimeout(() => callback('SIGNED_IN', session), 0);
        } catch (e) {}
      }
    }
    return { data: { subscription: { unsubscribe: () => undefined } } };
  },
};

const functions = {
  async invoke() {
    return { data: null, error: null };
  },
};

const storage = {
  from() {
    return {
      async upload() {
        return { data: null, error: null };
      },
      async createSignedUrl() {
        return { data: { signedUrl: "" }, error: null };
      },
      getPublicUrl() {
        return { data: { publicUrl: "" } };
      },
      async remove() {
        return { data: null, error: null };
      },
      async list() {
        return { data: [], error: null };
      },
    };
  },
};

const supabaseClient = {
  auth,
  functions,
  storage,
  from: (table: string) => createQueryBuilder(table),
  rpc: async () => ({ data: null, error: null }),
  channel: () => createChannel(),
  removeChannel: () => undefined,
};

export const supabase = supabaseClient as unknown as Database & {
  auth: typeof auth;
  functions: typeof functions;
  storage: typeof storage;
  from: (table: string) => ReturnType<typeof createQueryBuilder>;
  rpc: (fn: string, params?: Record<string, unknown>) => Promise<{ data: null; error: null }>;
  channel: (name: string) => ReturnType<typeof createChannel>;
  removeChannel: (channel: ReturnType<typeof createChannel>) => void;
};
