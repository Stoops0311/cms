import React, { useState } from 'react';
    import { Input } from '@/components/ui/input.jsx';
    import { Label } from '@/components/ui/label.jsx';
    import { Textarea } from '@/components/ui/textarea.jsx';
    import { DatePicker } from '@/components/ui/date-picker.jsx';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { useToast } from '@/components/ui/use-toast.jsx';

    const taskStatuses = ["Pending", "In Progress", "Completed", "Blocked", "On Hold"];
    const taskPriorities = ["Low", "Medium", "High", "Urgent"];

    const TaskForm = ({ onSubmit, initialData = {}, onCancel, projectList = [], personnelList = [] }) => {
      const [taskName, setTaskName] = useState(initialData.taskName || '');
      const [projectId, setProjectId] = useState(initialData.projectId || '');
      const [assigneeId, setAssigneeId] = useState(initialData.assigneeId || '');
      const [description, setDescription] = useState(initialData.description || '');
      const [startDate, setStartDate] = useState(initialData.startDate ? new Date(initialData.startDate) : null);
      const [dueDate, setDueDate] = useState(initialData.dueDate ? new Date(initialData.dueDate) : null);
      const [status, setStatus] = useState(initialData.status || taskStatuses[0]);
      const [priority, setPriority] = useState(initialData.priority || taskPriorities[1]);
      const { toast } = useToast();

      const handleSubmit = (e) => {
        e.preventDefault();
        if (!taskName || !projectId || !dueDate) {
          toast({ variant: "destructive", title: "Missing Information", description: "Task name, project, and due date are required." });
          return;
        }
        if (startDate && dueDate && new Date(dueDate) < new Date(startDate)) {
          toast({ variant: "destructive", title: "Invalid Dates", description: "Due date cannot be before start date." });
          return;
        }
        onSubmit({
          id: initialData.id || `TASK-${Date.now().toString().slice(-5)}`,
          taskName, projectId, assigneeId, description, 
          startDate: startDate ? startDate.toISOString() : null,
          dueDate: dueDate.toISOString(),
          status, priority,
        });
      };

      return (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label htmlFor="taskName-taskform">Task Name</Label><Input id="taskName-taskform" value={taskName} onChange={e => setTaskName(e.target.value)} placeholder="e.g., Foundation Pouring" /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="projectId-taskform">Project</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger id="projectId-taskform"><SelectValue placeholder="Select Project" /></SelectTrigger>
                <SelectContent>{projectList.map(p => <SelectItem key={p.id} value={p.id}>{p.projectName} ({p.projectCode || p.id})</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="assigneeId-taskform">Assignee (Optional)</Label>
              <Select value={assigneeId} onValueChange={setAssigneeId}>
                <SelectTrigger id="assigneeId-taskform"><SelectValue placeholder="Select Assignee" /></SelectTrigger>
                <SelectContent>{personnelList.map(p => <SelectItem key={p.id} value={p.id}>{p.name} ({p.staffId || p.id})</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div><Label htmlFor="description-taskform">Description</Label><Textarea id="description-taskform" value={description} onChange={e => setDescription(e.target.value)} placeholder="Task details..." /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label htmlFor="startDate-taskform">Start Date (Optional)</Label><DatePicker id="startDate-taskform" date={startDate} setDate={setStartDate} /></div>
            <div><Label htmlFor="dueDate-taskform">Due Date</Label><DatePicker id="dueDate-taskform" date={dueDate} setDate={setDueDate} /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status-taskform">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status-taskform"><SelectValue placeholder="Select Status" /></SelectTrigger>
                <SelectContent>{taskStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="priority-taskform">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger id="priority-taskform"><SelectValue placeholder="Select Priority" /></SelectTrigger>
                <SelectContent>{taskPriorities.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
            <Button type="submit">{initialData.id ? 'Update Task' : 'Add Task'}</Button>
          </div>
        </form>
      );
    };
    export default TaskForm;