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
  Download,
  Layers3,
  ListChecks,
  Loader2,
  PlayCircle,
  Sparkles,
  Star,
  Target,
  Users,
} from "lucide-react";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CourseOneToOneModal } from "@/components/courses/CourseOneToOneModal";
import { CourseCover } from "@/components/courses/CourseCover";
import {
  countCourseLessons,
  countFreeCourseLessons,
  findLocalCourseBySlug,
  mapDbCourseToCatalogItem,
} from "@/content/courses";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const isInternalHref = (href: string) => href.startsWith("/");

const lessonKey = (moduleIndex: number, lessonIndex: number, lessonTitle: string) =>
  `${moduleIndex}:${lessonIndex}:${lessonTitle}`;

const pluralize = (count: number, singular: string, plural = `${singular}s`) =>
  count === 1 ? singular : plural;

export default function CourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();
  const { toast } = useToast();

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
  const [showSyllabusModal, setShowSyllabusModal] = useState(false);
  const [oneToOneOpen, setOneToOneOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [syllabusForm, setSyllabusForm] = useState({
    name: "",
    email: "",
    mobile: "",
    otp: "",
    interest: "",
  });

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
  const freeLessons = countFreeCourseLessons(course?.modules || []);
  const completedLessonSet = useMemo(() => new Set(completedLessons), [completedLessons]);
  const progressPercent = totalLessons ? Math.round((completedLessons.length / totalLessons) * 100) : 0;

  const toggleLessonCompleted = (key: string) => {
    setCompletedLessons((previous) =>
      previous.includes(key) ? previous.filter((entry) => entry !== key) : [...previous, key],
    );
  };

  const handleSendOtp = async () => {
    if (!syllabusForm.email && !syllabusForm.mobile) {
      toast({
        title: "Contact required",
        description: "Enter an email or mobile number to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setOtpSent(true);
    setIsSubmitting(false);
    toast({
      title: "OTP sent",
      description: `Verification code sent to ${syllabusForm.email || syllabusForm.mobile}`,
    });
  };

  const handleVerifyOtp = async () => {
    if (syllabusForm.otp.trim().length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Enter a valid 6-digit OTP.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setOtpVerified(true);
    setIsSubmitting(false);
    toast({
      title: "Verified",
      description: "Your contact details have been verified.",
    });
  };

  const handleDownloadSyllabus = async () => {
    if (!syllabusForm.name || !otpVerified) {
      toast({
        title: "Complete verification",
        description: "Fill the required fields and verify the OTP first.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setIsSubmitting(false);
    setShowSyllabusModal(false);
    setOtpSent(false);
    setOtpVerified(false);
    setSyllabusForm({
      name: "",
      email: "",
      mobile: "",
      otp: "",
      interest: "",
    });
    toast({
      title: "Syllabus prepared",
      description: "The detailed syllabus download flow can be connected here.",
    });
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

      <main className="pt-24 pb-20">
        <section className="container mx-auto px-4">
          <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/courses" className="hover:text-foreground">
              Courses
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{course.title}</span>
          </div>

          <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
            <article className="min-w-0 space-y-8">
              <div className="overflow-hidden rounded-[2.25rem] border border-border/70 bg-card shadow-sm">
                <div className="grid gap-8 p-6 md:p-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
                  <div>
                    <Link
                      to="/courses"
                      className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to all courses
                    </Link>

                    <div className="mt-6 flex flex-wrap gap-2">
                      <span
                        className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                          course.isPremium ? "bg-foreground text-background" : "bg-emerald-500/90 text-white"
                        }`}
                      >
                        {course.isPremium ? course.priceLabel : "Free"}
                      </span>
                      <span className="rounded-full border border-border/70 bg-background px-4 py-1.5 text-sm font-semibold text-foreground">
                        {course.level}
                      </span>
                      <span className="rounded-full border border-border/70 bg-background px-4 py-1.5 text-sm font-semibold text-foreground">
                        {course.availability === "roadmap" ? "Roadmap open" : "Ready to start"}
                      </span>
                    </div>

                    <h1 className="mt-6 text-4xl font-black tracking-tight text-foreground md:text-5xl">
                      {course.title}
                    </h1>
                    <p className="mt-4 text-lg leading-8 text-muted-foreground">{course.description}</p>

                    <div className="mt-6 flex flex-wrap gap-3 text-sm text-muted-foreground">
                      {course.rating > 0 ? (
                        <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background px-4 py-2">
                          <Star className="h-4 w-4 text-amber-500" />
                          {course.rating.toFixed(1)} rating
                          {course.reviews > 0 ? ` · ${course.reviews} reviews` : ""}
                        </div>
                      ) : null}
                      <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background px-4 py-2">
                        <Users className="h-4 w-4 text-primary" />
                        {course.studentsLabel}
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background px-4 py-2">
                        <Clock className="h-4 w-4 text-primary" />
                        {course.duration}
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background px-4 py-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                        {totalLessons} {pluralize(totalLessons, "lesson")}
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2">
                      {course.tags.map((tag) => (
                        <span
                          key={`${course.slug}-${tag}`}
                          className="rounded-full border border-border/70 bg-background px-4 py-2 text-sm font-medium text-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="mt-8 flex flex-wrap gap-3">
                      <Button size="lg" asChild>
                        <a href="#course-content">
                          {course.availability === "roadmap" ? "Explore roadmap" : "Start with the course content"}
                          <ArrowRight className="h-4 w-4" />
                        </a>
                      </Button>
                      {course.resourceLink ? (
                        <Button size="lg" variant="outline" asChild>
                          {course.resourceLink.external ? (
                            <a href={course.resourceLink.href} target="_blank" rel="noopener noreferrer">
                              {course.resourceLink.label}
                              <ArrowRight className="h-4 w-4" />
                            </a>
                          ) : (
                            <Link to={course.resourceLink.href}>
                              {course.resourceLink.label}
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                          )}
                        </Button>
                      ) : (
                        <Button size="lg" variant="outline" onClick={() => setShowSyllabusModal(true)}>
                          <Download className="h-4 w-4" />
                          Download syllabus
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <CourseCover course={course} className="aspect-[4/3] rounded-[1.75rem]" />
                    <div className="rounded-[1.5rem] border border-border/70 bg-background p-4">
                      <p className="text-sm font-semibold text-foreground">Highlights</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {course.highlights.map((item) => (
                          <span
                            key={`${course.slug}-highlight-${item}`}
                            className="rounded-full border border-border/70 bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <section className="rounded-[2rem] border border-border/70 bg-card p-6 md:p-8">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">About this course</p>
                    <h2 className="mt-1 text-3xl font-black tracking-tight text-foreground">A structured learning path, not a loose playlist</h2>
                  </div>
                </div>
                <div className="mt-6 space-y-5 text-base leading-8 text-muted-foreground">
                  {course.overview.map((paragraph, index) => (
                    <p key={`${course.slug}-overview-${index}`}>{paragraph}</p>
                  ))}
                </div>
              </section>

              {course.learningPath.length ? (
                <section className="rounded-[2rem] border border-border/70 bg-card p-6 md:p-8">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Your learning path</p>
                  <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground">Progress from fundamentals to production thinking</h2>
                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    {course.learningPath.map((step, index) => (
                      <div
                        key={`${course.slug}-step-${step.title}`}
                        className="rounded-[1.5rem] border border-border/70 bg-background p-5"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-sm font-black text-primary">
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-foreground">{step.title}</h3>
                            <p className="text-sm text-muted-foreground">{step.summary}</p>
                          </div>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {step.modules.map((module) => (
                            <span
                              key={`${course.slug}-step-module-${module}`}
                              className="rounded-full border border-border/70 bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground"
                            >
                              {module}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}

              <section className="rounded-[2rem] border border-border/70 bg-card p-6 md:p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">What you will learn</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground">Core outcomes from this course</h2>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {course.outcomes.map((outcome) => (
                    <div
                      key={`${course.slug}-outcome-${outcome}`}
                      className="flex gap-3 rounded-[1.5rem] border border-border/70 bg-background p-5"
                    >
                      <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-500" />
                      <p className="text-sm leading-7 text-foreground">{outcome}</p>
                    </div>
                  ))}
                </div>
              </section>

              {course.buildProjects.length ? (
                <section className="rounded-[2rem] border border-border/70 bg-card p-6 md:p-8">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">What you will build</p>
                  <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground">Projects and review artifacts</h2>
                  <div className="mt-6 grid gap-4 md:grid-cols-3">
                    {course.buildProjects.map((project) => (
                      <div
                        key={`${course.slug}-project-${project.title}`}
                        className="rounded-[1.5rem] border border-border/70 bg-background p-5"
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          <Target className="h-5 w-5" />
                        </div>
                        <h3 className="mt-4 text-lg font-bold text-foreground">{project.title}</h3>
                        <p className="mt-2 text-sm leading-7 text-muted-foreground">{project.description}</p>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}

              <section id="course-content" className="rounded-[2rem] border border-border/70 bg-card p-6 md:p-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Course content</p>
                    <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground">Modules, chapters, and lessons</h2>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">
                      {course.modules.length} modules · {totalLessons} lessons · {freeLessons} free preview {pluralize(freeLessons, "lesson")}
                    </p>
                  </div>
                  <div className="rounded-full border border-border/70 bg-background px-4 py-2 text-sm font-semibold text-muted-foreground">
                    {completedLessons.length}/{totalLessons} completed
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
                          className="overflow-hidden rounded-[1.5rem] border border-border/70 bg-background"
                        >
                          <AccordionTrigger className="px-5 py-5 hover:no-underline">
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
                                    className="rounded-[1.25rem] border border-border/70 bg-card p-4"
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
                                                {lesson.type === "article" ? "Read article" : "Open lesson"}
                                                <ArrowRight className="h-4 w-4" />
                                              </Link>
                                            </Button>
                                          ) : (
                                            <Button size="sm" asChild>
                                              <a href={lesson.href} target="_blank" rel="noopener noreferrer">
                                                Open lesson
                                                <ArrowRight className="h-4 w-4" />
                                              </a>
                                            </Button>
                                          )
                                        ) : (
                                          <div className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-background px-3 py-2 text-xs font-medium text-muted-foreground">
                                            <PlayCircle className="h-4 w-4 text-primary" />
                                            {lesson.isFree ? "Preview lesson" : "Guided lesson"}
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
                <div className="rounded-[2rem] border border-border/70 bg-card p-6 md:p-8">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Requirements</p>
                  <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground">What you need before starting</h2>
                  <div className="mt-6 space-y-4">
                    {course.requirements.map((requirement) => (
                      <div
                        key={`${course.slug}-requirement-${requirement}`}
                        className="flex gap-3 rounded-[1.5rem] border border-border/70 bg-background p-4"
                      >
                        <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                        <p className="text-sm leading-7 text-foreground">{requirement}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[2rem] border border-border/70 bg-card p-6 md:p-8">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Who this course is for</p>
                  <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground">Best fit learners</h2>
                  <div className="mt-6 space-y-4">
                    {course.whoFor.map((item) => (
                      <div
                        key={`${course.slug}-whofor-${item}`}
                        className="flex gap-3 rounded-[1.5rem] border border-border/70 bg-background p-4"
                      >
                        <ListChecks className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                        <p className="text-sm leading-7 text-foreground">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section id="instructor" className="rounded-[2rem] border border-border/70 bg-card p-6 md:p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Instructor</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground">Built by {course.instructor.name}</h2>
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

              {course.faq.length ? (
                <section className="rounded-[2rem] border border-border/70 bg-card p-6 md:p-8">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Frequently asked questions</p>
                  <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground">Common questions about this course</h2>
                  <Accordion type="single" collapsible className="mt-6 space-y-4">
                    {course.faq.map((item, index) => (
                      <AccordionItem
                        key={`${course.slug}-faq-${item.question}`}
                        value={`faq-${index}`}
                        className="overflow-hidden rounded-[1.25rem] border border-border/70 bg-background"
                      >
                        <AccordionTrigger className="px-5 py-4 text-left text-base font-semibold hover:no-underline">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent className="px-5 pb-5 text-sm leading-7 text-muted-foreground">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </section>
              ) : null}
            </article>

            <aside className="space-y-4 xl:sticky xl:top-28 xl:self-start">
              <div className="rounded-[2rem] border border-border/70 bg-card p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">This course includes</p>
                    <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground">{course.isPremium ? course.priceLabel : "Free"}</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {course.availability === "roadmap"
                        ? "The roadmap is live and the final chapter plan is being expanded."
                        : course.isPremium
                          ? "Structured long-form learning with premium access."
                          : "Start immediately with the current lesson roadmap."}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                    <Layers3 className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <Button className="w-full" size="lg" asChild>
                    <a href="#course-content">
                      {course.availability === "roadmap" ? "Open roadmap" : "Start learning"}
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </Button>

                  {course.resourceLink ? (
                    <Button variant="outline" className="w-full" size="lg" asChild>
                      {course.resourceLink.external ? (
                        <a href={course.resourceLink.href} target="_blank" rel="noopener noreferrer">
                          {course.resourceLink.label}
                          <ArrowRight className="h-4 w-4" />
                        </a>
                      ) : (
                        <Link to={course.resourceLink.href}>
                          {course.resourceLink.label}
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      )}
                    </Button>
                  ) : (
                    <Button variant="outline" className="w-full" size="lg" onClick={() => setShowSyllabusModal(true)}>
                      <Download className="h-4 w-4" />
                      Download syllabus
                    </Button>
                  )}

                  {(course.oneToOneEnabled ?? true) ? (
                    <Button variant="outline" className="w-full" size="lg" onClick={() => setOneToOneOpen(true)}>
                      1:1 Session
                    </Button>
                  ) : null}
                </div>

                <div className="mt-6 space-y-3 border-t border-border/70 pt-6">
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

              <div className="rounded-[2rem] border border-border/70 bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Your progress</p>
                    <h3 className="mt-2 text-2xl font-black tracking-tight text-foreground">{progressPercent}% complete</h3>
                  </div>
                  <div className="rounded-2xl bg-primary/10 px-4 py-3 text-sm font-bold text-primary">
                    {completedLessons.length}/{totalLessons}
                  </div>
                </div>
                <Progress value={progressPercent} className="mt-5 h-3" />
                <div className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                  <div className="rounded-2xl border border-border/70 bg-background px-4 py-3">
                    {course.modules.length} modules
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-background px-4 py-3">
                    {freeLessons} free previews
                  </div>
                </div>
                <div className="mt-5 space-y-3">
                  {course.modules.map((module, index) => {
                    const moduleKeys = module.lessons.map((lesson, lessonIndex) =>
                      lessonKey(index, lessonIndex, lesson.title),
                    );
                    const moduleCompleted = moduleKeys.filter((key) => completedLessonSet.has(key)).length;
                    const modulePercent = module.lessons.length
                      ? Math.round((moduleCompleted / module.lessons.length) * 100)
                      : 0;

                    return (
                      <div
                        key={`${course.slug}-sidebar-module-${module.title}`}
                        className="rounded-2xl border border-border/70 bg-background p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-foreground">{index + 1}. {module.title}</p>
                          <span className="text-xs font-medium text-muted-foreground">{moduleCompleted}/{module.lessons.length}</span>
                        </div>
                        <Progress value={modulePercent} className="mt-3 h-2" />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">Newsletter</p>
                <h3 className="mt-3 text-2xl font-black tracking-tight">Get new courses and chapter drops first</h3>
                <p className="mt-3 text-sm leading-7 text-white/75">
                  Subscribe for new course releases, blog chapters, and architecture notes from this website.
                </p>
                <Button variant="secondary" className="mt-6" asChild>
                  <Link to="/#newsletter">
                    Join the newsletter
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <Dialog open={showSyllabusModal} onOpenChange={setShowSyllabusModal}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Download the course syllabus</DialogTitle>
            <DialogDescription>
              Verify your details and prepare the syllabus flow for {course.title}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Full name</label>
              <Input
                value={syllabusForm.name}
                onChange={(event) => setSyllabusForm((previous) => ({ ...previous, name: event.target.value }))}
                placeholder="Your full name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Email</label>
              <Input
                value={syllabusForm.email}
                onChange={(event) => setSyllabusForm((previous) => ({ ...previous, email: event.target.value }))}
                placeholder="you@example.com"
                disabled={otpSent}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Mobile number</label>
              <Input
                value={syllabusForm.mobile}
                onChange={(event) => setSyllabusForm((previous) => ({ ...previous, mobile: event.target.value }))}
                placeholder="+91..."
                disabled={otpSent}
              />
            </div>

            {!otpSent ? (
              <Button variant="outline" className="w-full" onClick={handleSendOtp} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  "Send OTP"
                )}
              </Button>
            ) : null}

            {otpSent && !otpVerified ? (
              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">OTP</label>
                  <Input
                    value={syllabusForm.otp}
                    onChange={(event) => setSyllabusForm((previous) => ({ ...previous, otp: event.target.value }))}
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                  />
                </div>
                <Button variant="outline" className="w-full" onClick={handleVerifyOtp} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify OTP"
                  )}
                </Button>
              </div>
            ) : null}

            {otpVerified ? (
              <>
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
                  Contact verified successfully.
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">What are you most interested in?</label>
                  <Textarea
                    value={syllabusForm.interest}
                    onChange={(event) => setSyllabusForm((previous) => ({ ...previous, interest: event.target.value }))}
                    rows={4}
                    placeholder="Career growth, specific modules, project depth, mentorship, etc."
                  />
                </div>
              </>
            ) : null}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSyllabusModal(false)}>
              Close
            </Button>
            <Button onClick={handleDownloadSyllabus} disabled={isSubmitting || !otpVerified}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Preparing...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Download syllabus
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
