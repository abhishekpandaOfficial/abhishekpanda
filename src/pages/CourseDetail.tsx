import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft,
  Play,
  Clock,
  Users,
  Star,
  BookOpen,
  Award,
  CheckCircle2,
  Download,
  Lock,
  ChevronDown,
  ChevronUp,
  Shield,
  RefreshCw,
  X,
  Phone,
  Mail,
  User,
  MapPin,
  Loader2,
  FileText,
} from "lucide-react";
import { CourseOneToOneModal } from "@/components/courses/CourseOneToOneModal";

const coursesDatabase: Record<string, {
  id: number;
  title: string;
  description: string;
  longDescription: string;
  duration: string;
  students: string;
  rating: number;
  reviews: number;
  price: string;
  priceAmount: number;
  isPremium: boolean;
  level: string;
  tags: string[];
  modules: {
    title: string;
    duration: string;
    lessons: { title: string; duration: string; isFree: boolean }[];
  }[];
  instructor: {
    name: string;
    role: string;
    bio: string;
  };
  outcomes: string[];
  requirements: string[];
}> = {
  "1": {
    id: 1,
    title: "Mastering .NET Microservices",
    description: "Build production-ready microservices with .NET, Docker, and Kubernetes.",
    longDescription: "This comprehensive course takes you from microservices fundamentals to production-ready deployments. You'll learn to design, build, and deploy scalable distributed systems using .NET Core, Docker containers, and Kubernetes orchestration. Real-world projects and industry best practices included.",
    duration: "12 hours",
    students: "2,500+",
    rating: 4.9,
    reviews: 342,
    price: "₹4,999",
    priceAmount: 4999,
    isPremium: true,
    level: "Advanced",
    tags: [".NET", "Microservices", "Docker", "Kubernetes"],
    oneToOneEnabled: true,
    oneToOnePriceInr: 4999,
    oneToOneDurationMinutes: 60,
    oneToOneStartHourIst: 20,
    oneToOneEndHourIst: 24,
    oneToOnePayAfterSchedule: true,
    modules: [
      {
        title: "Introduction to Microservices",
        duration: "45 min",
        lessons: [
          { title: "What are Microservices?", duration: "10 min", isFree: true },
          { title: "Monolith vs Microservices", duration: "15 min", isFree: true },
          { title: "When to use Microservices", duration: "10 min", isFree: false },
          { title: "Architecture Patterns", duration: "10 min", isFree: false },
        ],
      },
      {
        title: "Building Your First Microservice",
        duration: "1.5 hours",
        lessons: [
          { title: "Project Setup with .NET 8", duration: "20 min", isFree: true },
          { title: "Creating REST APIs", duration: "25 min", isFree: false },
          { title: "Dependency Injection Deep Dive", duration: "20 min", isFree: false },
          { title: "Configuration Management", duration: "25 min", isFree: false },
        ],
      },
      {
        title: "Docker & Containerization",
        duration: "2 hours",
        lessons: [
          { title: "Docker Fundamentals", duration: "30 min", isFree: false },
          { title: "Dockerfile Best Practices", duration: "30 min", isFree: false },
          { title: "Multi-stage Builds", duration: "30 min", isFree: false },
          { title: "Docker Compose for Development", duration: "30 min", isFree: false },
        ],
      },
      {
        title: "Kubernetes Orchestration",
        duration: "3 hours",
        lessons: [
          { title: "Kubernetes Architecture", duration: "45 min", isFree: false },
          { title: "Deployments & Services", duration: "45 min", isFree: false },
          { title: "ConfigMaps & Secrets", duration: "45 min", isFree: false },
          { title: "Production Deployment", duration: "45 min", isFree: false },
        ],
      },
    ],
    instructor: {
      name: "Abhishek Panda",
      role: ".NET Architect & Cloud-Native Specialist",
      bio: "10+ years of experience building enterprise-scale distributed systems. Worked with Fortune 500 companies on cloud migrations and microservices transformations.",
    },
    outcomes: [
      "Design scalable microservices architectures",
      "Build production-ready .NET microservices",
      "Deploy with Docker and Kubernetes",
      "Implement inter-service communication",
      "Handle distributed transactions",
      "Monitor and debug microservices",
    ],
    requirements: [
      "Basic C# and .NET knowledge",
      "Understanding of REST APIs",
      "Familiarity with command line",
    ],
  },
  "2": {
    id: 2,
    title: "AI/ML Engineering with Python",
    description: "From fundamentals to deploying ML models in production.",
    longDescription: "Master the complete ML engineering pipeline from data preparation to production deployment. Learn TensorFlow, PyTorch, and MLOps practices used by top tech companies.",
    duration: "15 hours",
    students: "3,200+",
    rating: 4.8,
    reviews: 456,
    price: "₹5,999",
    priceAmount: 5999,
    isPremium: true,
    level: "Intermediate",
    tags: ["Python", "ML", "TensorFlow", "MLOps"],
    oneToOneEnabled: true,
    oneToOnePriceInr: 5999,
    oneToOneDurationMinutes: 60,
    oneToOneStartHourIst: 20,
    oneToOneEndHourIst: 24,
    oneToOnePayAfterSchedule: true,
    modules: [
      {
        title: "ML Fundamentals",
        duration: "2 hours",
        lessons: [
          { title: "Introduction to Machine Learning", duration: "30 min", isFree: true },
          { title: "Types of ML Algorithms", duration: "30 min", isFree: true },
          { title: "Data Preprocessing", duration: "30 min", isFree: false },
          { title: "Feature Engineering", duration: "30 min", isFree: false },
        ],
      },
      {
        title: "Deep Learning with TensorFlow",
        duration: "4 hours",
        lessons: [
          { title: "Neural Network Basics", duration: "60 min", isFree: false },
          { title: "CNNs for Computer Vision", duration: "60 min", isFree: false },
          { title: "RNNs for Sequential Data", duration: "60 min", isFree: false },
          { title: "Transformers & Attention", duration: "60 min", isFree: false },
        ],
      },
    ],
    instructor: {
      name: "Abhishek Panda",
      role: "AI/ML Engineer & Researcher",
      bio: "Specializing in production ML systems and LLM applications. Published researcher with experience at leading AI companies.",
    },
    outcomes: [
      "Build and train ML models from scratch",
      "Deploy models to production",
      "Implement MLOps pipelines",
      "Work with LLMs and RAG systems",
    ],
    requirements: [
      "Python programming knowledge",
      "Basic statistics understanding",
      "Linear algebra fundamentals",
    ],
  },
};

