import React, { useState, useMemo } from 'react';
    import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { Input } from '@/components/ui/input.jsx';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog.jsx';
    import { Truck, PlusCircle, Edit2, Trash2, Search, Filter, CalendarDays } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast.jsx';
    import useLocalStorage from '@/hooks/useLocalStorage.jsx';
    import { motion } from 'framer-motion';
    import { format } from 'date-fns';
    import EquipmentForm from '@/components/equipmentDispatch/EquipmentForm.jsx';
    import EquipmentStatusBadge from '@/components/equipmentDispatch/EquipmentStatusBadge.jsx';

    const equipmentTypes = ["Excavator", "Bulldozer", "Crane", "Loader", "Dump Truck", "Concrete Mixer", "Generator", "Scaffolding", "Splicing Machine", "OTDR", "Cable Puller"];
    const equipmentStatuses = ["Available", "In Use", "Maintenance", "Unavailable"];
    const dispatchStatuses = ["Pending", "Approved", "Dispatched", "Returned", "Cancelled"];

    const EquipmentDispatch = () => {
      const [equipmentList, setEquipmentList] = useLocalStorage('cmsEquipment', []);
      const [dispatchLog, setDispatchLog] = useLocalStorage('cmsDispatchLog', []);
      const [projects] = useLocalStorage('projects', []);
      const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false);
      const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
      const [editingData, setEditingData] = useState(null);
      const [searchTerm, setSearchTerm] = useState('');
      const [filterType, setFilterType] = useState('All Types');
      const [filterStatus, setFilterStatus] = useState('All Statuses');
      const { toast } = useToast();

      const handleSaveEquipment = (data) => {
        if (editingData && editingData.id && !editingData.dispatchId) { 
          setEquipmentList(prev => prev.map(eq => eq.id === data.id ? data : eq));
          toast({ title: "Equipment Updated", description: `${data.name} details saved.` });
        } else { 
          setEquipmentList(prev => [...prev, data]);
          toast({ title: "Equipment Added", description: `${data.name} added to inventory.` });
        }
        setIsEquipmentModalOpen(false);
        setEditingData(null);
      };
      
      const handleSaveDispatch = (data) => {
         if (editingData && editingData.dispatchId) { 
          setDispatchLog(prev => prev.map(d => d.dispatchId === data.dispatchId ? data : d));
          toast({ title: "Dispatch Updated", description: `Dispatch for ${data.equipmentName} updated.` });
        } else { 
          setDispatchLog(prev => [data, ...prev].sort((a,b) => new Date(b.dispatchDate) - new Date(a.dispatchDate)));
          const equipmentToUpdate = equipmentList.find(eq => eq.id === data.equipmentId);
          if (equipmentToUpdate && equipmentToUpdate.status === "Available" && (data.dispatchStatus === "Approved" || data.dispatchStatus === "Dispatched")) {
            setEquipmentList(prevEqList => prevEqList.map(eq => eq.id === data.equipmentId ? {...eq, status: "In Use"} : eq));
          }
          toast({ title: "Equipment Dispatched", description: `${data.equipmentName} scheduled for dispatch.` });
        }
        setIsDispatchModalOpen(false);
        setEditingData(null);
      };

      const handleDeleteEquipment = (id) => {
        if (window.confirm("Are you sure you want to delete this equipment?")) {
          setEquipmentList(prev => prev.filter(eq => eq.id !== id));
          toast({ title: "Equipment Deleted", variant: "destructive" });
        }
      };
      
      const handleDeleteDispatch = (dispatchId) => {
        if (window.confirm("Are you sure you want to delete this dispatch record?")) {
          setDispatchLog(prev => prev.filter(d => d.dispatchId !== dispatchId));
          toast({ title: "Dispatch Record Deleted", variant: "destructive" });
        }
      };

      const openEditEquipmentModal = (equipment) => {
        setEditingData(equipment);
        setIsEquipmentModalOpen(true);
      };
      
      const openEditDispatchModal = (dispatchEntry) => {
        setEditingData(dispatchEntry);
        setIsDispatchModalOpen(true);
      };
      
      const openNewDispatchModal = (equipment) => {
        if (equipment.status !== "Available") {
          toast({variant: "destructive", title: "Equipment Not Available", description: `${equipment.name} is currently ${equipment.status}.`});
          return;
        }
        setEditingData({ ...equipment, equipmentId: equipment.id }); 
        setIsDispatchModalOpen(true);
      };

      const filteredEquipment = useMemo(() => {
        return equipmentList.filter(eq => 
          (eq.name.toLowerCase().includes(searchTerm.toLowerCase()) || eq.identifier.toLowerCase().includes(searchTerm.toLowerCase())) &&
          (filterType === 'All Types' || eq.type === filterType) &&
          (filterStatus === 'All Statuses' || eq.status === filterStatus)
        );
      }, [equipmentList, searchTerm, filterType, filterStatus]);
      
      const filteredDispatchLog = useMemo(() => {
        return dispatchLog.filter(d => 
          (d.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) || (projects.find(p=>p.id === d.projectId)?.projectName || '').toLowerCase().includes(searchTerm.toLowerCase())) &&
          (filterType === 'All Types' || equipmentList.find(eq => eq.id === d.equipmentId)?.type === filterType) &&
          (filterStatus === 'All Statuses' || d.dispatchStatus === filterStatus)
        ).sort((a,b) => new Date(b.dispatchDate) - new Date(a.dispatchDate));
      }, [dispatchLog, searchTerm, filterType, filterStatus, equipmentList, projects]);


      return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-8 p-4 md:p-6 lg:p-8">
          <Card className="shadow-xl border-t-4 border-primary">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <CardTitle className="text-2xl font-bold text-primary flex items-center"><Truck className="mr-3 h-7 w-7" />Equipment Inventory & Dispatch</CardTitle>
                  <CardDescription>Manage construction equipment and their dispatch logistics.</CardDescription>
                </div>
                <div className="mt-4 md:mt-0 flex space-x-2">
                    <Button onClick={() => { setEditingData(null); setIsEquipmentModalOpen(true); }} className="bg-primary hover:bg-primary/90">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Equipment
                    </Button>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input placeholder="Search equipment or project..." className="pl-10 w-full" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger><div className="flex items-center"><Filter className="mr-2 h-4 w-4 text-muted-foreground" /> <SelectValue placeholder="Filter by Type" /></div></SelectTrigger>
                  <SelectContent>{['All Types', ...equipmentTypes].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger><div className="flex items-center"><Filter className="mr-2 h-4 w-4 text-muted-foreground" /> <SelectValue placeholder="Filter by Status" /></div></SelectTrigger>
                  <SelectContent>{['All Statuses', ...equipmentStatuses, ...dispatchStatuses].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead><TableHead>Identifier</TableHead><TableHead>Type</TableHead>
                      <TableHead>Status</TableHead><TableHead>Last Maintenance</TableHead><TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEquipment.length === 0 && (
                        <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No equipment found.</TableCell></TableRow>
                    )}
                    {filteredEquipment.map(eq => (
                      <TableRow key={eq.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{eq.name}</TableCell><TableCell>{eq.identifier}</TableCell><TableCell>{eq.type}</TableCell>
                        <TableCell><EquipmentStatusBadge status={eq.status} type="equipment" /></TableCell>
                        <TableCell>{eq.lastMaintenance ? format(new Date(eq.lastMaintenance), 'dd MMM yyyy') : 'N/A'}</TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button variant="outline" size="sm" onClick={() => openNewDispatchModal(eq)} disabled={eq.status !== "Available"} className="text-xs">Dispatch</Button>
                          <Button variant="ghost" size="icon" onClick={() => openEditEquipmentModal(eq)} title="Edit"><Edit2 className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteEquipment(eq.id)} title="Delete"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-xl border-t-4 border-blue-500">
            <CardHeader className="bg-gradient-to-r from-blue-500/10 to-sky-500/10">
                <CardTitle className="text-2xl font-bold text-blue-600 flex items-center"><CalendarDays className="mr-3 h-7 w-7" />Dispatch Log</CardTitle>
                <CardDescription>Track all equipment dispatch activities.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Equipment</TableHead><TableHead>Project</TableHead><TableHead>Dispatch Date</TableHead>
                                <TableHead>Return Date</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredDispatchLog.length === 0 && (
                                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No dispatch records found.</TableCell></TableRow>
                            )}
                            {filteredDispatchLog.map(log => (
                                <TableRow key={log.dispatchId} className="hover:bg-muted/50">
                                    <TableCell className="font-medium">{log.equipmentName} ({log.equipmentId})</TableCell>
                                    <TableCell>{(projects.find(p=>p.id === log.projectId)?.projectName) || log.projectId}</TableCell>
                                    <TableCell>{format(new Date(log.dispatchDate), 'dd MMM yyyy')}</TableCell>
                                    <TableCell>{log.expectedReturnDate ? format(new Date(log.expectedReturnDate), 'dd MMM yyyy') : 'N/A'}</TableCell>
                                    <TableCell><EquipmentStatusBadge status={log.dispatchStatus} type="dispatch" /></TableCell>
                                    <TableCell className="text-right space-x-1">
                                        <Button variant="ghost" size="icon" onClick={() => openEditDispatchModal(log)} title="Edit Dispatch"><Edit2 className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteDispatch(log.dispatchId)} title="Delete Dispatch"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
          </Card>

          <Dialog open={isEquipmentModalOpen} onOpenChange={(open) => { if(!open) { setEditingData(null); } setIsEquipmentModalOpen(open); }}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingData ? 'Edit Equipment' : 'Add New Equipment'}</DialogTitle>
                <DialogDescription>{editingData ? 'Update details for this equipment.' : 'Enter details for the new equipment.'}</DialogDescription>
              </DialogHeader>
              <EquipmentForm onSubmit={handleSaveEquipment} initialData={editingData || {}} onCancel={() => { setIsEquipmentModalOpen(false); setEditingData(null); }} projectList={projects} />
            </DialogContent>
          </Dialog>
          
          <Dialog open={isDispatchModalOpen} onOpenChange={(open) => { if(!open) { setEditingData(null); } setIsDispatchModalOpen(open); }}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingData?.dispatchId ? 'Edit Dispatch' : 'Create New Dispatch'}</DialogTitle>
                <DialogDescription>{editingData?.dispatchId ? `Update dispatch for ${editingData.name}.` : `Dispatch ${editingData?.name || 'equipment'} to a project.`}</DialogDescription>
              </DialogHeader>
              <EquipmentForm onSubmit={handleSaveDispatch} initialData={editingData || {}} onCancel={() => { setIsDispatchModalOpen(false); setEditingData(null); }} isDispatchForm={true} projectList={projects} />
            </DialogContent>
          </Dialog>

        </motion.div>
      );
    };

    export default EquipmentDispatch;