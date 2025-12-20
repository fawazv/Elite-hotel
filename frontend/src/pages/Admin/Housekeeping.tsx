import { useState, useEffect } from 'react'
import { Plus, Search, Filter } from 'lucide-react'
import {
  housekeepingApi,
  type HousekeepingTask,
  type TaskFilters,
  type CreateTaskData,
} from '@/services/housekeepingApi'
import HousekeepingStats from '@/components/admin/housekeeping/HousekeepingStats'
import AssignTaskModal from '@/components/admin/housekeeping/AssignTaskModal'
import TaskDetailModal from '@/components/admin/housekeeping/TaskDetailModal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { format } from 'date-fns'

interface StatsData {
  total: number
  pending: number
  inProgress: number
  completed: number
  byPriority: Record<string, number>
  byType: Record<string, number>
}

const Housekeeping = () => {
  const [tasks, setTasks] = useState<HousekeepingTask[]>([])
  const [stats, setStats] = useState<StatsData>({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    byPriority: {},
    byType: {},
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Modals
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<HousekeepingTask | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [tasksRes, statsRes] = await Promise.all([
        housekeepingApi.getTasks({
          status: statusFilter !== 'all' ? statusFilter : undefined,
          priority: priorityFilter !== 'all' ? priorityFilter : undefined,
        }),
        housekeepingApi.getStats(),
      ])

      setTasks(tasksRes.tasks)
      setStats(statsRes)
    } catch (err) {
      console.error('Failed to fetch housekeeping data:', err)
      setError('Failed to load housekeeping data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [statusFilter, priorityFilter])

  const handleAssignTask = async (data: CreateTaskData) => {
    try {
      await housekeepingApi.assignTask(data)
      fetchData() // Refresh list
    } catch (err) {
      console.error('Failed to assign task:', err)
      throw err // Let modal handle error display if needed
    }
  }

  const handleViewTask = (task: HousekeepingTask) => {
    setSelectedTask(task)
    setIsDetailModalOpen(true)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50'
      case 'high': return 'text-orange-600 bg-orange-50'
      case 'normal': return 'text-blue-600 bg-blue-50'
      case 'low': return 'text-gray-600 bg-gray-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50'
      case 'in-progress': return 'text-blue-600 bg-blue-50'
      case 'cancelled': return 'text-red-600 bg-red-50'
      default: return 'text-yellow-600 bg-yellow-50'
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Housekeeping</h1>
          <p className="text-muted-foreground mt-1">
            Manage cleaning tasks and room status
          </p>
        </div>
        <Button onClick={() => setIsAssignModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </div>

      <HousekeepingStats stats={stats} />

      <div className="flex gap-4 items-center bg-card p-4 rounded-lg border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border bg-card">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm text-left">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Room</th>
                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Type</th>
                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Priority</th>
                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Status</th>
                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Assigned To</th>
                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Created</th>
                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {loading ? (
                <tr>
                  <td colSpan={7} className="h-24 text-center">
                    Loading...
                  </td>
                </tr>
              ) : !tasks || tasks?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="h-24 text-center text-muted-foreground">
                    No tasks found
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr
                    key={task._id}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted cursor-pointer"
                    onClick={() => handleViewTask(task)}
                  >
                    <td className="p-4 align-middle font-medium">{task.roomId}</td>
                    <td className="p-4 align-middle capitalize">{task.taskType}</td>
                    <td className="p-4 align-middle">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="p-4 align-middle">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="p-4 align-middle text-muted-foreground">
                      {task.assignedTo || 'Unassigned'}
                    </td>
                    <td className="p-4 align-middle text-muted-foreground">
                      {format(new Date(task.createdAt), 'MMM d, HH:mm')}
                    </td>
                    <td className="p-4 align-middle">
                      <Button variant="ghost" size="sm" onClick={(e) => {
                        e.stopPropagation()
                        handleViewTask(task)
                      }}>
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AssignTaskModal 
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onAssign={handleAssignTask}
      />

      {selectedTask && (
        <TaskDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false)
            setSelectedTask(null)
          }}
          task={selectedTask}
        />
      )}
    </div>
  )
}

export default Housekeeping
