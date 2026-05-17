import { AppSidebar } from "@/components/app-sidebar";
import { Topbar } from "@/components/topbar";
import { ReactNode } from "react";

export default function PlatformLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen overflow-x-hidden lg:flex">
      <AppSidebar />

      <div className="ml-[62px] flex min-h-screen w-[calc(100vw-62px)] flex-col overflow-x-hidden lg:ml-0 lg:w-auto lg:flex-1">
        <Topbar />

        <main className="min-w-0 flex-1 space-y-4 overflow-x-hidden p-3 lg:space-y-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
