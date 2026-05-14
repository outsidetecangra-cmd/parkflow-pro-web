import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type PanelProps = {
  children: ReactNode;
  className?: string;
};

export function Panel({ children, className }: PanelProps) {
  return <section className={cn("surface rounded-3xl p-5", className)}>{children}</section>;
}

