import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { useTasks } from '@/contexts/task-context'
import { STATUS_LABELS } from '@/lib/constants'
import type { TaskStatus } from '@/types'

const CHART_COLORS: Record<TaskStatus, string> = {
  todo: '#8F959E',
  in_progress: '#3370FF',
  in_review: '#7F3BF5',
  done: '#34C724',
  blocked: '#F54A45',
}

interface TaskStatusChartProps {
  statusCounts?: Record<string, number>
}

export function TaskStatusChart({ statusCounts: externalCounts }: TaskStatusChartProps) {
  const { getStatusCounts } = useTasks()
  const counts = externalCounts
    ? ({
        todo: externalCounts.todo ?? 0,
        in_progress: externalCounts.in_progress ?? 0,
        in_review: externalCounts.in_review ?? 0,
        done: externalCounts.done ?? 0,
        blocked: externalCounts.blocked ?? 0,
      } satisfies Record<TaskStatus, number>)
    : getStatusCounts()

  const data = (['todo', 'in_progress', 'in_review', 'done'] as TaskStatus[])
    .map((status) => ({
      name: STATUS_LABELS[status],
      value: counts[status],
      status,
    }))
    .filter((item) => item.value > 0)

  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={58}
            outerRadius={82}
            paddingAngle={2}
          >
            {data.map((entry) => (
              <Cell key={entry.status} fill={CHART_COLORS[entry.status]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: '1px solid #E5E6EB',
              fontSize: 12,
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="pointer-events-none -mt-[132px] flex flex-col items-center justify-center text-center">
        <div className="text-2xl font-semibold">{total}</div>
        <div className="text-xs text-muted-foreground">总任务</div>
      </div>

      <div className="mt-3 space-y-2">
        {data.map((item) => (
          <div key={item.status} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: CHART_COLORS[item.status] }}
              />
              {item.name}
            </div>
            <span className="text-muted-foreground">
              {total ? Math.round((item.value / total) * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
