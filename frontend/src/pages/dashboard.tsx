import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { StatusBadge } from '@/components/task/task-badges'
import { currentUser, mockProjects, mockTasks } from '@/data/mock'

export function DashboardPage() {
  const myTasks = mockTasks.filter((task) => task.assignee?.id === currentUser.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">早上好，{currentUser.name}</h1>
        <p className="text-sm text-muted-foreground">今日待办 5 项 · 逾期 1 项</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="border-border shadow-sm xl:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">我的待办</CardTitle>
            <Link to="/my-tasks" className="text-sm text-primary">
              查看全部
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {myTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 rounded-lg border border-border p-3"
              >
                <Checkbox />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{task.title}</div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{task.projectName}</span>
                    <span>·</span>
                    <span>{task.dueDate}</span>
                  </div>
                </div>
                <StatusBadge status={task.status} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">任务状态分布</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-semibold">124</div>
              <div className="text-sm text-muted-foreground">总任务</div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>已完成</span><span>50%</span></div>
              <div className="flex justify-between"><span>进行中</span><span>15%</span></div>
              <div className="flex justify-between"><span>待处理</span><span>35%</span></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">项目概览</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {mockProjects.map((project) => {
            const total = project.todoCount + project.inProgressCount + project.doneCount
            const progress = Math.round((project.doneCount / total) * 100)

            return (
              <Link
                key={project.id}
                to={`/projects/${project.id}/board`}
                className="rounded-lg border border-border p-4 transition-colors hover:border-primary/40"
              >
                <div className="font-medium">{project.name}</div>
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                    <span>完成率</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} />
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
  )
}
