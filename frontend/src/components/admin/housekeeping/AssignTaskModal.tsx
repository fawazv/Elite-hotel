import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { type CreateTaskData } from '@/services/housekeepingApi'

interface AssignTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onAssign: (data: CreateTaskData) => Promise<void>
}

const AssignTaskModal = ({ isOpen, onClose, onAssign }: AssignTaskModalProps) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CreateTaskData>({
    roomId: '',
    taskType: 'cleaning',
    priority: 'normal',
    assignedTo: '',
    notes: '',
    estimatedDuration: 30,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onAssign(formData)
      onClose()
      setFormData({
        roomId: '',
        taskType: 'cleaning',
        priority: 'normal',
        assignedTo: '',
        notes: '',
        estimatedDuration: 30,
      })
    } catch (error) {
      console.error('Failed to assign task:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="roomId">Room ID</Label>
              <Input
                id="roomId"
                required
                value={formData.roomId}
                onChange={(e) =>
                  setFormData({ ...formData, roomId: e.target.value })
                }
                placeholder="e.g. 101"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) =>
                  setFormData({ ...formData, priority: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="taskType">Task Type</Label>
              <Select
                value={formData.taskType}
                onValueChange={(value) =>
                  setFormData({ ...formData, taskType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cleaning">Cleaning</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="inspection">Inspection</SelectItem>
                  <SelectItem value="turndown">Turndown</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Est. Duration (min)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.estimatedDuration}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    estimatedDuration: parseInt(e.target.value),
                  })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignedTo">Assign To (Staff ID)</Label>
            <Input
              id="assignedTo"
              value={formData.assignedTo}
              onChange={(e) =>
                setFormData({ ...formData, assignedTo: e.target.value })
              }
              placeholder="Optional"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Special instructions..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Assigning...' : 'Assign Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AssignTaskModal
