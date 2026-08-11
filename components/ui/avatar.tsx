import * as React from "react"
import { cn } from "@/lib/utils"

export function Avatar({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full border border-slate-700 bg-slate-800 text-slate-200", className)}>
      {children}
    </div>
  )
}

export function AvatarImage({ src, alt }: { src?: string; alt?: string }) {
  if (!src) return null;
  return <img src={src} alt={alt || "Avatar"} className="aspect-square h-full w-full object-cover" />;
}

export function AvatarFallback({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex h-full w-full items-center justify-center rounded-full bg-cyan-950/80 font-semibold text-cyan-300 text-sm", className)}>
      {children}
    </div>
  )
}
