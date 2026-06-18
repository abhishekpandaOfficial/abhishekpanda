import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useUserAuth } from "@/hooks/useUserAuth";
import { Link, useNavigate } from "react-router-dom";

const Account = () => {
  const { user, isLoading } = useUserAuth();
  const navigate = useNavigate();

  const { data: entitlements = [], isLoading: entLoading } = useQuery({
    queryKey: ["user-entitlements", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_entitlements")
        .select("entitlement, expires_at, created_at")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const hasBlogPremium = entitlements.some((e) => e.entitlement === "blog_premium");

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-24 pb-20">
        <section className="container mx-auto px-4 max-w-2xl">
          <div className="glass-card rounded-2xl p-8">
            <h1 className="text-3xl font-black tracking-tight text-foreground mb-2">
              Account
            </h1>
            <p className="text-muted-foreground mb-6">Manage your session and premium access.</p>

            {isLoading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : !user ? (
              <div className="space-y-4">
                <p className="text-muted-foreground">You’re not signed in.</p>
                <Button asChild>
                  <Link to="/login">Sign in</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="rounded-xl border border-border bg-card p-4">
                  <p className="text-sm text-muted-foreground">Signed in as</p>
                  <p className="text-foreground font-semibold">{user.email}</p>
                </div>

                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Premium Blog Access</p>
                      <p className="text-foreground font-semibold">
                        {entLoading ? "Checking..." : hasBlogPremium ? "Active" : "Not active"}
                      </p>
                    </div>
                    <Button variant="outline" asChild>
                      <Link to="/blog">Go to Blog</Link>
                    </Button>
                  </div>

                  {!entLoading && !hasBlogPremium && (
                    <p className="text-xs text-muted-foreground mt-3">
                      Add an entitlement row in `user_entitlements` for your user to enable premium access.
                    </p>
                  )}
                </div>

                <Button
                  variant="outline"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    navigate("/");
                  }}
                >
                  Sign out
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Account;

