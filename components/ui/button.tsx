import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-semibold shadow-lg shadow-cyan-500/20",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md",
        outline: "border border-slate-700 bg-slate-900/50 hover:bg-slate-800 hover:text-cyan-300 text-slate-200",
        secondary: "bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700/50",
        ghost: "hover:bg-slate-800/60 hover:text-cyan-300 text-slate-300",
        link: "text-cyan-400 underline-offset-4 hover:underline",
        gradient: "bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-slate-950 font-bold hover:brightness-110 shadow-lg shadow-cyan-500/25",
        emerald: "bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-semibold shadow-lg shadow-emerald-500/20",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
