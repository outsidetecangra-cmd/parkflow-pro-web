import { AppSidebar } from "@/components/app-sidebar";
import { Topbar } from "@/components/topbar";
import { ReactNode } from "react";

export default function PlatformLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen lg:flex">
      <AppSidebar />

      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar />

        <main className="flex-1 space-y-6 p-4 lg:p-6">
          {children}
        </main>

        <footer className="border-t border-white/10 px-4 py-4 text-center text-xs text-slate-500 lg:px-6">
          <a
            href="#"
            className="transition hover:text-cyan-300"
            title="Dev. por WeBiFy Soluções"
          >
            Dev. por WeBiFy Soluções
          </a>
        </footer>
      </div>
    </div>
  );
}
