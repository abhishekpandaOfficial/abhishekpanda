import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface AdminAuthState {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  is2FAVerified: boolean;
  isLoading: boolean;
}

export const useAdminAuth = () => {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState<AdminAuthState>({
    user: null,
    session: null,
    isAdmin: false,
    is2FAVerified: false,
    isLoading: true,
  });

  const check2FAStatus = useCallback(() => {
    const verified = sessionStorage.getItem('admin_2fa_verified');
    const timestamp = sessionStorage.getItem('admin_2fa_timestamp');
    
    if (verified === 'true' && timestamp) {
      // 2FA valid for 4 hours
      const fourHours = 4 * 60 * 60 * 1000;
      const elapsed = Date.now() - parseInt(timestamp);
      return elapsed < fourHours;
    }
    return false;
  }, []);

  const checkAdminRole = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .single();

    return !error && data !== null;
  }, []);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setAuthState(prev => ({
          ...prev,
          session,
          user: session?.user ?? null,
        }));

        // Defer admin role check
        if (session?.user) {
          setTimeout(async () => {
            const isAdmin = await checkAdminRole(session.user.id);
            const is2FAVerified = check2FAStatus();
            
            setAuthState(prev => ({
              ...prev,
              isAdmin,
              is2FAVerified,
              isLoading: false,
            }));
          }, 0);
        } else {
          setAuthState(prev => ({
            ...prev,
            isAdmin: false,
            is2FAVerified: false,
            isLoading: false,
          }));
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const isAdmin = await checkAdminRole(session.user.id);
        const is2FAVerified = check2FAStatus();
        
        setAuthState({
          session,
          user: session.user,
          isAdmin,
          is2FAVerified,
          isLoading: false,
        });
      } else {
        setAuthState({
          session: null,
          user: null,
          isAdmin: false,
          is2FAVerified: false,
          isLoading: false,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [checkAdminRole, check2FAStatus]);

  const signOut = useCallback(async () => {
    sessionStorage.removeItem('admin_2fa_verified');
    sessionStorage.removeItem('admin_2fa_timestamp');
    await supabase.auth.signOut();
    navigate('/admin/login');
  }, [navigate]);

  const requireAuth = useCallback(() => {
    if (!authState.isLoading) {
      if (!authState.user || !authState.isAdmin) {
        navigate('/admin/login');
        return false;
      }
      if (!authState.is2FAVerified) {
        navigate('/admin/login');
        return false;
      }
    }
    return authState.user && authState.isAdmin && authState.is2FAVerified;
  }, [authState, navigate]);

  return {
    ...authState,
    signOut,
    requireAuth,
  };
};

export default useAdminAuth;
