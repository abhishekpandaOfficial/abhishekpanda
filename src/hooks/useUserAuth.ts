import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface UserAuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
}

export const useUserAuth = (): UserAuthState => {
  const [state, setState] = useState<UserAuthState>({
    user: null,
    session: null,
    isLoading: true,
  });

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      setState({
        session: data.session ?? null,
        user: data.session?.user ?? null,
        isLoading: false,
      });
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setState((prev) => ({
        ...prev,
        session: session ?? null,
        user: session?.user ?? null,
        isLoading: false,
      }));
    });

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return state;
};

