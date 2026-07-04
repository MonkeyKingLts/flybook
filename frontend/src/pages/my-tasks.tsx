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
import { currentUser } from '@/data/mock'

export function MyTasksPage() {
  const { tasks, openTask } = useTasks()
  const myTasks = tasks.filter((task) => task.assignee?.id === currentUser.id)

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
                  <TableCell className={task.dueDate === '昨天' ? 'text-destructive' : ''}>
                    {task.dueDate}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <TaskDetailSheet />
    </>
  )
}
