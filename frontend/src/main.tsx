import { ClerkProvider } from '@clerk/clerk-react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TaskProvider } from '@/contexts/task-context'
import { Toaster } from '@/components/ui/sonner'
import App from './App'
import './index.css'

const queryClient = new QueryClient()
const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!publishableKey) {
  console.warn('缺少 VITE_CLERK_PUBLISHABLE_KEY，请在 frontend/.env 中配置')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider
      publishableKey={publishableKey ?? ''}
      signInUrl="/login"
      signUpUrl="/register"
      afterSignOutUrl="/login"
    >
      <QueryClientProvider client={queryClient}>
        <TaskProvider>
          <App />
          <Toaster position="top-center" richColors />
        </TaskProvider>
      </QueryClientProvider>
    </ClerkProvider>
  </StrictMode>,
)
