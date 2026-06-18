import type { Database } from './types';

type QueryResult<T = unknown> = Promise<{ data: T | null; error: null }>;

const emptyQueryResult = async <T = unknown>(data: T | null = null): QueryResult<T> => ({
  data,
  error: null,
});

const createQueryBuilder = () => {
  const builder: Record<string, unknown> = {};

  const chain = (result: unknown = builder) => result;

  return new Proxy(builder, {
    get: (_, key) => {
      if (key === "then") {
        return (resolve: (value: { data: null; error: null }) => void) => resolve({ data: null, error: null });
      }

      if (key === "select") return () => chain();
      if (key === "insert") return () => chain();
      if (key === "update") return () => chain();
      if (key === "upsert") return () => chain();
      if (key === "delete") return () => chain();
      if (key === "eq") return () => chain();
      if (key === "neq") return () => chain();
      if (key === "gt") return () => chain();
      if (key === "gte") return () => chain();
      if (key === "lt") return () => chain();
      if (key === "lte") return () => chain();
      if (key === "ilike") return () => chain();
      if (key === "in") return () => chain();
      if (key === "contains") return () => chain();
      if (key === "is") return () => chain();
      if (key === "not") return () => chain();
      if (key === "or") return () => chain();
      if (key === "order") return () => chain();
      if (key === "limit") return () => chain();
      if (key === "range") return () => chain();
      if (key === "single") return () => emptyQueryResult();
      if (key === "maybeSingle") return () => emptyQueryResult();
      if (key === "csv") return () => emptyQueryResult("");

      return () => chain();
    },
  });
};

const createChannel = () => ({
  on: () => createChannel(),
  subscribe: () => ({ unsubscribe: () => undefined }),
  unsubscribe: () => undefined,
  send: () => Promise.resolve({ data: null, error: null }),
});

const auth = {
  async getSession() {
    return { data: { session: null }, error: null };
  },
  async getUser() {
    return { data: { user: null }, error: null };
  },
  async signInWithPassword() {
    return { data: { user: null, session: null }, error: { message: "Supabase is disabled" } };
  },
  async signOut() {
    return { error: null };
  },
  onAuthStateChange() {
    return { data: { subscription: { unsubscribe: () => undefined } } };
  },
};

const functions = {
  async invoke() {
    return { data: null, error: { message: "Supabase is disabled" } };
  },
};

const storage = {
  from() {
    return {
      async upload() {
        return { data: null, error: { message: "Supabase is disabled" } };
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
  from: () => createQueryBuilder(),
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
