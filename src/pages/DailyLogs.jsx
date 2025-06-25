import React, { useState, useMemo } from 'react';
    import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { Input } from '@/components/ui/input.jsx';
    import { DatePicker } from '@/components/ui/date-picker.jsx';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription as DDesc } from '@/components/ui/dialog.jsx';
    import { Clock, PlusCircle, Eye, Trash2, Search, Filter, Edit } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast.jsx';
    import useLocalStorage from '@/hooks/useLocalStorage.jsx';
    import { motion } from 'framer-motion';
    import { format } from 'date-fns';
    import DailyLogForm from '@/components/dailyLogs/DailyLogForm.jsx';
    import DailyLogDetailsModal from '@/components/dailyLogs/DailyLogDetailsModal.jsx';

    const DailyLogs = () => {
      const [dailyLogs, setDailyLogs] = useLocalStorage('cmsDailyLogs', []);
      const [projects] = useLocalStorage('projects', []);
      const [isFormModalOpen, setIsFormModalOpen] = useState(false);
      const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
      const [editingLog, setEditingLog] = useState(null);
      const [viewingLog, setViewingLog] = useState(null);
      const [searchTerm, setSearchTerm] = useState('');
      const [filterProject, setFilterProject] = useState('All Projects');
      const [filterDate, setFilterDate] = useState(null);
      const { toast } = useToast();

      const handleSaveLog = (data) => {
        if (editingLog) {
          setDailyLogs(prev => prev.map(log => log.id === data.id ? data : log));
          toast({ title: "Daily Log Updated" });
        } else {
          setDailyLogs(prev => [data, ...prev].sort((a,b) => new Date(b.logDate) - new Date(a.logDate))); 
          toast({ title: "Daily Log Submitted" });
        }
        setIsFormModalOpen(false);
        setEditingLog(null);
      };

      const handleDeleteLog = (id) => {
        if (window.confirm("Delete this daily log? This action cannot be undone.")) {
          setDailyLogs(prev => prev.filter(log => log.id !== id));
          toast({ title: "Daily Log Deleted", variant: "destructive" });
        }
      };
      
      const openEditModal = (log) => { 
        setEditingLog(log); 
        setViewingLog(null);
        setIsFormModalOpen(true); 
      };
      
      const openViewModal = (log) => {
        setViewingLog(log);
        setEditingLog(null);
        setIsDetailsModalOpen(true);
      };

      const openCreateModal = () => {
        setEditingLog(null);
        setViewingLog(null);
        setIsFormModalOpen(true);
      };


      const filteredLogs = useMemo(() => {
        return dailyLogs.filter(log => {
          const projectDetails = projects.find(p => p.id === log.projectId);
          const matchesSearch = searchTerm === '' || 
                                (projectDetails?.projectName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                                (projectDetails?.projectCode?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                                (log.siteLocation?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                                (log.workAccomplished?.toLowerCase().includes(searchTerm.toLowerCase()));
          const matchesProject = filterProject === 'All Projects' || log.projectId === filterProject;
          const matchesDate = !filterDate || format(new Date(log.logDate), 'yyyy-MM-dd') === format(filterDate, 'yyyy-MM-dd');
          return matchesSearch && matchesProject && matchesDate;
        }).sort((a,b) => new Date(b.logDate) - new Date(a.logDate));
      }, [dailyLogs, projects, searchTerm, filterProject, filterDate]);

      return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-8 p-4 md:p-6 lg:p-8">
          <Card className="shadow-xl border-t-4 border-teal-600">
            <CardHeader className="bg-gradient-to-r from-teal-600/10 to-cyan-600/10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <CardTitle className="text-2xl font-bold text-teal-700 flex items-center"><Clock className="mr-3 h-7 w-7" />Daily Construction Logs</CardTitle>
                  <CardDescription>Record and manage daily site activities, progress, and issues for Civil & Telecom projects.</CardDescription>
                </div>
                <Button onClick={openCreateModal} className="mt-4 md:mt-0 bg-teal-600 hover:bg-teal-700">
                  <PlusCircle className="mr-2 h-4 w-4" /> Create New Log
                </Button>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input placeholder="Search project, location, activity..." className="pl-10 w-full" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <Select value={filterProject} onValueChange={setFilterProject}>
                  <SelectTrigger><div className="flex items-center"><Filter className="mr-2 h-4 w-4 text-muted-foreground" /> <SelectValue placeholder="Filter by Project" /></div></SelectTrigger>
                  <SelectContent>{['All Projects', ...(projects || []).map(p => ({value: p.id, label: `${p.projectName} (${p.projectCode || p.id})`}))].map(opt => <SelectItem key={opt.value || opt} value={opt.value || opt}>{opt.label || opt}</SelectItem>)}</SelectContent>
                </Select>
                <div><DatePicker date={filterDate} setDate={setFilterDate} placeholder="Filter by Date" /></div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead><TableHead>Project</TableHead><TableHead>Site Location</TableHead>
                      <TableHead>Manpower</TableHead><TableHead>Key Activities</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.length === 0 && (
                        <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No daily logs found. Try adjusting filters or creating a new log.</TableCell></TableRow>
                    )}
                    {filteredLogs.map(log => {
                      const projectDetails = projects.find(p => p.id === log.projectId);
                      return (
                        <TableRow key={log.id} className="hover:bg-muted/50">
                          <TableCell>{format(new Date(log.logDate), 'dd MMM yyyy')}</TableCell>
                          <TableCell className="font-medium">{projectDetails?.projectName || log.projectId}</TableCell>
                          <TableCell>{log.siteLocation || 'N/A'}</TableCell>
                          <TableCell>{log.manpowerCount}</TableCell>
                          <TableCell className="max-w-xs truncate" title={log.workAccomplished}>{log.workAccomplished.substring(0,50)}...</TableCell>
                          <TableCell className="text-right space-x-1">
                            <Button variant="ghost" size="icon" onClick={() => openViewModal(log)} title="View Log Details"><Eye className="h-4 w-4 text-blue-600" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => openEditModal(log)} title="Edit Log"><Edit className="h-4 w-4 text-yellow-600" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteLog(log.id)} title="Delete Log"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
             {filteredLogs.length > 0 && (
                <CardFooter className="p-4 border-t text-sm text-muted-foreground">
                    Showing {filteredLogs.length} of {dailyLogs.length} total logs.
                </CardFooter>
            )}
          </Card>

          <Dialog open={isFormModalOpen} onOpenChange={(open) => { if(!open) { setEditingLog(null); } setIsFormModalOpen(open); }}>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto custom-scrollbar">
              <DialogHeader>
                <DialogTitle>{editingLog ? 'Edit Daily Log' : 'Create New Daily Log'}</DialogTitle>
                <DDesc>{editingLog ? `Updating log for ${projects.find(p=>p.id === editingLog.projectId)?.projectName || ''} on ${format(new Date(editingLog.logDate), 'PPP')}` : 'Fill in the details for today\'s site activities.'}</DDesc>
              </DialogHeader>
              <DailyLogForm onSubmit={handleSaveLog} initialData={editingLog || {}} onCancel={() => { setIsFormModalOpen(false); setEditingLog(null); }} projects={projects} />
            </DialogContent>
          </Dialog>

          {viewingLog && (
            <DailyLogDetailsModal 
                isOpen={isDetailsModalOpen} 
                onClose={() => { setIsDetailsModalOpen(false); setViewingLog(null); }} 
                log={viewingLog}
                projectDetails={projects.find(p => p.id === viewingLog.projectId)}
            />
          )}
        </motion.div>
      );
    };

    export default DailyLogs;