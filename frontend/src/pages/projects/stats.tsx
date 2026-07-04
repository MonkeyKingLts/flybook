import { useParams } from 'react-router-dom'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useProjectStats } from '@/hooks/use-projects'
import { PRIORITY_LABELS, STATUS_LABELS } from '@/lib/constants'
import type { TaskPriority, TaskStatus } from '@/types'

const STATUS_COLORS: Record<string, string> = {
  TODO: '#8F959E',
  IN_PROGRESS: '#3370FF',
  IN_REVIEW: '#7F3BF5',
  DONE: '#34C724',
  BLOCKED: '#F54A45',
}

const PRIORITY_COLORS: Record<string, string> = {
  HIGH: '#F54A45',
  MEDIUM: '#FF8800',
  LOW: '#8F959E',
}

const STATUS_API_MAP: Record<string, TaskStatus> = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  IN_REVIEW: 'in_review',
  DONE: 'done',
  BLOCKED: 'blocked',
}

export function ProjectStatsPage() {
  const { projectId } = useParams()
  const { data: stats, isLoading } = useProjectStats(projectId)

  if (isLoading || !stats) {
    return <div className="text-sm text-muted-foreground">加载统计数据...</div>
  }

  const statusData = stats.statusGroups.map((group) => ({
    name: STATUS_LABELS[STATUS_API_MAP[group.status] ?? 'todo'] ?? group.status,
    value: group._count._all,
    fill: STATUS_COLORS[group.status] ?? '#8F959E',
  }))

  const priorityData = stats.priorityGroups.map((group) => ({
    name: PRIORITY_LABELS[group.priority.toLowerCase() as TaskPriority] ?? group.priority,
    value: group._count._all,
    fill: PRIORITY_COLORS[group.priority] ?? '#8F959E',
  }))

  const metrics = [
    { label: '总任务', value: String(stats.total) },
    {
      label: '已完成',
      value: String(stats.done),
      extra: `${stats.completionRate}%`,
      progress: stats.completionRate,
    },
    { label: '逾期任务', value: String(stats.overdue), danger: stats.overdue > 0 },
    {
      label: '进行中',
      value: String(
        stats.statusGroups.find((g) => g.status === 'IN_PROGRESS')?._count._all ?? 0,
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label} className="border-border shadow-sm">
            <CardContent className="p-5">
              <div className="text-sm text-muted-foreground">{metric.label}</div>
              <div
                className={`mt-2 text-3xl font-semibold ${
                  metric.danger ? 'text-destructive' : ''
                }`}
              >
                {metric.value}
                {metric.extra ? (
                  <span className="ml-2 text-sm font-normal text-[#34C724]">{metric.extra}</span>
                ) : null}
              </div>
              {metric.progress !== undefined ? (
                <Progress value={metric.progress} className="mt-3" />
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">任务状态分布</CardTitle>
          </CardHeader>
          <CardContent className="h-56">
            {statusData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                暂无任务数据
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
                    {statusData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">优先级分布</CardTitle>
          </CardHeader>
          <CardContent className="h-56">
            {priorityData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                暂无任务数据
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={priorityData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
                    {priorityData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {stats.assigneeWorkload.length > 0 ? (
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">成员工作量</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.assigneeWorkload.map((item) => (
              <div key={item.name} className="flex items-center gap-3">
                <span className="w-24 truncate text-sm">{item.name}</span>
                <Progress
                  value={stats.total ? Math.round((item.count / stats.total) * 100) : 0}
                  className="h-2 flex-1"
                />
                <span className="w-8 text-right text-sm text-muted-foreground">{item.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
