import { useEffect } from "react";

export default function OpenOwlLanding() {
  useEffect(() => {
    window.location.replace("/openowl.html?v=20260305c");
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-sm text-muted-foreground">Redirecting to OpenOwl…</p>
    </div>
  );
}
