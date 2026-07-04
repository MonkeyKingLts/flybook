import { NavLink, Outlet, useParams } from 'react-router-dom'
import { Plus, Star } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { CreateTaskDialog } from '@/components/task/create-task-dialog'
import { TaskDetailSheet } from '@/components/task/task-detail-sheet'
import { useTasks } from '@/contexts/task-context'
import { mockProjects } from '@/data/mock'
import { cn } from '@/lib/utils'

const projectTabs = [
  { label: '看板', suffix: 'board' },
  { label: '列表', suffix: 'list' },
  { label: '统计', suffix: 'stats' },
  { label: '设置', suffix: 'settings' },
]

export function ProjectLayout() {
  const { projectId = '1' } = useParams()
  const { openCreateDialog } = useTasks()
  const project = mockProjects.find((item) => item.id === projectId) ?? mockProjects[0]

  return (
    <>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-[#F3EBFF] text-sm font-semibold text-primary">
              {project.key}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold">
                  {project.name} {project.key}
                </h1>
                <Star className="size-4 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Project ID: PROJ-882 · Updated 10 mins ago
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {project.members.map((member) => (
                <Avatar key={member.id} className="size-8 border-2 border-card">
                  <AvatarFallback className="bg-primary/10 text-xs text-primary">
                    {member.name.slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            <Button variant="outline">邀请成员</Button>
            <Button onClick={() => openCreateDialog('todo')}>
              <Plus className="size-4" />
              新建任务
            </Button>
          </div>
        </div>

        <div className="flex gap-1 border-b border-border">
          {projectTabs.map((tab) => (
            <NavLink
              key={tab.suffix}
              to={`/projects/${project.id}/${tab.suffix}`}
              className={({ isActive }) =>
                cn(
                  'border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                )
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </div>

        <Outlet />
      </div>

      <TaskDetailSheet />
      <CreateTaskDialog projectId={project.id} projectName={project.name} />
    </>
  )
}
