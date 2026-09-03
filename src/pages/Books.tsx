import { lazy, Suspense } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { BooksSection } from "@/components/products/BooksSection";

const Footer = lazy(() => import("@/components/layout/Footer").then((module) => ({ default: module.Footer })));

export default function Books() {
  return (
    <div className="min-h-screen bg-[#f7f8fa] text-slate-950 dark:bg-slate-950 dark:text-white">
      <Navigation />
      <main className="pt-16">
        <BooksSection />
      </main>
      <Suspense fallback={null}><Footer /></Suspense>
    </div>
  );
}
