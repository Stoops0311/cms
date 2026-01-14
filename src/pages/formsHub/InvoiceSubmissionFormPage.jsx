import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { DatePicker } from '@/components/ui/date-picker.jsx';
import { FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast.jsx';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { format } from 'date-fns';

const InvoiceSubmissionFormPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const users = useQuery(api.admin.listUsers, {});
  const projects = useQuery(api.projects.listProjects, {});
  const contractors = useQuery(api.contractors.listContractors, {});
  const createProcurementLog = useMutation(api.procurementLogs.createProcurementLog);

  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [supplier, setSupplier] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date());
  const [amount, setAmount] = useState('');
  const [projectId, setProjectId] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get first user as default (in real app, this would be the logged-in user)
  const currentUser = users?.[0];

  // Get supplier names from contractors
  const suppliers = contractors?.map(c => c.companyName) || [];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!invoiceNumber || !supplier || !amount) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Please fill in all required fields." });
      return;
    }

    if (!currentUser) {
      toast({ variant: "destructive", title: "Error", description: "No user found. Please ensure users exist in the system." });
      return;
    }

    setIsSubmitting(true);
    try {
      await createProcurementLog({
        logType: "Invoice",
        documentId: invoiceNumber,
        supplier,
        date: format(invoiceDate, 'yyyy-MM-dd'),
        amount: parseFloat(amount),
        relatedProjectId: projectId || undefined,
        notes: notes || undefined,
        createdBy: currentUser._id,
      });

      toast({ title: "Invoice Submitted", description: `Invoice ${invoiceNumber} has been submitted for processing.` });
      navigate('/forms-documents');
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to submit invoice. Please try again." });
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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto">
      <Card className="shadow-xl border-t-4 border-violet-600">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-violet-700 flex items-center">
            <FileText className="mr-3 h-7 w-7"/>Invoice Submission Form
          </CardTitle>
          <CardDescription>Submit vendor invoices for processing and payment.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invoiceNumber">Invoice Number *</Label>
                <Input id="invoiceNumber" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} placeholder="e.g., INV-2025-001" />
              </div>
              <div>
                <Label>Invoice Date *</Label>
                <DatePicker date={invoiceDate} setDate={setInvoiceDate} className="w-full" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="supplier">Supplier/Vendor *</Label>
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
                <Label htmlFor="amount">Invoice Amount (USD) *</Label>
                <Input id="amount" type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />
              </div>
            </div>

            <div>
              <Label htmlFor="projectId">Related Project</Label>
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

            <div>
              <Label htmlFor="notes">Notes / Description</Label>
              <Textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Additional details about this invoice..." rows={3} />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2 border-t pt-6">
            <Button type="button" variant="outline" onClick={() => navigate('/forms-documents')}>Cancel</Button>
            <Button type="submit" className="bg-violet-600 hover:bg-violet-700" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</> : 'Submit Invoice'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );
};

export default InvoiceSubmissionFormPage;
