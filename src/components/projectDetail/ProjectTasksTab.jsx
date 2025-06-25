import React, { useState } from 'react';
    import { motion } from 'framer-motion';
    import { CardTitle } from '@/components/ui/card.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { Input } from '@/components/ui/input.jsx';
    import { Textarea } from '@/components/ui/textarea.jsx';
    import { DatePicker } from '@/components/ui/date-picker.jsx';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
    import { PlusCircle, Edit2, Trash2, CheckSquare, AlertTriangle } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast.jsx';
    import { format } from 'date-fns';

    const TaskForm = ({ onSubmit, initialData = {}, onCancel }) => {
      const [taskName, setTaskName] = useState(initialData.name || '');
      const [description, setDescription] = useState(initialData.description || '');
      const [assignee, setAssignee] = useState(initialData.assignee || '');
      const [dueDate, setDueDate] = useState(initialData.dueDate ? new Date(initialData.dueDate) : null);
      const [status, setStatus] = useState(initialData.status || 'Pending');
      const { toast } = useToast();

      const handleSubmit = (e) => {
        e.preventDefault();
        if (!taskName) {
          toast({ variant: "destructive", title: "Task name is required." });
          return;
        }
        onSubmit({ id: initialData.id || `TASK-${Date.now()}`, name: taskName, description, assignee, dueDate: dueDate ? dueDate.toISOString() : null, status });
        if (!initialData.id) { // Reset only for new tasks
          setTaskName(''); setDescription(''); setAssignee(''); setDueDate(null); setStatus('Pending');
        }
      };

      return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-slate-50 mb-6">
          <Input placeholder="Task Name*" value={taskName} onChange={(e) => setTaskName(e.target.value)} />
          <Textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <Input placeholder="Assignee" value={assignee} onChange={(e) => setAssignee(e.target.value)} />
          <DatePicker date={dueDate} setDate={setDueDate} placeholder="Due Date" />
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Blocked">Blocked</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex justify-end space-x-2">
            {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
            <Button type="submit">{initialData.id ? 'Update Task' : 'Add Task'}</Button>
          </div>
        </form>
      );
    };

    const ProjectTasksTab = ({ project, updateProjectData }) => {
      const [showForm, setShowForm] = useState(false);
      const [editingTask, setEditingTask] = useState(null);
      const { toast } = useToast();

      const tasks = project.tasks || [];

      const handleAddTask = (taskData) => {
        const newTasks = [...tasks, taskData];
        updateProjectData({ tasks: newTasks });
        toast({ title: "Task Added", description: `${taskData.name} has been added.` });
        setShowForm(false);
      };

      const handleUpdateTask = (taskData) => {
        const updatedTasks = tasks.map(t => t.id === taskData.id ? taskData : t);
        updateProjectData({ tasks: updatedTasks });
        toast({ title: "Task Updated", description: `${taskData.name} has been updated.` });
        setEditingTask(null);
      };

      const handleDeleteTask = (taskId) => {
        if (window.confirm("Are you sure you want to delete this task?")) {
          const updatedTasks = tasks.filter(t => t.id !== taskId);
          updateProjectData({ tasks: updatedTasks });
          toast({ title: "Task Deleted", variant: "destructive" });
        }
      };
      
      const getStatusBadge = (status) => {
        let colorClass = "bg-gray-100 text-gray-700";
        if (status === "Completed") colorClass = "bg-green-100 text-green-700";
        else if (status === "In Progress") colorClass = "bg-blue-100 text-blue-700";
        else if (status === "Pending") colorClass = "bg-yellow-100 text-yellow-700";
        else if (status === "Blocked") colorClass = "bg-red-100 text-red-700";
        return <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${colorClass}`}>{status}</span>;
      };

      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <div className="flex justify-between items-center mb-6">
            <CardTitle className="text-xl font-semibold text-gray-700">Tasks & Schedule</CardTitle>
            <Button onClick={() => { setShowForm(!showForm); setEditingTask(null); }} variant={showForm ? "outline" : "default"}>
              <PlusCircle className="mr-2 h-4 w-4" /> {showForm ? "Cancel" : "Add New Task"}
            </Button>
          </div>

          {showForm && !editingTask && <TaskForm onSubmit={handleAddTask} onCancel={() => setShowForm(false)} />}
          {editingTask && <TaskForm onSubmit={handleUpdateTask} initialData={editingTask} onCancel={() => setEditingTask(null)} />}

          {tasks.length === 0 && !showForm ? (
            <p className="text-muted-foreground text-center py-8">No tasks added yet. Click "Add New Task" to get started.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task Name</TableHead>
                    <TableHead>Assignee</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map(task => (
                    <TableRow key={task.id} className={new Date(task.dueDate) < new Date() && task.status !== 'Completed' ? 'bg-red-500/10' : ''}>
                      <TableCell className="font-medium">{task.name}</TableCell>
                      <TableCell>{task.assignee || 'N/A'}</TableCell>
                      <TableCell>
                        {task.dueDate ? format(new Date(task.dueDate), 'PPP') : 'N/A'}
                        {new Date(task.dueDate) < new Date() && task.status !== 'Completed' && 
                          <AlertTriangle className="inline ml-2 h-4 w-4 text-red-500" title="Overdue"/>}
                      </TableCell>
                      <TableCell>{getStatusBadge(task.status)}</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => { setEditingTask(task); setShowForm(false); }} title="Edit Task">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteTask(task.id)} title="Delete Task">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </motion.div>
      );
    };

    export default ProjectTasksTab;