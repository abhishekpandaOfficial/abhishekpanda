import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Clock, 
  Users, 
  Star, 
  Play, 
  Lock,
  Filter,
  GraduationCap,
  Award,
  BookOpen,
  ArrowRight,
  Sparkles,
  Search
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { CourseOneToOneModal } from "@/components/courses/CourseOneToOneModal";
import { usePublicSocialProfiles } from "@/hooks/useSocialProfiles";
import { iconForKey } from "@/lib/social/iconMap";

const filters = {
  levels: ["All", "Beginner", "Intermediate", "Advanced"],
  types: ["All", "Free", "Premium"],
};

type UpcomingCourse = {
  title: string;
  category: string;
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  isPremium: boolean;
  isFree: boolean;
  price: string | null;
  priceAmount?: number | null;
  slug?: string;
  oneToOneEnabled?: boolean;
  oneToOnePriceInr?: number | null;
  oneToOneDurationMinutes?: number | null;
  oneToOneStartHourIst?: number | null;
  oneToOneEndHourIst?: number | null;
  oneToOnePayAfterSchedule?: boolean | null;
  includes: string[];
};

const upcomingCourses: UpcomingCourse[] = [
  {
    title: "Azure Architect Series Course",
    category: "Architect & Engineering Tracks",
    duration: "14 Weeks",
    level: "Advanced",
    isPremium: true,
    isFree: false,
    price: "₹24,999",
    priceAmount: 24999,
    slug: "azure-architect-series",
    oneToOneEnabled: true,
    oneToOnePriceInr: 24999,
    oneToOneDurationMinutes: 60,
    oneToOneStartHourIst: 20,
    oneToOneEndHourIst: 24,
    oneToOnePayAfterSchedule: true,
    includes: ["1:1 Weekend Session", "Lifetime Access"],
  },
  {
    title: ".NET Architect Series",
    category: "Architect & Engineering Tracks",
    duration: "16 Weeks",
    level: "Advanced",
    isPremium: true,
    isFree: false,
    price: "₹29,999",
    priceAmount: 29999,
    slug: "dotnet-architect-series",
    oneToOneEnabled: true,
    oneToOnePriceInr: 29999,
    oneToOneDurationMinutes: 60,
    oneToOneStartHourIst: 20,
    oneToOneEndHourIst: 24,
    oneToOnePayAfterSchedule: true,
    includes: ["1:1 Weekend Session", "Lifetime Access"],
  },
  {
    title: "Microservices Architecture",
    category: "Architect & Engineering Tracks",
    duration: "10 Weeks",
    level: "Intermediate",
    isPremium: true,
    isFree: false,
    price: "₹9,999",
    priceAmount: 9999,
    slug: "microservices-architecture",
    oneToOneEnabled: true,
    oneToOnePriceInr: 9999,
    oneToOneDurationMinutes: 60,
    oneToOneStartHourIst: 20,
    oneToOneEndHourIst: 24,
    oneToOnePayAfterSchedule: true,
    includes: ["Case Studies", "Lifetime Access"],
  },
  {
    title: "SOLID Principles Deep Dive",
    category: "Development Foundations",
    duration: "4 Weeks",
    level: "Beginner",
    isPremium: false,
    isFree: true,
    price: null,
    priceAmount: null,
    slug: "solid-principles",
    oneToOneEnabled: true,
    oneToOnePriceInr: 3999,
    oneToOneDurationMinutes: 60,
    oneToOneStartHourIst: 20,
    oneToOneEndHourIst: 24,
    oneToOnePayAfterSchedule: true,
    includes: ["Free Access", "Starter Exercises"],
  },
  {
    title: "Design Patterns Masterclass",
    category: "Development Foundations",
    duration: "8 Weeks",
    level: "Intermediate",
    isPremium: true,
    isFree: false,
    price: "₹6,999",
    priceAmount: 6999,
    slug: "design-patterns-masterclass",
    oneToOneEnabled: true,
    oneToOnePriceInr: 6999,
    oneToOneDurationMinutes: 60,
    oneToOneStartHourIst: 20,
    oneToOneEndHourIst: 24,
    oneToOnePayAfterSchedule: true,
    includes: ["Pattern Catalog", "Lifetime Access"],
  },
  {
    title: "Interview Preparation Series (.NET / Architect)",
    category: "Development Foundations",
    duration: "6 Weeks",
    level: "Beginner",
    isPremium: false,
    isFree: true,
    price: null,
    priceAmount: null,
    slug: "interview-prep-series",
    oneToOneEnabled: true,
    oneToOnePriceInr: 2999,
    oneToOneDurationMinutes: 60,
    oneToOneStartHourIst: 20,
    oneToOneEndHourIst: 24,
    oneToOnePayAfterSchedule: true,
    includes: ["Mock Interviews", "Question Bank"],
  },
  {
    title: "Apache Kafka Enterprise Series",
    category: "Messaging & Streaming",
    duration: "7 Weeks",
    level: "Advanced",
    isPremium: true,
    isFree: false,
    price: "₹8,999",
    priceAmount: 8999,
    slug: "apache-kafka-enterprise",
    oneToOneEnabled: true,
    oneToOnePriceInr: 8999,
    oneToOneDurationMinutes: 60,
    oneToOneStartHourIst: 20,
    oneToOneEndHourIst: 24,
    oneToOnePayAfterSchedule: true,
    includes: ["Architecture Labs", "Lifetime Access"],
  },
  {
    title: "C# Coding (Beginner → Advanced)",
    category: "Development Foundations",
    duration: "12 Weeks",
    level: "Beginner",
    isPremium: false,
    isFree: true,
    price: null,
    priceAmount: null,
    slug: "csharp-coding",
    oneToOneEnabled: true,
    oneToOnePriceInr: 2499,
    oneToOneDurationMinutes: 60,
    oneToOneStartHourIst: 20,
    oneToOneEndHourIst: 24,
    oneToOnePayAfterSchedule: true,
    includes: ["Free Core Modules", "Community Support"],
  },
  {
    title: "Next.js + TypeScript Full Stack",
    category: "Modern Web Stack",
    duration: "9 Weeks",
    level: "Intermediate",
    isPremium: true,
    isFree: false,
    price: "₹7,999",
    priceAmount: 7999,
    slug: "nextjs-typescript-fullstack",
    oneToOneEnabled: true,
    oneToOnePriceInr: 7999,
    oneToOneDurationMinutes: 60,
    oneToOneStartHourIst: 20,
    oneToOneEndHourIst: 24,
    oneToOnePayAfterSchedule: true,
    includes: ["Production Project", "Lifetime Access"],
  },
];

