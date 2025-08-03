"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner} from "sonner"
import type { ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--sonner-toast-background": "var(--background)",
          "--sonner-toast-color": "var(--foreground)",
          "--sonner-toast-border-radius": "var(--radius)",
          "--sonner-toast-box-shadow": "var(--shadow)",
          "--sonner-toast-padding": "0.5rem 1rem",
          "--sonner-toast-font-size": "0.875rem",
          "--sonner-toast-line-height": "1.25rem",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
