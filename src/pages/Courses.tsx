import { useState } from "react";
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
  Sparkles
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { CourseOneToOneModal } from "@/components/courses/CourseOneToOneModal";

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
    includes: ["Production Project", "Lifetime Access"],
  },
];

const Courses = () => {
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [oneToOneOpen, setOneToOneOpen] = useState(false);
  const [oneToOneCourse, setOneToOneCourse] = useState<{
    title: string;
    priceAmount?: number | null;
    slug?: string;
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

  const filteredCourses = courses.filter((course) => {
    const matchesLevel = selectedLevel === "All" || course.level === selectedLevel;
    const matchesType = selectedType === "All" || 
      (selectedType === "Free" && !course.is_premium) ||
      (selectedType === "Premium" && course.is_premium);
    return matchesLevel && matchesType;
  });

  const filteredUpcoming = upcomingCourses.filter((course) => {
    const matchesLevel = selectedLevel === "All" || course.level === selectedLevel;
    const matchesType =
      selectedType === "All" ||
      (selectedType === "Free" && course.isFree) ||
      (selectedType === "Premium" && course.isPremium);
    return matchesLevel && matchesType;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 pb-20">
        {/* Hero */}
        <section className="relative overflow-hidden py-16">
          <div className="absolute inset-0 mesh-gradient opacity-50" />
          <div className="relative container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-2 text-sm font-medium mb-6">
                <GraduationCap className="w-4 h-4" />
                Industry-Proven Curriculum
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 tracking-tight">
                Level Up Your <span className="gradient-text">Engineering Skills</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Learn from real-world projects and battle-tested architectures.
                New series are rolling out continuously across .NET, Azure, microservices, AI, and interview prep.
              </p>
              <div className="flex flex-wrap justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <span className="text-muted-foreground">Expert-Led Content</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  <span className="text-muted-foreground">Certificates Included</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="text-muted-foreground">Community Support</span>
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
            className="glass-card rounded-2xl p-4 flex flex-wrap items-center gap-4"
          >
            <div className="flex items-center gap-2 text-muted-foreground">
              <Filter className="w-5 h-5" />
              <span className="font-medium">Filters:</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {filters.levels.map((level) => (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedLevel === level
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>

            <div className="h-8 w-px bg-border hidden sm:block" />

            <div className="flex flex-wrap gap-2">
              {filters.types.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedType === type
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Course Grid */}
        <section className="container mx-auto px-4">
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
          ) : filteredCourses.length === 0 ? (
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
                        <Link to={`/courses/${course.slug}`}>
                          <h3 className="font-bold text-lg text-foreground mb-2 hover:text-primary transition-colors line-clamp-2">{course.title}</h3>
                        </Link>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">{course.description}</p>
                        <div className="flex items-center justify-between pt-4 border-t border-border">
                          <span className={`font-bold text-xl ${course.is_premium ? 'gradient-text' : 'text-accent'}`}>
                            {course.is_premium && course.price_amount ? `₹${course.price_amount}` : 'Free'}
                          </span>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setOneToOneCourse({ title: course.title, priceAmount: course.price_amount, slug: course.slug });
                                setOneToOneOpen(true);
                              }}
                            >
                              1:1 Session
                            </Button>
                            <Button variant={course.is_premium ? "premium" : "default"} size="sm" asChild>
                              <Link to={`/courses/${course.slug}`}>
                                {course.is_premium ? "Enroll" : "Start"}<ArrowRight className="w-4 h-4" />
                              </Link>
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
                      <div className="mt-4 flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setOneToOneCourse({ title: course.title, priceAmount: course.priceAmount, slug: course.slug });
                            setOneToOneOpen(true);
                          }}
                        >
                          1:1 Session
                        </Button>
                      </div>
                    </motion.article>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      <CourseOneToOneModal
        open={oneToOneOpen}
        onOpenChange={setOneToOneOpen}
        courseTitle={oneToOneCourse?.title || "Course"}
        coursePriceInr={oneToOneCourse?.priceAmount ?? null}
        courseSlug={oneToOneCourse?.slug}
      />

      <Footer />
    </div>
  );
};

export default Courses;
