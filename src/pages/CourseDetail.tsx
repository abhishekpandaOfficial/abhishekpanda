import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  Layers3,
  ListChecks,
  Loader2,
  PlayCircle,
  Sparkles,
  Star,
  Users,
  Eye,
} from "lucide-react";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CourseOneToOneModal } from "@/components/courses/CourseOneToOneModal";
import { CourseCover } from "@/components/courses/CourseCover";
import {
  countCourseLessons,
  findLocalCourseBySlug,
  mapDbCourseToCatalogItem,
} from "@/content/courses";
import { supabase } from "@/integrations/supabase/client";

const isInternalHref = (href: string) => href.startsWith("/");

const lessonKey = (moduleIndex: number, lessonIndex: number, lessonTitle: string) =>
  `${moduleIndex}:${lessonIndex}:${lessonTitle}`;

const pluralize = (count: number, singular: string, plural = `${singular}s`) =>
  count === 1 ? singular : plural;

export default function CourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();

  const fallbackCourse = useMemo(
    () => (courseId ? findLocalCourseBySlug(courseId) || null : null),
    [courseId],
  );

  const { data: dbCourse, isLoading } = useQuery({
    queryKey: ["course-detail", courseId],
    enabled: Boolean(courseId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("slug", courseId)
        .maybeSingle();

      if (error || !data) return null;
      return mapDbCourseToCatalogItem(data);
    },
  });

  const course = dbCourse || fallbackCourse;

  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [oneToOneOpen, setOneToOneOpen] = useState(false);

  useEffect(() => {
    if (!course?.slug) {
      setCompletedLessons([]);
      return;
    }

    const storageKey = `course-progress:${course.slug}`;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) {
        setCompletedLessons([]);
        return;
      }
      const parsed = JSON.parse(raw);
      setCompletedLessons(Array.isArray(parsed) ? parsed : []);
    } catch {
      setCompletedLessons([]);
    }
  }, [course?.slug]);

  useEffect(() => {
    if (!course?.slug) return;
    const storageKey = `course-progress:${course.slug}`;
    window.localStorage.setItem(storageKey, JSON.stringify(completedLessons));
  }, [completedLessons, course?.slug]);

  useEffect(() => {
    if (!course?.title) return;
    document.title = `${course.title} | Abhishek Panda Courses`;
  }, [course?.title]);

  const totalLessons = countCourseLessons(course?.modules || []);
  const completedLessonSet = useMemo(() => new Set(completedLessons), [completedLessons]);
  const progressPercent = totalLessons ? Math.round((completedLessons.length / totalLessons) * 100) : 0;
  const estimatedViews = useMemo(() => {
    const digits = Number((course.studentsLabel || "").replace(/[^\d]/g, ""));
    if (!digits || Number.isNaN(digits)) return "10K views";
    return `${Math.max(10, Math.round(digits * 8 / 10))}K views`;
  }, [course.studentsLabel]);

  const toggleLessonCompleted = (key: string) => {
    setCompletedLessons((previous) =>
      previous.includes(key) ? previous.filter((entry) => entry !== key) : [...previous, key],
    );
  };


  if (!course && isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 pt-28 pb-16">
          <div className="rounded-[2rem] border border-border/70 bg-card p-10 text-center">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Loading course details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 pt-28 pb-16">
          <div className="rounded-[2rem] border border-border/70 bg-card p-10 text-center">
            <h1 className="text-3xl font-black tracking-tight text-foreground">Course not found</h1>
            <p className="mt-3 text-muted-foreground">
              This course route does not have a published or local course record yet.
            </p>
            <Button className="mt-6" asChild>
              <Link to="/courses">
                Back to Courses
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-20 pb-20">
        <section className="bg-[#1c1d1f] py-10 text-white">
          <div className="container mx-auto px-4">
            <div className="mb-4 inline-flex flex-wrap items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-2 text-sm text-white/80">
            <Link to="/" className="hover:text-foreground">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/courses" className="hover:text-foreground">
              Courses
            </Link>
            <ChevronRight className="h-4 w-4" />
              <span className="max-w-[220px] truncate text-white md:max-w-[460px]">{course.title}</span>
            </div>

            <div className="grid gap-8">
              <article className="min-w-0">
                  <div>
                    <Link
                      to="/courses"
                      className="inline-flex items-center gap-2 text-sm font-medium text-white/75 transition hover:text-white"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to all courses
                    </Link>

                    <div className="mt-6 flex flex-wrap gap-2">
                      <span
                        className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                          course.isPremium ? "bg-white text-black" : "bg-emerald-500/90 text-white"
                        }`}
                      >
                        {course.isPremium ? course.priceLabel : "Free"}
                      </span>
                      <span className="rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-semibold text-white">
                        {course.level}
                      </span>
                      <span className="rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-semibold text-white">
                        {course.availability === "roadmap" ? "Registration open" : "Now streaming"}
                      </span>
                    </div>

                    <h1 className="mt-6 text-4xl font-black tracking-tight text-white md:text-5xl lg:text-[3.35rem]">
                      {course.title}
                    </h1>
                    <p className="mt-4 text-lg leading-8 text-white/80">{course.description}</p>

                    <div className="mt-6 flex flex-wrap gap-3 text-sm text-white/80">
                      {course.rating > 0 ? (
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2">
                          <Star className="h-4 w-4 text-amber-500" />
                          {course.rating.toFixed(1)} rating
                          {course.reviews > 0 ? ` · ${course.reviews} reviews` : ""}
                        </div>
                      ) : null}
                      <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2">
                        <Users className="h-4 w-4 text-primary" />
                        {course.studentsLabel}
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2">
                        <Clock className="h-4 w-4 text-primary" />
                        {course.duration}
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                        {totalLessons} {pluralize(totalLessons, "lesson")}
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2">
                        <Eye className="h-4 w-4 text-primary" />
                        {estimatedViews}
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2">
                      {course.tags.map((tag) => (
                        <span
                          key={`${course.slug}-${tag}`}
                          className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-white"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="mt-8 flex flex-wrap gap-3">
                      <Button size="lg" className="min-w-[190px] bg-[#a435f0] text-white hover:bg-[#8710d8]" asChild>
                        <a href="#course-content">
                          Start Learning
                          <ArrowRight className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button size="lg" variant="outline" onClick={() => setOneToOneOpen(true)}>
                        Register Session
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

              </article>
              <aside className="hidden space-y-4 xl:sticky xl:top-24 xl:self-start xl:pr-1">
                <div className="rounded-md border border-border bg-card p-3 shadow-lg">
                  <CourseCover course={course} className="aspect-video rounded-xl" />
                </div>
                <div className="rounded-md border border-border bg-card p-5 shadow-sm xl:flex-shrink-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Pricing</p>
                      <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground">{course.isPremium ? course.priceLabel : "Free"}</h2>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Video-first sessions with guided curriculum and chapter tracking.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <Button className="w-full rounded-md bg-[#a435f0] text-white hover:bg-[#8710d8]" size="lg" asChild>
                      <a href="#course-content">
                        Start Learning
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    </Button>

                    {course.resourceLink ? (
                      <Button variant="outline" className="w-full" size="lg" asChild>
                        {isInternalHref(course.resourceLink.href) ? (
                          <Link to={course.resourceLink.href}>{course.resourceLink.label}</Link>
                        ) : (
                          <a href={course.resourceLink.href} target="_blank" rel="noopener noreferrer">
                            {course.resourceLink.label}
                          </a>
                        )}
                      </Button>
                    ) : null}

                    {(course.oneToOneEnabled ?? true) ? (
                      <Button variant="outline" className="w-full" size="lg" onClick={() => setOneToOneOpen(true)}>
                        Register Session
                      </Button>
                    ) : null}
                  </div>

                  <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">This course includes</p>
                  <div className="mt-3 space-y-3">
                    {course.includes.map((item) => (
                      <div
                        key={`${course.slug}-include-${item}`}
                        className="flex items-start gap-3 rounded-2xl border border-border/70 bg-background px-4 py-3"
                      >
                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                        <p className="text-sm text-foreground">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-md border border-border bg-card p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Progress</p>
                      <h3 className="mt-1 text-2xl font-black tracking-tight text-foreground">
                        {completedLessons.length}/{totalLessons} lessons
                      </h3>
                      <p className="text-xs text-muted-foreground">{Math.max(0, totalLessons - completedLessons.length)} remaining</p>
                    </div>
                    <div className="rounded-2xl bg-primary/10 px-4 py-2 text-sm font-bold text-primary">
                      {progressPercent}%
                    </div>
                  </div>
                  <Progress value={progressPercent} className="mt-4 h-2.5" />

                  <div className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                    <div className="rounded-xl border border-border/70 bg-background px-3 py-2">
                      <span className="inline-flex items-center gap-2">
                        <Layers3 className="h-4 w-4 text-primary" />
                        {course.modules.length} modules
                      </span>
                    </div>
                    <div className="rounded-xl border border-border/70 bg-background px-3 py-2">
                      <span className="inline-flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                        {totalLessons} lessons
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 border-t border-border/70 pt-4">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Module tracker</p>
                    <div className="mt-3 max-h-[340px] space-y-2 overflow-y-auto pr-1">
                      {course.modules.map((module, moduleIndex) => {
                        const moduleLessonKeys = module.lessons.map((lesson, lessonIndex) =>
                          lessonKey(moduleIndex, lessonIndex, lesson.title),
                        );
                        const moduleCompleted = moduleLessonKeys.filter((key) => completedLessonSet.has(key)).length;
                        return (
                          <div
                            key={`${course.slug}-aside-module-${module.title}`}
                            className="rounded-xl border border-border/70 bg-background px-3 py-2"
                          >
                            <p className="line-clamp-1 text-sm font-semibold text-foreground">{module.title}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {moduleCompleted}/{module.lessons.length} completed
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 pt-8">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px] xl:gap-10">
            <article className="min-w-0 space-y-8">
              <section className="rounded-md border border-border bg-card p-6 md:p-8">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Description</p>
                    <h2 className="mt-1 text-2xl font-black tracking-tight text-foreground md:text-3xl">About this course</h2>
                  </div>
                </div>
                <div className="mt-6 space-y-5 text-base leading-8 text-muted-foreground">
                  {course.overview.map((paragraph, index) => (
                    <p key={`${course.slug}-overview-${index}`}>{paragraph}</p>
                  ))}
                </div>
              </section>

              <section className="rounded-md border border-border bg-card p-6 md:p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">What you'll learn</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-foreground md:text-3xl">Learning outcomes</h2>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {course.outcomes.map((outcome) => (
                    <div
                      key={`${course.slug}-outcome-${outcome}`}
                      className="flex gap-3 rounded-md border border-border bg-background p-5"
                    >
                      <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-500" />
                      <p className="text-sm leading-7 text-foreground">{outcome}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section id="course-content" className="rounded-md border border-border bg-card p-6 md:p-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Course content</p>
                    <h2 className="mt-2 text-2xl font-black tracking-tight text-foreground md:text-3xl">Modules, chapters, and lessons</h2>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">
                      {course.modules.length} modules · {totalLessons} lessons
                    </p>
                  </div>
                </div>

                {course.modules.length ? (
                  <Accordion type="multiple" defaultValue={["module-0"]} className="mt-6 space-y-4">
                    {course.modules.map((module, moduleIndex) => {
                      const moduleLessonKeys = module.lessons.map((lesson, lessonIndex) =>
                        lessonKey(moduleIndex, lessonIndex, lesson.title),
                      );
                      const moduleCompleted = moduleLessonKeys.filter((key) => completedLessonSet.has(key)).length;

                      return (
                        <AccordionItem
                          key={`${course.slug}-module-${module.title}`}
                          value={`module-${moduleIndex}`}
                            className="overflow-hidden rounded-md border border-border bg-background"
                        >
                          <AccordionTrigger className="px-5 py-4 hover:no-underline">
                            <div className="flex flex-1 items-start justify-between gap-4 pr-4 text-left">
                              <div>
                                <p className="text-lg font-bold text-foreground">{module.title}</p>
                                <p className="mt-1 text-sm text-muted-foreground">{module.summary}</p>
                                <div className="mt-3 flex flex-wrap gap-3 text-xs font-medium text-muted-foreground">
                                  <span>{module.duration}</span>
                                  <span>{module.lessons.length} lessons</span>
                                  <span>{moduleCompleted} completed</span>
                                </div>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-5 pb-5">
                            <div className="space-y-3">
                              {module.lessons.map((lesson, lessonIndex) => {
                                const key = lessonKey(moduleIndex, lessonIndex, lesson.title);
                                const completed = completedLessonSet.has(key);

                                return (
                                  <div
                                    key={`${course.slug}-lesson-${moduleIndex}-${lessonIndex}`}
                                    className="rounded-xl border border-border/70 bg-card p-4"
                                  >
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                      <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                                            {lesson.duration}
                                          </span>
                                          <span
                                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                              lesson.isFree ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-muted text-muted-foreground"
                                            }`}
                                          >
                                            {lesson.isFree ? "Preview" : "Guided"}
                                          </span>
                                        </div>
                                        <h3 className="mt-3 text-lg font-bold text-foreground">{lesson.title}</h3>
                                        {lesson.summary ? (
                                          <p className="mt-2 text-sm leading-7 text-muted-foreground">{lesson.summary}</p>
                                        ) : null}
                                      </div>

                                      <div className="flex flex-wrap gap-2">
                                        <Button
                                          variant={completed ? "default" : "outline"}
                                          size="sm"
                                          onClick={() => toggleLessonCompleted(key)}
                                        >
                                          <CheckCircle2 className="h-4 w-4" />
                                          {completed ? "Completed" : "Mark complete"}
                                        </Button>

                                        {lesson.href ? (
                                          isInternalHref(lesson.href) ? (
                                            <Button size="sm" asChild>
                                              <Link to={lesson.href}>
                                                Watch session
                                                <ArrowRight className="h-4 w-4" />
                                              </Link>
                                            </Button>
                                          ) : (
                                            <Button size="sm" asChild>
                                              <a href={lesson.href} target="_blank" rel="noopener noreferrer">
                                                Watch session
                                                <ArrowRight className="h-4 w-4" />
                                              </a>
                                            </Button>
                                          )
                                        ) : (
                                          <div className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-background px-3 py-2 text-xs font-medium text-muted-foreground">
                                            <PlayCircle className="h-4 w-4 text-primary" />
                                            {lesson.isFree ? "Preview session" : "Guided session"}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                ) : (
                  <div className="mt-6 rounded-[1.5rem] border border-dashed border-border/70 bg-background p-8 text-center text-muted-foreground">
                    Modules will appear here once the full course outline is attached.
                  </div>
                )}
              </section>

              <section className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-md border border-border bg-card p-6 md:p-8">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Requirements</p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight text-foreground md:text-3xl">What you need before starting</h2>
                  <div className="mt-6 space-y-4">
                    {course.requirements.map((requirement) => (
                      <div
                        key={`${course.slug}-requirement-${requirement}`}
                        className="flex gap-3 rounded-md border border-border bg-background p-4"
                      >
                        <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                        <p className="text-sm leading-7 text-foreground">{requirement}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-md border border-border bg-card p-6 md:p-8">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Who this course is for</p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight text-foreground md:text-3xl">Best fit learners</h2>
                  <div className="mt-6 space-y-4">
                    {course.whoFor.map((item) => (
                      <div
                        key={`${course.slug}-whofor-${item}`}
                        className="flex gap-3 rounded-md border border-border bg-background p-4"
                      >
                        <ListChecks className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                        <p className="text-sm leading-7 text-foreground">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section id="instructor" className="rounded-md border border-border bg-card p-6 md:p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Instructor</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-foreground md:text-3xl">Built by {course.instructor.name}</h2>
                <div className="mt-6 flex flex-col gap-5 rounded-[1.5rem] border border-border/70 bg-background p-5 md:flex-row md:items-start">
                  <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-primary/10 text-lg font-black text-primary">
                    AP
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg font-bold text-foreground">{course.instructor.role}</p>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">{course.instructor.bio}</p>
                  </div>
                </div>
              </section>

            </article>

            <aside className="hidden lg:block lg:sticky lg:top-24 lg:self-start">
              <div className="flex flex-col gap-4">
                <div className="rounded-md border border-border bg-card p-5 shadow-sm">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Continue course</p>
                  <h3 className="mt-2 text-2xl font-black tracking-tight text-foreground">
                    {course.isPremium ? course.priceLabel : "Free"}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">Start watching now and track chapter progress.</p>
                  <div className="mt-4 space-y-2">
                    <Button className="w-full rounded-md bg-[#a435f0] text-white hover:bg-[#8710d8]" asChild>
                      <a href="#course-content">
                        Start Learning
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    </Button>
                    {(course.oneToOneEnabled ?? true) ? (
                      <Button variant="outline" className="w-full" onClick={() => setOneToOneOpen(true)}>
                        Register Session
                      </Button>
                    ) : null}
                  </div>
                </div>

                <div className="rounded-md border border-border bg-card p-5 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Progress</p>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">
                      {completedLessons.length}/{totalLessons} lessons
                    </p>
                    <span className="text-sm font-bold text-primary">{progressPercent}%</span>
                  </div>
                  <Progress value={progressPercent} className="mt-3 h-2.5" />
                </div>

                <div className="rounded-md border border-border bg-card p-5 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Preview topics</p>
                  <div className="mt-3 max-h-[420px] space-y-2 overflow-y-auto pr-1">
                    {course.modules.map((module, moduleIndex) => (
                      <a
                        key={`${course.slug}-preview-module-${module.title}`}
                        href="#course-content"
                        className="block rounded-md border border-border bg-background px-3 py-2 transition hover:border-primary/40 hover:bg-primary/5"
                      >
                        <p className="line-clamp-1 text-sm font-semibold text-foreground">{module.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Module {moduleIndex + 1} · {module.lessons.length} lessons
                        </p>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <CourseOneToOneModal
        open={oneToOneOpen}
        onOpenChange={setOneToOneOpen}
        courseTitle={course.title}
        coursePriceInr={course.priceAmount}
        courseSlug={course.slug}
        oneToOneEnabled={course.oneToOneEnabled}
        oneToOnePriceInr={course.oneToOnePriceInr}
        oneToOneDurationMinutes={course.oneToOneDurationMinutes}
        oneToOneStartHourIst={course.oneToOneStartHourIst}
        oneToOneEndHourIst={course.oneToOneEndHourIst}
        payAfterSchedule={course.oneToOnePayAfterSchedule}
      />

      <Footer />
    </div>
  );
}
