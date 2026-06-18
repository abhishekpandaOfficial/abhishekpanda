import { Outlet, useLocation } from "react-router-dom";
import { SidebarNav } from "@/components/openowl/admin/SidebarNav";
import { Topbar } from "@/components/openowl/admin/Topbar";

const titleByPath: Record<string, string> = {
  "/openowl/admin": "OpenOwl Admin Center · Overview",
  "/openowl/admin/studio": "OpenOwl Admin Center · Studio",
  "/openowl/admin/publish": "OpenOwl Admin Center · Publish",
  "/openowl/admin/delivery": "OpenOwl Admin Center · Delivery Status",
  "/openowl/admin/runs": "OpenOwl Admin Center · Runs & Traces",
  "/openowl/admin/settings": "OpenOwl Admin Center · Settings",
};

export default function OpenOwlAdminLayout() {
  const { pathname } = useLocation();
  const title = titleByPath[pathname] || "OpenOwl Admin Center";

  return (
    <div className="min-h-screen bg-background md:flex">
      <SidebarNav />
      <div className="min-w-0 flex-1">
        <Topbar title={title} />
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
