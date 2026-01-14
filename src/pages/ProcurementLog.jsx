import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { Truck, FilePlus, ListOrdered, AlertTriangle, Edit, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { DatePicker } from '@/components/ui/date-picker.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog.jsx';
import { useToast } from '@/components/ui/use-toast.jsx';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { format } from 'date-fns';

const logTypes = ["Purchase Order (PO)", "Invoice", "Delivery Note", "Material Request"];

const ProcurementLogForm = ({ onSubmit, initialData = {}, onCancel, suppliers, projects, isSubmitting }) => {
  const [formData, setFormData] = useState({
    logType: initialData.logType || logTypes[0],
    documentId: initialData.documentId || '',
    supplier: initialData.supplier || (suppliers?.[0] || ''),
    date: initialData.date ? new Date(initialData.date) : new Date(),
    amount: initialData.amount?.toString() || '',
    status: initialData.status || 'Pending',
    relatedProjectId: initialData.relatedProjectId || '',
    notes: initialData.notes || '',
  });
  const { toast } = useToast();

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.documentId || !formData.supplier) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Document ID and Supplier are required." });
      return;
    }
    onSubmit({
      ...formData,
      amount: formData.amount ? parseFloat(formData.amount) : undefined,
      date: formData.date ? format(formData.date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      id: initialData._id,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label htmlFor="logType">Log Type</Label>
          <Select value={formData.logType} onValueChange={val => handleChange('logType', val)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{logTypes.map(lt => <SelectItem key={lt} value={lt}>{lt}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="documentId">Document ID (PO#, Invoice#)</Label>
          <Input id="documentId" value={formData.documentId} onChange={e => handleChange('documentId', e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label htmlFor="supplier">Supplier</Label>
          <Select value={formData.supplier} onValueChange={val => handleChange('supplier', val)}>
            <SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger>
            <SelectContent>
              {suppliers?.length > 0 ? (
                suppliers.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)
              ) : (
                <SelectItem value="manual" disabled className="text-muted-foreground">
                  No contractors found - add contractors first
                </SelectItem>
              )}
              <SelectItem value="Other">Other / Manual Entry</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="date">Date</Label>
          <DatePicker date={formData.date} setDate={d => handleChange('date', d)} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label htmlFor="amount">Amount (Optional)</Label>
          <Input id="amount" type="number" value={formData.amount} onChange={e => handleChange('amount', e.target.value)} />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={val => handleChange('status', val)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Ordered">Ordered</SelectItem>
              <SelectItem value="Delivered">Delivered</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="relatedProject">Related Project</Label>
        <Select value={formData.relatedProjectId} onValueChange={val => handleChange('relatedProjectId', val)}>
          <SelectTrigger><SelectValue placeholder="Select project (optional)" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">No Project</SelectItem>
            {projects?.map(p => <SelectItem key={p._id} value={p._id}>{p.projectName}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Input id="notes" value={formData.notes} onChange={e => handleChange('notes', e.target.value)} />
      </div>
      <DialogFooter className="pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData._id ? 'Update Log' : 'Add Log Entry'}
        </Button>
      </DialogFooter>
    </form>
  );
};

const ProcurementLog = () => {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Convex queries
  const logs = useQuery(api.procurementLogs.listProcurementLogs, {});
  const projects = useQuery(api.projects.listProjects, {});
  const contractors = useQuery(api.contractors.listContractors, {});
  const users = useQuery(api.admin.listUsers, { isActive: true });

  // Convex mutations
  const createLog = useMutation(api.procurementLogs.createProcurementLog);
  const updateLog = useMutation(api.procurementLogs.updateProcurementLog);

  // Get first admin user as createdBy
  const adminUser = users?.find(u => u.role === 'admin') || users?.[0];

  // Get suppliers from contractors (no hardcoded fallback)
  const suppliers = contractors?.map(c => c.companyName) || [];

  const handleSaveLog = async (logData) => {
    if (!adminUser) {
      toast({ variant: "destructive", title: "Error", description: "No admin user found." });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingLog) {
        await updateLog({
          logId: editingLog._id,
          logType: logData.logType,
          documentId: logData.documentId,
          supplier: logData.supplier,
          date: logData.date,
          amount: logData.amount,
          status: logData.status,
          relatedProjectId: logData.relatedProjectId || undefined,
          notes: logData.notes || undefined,
        });
        toast({ title: "Log Updated", description: `${logData.logType} entry updated.` });
      } else {
        await createLog({
          logType: logData.logType,
          documentId: logData.documentId,
          supplier: logData.supplier,
          date: logData.date,
          amount: logData.amount,
          status: logData.status,
          relatedProjectId: logData.relatedProjectId || undefined,
          notes: logData.notes || undefined,
          createdBy: adminUser._id,
        });
        toast({ title: "Log Added", description: `${logData.logType} entry added.` });
      }
      setIsModalOpen(false);
      setEditingLog(null);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to save log." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (log) => {
    setEditingLog(log);
    setIsModalOpen(true);
  };

  const isLoading = logs === undefined || users === undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 md:p-6 lg:p-8"
    >
      <Card className="shadow-xl border-t-4 border-cyan-500 mb-8">
        <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight text-cyan-600 flex items-center">
              <Truck className="mr-2 h-6 w-6" />Procurement Log
            </CardTitle>
            <CardDescription>
              Track Purchase Orders (PO), Invoices, and Delivery Notes.
            </CardDescription>
          </div>
          <Button
            onClick={() => { setEditingLog(null); setIsModalOpen(true); }}
            className="mt-4 md:mt-0 bg-cyan-500 hover:bg-cyan-600 text-white"
            disabled={!adminUser}
          >
            <FilePlus className="mr-2 h-4 w-4" />Add New Log Entry
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mt-2 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded-md flex items-start">
            <AlertTriangle className="h-5 w-5 mr-3 mt-1 flex-shrink-0" />
            <div>
              <p className="font-semibold">Simplified View:</p>
              <p className="text-sm">This page provides a basic list of procurement logs. Full workflow integration and approval processes will be added later.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
          <span className="ml-2 text-muted-foreground">Loading procurement logs...</span>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ListOrdered className="mr-2 h-5 w-5" />Logged Entries ({logs?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {logs?.length === 0 ? (
              <p className="text-muted-foreground text-center py-6">No procurement logs recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {logs?.map(log => (
                  <Card key={log._id} className="p-3 shadow-sm">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">
                          {log.logType}: {log.documentId}{' '}
                          <span className="text-xs font-normal text-muted-foreground">({log.supplier})</span>
                        </p>
                        <p className="text-sm">
                          Date: {log.date} | Status:{' '}
                          <span className={`font-medium ${
                            log.status === 'Paid' || log.status === 'Delivered' ? 'text-green-600' :
                            log.status === 'Cancelled' ? 'text-red-600' : 'text-yellow-600'
                          }`}>
                            {log.status}
                          </span>
                        </p>
                        {log.amount && <p className="text-xs text-gray-500">Amount: {log.amount.toLocaleString()}</p>}
                        {log.projectName && <p className="text-xs text-gray-500">Project: {log.projectName}</p>}
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => openEditModal(log)} title="Edit Log">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                    {log.notes && <p className="text-xs italic mt-1 text-gray-600">Notes: {log.notes}</p>}
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={isModalOpen} onOpenChange={(open) => { if (!open) { setEditingLog(null); } setIsModalOpen(open); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingLog ? 'Edit Procurement Log' : 'Add New Procurement Log Entry'}</DialogTitle>
          </DialogHeader>
          <ProcurementLogForm
            onSubmit={handleSaveLog}
            initialData={editingLog || {}}
            onCancel={() => { setIsModalOpen(false); setEditingLog(null); }}
            suppliers={suppliers}
            projects={projects}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default ProcurementLog;
