import { AppSidebar } from "@/components/app-sidebar";
import { Topbar } from "@/components/topbar";
import { ReactNode } from "react";

export default function PlatformLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen lg:flex">
      <AppSidebar />
      <div className="flex-1">
        <Topbar />
        <main className="space-y-6 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}

