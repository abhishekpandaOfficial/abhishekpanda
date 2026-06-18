import { useMemo, useState } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useUserAuth } from "@/hooks/useUserAuth";
import { Link, useLocation } from "react-router-dom";
import { toast } from "sonner";

const Login = () => {
  const { user, isLoading } = useUserAuth();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const location = useLocation();

  const next = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    return sp.get("next") || "/account";
  }, [location.search]);

  const sendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const redirectTo = `${window.location.origin}/login?next=${encodeURIComponent(next)}`;
      const { error } = await supabase.functions.invoke("send-magic-link", {
        body: { email, redirectTo },
      });
      if (error) throw error;
      toast.success("Magic link sent. Check your email.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send magic link.";
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-24 pb-20">
        <section className="container mx-auto px-4 max-w-xl">
          <div className="glass-card rounded-2xl p-8">
            <h1 className="text-3xl font-black tracking-tight text-foreground mb-2">
              Sign in
            </h1>
            <p className="text-muted-foreground mb-6">
              Use a magic link. This is required to access premium posts.
            </p>

            {isLoading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : user ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Signed in as <span className="text-foreground font-medium">{user.email}</span>
                </p>
                <Button asChild className="w-full">
                  <Link to={next}>Continue</Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    toast.success("Signed out.");
                  }}
                >
                  Sign out
                </Button>
              </div>
            ) : (
              <form onSubmit={sendMagicLink} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={sending}>
                  {sending ? "Sending..." : "Send Magic Link"}
                </Button>
                <p className="text-xs text-muted-foreground">
                  After you click the link in your email, you’ll come back here and can continue.
                </p>
              </form>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
