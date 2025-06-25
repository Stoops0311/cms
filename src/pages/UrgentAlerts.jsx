import React, { useState, useMemo } from 'react';
    import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { Input } from '@/components/ui/input.jsx';
    import { Textarea } from '@/components/ui/textarea.jsx';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
    import { Label } from '@/components/ui/label.jsx';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter as DFooter } from '@/components/ui/dialog.jsx';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
    import { AlertTriangle, PlusCircle, Edit2, Trash2, Siren, Megaphone, Eye, Filter, Search } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast.jsx';
    import useLocalStorage from '@/hooks/useLocalStorage.jsx';
    import { motion } from 'framer-motion';
    import { format, parseISO } from 'date-fns';
    import { Link } from 'react-router-dom';

    const UrgentAlertForm = ({ onSubmit, initialData = {}, onCancel }) => {
        const [title, setTitle] = useState(initialData.title || '');
        const [message, setMessage] = useState(initialData.message || '');
        const [severity, setSeverity] = useState(initialData.severity || 'Medium');
        const [target, setTarget] = useState(initialData.target || 'All Sites');
        const { toast } = useToast();

        const handleSubmit = (e) => {
            e.preventDefault();
            if (!title || !message) {
                toast({ variant: "destructive", title: "Missing Fields", description: "Title and Message are required." });
                return;
            }
            onSubmit({
                id: initialData.id || `ALERT-${Date.now()}`,
                title, message, severity, target,
                timestamp: initialData.timestamp || new Date().toISOString(),
                status: initialData.status || "Active" 
            });
        };
        return (
            <form onSubmit={handleSubmit} className="space-y-4">
                <div><Label htmlFor="ua-title">Alert Title</Label><Input id="ua-title" value={title} onChange={e => setTitle(e.target.value)} /></div>
                <div><Label htmlFor="ua-message">Message</Label><Textarea id="ua-message" value={message} onChange={e => setMessage(e.target.value)} rows={4} /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="ua-severity">Severity</Label>
                        <Select value={severity} onValueChange={setSeverity}>
                            <SelectTrigger id="ua-severity"><SelectValue placeholder="Select Severity" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Critical"><Siren className="inline h-4 w-4 mr-2 text-red-600"/>Critical</SelectItem>
                                <SelectItem value="High"><AlertTriangle className="inline h-4 w-4 mr-2 text-orange-500"/>High</SelectItem>
                                <SelectItem value="Medium"><Megaphone className="inline h-4 w-4 mr-2 text-yellow-500"/>Medium</SelectItem>
                                <SelectItem value="Low">Low</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div><Label htmlFor="ua-target">Target Audience/Sites</Label><Input id="ua-target" value={target} onChange={e => setTarget(e.target.value)} /></div>
                </div>
                <DFooter className="pt-2"><Button type="button" variant="outline" onClick={onCancel}>Cancel</Button><Button type="submit" className="bg-red-600 hover:bg-red-700">{initialData.id ? "Update Alert" : "Send Alert"}</Button></DFooter>
            </form>
        );
    };

    const UrgentAlerts = () => {
        const [alerts, setAlerts] = useLocalStorage('cmsUrgentAlerts', []);
        const [isModalOpen, setIsModalOpen] = useState(false);
        const [editingAlert, setEditingAlert] = useState(null);
        const [viewingAlert, setViewingAlert] = useState(null);
        const [searchTerm, setSearchTerm] = useState('');
        const [filterSeverity, setFilterSeverity] = useState('All Severities');
        const { toast } = useToast();

        const handleSaveAlert = (alertData) => {
            if (editingAlert) {
                setAlerts(prev => prev.map(a => a.id === alertData.id ? { ...alertData, timestamp: new Date().toISOString() } : a));
                toast({ title: "Alert Updated" });
            } else {
                setAlerts(prev => [alertData, ...prev].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
                toast({ title: "Alert Created & Sent", variant: alertData.severity === "Critical" ? "destructive" : "default" });
            }
            setIsModalOpen(false);
            setEditingAlert(null);
        };

        const handleDeleteAlert = (id) => {
            if (window.confirm("Are you sure you want to delete this alert?")) {
                setAlerts(prev => prev.filter(a => a.id !== id));
                toast({ title: "Alert Deleted", variant: "destructive" });
            }
        };
        
        const openEditModal = (alert) => { setEditingAlert(alert); setIsModalOpen(true); };
        const openViewModal = (alert) => { setViewingAlert(alert); };

        const getSeverityBadge = (severity) => {
            switch(severity?.toLowerCase()){
                case 'critical': return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700 border border-red-300 flex items-center"><Siren className="h-3 w-3 mr-1"/>Critical</span>;
                case 'high': return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-700 border border-orange-300 flex items-center"><AlertTriangle className="h-3 w-3 mr-1"/>High</span>;
                case 'medium': return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700 border border-yellow-300 flex items-center"><Megaphone className="h-3 w-3 mr-1"/>Medium</span>;
                default: return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 border border-blue-300">Low</span>;
            }
        };

        const filteredAlerts = useMemo(() => {
            return alerts.filter(alert => 
                (alert.title.toLowerCase().includes(searchTerm.toLowerCase()) || alert.message.toLowerCase().includes(searchTerm.toLowerCase()) || alert.target.toLowerCase().includes(searchTerm.toLowerCase())) &&
                (filterSeverity === 'All Severities' || alert.severity === filterSeverity)
            ).sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
        }, [alerts, searchTerm, filterSeverity]);

        return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="p-4 md:p-6 lg:p-8">
                <Card className="shadow-xl border-t-4 border-red-600">
                    <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div>
                            <CardTitle className="text-2xl font-bold text-red-700 flex items-center"><Siren className="mr-3 h-7 w-7"/>Urgent Alerts Management</CardTitle>
                            <CardDescription>View, create, and manage critical system-wide alerts.</CardDescription>
                        </div>
                        <Button onClick={() => { setEditingAlert(null); setIsModalOpen(true); }} className="mt-4 md:mt-0 bg-red-600 hover:bg-red-700 text-white">
                            <PlusCircle className="mr-2 h-4 w-4"/> Create New Alert
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 items-end">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"/>
                                <Input placeholder="Search alerts..." className="pl-10 w-full" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)}/>
                            </div>
                            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                                <SelectTrigger><div className="flex items-center"><Filter className="mr-2 h-4 w-4 text-muted-foreground"/> <SelectValue placeholder="Filter by Severity"/></div></SelectTrigger>
                                <SelectContent>{['All Severities', 'Critical', 'High', 'Medium', 'Low'].map(s=><SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                         <div className="overflow-x-auto">
                            <Table>
                                <TableHeader><TableRow>
                                    <TableHead>Title</TableHead><TableHead>Severity</TableHead><TableHead>Target</TableHead>
                                    <TableHead>Timestamp</TableHead><TableHead className="text-right">Actions</TableHead>
                                </TableRow></TableHeader>
                                <TableBody>
                                {filteredAlerts.length === 0 ? (
                                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No alerts match your criteria.</TableCell></TableRow>
                                ) : filteredAlerts.map(alert => (
                                    <TableRow key={alert.id} className="hover:bg-muted/50">
                                        <TableCell className="font-medium">{alert.title}</TableCell>
                                        <TableCell>{getSeverityBadge(alert.severity)}</TableCell>
                                        <TableCell>{alert.target}</TableCell>
                                        <TableCell>{format(parseISO(alert.timestamp), 'dd MMM yyyy, HH:mm')}</TableCell>
                                        <TableCell className="text-right space-x-1">
                                            <Button variant="ghost" size="icon" onClick={()=>openViewModal(alert)} title="View Details"><Eye className="h-4 w-4 text-blue-600"/></Button>
                                            <Button variant="ghost" size="icon" onClick={()=>openEditModal(alert)} title="Edit Alert"><Edit2 className="h-4 w-4"/></Button>
                                            <Button variant="ghost" size="icon" onClick={()=>handleDeleteAlert(alert.id)} title="Delete Alert"><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                    <CardFooter className="text-sm text-muted-foreground pt-4 border-t">Total alerts: {alerts.length}.</CardFooter>
                </Card>

                <Dialog open={isModalOpen} onOpenChange={(open) => { if(!open) setEditingAlert(null); setIsModalOpen(open); }}>
                    <DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>{editingAlert ? 'Edit Alert' : 'Create New Alert'}</DialogTitle><DialogDescription>Use alerts for critical information only.</DialogDescription></DialogHeader><UrgentAlertForm onSubmit={handleSaveAlert} initialData={editingAlert || {}} onCancel={()=>setIsModalOpen(false)}/></DialogContent>
                </Dialog>
                
                <Dialog open={!!viewingAlert} onOpenChange={(open) => { if(!open) setViewingAlert(null); }}>
                    <DialogContent className="sm:max-w-lg">
                        {viewingAlert && (<>
                            <DialogHeader><DialogTitle>{viewingAlert.title}</DialogTitle><DialogDescription className="flex items-center gap-2">{getSeverityBadge(viewingAlert.severity)} <span className="text-xs">Target: {viewingAlert.target} | {format(parseISO(viewingAlert.timestamp), 'PPPp')}</span></DialogDescription></DialogHeader>
                            <div className="py-4 prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap break-words">{viewingAlert.message}</div>
                            <DFooter><Button onClick={()=>setViewingAlert(null)}>Close</Button></DFooter>
                        </>)}
                    </DialogContent>
                </Dialog>
            </motion.div>
        );
    };
    export default UrgentAlerts;