import { useOrganization } from '@clerk/clerk-react'
import { useQuery } from '@tanstack/react-query'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PriorityBadge, StatusBadge } from '@/components/task/task-badges'
import { TaskDetailSheet } from '@/components/task/task-detail-sheet'
import { useTasks } from '@/contexts/task-context'
import { useApiClient } from '@/hooks/use-api-client'
import type { Task } from '@/types'

export function MyTasksPage() {
  const { organization } = useOrganization()
  const { request } = useApiClient()
  const { openTask } = useTasks()

  const { data: myTasks = [], isLoading } = useQuery({
    queryKey: ['my-tasks', organization?.id],
    queryFn: () => request<Task[]>('/api/v1/tasks/my'),
    enabled: Boolean(organization?.id),
  })

  return (
    <>
      <div className="space-y-6">
        <h1 className="text-xl font-semibold">我的任务</h1>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">全部</TabsTrigger>
            <TabsTrigger value="todo">待办</TabsTrigger>
            <TabsTrigger value="in_progress">进行中</TabsTrigger>
            <TabsTrigger value="overdue">已逾期</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="overflow-hidden rounded-lg border border-border bg-card">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">加载中...</div>
          ) : myTasks.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">暂无任务</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>任务标题</TableHead>
                  <TableHead>项目</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>优先级</TableHead>
                  <TableHead>截止日期</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myTasks.map((task) => (
                  <TableRow
                    key={task.id}
                    className="cursor-pointer"
                    onClick={() => openTask(task.id)}
                  >
                    <TableCell className="font-medium">{task.title}</TableCell>
                    <TableCell>{task.projectName}</TableCell>
                    <TableCell>
                      <StatusBadge status={task.status} />
                    </TableCell>
                    <TableCell>
                      <PriorityBadge priority={task.priority} />
                    </TableCell>
                    <TableCell>{task.dueDate ?? '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      <TaskDetailSheet />
    </>
  )
}
