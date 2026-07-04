import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { RequireAuth } from '@/components/auth/require-auth'
import { RequireOrg } from '@/components/auth/require-org'
import { AuthenticatedShell } from '@/components/layout/authenticated-shell'
import { LoginPage } from '@/pages/auth/login'
import { RegisterPage } from '@/pages/auth/register'
import { DashboardPage } from '@/pages/dashboard'
import { MyTasksPage } from '@/pages/my-tasks'
import { OrgSettingsPage } from '@/pages/org/settings'
import { ProjectsPage } from '@/pages/projects'
import { ProjectBoardPage } from '@/pages/projects/board'
import { ProjectLayout } from '@/pages/projects/project-layout'
import { ProjectListPage } from '@/pages/projects/list'
import { ProjectSettingsPage } from '@/pages/projects/settings'
import { ProjectStatsPage } from '@/pages/projects/stats'
import { SelectOrgPage } from '@/pages/select-org'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login/*" element={<LoginPage />} />
        <Route path="/register/*" element={<RegisterPage />} />

        <Route element={<RequireAuth />}>
          <Route path="/select-org" element={<SelectOrgPage />} />

          <Route element={<RequireOrg />}>
            <Route element={<AuthenticatedShell />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/my-tasks" element={<MyTasksPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/projects/:projectId" element={<ProjectLayout />}>
                <Route index element={<Navigate to="board" replace />} />
                <Route path="board" element={<ProjectBoardPage />} />
                <Route path="list" element={<ProjectListPage />} />
                <Route path="stats" element={<ProjectStatsPage />} />
                <Route path="settings" element={<ProjectSettingsPage />} />
              </Route>
              <Route path="/org/settings" element={<OrgSettingsPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
