import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BookOpen,
  Clock,
  GraduationCap,
  Layers3,
  Search,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { CourseCover } from "@/components/courses/CourseCover";
import {
  COURSE_INSTRUCTOR,
  countCourseLessons,
  FUTURE_COURSE_TOPICS,
  LOCAL_COURSE_CATALOG,
  mapDbCourseToCatalogItem,
  type CourseCatalogItem,
} from "@/content/courses";
import { supabase } from "@/integrations/supabase/client";

const matchesCourseQuery = (course: CourseCatalogItem, query: string) => {
  if (!query) return true;
  const source = [
    course.title,
    course.category,
    course.description,
    course.level,
    course.tags.join(" "),
    course.highlights.join(" "),
  ]
    .join(" ")
    .toLowerCase();
  return source.includes(query);
};

const availabilityWeight = (course: CourseCatalogItem) => (course.availability === "available" ? 0 : 1);

export default function Courses() {
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    document.title = "Courses | Abhishek Panda";
  }, []);

  const { data: publishedCourses = [], isLoading } = useQuery({
    queryKey: ["published-courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const allCourses = useMemo(() => {
    const bySlug = new Map<string, CourseCatalogItem>();

    for (const row of publishedCourses) {
      const mapped = mapDbCourseToCatalogItem(row);
      bySlug.set(mapped.slug, mapped);
    }

    for (const localCourse of LOCAL_COURSE_CATALOG) {
      if (!bySlug.has(localCourse.slug)) {
        bySlug.set(localCourse.slug, localCourse);
      }
    }

    return Array.from(bySlug.values()).sort((left, right) => {
      const leftWeight = availabilityWeight(left);
      const rightWeight = availabilityWeight(right);
      if (leftWeight !== rightWeight) return leftWeight - rightWeight;
      if (right.rating !== left.rating) return right.rating - left.rating;
      return left.title.localeCompare(right.title);
    });
  }, [publishedCourses]);

  const query = searchQuery.trim().toLowerCase();
  const visibleCourses = useMemo(
    () => allCourses.filter((course) => matchesCourseQuery(course, query)),
    [allCourses, query],
  );

  const activeCourseCount = useMemo(
    () => allCourses.filter((course) => course.availability === "available").length,
    [allCourses],
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-24 pb-20">
        <section className="relative overflow-hidden py-16 sm:py-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.16),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.14),transparent_34%)]" />
          <div className="relative container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="mx-auto max-w-4xl text-center"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/85 px-4 py-2 text-sm font-semibold text-foreground shadow-sm backdrop-blur">
                <GraduationCap className="h-4 w-4 text-primary" />
                {allCourses.length} Courses Available
              </div>

              <h1 className="mt-6 text-4xl font-black tracking-tight text-foreground md:text-5xl lg:text-6xl">
                Learn Engineering Through <span className="gradient-text">Structured Courses</span>
              </h1>
              <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
                Course cards, chapter-style roadmaps, and long-form learning paths built for .NET,
                architecture, cloud, AI, and modern engineering delivery.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {[
                  "Chapter-based learning paths",
                  "Responsive lesson roadmaps",
                  "Mentorship-ready course tracks",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-border/70 bg-card/80 px-4 py-3 text-sm font-medium text-foreground shadow-sm backdrop-blur"
                  >
                    {item}
                  </div>
                ))}
              </div>

              <div className="relative mx-auto mt-8 max-w-2xl">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search courses, stacks, topics, or architecture tracks..."
                  className="h-14 rounded-2xl border-border/70 bg-card pl-12 pr-4 text-base shadow-sm"
                />
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-4 py-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  {activeCourseCount} active learning paths
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-4 py-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  Course pages with lesson TOCs
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-4 py-2">
                  <Users className="h-4 w-4 text-primary" />
                  Directly from {COURSE_INSTRUCTOR.name}
                </span>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="container mx-auto px-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Start learning today</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground md:text-4xl">
                Open any course card and jump into the roadmap
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
                Every course card routes into a dedicated course page with overview, learning path,
                modules, lessons, and a sticky action panel.
              </p>
            </div>
            <div className="rounded-full border border-border/70 bg-card/80 px-4 py-2 text-sm font-semibold text-muted-foreground shadow-sm">
              {visibleCourses.length} visible of {allCourses.length}
            </div>
          </div>

          {isLoading && !allCourses.length ? (
            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="overflow-hidden rounded-[2rem] border border-border/70 bg-card">
                  <Skeleton className="aspect-[16/10] w-full" />
                  <div className="space-y-4 p-6">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-7 w-4/5" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : visibleCourses.length ? (
            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {visibleCourses.map((course, index) => {
                const lessonCount = countCourseLessons(course.modules);
                const proofLabel =
                  course.rating > 0
                    ? `${course.rating.toFixed(1)} rating`
                    : course.availability === "roadmap"
                      ? "Roadmap"
                      : "Open";

                return (
                  <motion.article
                    key={course.slug}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.4, delay: index * 0.04 }}
                    className="group h-full"
                  >
                    <Link
                      to={`/courses/${course.slug}`}
                      className="flex h-full flex-col overflow-hidden rounded-[2rem] border border-border/70 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl"
                    >
                      <div className="relative">
                        <CourseCover course={course} className="aspect-[16/10]" compact />
                        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${
                              course.isPremium
                                ? "bg-foreground text-background"
                                : "bg-emerald-500/90 text-white"
                            }`}
                          >
                            {course.isPremium ? course.priceLabel : "Free"}
                          </span>
                          <span className="rounded-full border border-white/25 bg-background/80 px-3 py-1 text-xs font-semibold text-foreground shadow-sm backdrop-blur">
                            {course.level}
                          </span>
                        </div>
                        <div className="absolute right-4 top-4 rounded-full border border-white/25 bg-background/80 px-3 py-1 text-xs font-semibold text-foreground shadow-sm backdrop-blur">
                          {course.availability === "roadmap" ? "Roadmap" : "Open"}
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col p-6">
                        <div className="flex flex-wrap gap-2">
                          {course.tags.slice(0, 3).map((tag) => (
                            <span
                              key={`${course.slug}-${tag}`}
                              className="rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-medium text-muted-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        <h3 className="mt-4 text-2xl font-black tracking-tight text-foreground transition-colors group-hover:text-primary">
                          {course.title}
                        </h3>
                        <p className="mt-3 line-clamp-3 text-sm leading-7 text-muted-foreground">
                          {course.description}
                        </p>

                        <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                          <div className="inline-flex items-center gap-2 rounded-2xl border border-border/60 bg-background px-3 py-2">
                            <BookOpen className="h-4 w-4 text-primary" />
                            {lessonCount} lessons
                          </div>
                          <div className="inline-flex items-center gap-2 rounded-2xl border border-border/60 bg-background px-3 py-2">
                            <Clock className="h-4 w-4 text-primary" />
                            {course.duration}
                          </div>
                          <div className="inline-flex items-center gap-2 rounded-2xl border border-border/60 bg-background px-3 py-2">
                            <Users className="h-4 w-4 text-primary" />
                            {course.studentsLabel}
                          </div>
                          <div className="inline-flex items-center gap-2 rounded-2xl border border-border/60 bg-background px-3 py-2">
                            {course.rating > 0 ? <Star className="h-4 w-4 text-amber-500" /> : <Layers3 className="h-4 w-4 text-primary" />}
                            {proofLabel}
                          </div>
                        </div>

                        <div className="mt-6 flex items-center justify-between border-t border-border/70 pt-5">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground">{COURSE_INSTRUCTOR.name}</p>
                            <p className="truncate text-xs text-muted-foreground">{COURSE_INSTRUCTOR.role}</p>
                          </div>
                          <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                            {course.availability === "roadmap" ? "Explore roadmap" : "Start"}
                            <ArrowRight className="h-4 w-4" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.article>
                );
              })}
            </div>
          ) : (
            <div className="mt-8 rounded-[2rem] border border-dashed border-border/70 bg-card/60 p-10 text-center">
              <h3 className="text-xl font-bold text-foreground">No matching courses found.</h3>
              <p className="mt-3 text-muted-foreground">
                Try a broader search term or open one of the available course routes directly.
              </p>
            </div>
          )}

          <div className="mt-12 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[2rem] border border-border/70 bg-gradient-to-br from-card via-card to-primary/5 p-6 md:p-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-4 py-2 text-sm font-semibold text-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                In the works
              </div>
              <h2 className="mt-5 text-3xl font-black tracking-tight text-foreground">
                More courses are coming soon
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                New architect-grade courses, deep-dive modules, and companion learning tracks are being prepared.
                The course routes above already preview how the final learning flow will look.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {FUTURE_COURSE_TOPICS.map((topic) => (
                  <span
                    key={topic}
                    className="rounded-full border border-border/70 bg-background px-4 py-2 text-sm font-medium text-foreground"
                  >
                    {topic}
                  </span>
                ))}
              </div>
              <div className="mt-6">
                <Button variant="outline" asChild>
                  <Link to="/#newsletter">
                    Get notified
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="rounded-[2rem] border border-border/70 bg-slate-950 p-6 text-white shadow-sm md:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/70">Weekly engineering notes</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight">
                Stay updated on new courses, roadmaps, and chapter drops
              </h2>
              <p className="mt-3 text-sm leading-7 text-white/75">
                Join the newsletter to get the next course release, architecture notes, and linked lesson updates from this website.
              </p>
              <div className="mt-6 flex flex-wrap gap-3 text-sm text-white/80">
                <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2">Courses</span>
                <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2">Architecture</span>
                <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2">Cloud</span>
                <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2">AI</span>
              </div>
              <Button variant="secondary" className="mt-6" asChild>
                <Link to="/#newsletter">
                  Join the newsletter
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
