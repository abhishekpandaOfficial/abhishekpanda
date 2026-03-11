import { Suspense, lazy, useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Routes, Route, useParams } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useAnalytics } from "@/hooks/useAnalytics";
import Index from "./pages/Index";
import { RouteSeo } from "@/components/seo/RouteSeo";
import { BrandIntro } from "@/components/BrandIntro";
import AdminWebVault from "@/components/admin/AdminWebVault";

const About = lazy(() => import("./pages/About"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Courses = lazy(() => import("./pages/Courses"));
const CourseDetail = lazy(() => import("./pages/CourseDetail"));
const Products = lazy(() => import("./pages/Products"));
const Mentorship = lazy(() => import("./pages/Mentorship"));
const Contact = lazy(() => import("./pages/Contact"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const Ebooks = lazy(() => import("./pages/Ebooks"));
const EbookDetail = lazy(() => import("./pages/EbookDetail"));
const EbookReader = lazy(() => import("./pages/EbookReader"));
const LLMGalaxy = lazy(() => import("./pages/LLMGalaxy"));
const ModelDetail = lazy(() => import("./pages/ModelDetail"));
const ClosedSourceModels = lazy(() => import("./pages/ClosedSourceModels"));
const OpenSourceModels = lazy(() => import("./pages/OpenSourceModels"));
const ModelComparisonPage = lazy(() => import("./pages/ModelComparisonPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const BlogAggregator = lazy(() => import("./pages/BlogAggregator"));
const BlogSeries = lazy(() => import("./pages/BlogSeries"));
const AiMlBlogsHub = lazy(() => import("./pages/AiMlBlogsHub"));
const AiMlSeries = lazy(() => import("./pages/AiMlSeries"));
const MathematicsMastery = lazy(() => import("./pages/MathematicsMastery"));
const StatisticsMastery = lazy(() => import("./pages/StatisticsMastery"));
const NumpyMastery = lazy(() => import("./pages/NumpyMastery"));
const MachineLearningCoreMastery = lazy(() => import("./pages/MachineLearningCoreMastery"));
const ArticlesPage = lazy(() => import("./pages/Articles"));
const CaseStudies = lazy(() => import("./pages/CaseStudies"));
const Interview = lazy(() => import("./pages/Interview"));
const Projects = lazy(() => import("./pages/Projects"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const InstallPWA = lazy(() => import("./pages/InstallPWA"));
const PasskeyRegistration = lazy(() => import("./pages/PasskeyRegistration"));
const Login = lazy(() => import("./pages/Login"));
const Account = lazy(() => import("./pages/Account"));
const Chronyx = lazy(() => import("./pages/Chronyx"));
const TechHub = lazy(() => import("./pages/TechHub"));
const OpenOwlLanding = lazy(() => import("./pages/OpenOwlLanding"));
const OpenOwlAssistant = lazy(() => import("./pages/OpenOwlAssistant"));
const LLMVisualizer = lazy(() => import("./pages/llm-visualizer"));
const CSharpMastery = lazy(() => import("./pages/CSharpMastery"));
const LinqMastery = lazy(() => import("./pages/LinqMastery"));
const DotnetMastery = lazy(() => import("./pages/DotnetMastery"));
const MicroservicesMastery = lazy(() => import("./pages/MicroservicesMastery"));
const KafkaMastery = lazy(() => import("./pages/KafkaMastery"));
const BlazorMastery = lazy(() => import("./pages/BlazorMastery"));
const EFCoreMastery = lazy(() => import("./pages/EFCoreMastery"));
const AzureMasteryGuide = lazy(() => import("./pages/AzureMasteryGuide"));
const AngularMasteryGuide = lazy(() => import("./pages/AngularMasteryGuide"));
const DesignPatternsGuide = lazy(() => import("./pages/DesignPatternsGuide"));
const SolidPrinciplesGuide = lazy(() => import("./pages/SolidPrinciplesGuide"));
const Classified = lazy(() => import("./pages/Classified"));
const Scriptures = lazy(() => import("./pages/Scriptures"));

const AdminLayout = lazy(() => import("@/components/admin/AdminLayout").then((m) => ({ default: m.AdminLayout })));
const AdminDashboard = lazy(() => import("@/components/admin/AdminDashboard"));
const AdminCoursesManager = lazy(() => import("@/components/admin/AdminCoursesManager").then((m) => ({ default: m.AdminCoursesManager })));
const AdminContactRequests = lazy(() => import("@/components/admin/AdminContactRequests"));
const AdminLLMAtlasManager = lazy(() => import("@/components/admin/AdminLLMAtlasManager"));
const AdminSocialHub = lazy(() => import("@/components/admin/AdminSocialHub").then((m) => ({ default: m.AdminSocialHub })));
const AdminArgusControl = lazy(() => import("@/components/admin/AdminArgusControl"));
const AdminAnalytics = lazy(() => import("@/components/admin/AdminAnalytics"));
const AdminSettings = lazy(() => import("@/components/admin/AdminSettings"));
const AdminSecurity = lazy(() => import("@/components/admin/AdminSecurity").then((m) => ({ default: m.AdminSecurity })));
const AdminIntegrations = lazy(() => import("@/components/admin/AdminIntegrations"));
const AdminAuditLogs = lazy(() => import("@/components/admin/AdminAuditLogs"));
const AdminMentorshipBookings = lazy(() => import("@/components/admin/AdminMentorshipBookings"));
const AdminOpsDocs = lazy(() => import("@/components/admin/AdminOpsDocs"));
const AdminEbooksManager = lazy(() => import("@/components/admin/AdminEbooksManager"));
const OpenOwlAdminLayout = lazy(() => import("./pages/openowl-admin/OpenOwlAdminLayout"));
const OpenOwlAdminOverview = lazy(() => import("./pages/openowl-admin/OverviewPage"));
const OpenOwlAdminStudio = lazy(() => import("./pages/openowl-admin/StudioPage"));
const OpenOwlAdminPublish = lazy(() => import("./pages/openowl-admin/PublishPage"));
const OpenOwlAdminDelivery = lazy(() => import("./pages/openowl-admin/DeliveryPage"));
const OpenOwlAdminRuns = lazy(() => import("./pages/openowl-admin/RunsPage"));
const OpenOwlAdminSettings = lazy(() => import("./pages/openowl-admin/SettingsPage"));

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

const LegacyCheatsheetSeriesRedirect = () => {
  const { seriesSlug } = useParams();
  return <Navigate to={seriesSlug ? `/cheatsheets/${seriesSlug}` : "/cheatsheets"} replace />;
};

const App = () => {
  const [showIntro, setShowIntro] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.location.pathname === "/";
  });

  useEffect(() => {
    if (!showIntro) return;
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
  }, [showIntro]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="abhishekpanda-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
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
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/refund" element={<RefundPolicy />} />
                <Route path="/llm-galaxy" element={<LLMGalaxy />} />
                <Route path="/llm-galaxy/model/:modelId" element={<ModelDetail />} />
                <Route path="/llm-galaxy/closed-source-models" element={<ClosedSourceModels />} />
                <Route path="/llm-galaxy/open-source-models" element={<OpenSourceModels />} />
                <Route path="/llm-galaxy/model-comparison" element={<ModelComparisonPage />} />
                <Route path="/ai-closed_models_2026.html" element={<Navigate to="/llm-galaxy/closed-source-models" replace />} />
                <Route path="/open-source-models-march-2026.html" element={<Navigate to="/llm-galaxy/open-source-models" replace />} />
                <Route path="/ai-model-comparison.html" element={<Navigate to="/llm-galaxy/model-comparison" replace />} />
                <Route path="/blogs" element={<BlogAggregator />} />
                <Route path="/cheatsheets" element={<Navigate to="/blogs" replace />} />
                <Route path="/cheatsheets/azure-mastery" element={<AzureMasteryGuide />} />
                <Route path="/cheatsheets/angular-mastery" element={<AngularMasteryGuide />} />
                <Route path="/cheatsheets/csharp-mastery" element={<CSharpMastery />} />
                <Route path="/cheatsheets/linq-mastery" element={<LinqMastery />} />
                <Route path="/cheatsheets/dotnet-mastery" element={<DotnetMastery />} />
                <Route path="/cheatsheets/microservices-mastery" element={<MicroservicesMastery />} />
                <Route path="/cheatsheets/kafka-mastery" element={<KafkaMastery />} />
                <Route path="/cheatsheets/blazor-mastery" element={<BlazorMastery />} />
                <Route path="/cheatsheets/efcore-mastery" element={<EFCoreMastery />} />
                <Route path="/cheatsheets/dotnet-mastery-toc" element={<Navigate to="/cheatsheets/dotnet-mastery" replace />} />
                <Route path="/cheatsheets/:seriesSlug" element={<BlogSeries />} />
                <Route path="/ai-ml-blogs" element={<AiMlBlogsHub />} />
                <Route path="/ai-ml-blogs/mathematics-mastery" element={<MathematicsMastery />} />
                <Route path="/ai-ml-blogs/statistics-mastery" element={<StatisticsMastery />} />
                <Route path="/ai-ml-blogs/numpy-mastery" element={<NumpyMastery />} />
                <Route path="/ai-ml-blogs/machine-learning-core-mastery" element={<MachineLearningCoreMastery />} />
                <Route path="/ai-ml-blogs/:seriesSlug" element={<AiMlSeries />} />
                <Route path="/blogs/azure-mastery" element={<Navigate to="/cheatsheets/azure-mastery" replace />} />
                <Route path="/blogs/angular-mastery" element={<Navigate to="/cheatsheets/angular-mastery" replace />} />
                <Route path="/blogs/linq-mastery" element={<Navigate to="/cheatsheets/linq-mastery" replace />} />
                <Route path="/blogs/dotnet-mastery" element={<Navigate to="/cheatsheets/dotnet-mastery" replace />} />
                <Route path="/blogs/microservices-mastery" element={<Navigate to="/cheatsheets/microservices-mastery" replace />} />
                <Route path="/blogs/kafka-mastery" element={<Navigate to="/cheatsheets/kafka-mastery" replace />} />
                <Route path="/blogs/blazor-mastery" element={<Navigate to="/cheatsheets/blazor-mastery" replace />} />
                <Route path="/blogs/:seriesSlug" element={<LegacyCheatsheetSeriesRedirect />} />
                <Route path="/blog/techhub" element={<TechHub />} />
                <Route path="/articles" element={<Suspense fallback={<RouteLoader />}><ArticlesPage /></Suspense>} />
                <Route path="/articles/:slug" element={<Suspense fallback={<RouteLoader />}><ArticlesPage /></Suspense>} />
                <Route path="/scriptures" element={<Suspense fallback={<RouteLoader />}><Scriptures /></Suspense>} />
                <Route path="/scriptures/:slug" element={<Suspense fallback={<RouteLoader />}><Scriptures /></Suspense>} />
                <Route path="/case-studies" element={<CaseStudies />} />
                <Route path="/case-studies/:slug" element={<CaseStudies />} />
                <Route path="/interview" element={<Interview />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/blog/techstacks" element={<Navigate to="/blog/techhub" replace />} />
                <Route path="/chronyx" element={<Chronyx />} />
                <Route path="/tech" element={<Navigate to="/blog/techhub" replace />} />
                <Route path="/tech/:slug" element={<Navigate to="/blog/techhub" replace />} />
                <Route path="/openowl" element={<OpenOwlLanding />} />
                <Route path="/openowl/assistant" element={<OpenOwlAssistant />} />
                <Route path="/openowl/dashboard" element={<Navigate to="/openowl-dashboard.html" replace />} />
                <Route path="/openowl/blueprint" element={<Navigate to="/openowl-blueprint.html" replace />} />
                <Route path="/openowl/setup" element={<Navigate to="/openowl-setup-guide.html" replace />} />
                <Route path="/openowl/guide" element={<Navigate to="/openowl-setup-guide.html" replace />} />
                <Route path="/openowl-dashboard" element={<Navigate to="/openowl-dashboard.html" replace />} />
                <Route path="/openowl-blueprint" element={<Navigate to="/openowl-blueprint.html" replace />} />
                <Route path="/open-owl" element={<Navigate to="/openowl" replace />} />
                <Route path="/llm-visualizer" element={<LLMVisualizer />} />
                <Route path="/azure-mastery" element={<Navigate to="/cheatsheets/azure-mastery" replace />} />
                <Route path="/angular-mastery" element={<Navigate to="/cheatsheets/angular-mastery" replace />} />
                <Route path="/csharp-mastery" element={<Navigate to="/cheatsheets/csharp-mastery" replace />} />
                <Route path="/linq-mastery" element={<Navigate to="/cheatsheets/linq-mastery" replace />} />
                <Route path="/dotnet-mastery" element={<Navigate to="/cheatsheets/dotnet-mastery" replace />} />
                <Route path="/microservices-mastery" element={<Navigate to="/cheatsheets/microservices-mastery" replace />} />
                <Route path="/kafka-mastery" element={<Navigate to="/cheatsheets/kafka-mastery" replace />} />
                <Route path="/blazor-mastery" element={<Navigate to="/cheatsheets/blazor-mastery" replace />} />
                <Route path="/efcore-mastery" element={<Navigate to="/cheatsheets/efcore-mastery" replace />} />
                <Route path="/dotnet-mastery-toc" element={<Navigate to="/cheatsheets/dotnet-mastery" replace />} />
                <Route path="/design-patterns-guide" element={<DesignPatternsGuide />} />
                <Route path="/cheatsheets/solid-principles" element={<SolidPrinciplesGuide />} />
                <Route path="/cheatsheets/solid-principle" element={<Navigate to="/cheatsheets/solid-principles" replace />} />
                <Route path="/blogs/solid-principles" element={<Navigate to="/cheatsheets/solid-principles" replace />} />
                <Route path="/blogs/solid-principle" element={<Navigate to="/cheatsheets/solid-principles" replace />} />
                <Route path="/solid-principles-guide" element={<Navigate to="/cheatsheets/solid-principles" replace />} />
                <Route path="/classified" element={<Classified />} />
                <Route path="/classified-preview" element={<Navigate to="/classified" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/account" element={<Account />} />

                {/* Admin Install & Login */}
                <Route path="/install" element={<InstallPWA />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/register-passkey" element={<PasskeyRegistration />} />

                {/* Admin Routes - Protected */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="business" element={<Navigate to="/admin" replace />} />
                  <Route path="ip-management" element={<Navigate to="/admin" replace />} />
                  <Route path="cv-downloads" element={<Navigate to="/admin" replace />} />
                  <Route path="contacts" element={<AdminContactRequests />} />
                  <Route path="mentorship" element={<AdminMentorshipBookings />} />
                  <Route path="blog" element={<Navigate to="/admin" replace />} />
                  <Route path="cms" element={<Navigate to="/admin" replace />} />
                  <Route path="nimbus" element={<Navigate to="/admin" replace />} />
                  <Route path="courses" element={<AdminCoursesManager />} />
                  <Route path="products" element={<Navigate to="/admin" replace />} />
                  <Route path="ebooks" element={<AdminEbooksManager />} />
                  <Route path="llm-galaxy" element={<AdminLLMAtlasManager />} />
                  <Route path="workflows" element={<Navigate to="/admin" replace />} />
                  <Route path="social" element={<AdminSocialHub />} />
                  <Route path="jobs" element={<Navigate to="/admin" replace />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                  <Route path="argus" element={<AdminArgusControl />} />
                  <Route path="payments" element={<Navigate to="/admin" replace />} />
                  <Route path="drive" element={<Navigate to="/admin" replace />} />
                  <Route path="webvault" element={<AdminWebVault />} />
                  <Route path="lifemap" element={<Navigate to="/admin" replace />} />
                  <Route path="open-owl" element={<Navigate to="/openowl/admin" replace />} />
                  <Route path="integrations" element={<AdminIntegrations />} />
                  <Route path="ops" element={<AdminOpsDocs />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="security" element={<AdminSecurity />} />
                  <Route path="audit-logs" element={<AdminAuditLogs />} />
                </Route>

                <Route path="/openowl/admin" element={<OpenOwlAdminLayout />}>
                  <Route index element={<OpenOwlAdminOverview />} />
                  <Route path="studio" element={<OpenOwlAdminStudio />} />
                  <Route path="publish" element={<OpenOwlAdminPublish />} />
                  <Route path="delivery" element={<OpenOwlAdminDelivery />} />
                  <Route path="runs" element={<OpenOwlAdminRuns />} />
                  <Route path="settings" element={<OpenOwlAdminSettings />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
              </Suspense>
            </AnalyticsWrapper>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
