import { Link } from 'react-router-dom'
import { useOrganization } from '@clerk/clerk-react'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, FolderKanban } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { TaskStatusChart } from '@/components/dashboard/task-status-chart'
import { StatusBadge } from '@/components/task/task-badges'
import { TaskDetailSheet } from '@/components/task/task-detail-sheet'
import { useSession } from '@/contexts/session-context'
import { useTasks } from '@/contexts/task-context'
import { useApiClient } from '@/hooks/use-api-client'

interface DashboardStats {
  total: number
  myOpenTasks: number
  projectCount: number
  statusCounts: Record<string, number>
  projects: Array<{
    id: string
    name: string
    key: string
    todoCount: number
    inProgressCount: number
    doneCount: number
  }>
}

export function DashboardPage() {
  const { me } = useSession()
  const { organization } = useOrganization()
  const { request } = useApiClient()
  const { openTask } = useTasks()

  const { data: myTasks = [] } = useQuery({
    queryKey: ['my-tasks', organization?.id],
    queryFn: () => request<Array<import('@/types').Task>>('/api/v1/tasks/my'),
    enabled: Boolean(organization?.id),
  })

  const { data: dashboard } = useQuery({
    queryKey: ['dashboard', organization?.id],
    queryFn: () => request<DashboardStats>('/api/v1/tasks/dashboard'),
    enabled: Boolean(organization?.id),
  })

  const openTasks = myTasks.filter((task) => task.status !== 'done')
  const userName = me?.user.name ?? '用户'

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold">早上好，{userName}</h1>
          <p className="text-sm text-muted-foreground">
            今日待办 {openTasks.length} 项 · 进行中 {dashboard?.myOpenTasks ?? 0} 项
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <Card className="border-border shadow-sm xl:col-span-2">
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-base">我的待办</CardTitle>
              <Link to="/my-tasks" className="text-sm text-primary hover:underline">
                查看全部
              </Link>
            </CardHeader>
            <CardContent className="space-y-2">
              {openTasks.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  暂无待办任务
                </div>
              ) : (
                openTasks.slice(0, 5).map((task) => (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => openTask(task.id)}
                    className="flex w-full items-center gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:border-primary/40 hover:bg-muted/30"
                  >
                    <Checkbox />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{task.title}</div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{task.projectName}</span>
                        {task.dueDate ? (
                          <>
                            <span>·</span>
                            <span>{task.dueDate}</span>
                          </>
                        ) : null}
                      </div>
                    </div>
                    <StatusBadge status={task.status} />
                  </button>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">任务状态分布</CardTitle>
            </CardHeader>
            <CardContent>
              <TaskStatusChart statusCounts={dashboard?.statusCounts} />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-border shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex size-12 items-center justify-center rounded-full bg-[#E8F0FF]">
                <CheckCircle2 className="size-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-semibold">
                  {dashboard?.statusCounts?.done ?? 0}
                </div>
                <div className="text-sm text-muted-foreground">已完成任务</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex size-12 items-center justify-center rounded-full bg-[#FFF3E0]">
                <FolderKanban className="size-6 text-[#FF8800]" />
              </div>
              <div>
                <div className="text-2xl font-semibold">{dashboard?.projectCount ?? 0}</div>
                <div className="text-sm text-muted-foreground">累计参与项目</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">项目概览</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            {(dashboard?.projects ?? []).map((project) => {
              const total = project.todoCount + project.inProgressCount + project.doneCount
              const progress = total ? Math.round((project.doneCount / total) * 100) : 0

              return (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}/board`}
                  className="rounded-lg border border-border p-4 transition-colors hover:border-primary/40 hover:bg-muted/20"
                >
                  <div className="font-medium">{project.name}</div>
                  <div className="mt-3">
                    <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                      <span>完成率</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    任务: {project.doneCount}/{total}
                  </div>
                </Link>
              )
            })}
          </CardContent>
        </Card>
      </div>

      <TaskDetailSheet />
    </>
  )
}
