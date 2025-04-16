"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const { login, isAuthenticated, loginError, setLoginError } = useAuth()
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const router = useRouter()

  // If already authenticated, redirect to main app
  if (isAuthenticated) {
    router.push("/")
    return null
  }

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true)
    setLoginError(null)

    try {
      // Mock Google OAuth login
      await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate network delay

      // Simulate successful login 80% of the time
      if (Math.random() > 0.2) {
        const mockUser = {
          id: "123456789",
          name: "Demo User",
          email: "demo@example.com",
          picture: "https://ui-avatars.com/api/?name=Demo+User&background=random",
        }
        login(mockUser)
        router.push("/")
      } else {
        // Simulate login failure
        setLoginError("Authentication failed. Please try again.")
      }
    } catch (error) {
      setLoginError("An unexpected error occurred. Please try again.")
      console.error("Login error:", error)
    } finally {
      setIsLoggingIn(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Todo Board</CardTitle>
          <CardDescription>Sign in to access your tasks</CardDescription>
        </CardHeader>
        <CardContent>
          {loginError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{loginError}</AlertDescription>
            </Alert>
          )}

          <Button
            className="w-full flex items-center justify-center gap-2"
            onClick={handleGoogleLogin}
            disabled={isLoggingIn}
          >
            {isLoggingIn ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
                <path d="M1 1h22v22H1z" fill="none" />
              </svg>
            )}
            {isLoggingIn ? "Signing in..." : "Sign in with Google"}
          </Button>
        </CardContent>
        <CardFooter className="text-center text-sm text-muted-foreground">
          <p className="w-full">This is a demo application with mock authentication</p>
        </CardFooter>
      </Card>
    </div>
  )
}
