export function startOfDay(date = new Date()) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function endOfDay(date = new Date()) {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

export function startOfWeek(date = new Date()) {
  const d = startOfDay(date)
  const day = d.getDay()
  const diff = day === 0 ? 6 : day - 1
  d.setDate(d.getDate() - diff)
  return d
}

export function daysAgo(days: number) {
  const d = startOfDay()
  d.setDate(d.getDate() - days)
  return d
}

export function isOverdue(dueDate: Date | null | undefined, status: string) {
  if (!dueDate || status === 'DONE') return false
  return dueDate < startOfDay()
}

export function isDueToday(dueDate: Date | null | undefined) {
  if (!dueDate) return false
  const today = startOfDay()
  const due = startOfDay(dueDate)
  return due.getTime() === today.getTime()
}

export function formatDueDateLabel(dueDate: Date | null | undefined, status: string) {
  if (!dueDate) return undefined

  if (isOverdue(dueDate, status)) {
    const yesterday = startOfDay()
    yesterday.setDate(yesterday.getDate() - 1)
    if (startOfDay(dueDate).getTime() === yesterday.getTime()) {
      return '昨天截止'
    }
    return '已逾期'
  }

  if (isDueToday(dueDate)) {
    const hours = dueDate.getHours()
    const minutes = dueDate.getMinutes()
    if (hours > 0 || minutes > 0) {
      return `今天 ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
    }
    return '今天'
  }

  const tomorrow = startOfDay()
  tomorrow.setDate(tomorrow.getDate() + 1)
  if (startOfDay(dueDate).getTime() === tomorrow.getTime()) {
    return '明天'
  }

  return `${dueDate.getMonth() + 1}月${dueDate.getDate()}日`
}

export function formatDisplayDate(date: Date) {
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

export function formatRelativeTime(date: Date) {
  const diff = Date.now() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}小时前`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}天前`
  return formatDisplayDate(date)
}

export function formatJoinedDate(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
