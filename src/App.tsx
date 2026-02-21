import { Suspense, lazy, useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useAnalytics } from "@/hooks/useAnalytics";
import Index from "./pages/Index";
import { RouteSeo } from "@/components/seo/RouteSeo";
import { BrandIntro } from "@/components/BrandIntro";

const About = lazy(() => import("./pages/About"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Courses = lazy(() => import("./pages/Courses"));
const CourseDetail = lazy(() => import("./pages/CourseDetail"));
const Products = lazy(() => import("./pages/Products"));
const Mentorship = lazy(() => import("./pages/Mentorship"));
const Contact = lazy(() => import("./pages/Contact"));
const Ebooks = lazy(() => import("./pages/Ebooks"));
const EbookDetail = lazy(() => import("./pages/EbookDetail"));
const EbookReader = lazy(() => import("./pages/EbookReader"));
const LLMGalaxy = lazy(() => import("./pages/LLMGalaxy"));
const ModelDetail = lazy(() => import("./pages/ModelDetail"));
const NotFound = lazy(() => import("./pages/NotFound"));
const BlogAggregator = lazy(() => import("./pages/BlogAggregator"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const InstallPWA = lazy(() => import("./pages/InstallPWA"));
const PasskeyRegistration = lazy(() => import("./pages/PasskeyRegistration"));
const Login = lazy(() => import("./pages/Login"));
const Account = lazy(() => import("./pages/Account"));
const Chronyx = lazy(() => import("./pages/Chronyx"));
const TechHub = lazy(() => import("./pages/TechHub"));
const FoundationalModelsGuide = lazy(() => import("./pages/FoundationalModelsGuide"));
const ABHIBot = lazy(() => import("@/components/home/ABHIBot").then((m) => ({ default: m.ABHIBot })));

const AdminLayout = lazy(() => import("@/components/admin/AdminLayout").then((m) => ({ default: m.AdminLayout })));
const AdminDashboard = lazy(() => import("@/components/admin/AdminDashboard"));
const AdminCVDownloads = lazy(() => import("@/components/admin/AdminCVDownloads"));
const AdminBusinessHub = lazy(() => import("@/components/admin/AdminBusinessHub"));
const AdminPayments = lazy(() => import("@/components/admin/AdminPayments"));
const AdminCoursesManager = lazy(() => import("@/components/admin/AdminCoursesManager").then((m) => ({ default: m.AdminCoursesManager })));
const AdminBlogManager = lazy(() => import("@/components/admin/AdminBlogManager").then((m) => ({ default: m.AdminBlogManager })));
const AdminEncryptedDrive = lazy(() => import("@/components/admin/AdminEncryptedDrive").then((m) => ({ default: m.AdminEncryptedDrive })));
const AdminContactRequests = lazy(() => import("@/components/admin/AdminContactRequests"));
const AdminProductsManager = lazy(() => import("@/components/admin/AdminProductsManager"));
const AdminLLMAtlasManager = lazy(() => import("@/components/admin/AdminLLMAtlasManager"));
const AdminWorkflows = lazy(() => import("@/components/admin/AdminWorkflows").then((m) => ({ default: m.AdminWorkflows })));
const AdminSocialHub = lazy(() => import("@/components/admin/AdminSocialHub").then((m) => ({ default: m.AdminSocialHub })));
const AdminScheduledJobs = lazy(() => import("@/components/admin/AdminScheduledJobs").then((m) => ({ default: m.AdminScheduledJobs })));
const AdminAnalytics = lazy(() => import("@/components/admin/AdminAnalytics"));
const AdminSettings = lazy(() => import("@/components/admin/AdminSettings"));
const AdminSecurity = lazy(() => import("@/components/admin/AdminSecurity").then((m) => ({ default: m.AdminSecurity })));
const AdminLifeMap = lazy(() => import("@/components/admin/AdminLifeMap"));
const AdminIntegrations = lazy(() => import("@/components/admin/AdminIntegrations"));
const AdminNimbusDesk = lazy(() => import("@/components/admin/AdminNimbusDesk"));
const AdminAuditLogs = lazy(() => import("@/components/admin/AdminAuditLogs"));
const AdminIPManagement = lazy(() => import("@/components/admin/AdminIPManagement"));
const AdminMentorshipBookings = lazy(() => import("@/components/admin/AdminMentorshipBookings"));
const AdminOpsDocs = lazy(() => import("@/components/admin/AdminOpsDocs"));
const AdminEbooksManager = lazy(() => import("@/components/admin/AdminEbooksManager"));

const queryClient = new QueryClient();

const AnalyticsWrapper = ({ children }: { children: React.ReactNode }) => {
  useAnalytics();
  return <>{children}</>;
};

const RouteLoader = () => (
  <div className="min-h-[35vh] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary/35 border-t-primary rounded-full animate-spin" />
  </div>
);

const AssistantMount = () => {
  const { pathname } = useLocation();
  if (pathname.startsWith("/admin")) return null;

  return (
    <Suspense fallback={null}>
      <ABHIBot />
    </Suspense>
  );
};

const App = () => {
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const start = Date.now();
    const minDuration = 1500;

    const complete = () => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(minDuration - elapsed, 0);
      setTimeout(() => setShowIntro(false), remaining);
    };

    if (document.readyState === "complete") {
      complete();
    } else {
      window.addEventListener("load", complete, { once: true });
      return () => window.removeEventListener("load", complete);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="abhishekpanda-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AnalyticsWrapper>
              <RouteSeo />
              <AnimatePresence>{showIntro ? <BrandIntro /> : null}</AnimatePresence>
              <Suspense fallback={<RouteLoader />}>
                <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<About />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/academy" element={<Navigate to="/courses" replace />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/courses/:courseId" element={<CourseDetail />} />
                <Route path="/ebooks" element={<Ebooks />} />
                <Route path="/ebooks/:slug" element={<EbookDetail />} />
                <Route path="/ebooks/:slug/read" element={<EbookReader />} />
                <Route path="/products" element={<Products />} />
                <Route path="/mentorship" element={<Mentorship />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/llm-galaxy" element={<LLMGalaxy />} />
                <Route path="/llm-galaxy/model/:modelId" element={<ModelDetail />} />
                <Route path="/blogs" element={<BlogAggregator />} />
                <Route path="/blog/techhub" element={<TechHub />} />
                <Route path="/blog/building-your-own-foundational-ai-models-from-scratch" element={<FoundationalModelsGuide />} />
                <Route path="/blog/techstacks" element={<Navigate to="/blog/techhub" replace />} />
                <Route path="/chronyx" element={<Chronyx />} />
                <Route path="/tech" element={<Navigate to="/blog/techhub" replace />} />
                <Route path="/tech/:slug" element={<Navigate to="/blog/techhub" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/account" element={<Account />} />

                {/* Admin Install & Login */}
                <Route path="/install" element={<InstallPWA />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/register-passkey" element={<PasskeyRegistration />} />

                {/* Admin Routes - Protected */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="business" element={<AdminBusinessHub />} />
                  <Route path="ip-management" element={<AdminIPManagement />} />
                  <Route path="cv-downloads" element={<AdminCVDownloads />} />
                  <Route path="contacts" element={<AdminContactRequests />} />
                  <Route path="mentorship" element={<AdminMentorshipBookings />} />
                  <Route path="blog" element={<AdminBlogManager />} />
                  <Route path="nimbus" element={<AdminNimbusDesk />} />
                  <Route path="courses" element={<AdminCoursesManager />} />
                  <Route path="products" element={<AdminProductsManager />} />
                  <Route path="ebooks" element={<AdminEbooksManager />} />
                  <Route path="llm-galaxy" element={<AdminLLMAtlasManager />} />
                  <Route path="workflows" element={<AdminWorkflows />} />
                  <Route path="social" element={<AdminSocialHub />} />
                  <Route path="jobs" element={<AdminScheduledJobs />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                  <Route path="payments" element={<AdminPayments />} />
                  <Route path="drive" element={<AdminEncryptedDrive />} />
                  <Route path="lifemap" element={<AdminLifeMap />} />
                  <Route path="integrations" element={<AdminIntegrations />} />
                  <Route path="ops" element={<AdminOpsDocs />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="security" element={<AdminSecurity />} />
                  <Route path="audit-logs" element={<AdminAuditLogs />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
              </Suspense>
              <AssistantMount />
            </AnalyticsWrapper>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
