import React, { useState, useMemo } from 'react';
    import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { Input } from '@/components/ui/input.jsx';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
    import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog.jsx';
    import { CalendarCheck, PlusCircle, Edit2, Trash2, Search, Filter, AlertTriangle } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast.jsx';
    import useLocalStorage from '@/hooks/useLocalStorage.jsx';
    import { motion } from 'framer-motion';
    import { format } from 'date-fns';
    import TaskForm from '@/components/schedules/TaskForm.jsx';
    import TaskStatusBadge from '@/components/schedules/TaskStatusBadge.jsx';

    const taskStatuses = ["Pending", "In Progress", "Completed", "Blocked", "On Hold"];

    const Schedules = () => {
      const [tasks, setTasks] = useLocalStorage('cmsTasks', []);
      const [projects] = useLocalStorage('projects', []); 
      const [personnel] = useLocalStorage('staff', []); 
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [editingTask, setEditingTask] = useState(null);
      const [searchTerm, setSearchTerm] = useState('');
      const [filterProject, setFilterProject] = useState('All Projects');
      const [filterStatus, setFilterStatus] = useState('All Statuses');
      const { toast } = useToast();

      const handleSaveTask = (data) => {
        if (editingTask) {
          setTasks(prev => prev.map(t => t.id === data.id ? data : t));
          toast({ title: "Task Updated" });
        } else {
          setTasks(prev => [data, ...prev].sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate)));
          toast({ title: "Task Added" });
        }
        setIsModalOpen(false);
        setEditingTask(null);
      };

      const handleDeleteTask = (id) => {
        if (window.confirm("Delete this task?")) {
          setTasks(prev => prev.filter(t => t.id !== id));
          toast({ title: "Task Deleted", variant: "destructive" });
        }
      };

      const openEditModal = (task) => {
        setEditingTask(task);
        setIsModalOpen(true);
      };

      const filteredTasks = useMemo(() => {
        return tasks.filter(t => 
          (t.taskName.toLowerCase().includes(searchTerm.toLowerCase())) &&
          (filterProject === 'All Projects' || t.projectId === filterProject) &&
          (filterStatus === 'All Statuses' || t.status === filterStatus)
        ).sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate));
      }, [tasks, searchTerm, filterProject, filterStatus]);

      return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-8 p-4 md:p-6 lg:p-8">
          <Card className="shadow-xl border-t-4 border-purple-600">
            <CardHeader className="bg-gradient-to-r from-purple-600/10 to-indigo-600/10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <CardTitle className="text-2xl font-bold text-purple-700 flex items-center"><CalendarCheck className="mr-3 h-7 w-7" />Schedules & Tasks</CardTitle>
                  <CardDescription>Manage project timelines, tasks, and assignments.</CardDescription>
                </div>
                <Button onClick={() => { setEditingTask(null); setIsModalOpen(true); }} className="mt-4 md:mt-0 bg-purple-600 hover:bg-purple-700">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add New Task
                </Button>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input placeholder="Search by task name..." className="pl-10 w-full" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <Select value={filterProject} onValueChange={setFilterProject}>
                  <SelectTrigger><div className="flex items-center"><Filter className="mr-2 h-4 w-4 text-muted-foreground" /> <SelectValue placeholder="Filter by Project" /></div></SelectTrigger>
                  <SelectContent>{['All Projects', ...projects.map(p=>({value: p.id, label: `${p.projectName} (${p.projectCode || p.id})`}))].map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label || opt.value}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger><div className="flex items-center"><Filter className="mr-2 h-4 w-4 text-muted-foreground" /> <SelectValue placeholder="Filter by Status" /></div></SelectTrigger>
                  <SelectContent>{['All Statuses', ...taskStatuses].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task Name</TableHead><TableHead>Project</TableHead><TableHead>Assignee</TableHead>
                      <TableHead>Due Date</TableHead><TableHead>Priority</TableHead><TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTasks.length === 0 && (
                        <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No tasks found.</TableCell></TableRow>
                    )}
                    {filteredTasks.map(task => {
                      const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'Completed';
                      return (
                        <TableRow key={task.id} className={`hover:bg-muted/50 ${isOverdue ? 'bg-red-500/10' : ''}`}>
                          <TableCell className="font-medium">{task.taskName}</TableCell>
                          <TableCell>{projects.find(p=>p.id === task.projectId)?.projectName || 'N/A'}</TableCell>
                          <TableCell>{personnel.find(p=>p.id === task.assigneeId)?.name || 'Unassigned'}</TableCell>
                          <TableCell className={isOverdue ? 'font-bold text-red-600' : ''}>
                            {format(new Date(task.dueDate), 'dd MMM yyyy')}
                            {isOverdue && <AlertTriangle className="inline ml-1 h-4 w-4"/>}
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${
                                task.priority === "Urgent" ? "bg-red-500 text-white" :
                                task.priority === "High" ? "bg-orange-400 text-white" :
                                task.priority === "Medium" ? "bg-yellow-400 text-gray-800" : "bg-blue-400 text-white"
                            }`}>{task.priority}</span>
                          </TableCell>
                          <TableCell><TaskStatusBadge status={task.status} /></TableCell>
                          <TableCell className="text-right space-x-1">
                            <Button variant="ghost" size="icon" onClick={() => openEditModal(task)} title="Edit"><Edit2 className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteTask(task.id)} title="Delete"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Dialog open={isModalOpen} onOpenChange={(open) => { if(!open) { setEditingTask(null); } setIsModalOpen(open); }}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
              </DialogHeader>
              <TaskForm 
                onSubmit={handleSaveTask} 
                initialData={editingTask || {}} 
                onCancel={() => { setIsModalOpen(false); setEditingTask(null); }} 
                projectList={projects}
                personnelList={personnel}
              />
            </DialogContent>
          </Dialog>
        </motion.div>
      );
    };

    export default Schedules;