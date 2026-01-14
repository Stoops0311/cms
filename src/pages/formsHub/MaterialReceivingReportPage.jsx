import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { DatePicker } from '@/components/ui/date-picker.jsx';
import { Truck, Loader2, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast.jsx';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { format } from 'date-fns';

const conditionOptions = ["Good", "Acceptable", "Damaged", "Rejected"];

const MaterialReceivingReportPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const users = useQuery(api.admin.listUsers, {});
  const projects = useQuery(api.projects.listProjects, {});
  const contractors = useQuery(api.contractors.listContractors, {});
  const createProcurementLog = useMutation(api.procurementLogs.createProcurementLog);

  const [projectId, setProjectId] = useState('');
  const [supplier, setSupplier] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(new Date());
  const [deliveryNote, setDeliveryNote] = useState('');
  const [poReference, setPoReference] = useState('');
  const [receivedBy, setReceivedBy] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [items, setItems] = useState([
    { description: '', quantityOrdered: '', quantityReceived: '', unit: '', condition: 'Good' }
  ]);

  // Get first user as default (in real app, this would be the logged-in user)
  const currentUser = users?.[0];
  const suppliers = contractors?.map(c => c.companyName) || [];

  const addItem = () => {
    setItems([...items, { description: '', quantityOrdered: '', quantityReceived: '', unit: '', condition: 'Good' }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!supplier || !deliveryNote || items.some(item => !item.description || !item.quantityReceived)) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Please fill in all required fields." });
      return;
    }

    if (!currentUser) {
      toast({ variant: "destructive", title: "Error", description: "No user found. Please ensure users exist in the system." });
      return;
    }

    setIsSubmitting(true);
    try {
      // Calculate total value (would need price in real implementation)
      const itemsDescription = items.map(item =>
        `${item.description}: ${item.quantityReceived} ${item.unit} (${item.condition})`
      ).join('\n');

      await createProcurementLog({
        logType: "Delivery Note",
        documentId: deliveryNote,
        supplier,
        date: format(deliveryDate, 'yyyy-MM-dd'),
        amount: 0, // Would be calculated from items in real implementation
        relatedProjectId: projectId || undefined,
        notes: `PO Reference: ${poReference || 'N/A'}\nReceived By: ${receivedBy || currentUser.fullName}\n\nItems Received:\n${itemsDescription}${notes ? `\n\nNotes: ${notes}` : ''}`,
        createdBy: currentUser._id,
      });

      toast({ title: "Material Received", description: `Delivery note ${deliveryNote} has been logged.` });
      navigate('/forms-documents');
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to log material receipt. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!users || !contractors) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
      <Card className="shadow-xl border-t-4 border-amber-600">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-amber-700 flex items-center">
            <Truck className="mr-3 h-7 w-7"/>Material Receiving Report
          </CardTitle>
          <CardDescription>Document receipt of materials and verify delivery against purchase order.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="supplier">Supplier *</Label>
                <Select value={supplier} onValueChange={setSupplier}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="projectId">Project</Label>
                <Select value={projectId} onValueChange={setProjectId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {projects?.map(project => (
                      <SelectItem key={project._id} value={project._id}>{project.projectName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="deliveryNote">Delivery Note Number *</Label>
                <Input id="deliveryNote" value={deliveryNote} onChange={e => setDeliveryNote(e.target.value)} placeholder="e.g., DN-2025-001" />
              </div>
              <div>
                <Label htmlFor="poReference">PO Reference</Label>
                <Input id="poReference" value={poReference} onChange={e => setPoReference(e.target.value)} placeholder="e.g., PO-2025-001" />
              </div>
              <div>
                <Label>Delivery Date *</Label>
                <DatePicker date={deliveryDate} setDate={setDeliveryDate} className="w-full" />
              </div>
            </div>

            <div>
              <Label htmlFor="receivedBy">Received By</Label>
              <Input id="receivedBy" value={receivedBy} onChange={e => setReceivedBy(e.target.value)} placeholder="Name of person receiving materials" />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-lg font-semibold">Items Received</Label>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-1" /> Add Item
                </Button>
              </div>

              {items.map((item, index) => (
                <div key={index} className="p-4 bg-slate-50 rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-600">Item {index + 1}</span>
                    {items.length > 1 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(index)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    <div className="md:col-span-2">
                      <Label className="text-xs">Description *</Label>
                      <Input value={item.description} onChange={e => updateItem(index, 'description', e.target.value)} placeholder="Material description" />
                    </div>
                    <div>
                      <Label className="text-xs">Qty Ordered</Label>
                      <Input type="number" value={item.quantityOrdered} onChange={e => updateItem(index, 'quantityOrdered', e.target.value)} placeholder="0" />
                    </div>
                    <div>
                      <Label className="text-xs">Qty Received *</Label>
                      <Input type="number" value={item.quantityReceived} onChange={e => updateItem(index, 'quantityReceived', e.target.value)} placeholder="0" />
                    </div>
                    <div>
                      <Label className="text-xs">Unit</Label>
                      <Input value={item.unit} onChange={e => updateItem(index, 'unit', e.target.value)} placeholder="pcs, kg, m" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Condition</Label>
                    <Select value={item.condition} onValueChange={v => updateItem(index, 'condition', v)}>
                      <SelectTrigger className="w-full md:w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {conditionOptions.map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <Label htmlFor="notes">Notes / Discrepancies</Label>
              <Textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Note any discrepancies between ordered and received quantities, damaged items, etc." rows={3} />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2 border-t pt-6">
            <Button type="button" variant="outline" onClick={() => navigate('/forms-documents')}>Cancel</Button>
            <Button type="submit" className="bg-amber-600 hover:bg-amber-700" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</> : 'Submit Report'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );
};

export default MaterialReceivingReportPage;
