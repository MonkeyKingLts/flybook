import { Navigate } from 'react-router-dom'
import { SignUp, useAuth } from '@clerk/clerk-react'
import { clerkAppearance } from '@/lib/clerk-appearance'

export function RegisterPage() {
  const { isSignedIn } = useAuth()

  if (isSignedIn) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-center bg-card px-16 lg:flex">
        <h1 className="text-4xl font-bold">协作，从任务开始</h1>
        <p className="mt-4 max-w-md text-muted-foreground">
          连接您的团队、任务和工具，在一个纯粹、高效的工作空间中实现目标。
        </p>
      </div>

      <div className="flex items-center justify-center bg-background p-6">
        <SignUp
          routing="path"
          path="/register"
          signInUrl="/login"
          appearance={clerkAppearance}
        />
      </div>
    </div>
  )
}
