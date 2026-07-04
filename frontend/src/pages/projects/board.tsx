import { useParams } from 'react-router-dom'
import { KanbanBoard } from '@/components/task/kanban-board'

export function ProjectBoardPage() {
  const { projectId = '1' } = useParams()

  return <KanbanBoard projectId={projectId} />
}
