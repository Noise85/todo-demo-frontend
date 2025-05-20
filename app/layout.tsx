import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { ToastProvider, ToastViewport } from "@/components/ui/toast"
import { AuthProvider } from "@/contexts/auth-context"
import { ThemeContextProvider } from "@/contexts/theme-context"
import { NotificationProvider } from "@/contexts/notification-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Todo Board Application",
  description: "A Trello/Jira-style board for managing tasks",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Task manager - Welcome</title>
        <script src="/default-config.js"></script>
      </head>
      <body className={inter.className}>
        <ThemeContextProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <AuthProvider>
              <NotificationProvider>
                <ToastProvider>
                  <main className="min-h-screen bg-background">{children}</main>
                  <ToastViewport />
                </ToastProvider>
              </NotificationProvider>
            </AuthProvider>
          </ThemeProvider>
        </ThemeContextProvider>
      </body>
    </html>
  )
}
