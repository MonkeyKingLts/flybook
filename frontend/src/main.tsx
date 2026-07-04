import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TaskProvider } from '@/contexts/task-context'
import { Toaster } from '@/components/ui/sonner'
import App from './App'
import './index.css'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <TaskProvider>
        <App />
        <Toaster position="top-center" richColors />
      </TaskProvider>
    </QueryClientProvider>
  </StrictMode>,
)