const Courses = () => {
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [oneToOneOpen, setOneToOneOpen] = useState(false);
  const [oneToOneCourse, setOneToOneCourse] = useState<{
    title: string;
    priceAmount?: number | null;
    slug?: string;
    oneToOneEnabled?: boolean;
    oneToOnePriceInr?: number | null;
    oneToOneDurationMinutes?: number | null;
    oneToOneStartHourIst?: number | null;
    oneToOneEndHourIst?: number | null;
    oneToOnePayAfterSchedule?: boolean | null;
  } | null>(null);

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['published-courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  const courseMeta = (course: any) => {
    const modules = Array.isArray(course.modules) ? course.modules : [];
    const lessons = modules.flatMap((m: any) => (Array.isArray(m.lessons) ? m.lessons : []));
    const videoCount = lessons.length || course.lesson_count || 0;
    const durationLabel = course.duration || "Self-paced";
    return { videoCount, durationLabel };
  };

  const categories = useMemo(() => {
    const fromDb = courses.flatMap((course: any) => (course.tags || []).map((t: string) => t.toUpperCase()));
    const fromUpcoming = upcomingCourses.map((c) => c.category.toUpperCase());
    const unique = Array.from(new Set(["All", ...fromDb, ...fromUpcoming]));
    return unique;
  }, [courses]);

  const filteredCourses = courses.filter((course: any) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      course.title?.toLowerCase().includes(q) ||
      course.description?.toLowerCase().includes(q) ||
      (course.tags || []).join(" ").toLowerCase().includes(q);
    const matchesLevel = selectedLevel === "All" || course.level === selectedLevel;
    const matchesType = selectedType === "All" || 
      (selectedType === "Free" && !course.is_premium) ||
      (selectedType === "Premium" && course.is_premium);
    const matchesCategory =
      selectedCategory === "All" ||
      (course.tags || []).map((t: string) => t.toUpperCase()).includes(selectedCategory);
    return matchesSearch && matchesLevel && matchesType && matchesCategory;
  });

  const filteredUpcoming = upcomingCourses.filter((course) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      course.title.toLowerCase().includes(q) ||
      course.category.toLowerCase().includes(q);
    const matchesLevel = selectedLevel === "All" || course.level === selectedLevel;
    const matchesType =
      selectedType === "All" ||
      (selectedType === "Free" && course.isFree) ||
      (selectedType === "Premium" && course.isPremium);
    const matchesCategory =
      selectedCategory === "All" || course.category.toUpperCase() === selectedCategory;
    return matchesSearch && matchesLevel && matchesType && matchesCategory;
  });

  const { data: profiles } = usePublicSocialProfiles();
  const socialProfiles = (profiles ?? []).filter((p: any) => p.category === "social" && p.profile_url);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Social Rail */}
      <div className="hidden xl:flex fixed right-6 top-1/2 -translate-y-1/2 z-40 flex-col gap-3">
        {socialProfiles.map((p: any) => {
          const Icon: any = iconForKey(p.icon_key);
          return (
            <a
              key={p.platform}
              href={p.profile_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-2xl bg-card/90 border border-border/60 backdrop-blur-xl flex items-center justify-center text-muted-foreground hover:text-primary transition-all hover:shadow-glow"
              aria-label={p.display_name}
              title={p.display_name}
            >
              <Icon className="w-5 h-5" />
            </a>
          );
        })}
      </div>
      
      <main className="pt-24 pb-20">
        {/* Hero */}
        <section className="relative overflow-hidden py-14">
          <div className="absolute inset-0 atlas-mesh-bg opacity-70" />
          <div className="relative container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center"
            >
              <div>
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-2 text-xs font-semibold mb-5">
                  <GraduationCap className="w-4 h-4" />
                  Abhishek Panda Courses
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 tracking-tight">
                  Master Modern Engineering <span className="gradient-text">with a Direct Architect</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mb-6">
                  Premium, job-ready programs across .NET, Azure, microservices, AI/ML, and interview prep.
                  Built from real production systems and guided mentorship.
                </p>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="inline-flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary" />
                    20+ Premium Tracks
                  </div>
                  <div className="inline-flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    300k+ learners globally
                  </div>
                  <div className="inline-flex items-center gap-2">
                    <Award className="w-4 h-4 text-primary" />
                    Architect-level outcomes
                  </div>
                </div>
              </div>
              <div className="glass-card rounded-3xl p-6 border border-border/60">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary text-primary-foreground flex items-center justify-center text-2xl font-bold">
                    AP
                  </div>
                  <div>
                    <div className="text-sm uppercase text-muted-foreground">Your Instructor</div>
                    <div className="text-xl font-bold text-foreground">Abhishek Panda</div>
                    <div className="text-sm text-muted-foreground">Architect & AI Engineer • OriginX Labs</div>
                  </div>
                </div>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                  Architecting real-world systems for 10+ years. Focused on production-ready
                  patterns, scale, and leadership-grade engineering thinking.
                </p>
                <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs text-muted-foreground">
                  <div className="rounded-xl border border-border/70 p-3">
                    <div className="text-lg font-bold text-foreground">15+</div>
                    Years exp
                  </div>
                  <div className="rounded-xl border border-border/70 p-3">
                    <div className="text-lg font-bold text-foreground">120+</div>
                    Modules
                  </div>
                  <div className="rounded-xl border border-border/70 p-3">
                    <div className="text-lg font-bold text-foreground">24/7</div>
                    Support
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Filters */}
        <section className="container mx-auto px-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-card rounded-2xl p-4"
          >
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                      selectedCategory === cat
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr_1fr] gap-3 items-center">
                <div className="relative">
                  <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search course title, tag, or topic..."
                    className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm"
                  />
                </div>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Filter className="w-4 h-4" />
                  Level:
                  <div className="flex flex-wrap gap-2">
                    {filters.levels.map((level) => (
                      <button
                        key={level}
                        onClick={() => setSelectedLevel(level)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                          selectedLevel === level
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  Type:
                  <div className="flex flex-wrap gap-2">
                    {filters.types.map((type) => (
                      <button
                        key={type}
                        onClick={() => setSelectedType(type)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                          selectedType === type
                            ? "bg-secondary text-secondary-foreground"
                            : "bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Course Grid */}
        <section className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-foreground">Explore Courses</h2>
              <p className="text-sm text-muted-foreground">Find the right path and start building production-ready skills.</p>
            </div>
            <Button variant="outline" size="sm">View All Courses</Button>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card rounded-2xl overflow-hidden">
                  <Skeleton className="aspect-video w-full" />
                  <div className="p-6 space-y-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredCourses.length === 0 && filteredUpcoming.length === 0 ? (
            <div className="space-y-10">
              <div className="text-center pt-8">
                <GraduationCap className="w-14 h-14 text-primary mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-foreground mb-2">Courses Coming Soon</h3>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Fresh tracks are being prepared and published. Browse planned courses below.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUpcoming.map((course, index) => (
                  <motion.article
                    key={course.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: index * 0.06 }}
                    className="glass-card rounded-2xl p-6 border border-border/60"
                  >
                    <div className="flex items-center justify-between gap-2 mb-4">
                      {course.isPremium ? (
                        <span className="badge-premium"><Lock className="w-3 h-3" />Premium</span>
                      ) : (
                        <span className="badge-free">Free</span>
                      )}
                      <span className="px-2 py-1 rounded-md text-xs font-semibold bg-muted text-foreground">{course.level}</span>
                    </div>
                    <div className="text-xs uppercase tracking-wide text-primary font-semibold mb-2">{course.category}</div>
                    <h4 className="font-bold text-foreground text-lg leading-snug mb-3">{course.title}</h4>
                    <div className="space-y-1.5 text-xs text-muted-foreground mb-3">
                      <div>Instructor: <span className="text-foreground font-semibold">Abhishek Panda</span></div>
                      <div className="inline-flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        Duration: {course.duration}
                      </div>
                      <div>Price: <span className="text-foreground font-semibold">{course.price ?? "Free"}</span></div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {course.includes.map((item) => (
                        <span key={`${course.title}-${item}`} className="px-2 py-1 rounded-full text-[11px] bg-muted text-foreground/90 border border-border/70">
                          {item}
                        </span>
                      ))}
                    </div>
                    <div className="inline-flex items-center gap-2 text-xs text-muted-foreground bg-primary/10 px-3 py-1.5 rounded-full">
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                      Coming Soon
                    </div>
                  </motion.article>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course, index) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="glass-card-hover rounded-2xl overflow-hidden h-full flex flex-col">
                      <Link to={`/courses/${course.slug}`} className="block group">
                        <div className="relative aspect-video bg-gradient-to-br from-primary/20 via-secondary/20 to-purple/20 overflow-hidden">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-glow">
                              <Play className="w-6 h-6 text-primary-foreground ml-1" />
                            </div>
                          </div>
                          <div className="absolute top-3 left-3 flex gap-2">
                            {course.is_premium ? (
                              <span className="badge-premium"><Lock className="w-3 h-3" />Premium</span>
                            ) : (
                              <span className="badge-free">Free</span>
                            )}
                            {course.level && (
                              <span className="px-2 py-1 rounded-md text-xs font-semibold bg-card/90 text-foreground">{course.level}</span>
                            )}
                          </div>
                        </div>
                      </Link>
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground mb-2">
                          {(course.tags?.[0] || "PROGRAM").toString().toUpperCase()}
                        </div>
                        <Link to={`/courses/${course.slug}`}>
                          <h3 className="font-bold text-lg text-foreground mb-2 hover:text-primary transition-colors line-clamp-2">{course.title}</h3>
                        </Link>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">{course.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                          <span className="inline-flex items-center gap-1"><Play className="w-3.5 h-3.5" />{courseMeta(course).videoCount} videos</span>
                          <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{courseMeta(course).durationLabel}</span>
                          <span className="inline-flex items-center gap-1"><Users className="w-3.5 h-3.5" />{course.students_count || 0} learners</span>
                          <span className="inline-flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-500" />{course.rating || "4.9"}</span>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-border">
                          <span className={`font-bold text-xl ${course.is_premium ? 'gradient-text' : 'text-accent'}`}>
                            {course.is_premium && course.price_amount ? `₹${course.price_amount}` : 'Free'}
                          </span>
                          <div className="flex items-center gap-2">
                            {(course.one_to_one_enabled ?? true) ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setOneToOneCourse({
                                    title: course.title,
                                    priceAmount: course.price_amount,
                                    slug: course.slug,
                                    oneToOneEnabled: course.one_to_one_enabled,
                                    oneToOnePriceInr: course.one_to_one_price_inr,
                                    oneToOneDurationMinutes: course.one_to_one_duration_minutes,
                                    oneToOneStartHourIst: course.one_to_one_start_hour_ist,
                                    oneToOneEndHourIst: course.one_to_one_end_hour_ist,
                                    oneToOnePayAfterSchedule: course.one_to_one_pay_after_schedule,
                                  });
                                  setOneToOneOpen(true);
                                }}
                              >
                                1:1 Session
                              </Button>
                            ) : null}
                            <Button variant={course.is_premium ? "premium" : "default"} size="sm" asChild>
                              <Link to={`/courses/${course.slug}`}>
                                {course.is_premium ? "Buy Now" : "Start Free"}<ArrowRight className="w-4 h-4" />
                              </Link>
                            </Button>
                            <Button variant="ghost" size="sm" asChild>
                              <Link to={`/courses/${course.slug}`}>Details</Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-5">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h3 className="text-2xl font-bold text-foreground">Coming Soon Tracks</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredUpcoming.map((course, index) => (
                    <motion.article
                      key={course.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.45, delay: index * 0.05 }}
                      className="glass-card rounded-2xl p-6 border border-border/60"
                    >
                      <div className="flex items-center justify-between gap-2 mb-4">
                        {course.isPremium ? (
                          <span className="badge-premium"><Lock className="w-3 h-3" />Premium</span>
                        ) : (
                          <span className="badge-free">Free</span>
                        )}
                        <span className="px-2 py-1 rounded-md text-xs font-semibold bg-muted text-foreground">{course.level}</span>
                      </div>
                      <div className="text-xs uppercase tracking-wide text-primary font-semibold mb-2">{course.category}</div>
                      <h4 className="font-bold text-foreground text-lg leading-snug mb-3">{course.title}</h4>
                      <div className="space-y-1.5 text-xs text-muted-foreground mb-3">
                        <div>Instructor: <span className="text-foreground font-semibold">Abhishek Panda</span></div>
                        <div className="inline-flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          Duration: {course.duration}
                        </div>
                        <div>Price: <span className="text-foreground font-semibold">{course.price ?? "Free"}</span></div>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {course.includes.map((item) => (
                          <span key={`${course.title}-${item}`} className="px-2 py-1 rounded-full text-[11px] bg-muted text-foreground/90 border border-border/70">
                            {item}
                          </span>
                        ))}
                      </div>
                      <div className="inline-flex items-center gap-2 text-xs text-muted-foreground bg-primary/10 px-3 py-1.5 rounded-full">
                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                        Coming Soon
                      </div>
                      {(course.oneToOneEnabled ?? true) ? (
                        <div className="mt-4 flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setOneToOneCourse({
                                title: course.title,
                                priceAmount: course.priceAmount,
                                slug: course.slug,
                                oneToOneEnabled: course.oneToOneEnabled,
                                oneToOnePriceInr: course.oneToOnePriceInr,
                                oneToOneDurationMinutes: course.oneToOneDurationMinutes,
                                oneToOneStartHourIst: course.oneToOneStartHourIst,
                                oneToOneEndHourIst: course.oneToOneEndHourIst,
                                oneToOnePayAfterSchedule: course.oneToOnePayAfterSchedule,
                              });
                              setOneToOneOpen(true);
                            }}
                          >
                            1:1 Session
                          </Button>
                        </div>
                      ) : null}
                    </motion.article>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Testimonials */}
        <section className="container mx-auto px-4 mt-16">
          <div className="text-center mb-8">
            <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Testimonials</div>
            <h2 className="text-3xl font-black text-foreground mt-2">What Students Say</h2>
            <p className="text-sm text-muted-foreground">Career transformations driven by real-world, production-grade learning.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Omid M.",
                quote: "The depth and clarity of Abhishek's architecture explanations helped me upgrade my system design interviews.",
              },
              {
                name: "Steve A.",
                quote: "Great balance between theory and real-world scenarios. The 1:1 guidance made the difference.",
              },
              {
                name: "Timothy M.",
                quote: "Hands-on patterns and real production setups. This feels like a senior engineer showing you the ropes.",
              },
            ].map((t) => (
              <div key={t.name} className="glass-card rounded-2xl p-6 border border-border/60">
                <div className="text-sm text-muted-foreground mb-3">★★★★★</div>
                <p className="text-sm text-foreground/90 leading-relaxed mb-4">“{t.quote}”</p>
                <div className="text-xs font-semibold text-muted-foreground">{t.name}</div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <CourseOneToOneModal
        open={oneToOneOpen}
        onOpenChange={setOneToOneOpen}
        courseTitle={oneToOneCourse?.title || "Course"}
        coursePriceInr={oneToOneCourse?.priceAmount ?? null}
        courseSlug={oneToOneCourse?.slug}
        oneToOneEnabled={oneToOneCourse?.oneToOneEnabled}
        oneToOnePriceInr={oneToOneCourse?.oneToOnePriceInr}
        oneToOneDurationMinutes={oneToOneCourse?.oneToOneDurationMinutes}
        oneToOneStartHourIst={oneToOneCourse?.oneToOneStartHourIst}
        oneToOneEndHourIst={oneToOneCourse?.oneToOneEndHourIst}
        payAfterSchedule={oneToOneCourse?.oneToOnePayAfterSchedule}
      />

      <Footer />
    </div>
  );
};

export default Courses;
