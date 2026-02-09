import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useAnalytics } from "@/hooks/useAnalytics";
import Index from "./pages/Index";
import About from "./pages/About";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Academy from "./pages/Academy";
import CourseDetail from "./pages/CourseDetail";
import Products from "./pages/Products";
import Mentorship from "./pages/Mentorship";
import Contact from "./pages/Contact";
import LLMGalaxy from "./pages/LLMGalaxy";
import ModelDetail from "./pages/ModelDetail";
import NotFound from "./pages/NotFound";
import BlogAggregator from "./pages/BlogAggregator";
import AdminLogin from "./pages/AdminLogin";
import InstallPWA from "./pages/InstallPWA";
import PasskeyRegistration from "./pages/PasskeyRegistration";
import Login from "./pages/Login";
import Account from "./pages/Account";

// Admin imports
import { AdminLayout } from "@/components/admin/AdminLayout";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminCVDownloads from "@/components/admin/AdminCVDownloads";
import AdminPayments from "@/components/admin/AdminPayments";
import { AdminCoursesManager } from "@/components/admin/AdminCoursesManager";
import { AdminBlogManager } from "@/components/admin/AdminBlogManager";
import { AdminEncryptedDrive } from "@/components/admin/AdminEncryptedDrive";
import AdminContactRequests from "@/components/admin/AdminContactRequests";

const queryClient = new QueryClient();

// Admin module imports
import AdminProductsManager from "@/components/admin/AdminProductsManager";
import AdminLLMAtlasManager from "@/components/admin/AdminLLMAtlasManager";
import { AdminWorkflows } from "@/components/admin/AdminWorkflows";
import { AdminSocialHub } from "@/components/admin/AdminSocialHub";
import { AdminScheduledJobs } from "@/components/admin/AdminScheduledJobs";
import AdminAnalytics from "@/components/admin/AdminAnalytics";
import AdminSettings from "@/components/admin/AdminSettings";
import { AdminSecurity } from "@/components/admin/AdminSecurity";
import AdminLifeMap from "@/components/admin/AdminLifeMap";
import AdminIntegrations from "@/components/admin/AdminIntegrations";
import AdminNimbusDesk from "@/components/admin/AdminNimbusDesk";
import AdminAuditLogs from "@/components/admin/AdminAuditLogs";
import AdminIPManagement from "@/components/admin/AdminIPManagement";
import AdminOpsDocs from "@/components/admin/AdminOpsDocs";

// Analytics wrapper component
const AnalyticsWrapper = ({ children }: { children: React.ReactNode }) => {
  useAnalytics();
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="abhishekpanda-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AnalyticsWrapper>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/academy" element={<Academy />} />
            <Route path="/courses/:courseId" element={<CourseDetail />} />
            <Route path="/products" element={<Products />} />
            <Route path="/mentorship" element={<Mentorship />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/llm-galaxy" element={<LLMGalaxy />} />
            <Route path="/llm-galaxy/model/:modelId" element={<ModelDetail />} />
            <Route path="/blogs" element={<BlogAggregator />} />
            <Route path="/login" element={<Login />} />
            <Route path="/account" element={<Account />} />
            
            {/* Admin Install & Login */}
            <Route path="/install" element={<InstallPWA />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/register-passkey" element={<PasskeyRegistration />} />
            
            {/* Admin Routes - Protected */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="ip-management" element={<AdminIPManagement />} />
              <Route path="cv-downloads" element={<AdminCVDownloads />} />
              <Route path="contacts" element={<AdminContactRequests />} />
              <Route path="blog" element={<AdminBlogManager />} />
              <Route path="nimbus" element={<AdminNimbusDesk />} />
              <Route path="courses" element={<AdminCoursesManager />} />
              <Route path="products" element={<AdminProductsManager />} />
              <Route path="llm-atlas" element={<AdminLLMAtlasManager />} />
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
          </AnalyticsWrapper>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