const mapDbCourse = (row: any) => ({
  id: row.id,
  title: row.title,
  description: row.description || "",
  longDescription: row.long_description || row.description || "",
  duration: row.duration || "0 hours",
  students: row.students_count ? `${row.students_count.toLocaleString()}+` : "0",
  rating: Number(row.rating || 0),
  reviews: Number(row.reviews_count || 0),
  price: row.price_amount ? `₹${row.price_amount}` : "Free",
  priceAmount: row.price_amount || 0,
  isPremium: !!row.is_premium,
  level: row.level || "Beginner",
  tags: row.tags || [],
  modules: Array.isArray(row.modules) ? row.modules : row.modules || [],
  instructor: {
    name: "Abhishek Panda",
    role: ".NET Architect & Cloud-Native Specialist",
    bio: "Architect-level technical mentorship and production-grade engineering practices.",
  },
  outcomes: row.outcomes || [],
  requirements: row.requirements || [],
  oneToOneEnabled: row.one_to_one_enabled ?? true,
  oneToOnePriceInr: row.one_to_one_price_inr ?? null,
  oneToOneDurationMinutes: row.one_to_one_duration_minutes ?? 60,
  oneToOneStartHourIst: row.one_to_one_start_hour_ist ?? 20,
  oneToOneEndHourIst: row.one_to_one_end_hour_ist ?? 24,
  oneToOnePayAfterSchedule: row.one_to_one_pay_after_schedule ?? true,
});

const CourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [dbCourse, setDbCourse] = useState<any | null>(null);
  const [loadingCourse, setLoadingCourse] = useState(false);
  const { toast } = useToast();

  const [expandedModules, setExpandedModules] = useState<number[]>([0]);
  const [showSyllabusModal, setShowSyllabusModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [oneToOneOpen, setOneToOneOpen] = useState(false);

  useEffect(() => {
    if (!courseId) return;
    let mounted = true;
    setLoadingCourse(true);
    supabase
      .from("courses")
      .select("*")
      .eq("slug", courseId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!mounted) return;
        if (error || !data) {
          setDbCourse(null);
          return;
        }
        setDbCourse(mapDbCourse(data));
      })
      .finally(() => mounted && setLoadingCourse(false));
    return () => {
      mounted = false;
    };
  }, [courseId]);

  const course = useMemo(() => {
    if (dbCourse) return dbCourse;
    return coursesDatabase[courseId || "1"] || coursesDatabase["1"];
  }, [dbCourse, courseId]);

  const [syllabusForm, setSyllabusForm] = useState({
    name: "",
    email: "",
    mobile: "",
    otp: "",
    address: "",
    city: "",
    interest: "",
  });

  const toggleModule = (index: number) => {
    setExpandedModules((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleSendOtp = async () => {
    if (!syllabusForm.email && !syllabusForm.mobile) {
      toast({
        title: "Contact required",
        description: "Please enter email or mobile number to receive OTP.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    // Simulate OTP sending
    await new Promise((r) => setTimeout(r, 1500));
    setOtpSent(true);
    setIsSubmitting(false);
    toast({
      title: "OTP Sent!",
      description: `Verification code sent to ${syllabusForm.email || syllabusForm.mobile}`,
    });
  };

  const handleVerifyOtp = async () => {
    if (syllabusForm.otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid 6-digit OTP.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));
    setOtpVerified(true);
    setIsSubmitting(false);
    toast({
      title: "Verified!",
      description: "Your contact has been verified successfully.",
    });
  };

  const handleDownloadSyllabus = async () => {
    if (!syllabusForm.name || !otpVerified) {
      toast({
        title: "Complete verification",
        description: "Please fill all required fields and verify OTP.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));
    
    // Download syllabus (simulated)
    toast({
      title: "Download Started!",
      description: "Your syllabus PDF is being downloaded.",
    });
    
    setShowSyllabusModal(false);
    setSyllabusForm({ name: "", email: "", mobile: "", otp: "", address: "", city: "", interest: "" });
    setOtpSent(false);
    setOtpVerified(false);
    setIsSubmitting(false);
  };

  const handlePayment = async () => {
    toast({
      title: "Redirecting to Payment",
      description: "Opening Razorpay checkout...",
    });
    // Razorpay integration will be added
  };

  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const freeLessons = course.modules.reduce(
    (acc, m) => acc + m.lessons.filter((l) => l.isFree).length,
    0
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-24 pb-20">
        {/* Back Link */}
        <div className="container mx-auto px-4 mb-8">
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Courses
          </Link>
        </div>

        {/* Hero */}
        <section className="container mx-auto px-4 mb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Course Info */}
            <div className="lg:col-span-2">
              <div className="flex flex-wrap gap-2 mb-4">
                {course.isPremium ? (
                  <span className="badge-premium">
                    <Lock className="w-3 h-3" />
                    Premium
                  </span>
                ) : (
                  <span className="badge-free">Free</span>
                )}
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-muted text-muted-foreground">
                  {course.level}
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
                {course.title}
              </h1>
              <p className="text-xl text-muted-foreground mb-6">
                {course.longDescription}
              </p>

              {/* Meta */}
              <div className="flex flex-wrap gap-6 text-sm mb-8">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4 text-primary" />
                  {course.duration}
                </span>
                <span className="flex items-center gap-2 text-muted-foreground">
                  <BookOpen className="w-4 h-4 text-primary" />
                  {totalLessons} lessons
                </span>
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4 text-primary" />
                  {course.students} students
                </span>
                <span className="flex items-center gap-2 text-amber-500">
                  <Star className="w-4 h-4 fill-current" />
                  {course.rating} ({course.reviews} reviews)
                </span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-8">
                {course.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Instructor */}
              <div className="glass-card rounded-2xl p-6 mb-8">
                <h3 className="font-bold mb-4">Your Instructor</h3>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl text-primary-foreground font-bold">
                    AP
                  </div>
                  <div>
                    <div className="font-bold text-foreground">{course.instructor.name}</div>
                    <div className="text-sm text-muted-foreground mb-2">{course.instructor.role}</div>
                    <p className="text-sm text-muted-foreground">{course.instructor.bio}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Card */}
            <div className="lg:col-span-1">
              <div className="glass-card rounded-2xl p-6 sticky top-28">
                {/* Video Preview */}
                <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl mb-6 overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-glow">
                      <Play className="w-6 h-6 text-primary-foreground ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-3 left-3 text-sm text-white bg-black/50 px-2 py-1 rounded">
                    Preview Available
                  </div>
                </div>

                {/* Price */}
                <div className="text-center mb-6">
                  <div className="text-4xl font-black gradient-text mb-2">{course.price}</div>
                  {course.isPremium && (
                    <p className="text-sm text-muted-foreground">One-time payment, lifetime access</p>
                  )}
                </div>

                {/* CTAs */}
                <div className="space-y-3 mb-6">
                  {course.isPremium ? (
                    <>
                      <Button
                        variant="hero"
                        size="lg"
                        className="w-full"
                        onClick={() => setShowPaymentModal(true)}
                      >
                        Enroll Now
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full"
                        onClick={() => setShowSyllabusModal(true)}
                      >
                        <Download className="w-4 h-4" />
                        Download Syllabus
                      </Button>
                      {(course.oneToOneEnabled ?? true) ? (
                        <Button
                          variant="outline"
                          size="lg"
                          className="w-full"
                          onClick={() => setOneToOneOpen(true)}
                        >
                          1:1 Session
                        </Button>
                      ) : null}
                    </>
                  ) : (
                    <>
                      <Button variant="hero" size="lg" className="w-full">
                        Start Free Course
                      </Button>
                      {(course.oneToOneEnabled ?? true) ? (
                        <Button
                          variant="outline"
                          size="lg"
                          className="w-full"
                          onClick={() => setOneToOneOpen(true)}
                        >
                          1:1 Session
                        </Button>
                      ) : null}
                    </>
                  )}
                </div>

                {/* Guarantees */}
                <div className="space-y-3 pt-6 border-t border-border">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Shield className="w-5 h-5 text-emerald-500" />
                    <span>7-Day Money Back Guarantee</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <RefreshCw className="w-5 h-5 text-primary" />
                    <span>Lifetime Updates</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Award className="w-5 h-5 text-amber-500" />
                    <span>Certificate of Completion</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Course Content */}
        <section className="container mx-auto px-4 mb-16">
          <h2 className="text-3xl font-black mb-2">Course Content</h2>
          <p className="text-muted-foreground mb-6">
            Organized modules with clear lesson flow, locked segments, and preview lessons.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Modules</p>
              <p className="text-2xl font-black text-foreground">{course.modules.length}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Lessons</p>
              <p className="text-2xl font-black text-foreground">{totalLessons}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Free Preview</p>
              <p className="text-2xl font-black text-foreground">{freeLessons}</p>
            </div>
          </div>

          <div className="space-y-4">
            {course.modules.map((module, moduleIndex) => (
              <motion.div
                key={moduleIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: moduleIndex * 0.1 }}
                className="glass-card rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => toggleModule(moduleIndex)}
                  className="w-full p-6 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <h3 className="font-bold text-lg text-foreground">{module.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {module.lessons.length} lessons • {module.duration}
                    </p>
                  </div>
                  {expandedModules.includes(moduleIndex) ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>

                <AnimatePresence>
                  {expandedModules.includes(moduleIndex) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-border"
                    >
                      <div className="p-4 space-y-2">
                        {module.lessons.map((lesson, lessonIndex) => (
                          <div
                            key={lessonIndex}
                            className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                              lesson.isFree ? "bg-emerald-500/5 border border-emerald-500/20" : "hover:bg-muted/50"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {lesson.isFree ? (
                                <Play className="w-4 h-4 text-primary" />
                              ) : (
                                <Lock className="w-4 h-4 text-muted-foreground" />
                              )}
                              <span className="text-foreground">{lesson.title}</span>
                              {lesson.isFree && (
                                <span className="badge-free text-xs">Preview</span>
                              )}
                            </div>
                            <span className="text-sm text-muted-foreground">{lesson.duration}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Outcomes & Requirements */}
        <section className="container mx-auto px-4 mb-16">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                What You'll Learn
              </h3>
              <ul className="space-y-3">
                {course.outcomes.map((outcome, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-foreground">{outcome}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Requirements
              </h3>
              <ul className="space-y-3">
                {course.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <span className="text-foreground">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Money Back Guarantee */}
        <section className="container mx-auto px-4 mb-16">
          <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-2xl p-8 border border-emerald-500/20 text-center">
            <Shield className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">7-Day Money Back Guarantee</h3>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Not satisfied with the course? Get a full refund within 7 days of purchase.
              No questions asked. Terms and conditions apply.
            </p>
          </div>
        </section>
      </main>

      {/* Syllabus Download Modal */}
      <AnimatePresence>
        {showSyllabusModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSyllabusModal(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="bg-card rounded-3xl p-6 md:p-8 border border-primary/30 shadow-2xl">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <FileText className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Download Syllabus</h2>
                      <p className="text-sm text-muted-foreground">Get the detailed course outline</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowSyllabusModal(false)}
                    className="w-8 h-8 rounded-lg bg-muted hover:bg-destructive hover:text-destructive-foreground flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Full Name <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        value={syllabusForm.name}
                        onChange={(e) => setSyllabusForm({ ...syllabusForm, name: e.target.value })}
                        placeholder="Your full name"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Email Address <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="email"
                        value={syllabusForm.email}
                        onChange={(e) => setSyllabusForm({ ...syllabusForm, email: e.target.value })}
                        placeholder="your@email.com"
                        className="pl-10"
                        disabled={otpSent}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Mobile Number <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        value={syllabusForm.mobile}
                        onChange={(e) => setSyllabusForm({ ...syllabusForm, mobile: e.target.value })}
                        placeholder="+91 9876543210"
                        className="pl-10"
                        disabled={otpSent}
                      />
                    </div>
                  </div>

                  {!otpSent && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleSendOtp}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Sending OTP...</>
                      ) : (
                        "Send OTP"
                      )}
                    </Button>
                  )}

                  {otpSent && !otpVerified && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-semibold mb-2">
                          Enter OTP <span className="text-destructive">*</span>
                        </label>
                        <Input
                          value={syllabusForm.otp}
                          onChange={(e) => setSyllabusForm({ ...syllabusForm, otp: e.target.value })}
                          placeholder="Enter 6-digit OTP"
                          maxLength={6}
                        />
                      </div>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleVerifyOtp}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</>
                        ) : (
                          "Verify OTP"
                        )}
                      </Button>
                    </div>
                  )}

                  {otpVerified && (
                    <>
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Contact verified successfully!
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2">
                          Address (Optional)
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            value={syllabusForm.address}
                            onChange={(e) => setSyllabusForm({ ...syllabusForm, address: e.target.value })}
                            placeholder="Your address"
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2">
                          What interests you most?
                        </label>
                        <Input
                          value={syllabusForm.interest}
                          onChange={(e) => setSyllabusForm({ ...syllabusForm, interest: e.target.value })}
                          placeholder="e.g., Career growth, specific topics..."
                        />
                      </div>

                      <Button
                        variant="hero"
                        className="w-full"
                        onClick={handleDownloadSyllabus}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Preparing...</>
                        ) : (
                          <><Download className="w-4 h-4" /> Download Syllabus</>
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <CourseOneToOneModal
        open={oneToOneOpen}
        onOpenChange={setOneToOneOpen}
        courseTitle={course.title}
        coursePriceInr={course.priceAmount}
        courseSlug={courseId}
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
};

export default CourseDetail;
