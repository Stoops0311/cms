import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { DatePicker } from '@/components/ui/date-picker.jsx';
import { CreditCard, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast.jsx';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { format } from 'date-fns';

const VendorPaymentCertificatePage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const users = useQuery(api.admin.listUsers, {});
  const projects = useQuery(api.projects.listProjects, {});
  const contractors = useQuery(api.contractors.listContractors, {});
  const createVendorPayment = useMutation(api.vendorPayments.createVendorPayment);

  const [vendorId, setVendorId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [certificateNumber, setCertificateNumber] = useState(`VPC-${Date.now()}`);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentFor, setPaymentFor] = useState('');
  const [invoiceReference, setInvoiceReference] = useState('');
  const [workPeriodStart, setWorkPeriodStart] = useState(null);
  const [workPeriodEnd, setWorkPeriodEnd] = useState(null);
  const [retentionAmount, setRetentionAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get first user as default (in real app, this would be the logged-in user)
  const currentUser = users?.[0];

  const netPayable = paymentAmount
    ? parseFloat(paymentAmount) - (parseFloat(retentionAmount) || 0)
    : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!vendorId || !projectId || !paymentAmount || !paymentFor || !workPeriodStart || !workPeriodEnd) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Please fill in all required fields." });
      return;
    }

    if (!currentUser) {
      toast({ variant: "destructive", title: "Error", description: "No user found. Please ensure users exist in the system." });
      return;
    }

    if (workPeriodEnd < workPeriodStart) {
      toast({ variant: "destructive", title: "Invalid Dates", description: "Work period end date cannot be before start date." });
      return;
    }

    setIsSubmitting(true);
    try {
      await createVendorPayment({
        vendorId,
        projectId,
        certificateNumber,
        paymentAmount: parseFloat(paymentAmount),
        paymentFor,
        invoiceReference: invoiceReference || undefined,
        workPeriodStart: format(workPeriodStart, 'yyyy-MM-dd'),
        workPeriodEnd: format(workPeriodEnd, 'yyyy-MM-dd'),
        retentionAmount: retentionAmount ? parseFloat(retentionAmount) : undefined,
        createdBy: currentUser._id,
      });

      toast({ title: "Payment Certificate Submitted", description: `Certificate ${certificateNumber} has been submitted for approval.` });
      navigate('/forms-documents');
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to submit payment certificate. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!users || !projects || !contractors) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto">
      <Card className="shadow-xl border-t-4 border-green-600">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-green-700 flex items-center">
            <CreditCard className="mr-3 h-7 w-7"/>Vendor Payment Certificate
          </CardTitle>
          <CardDescription>Create a payment certificate for vendor/contractor work.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vendorId">Vendor/Contractor *</Label>
                <Select value={vendorId} onValueChange={setVendorId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {contractors?.map(contractor => (
                      <SelectItem key={contractor._id} value={contractor._id}>{contractor.companyName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="projectId">Project *</Label>
                <Select value={projectId} onValueChange={setProjectId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects?.map(project => (
                      <SelectItem key={project._id} value={project._id}>{project.projectName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="certificateNumber">Certificate Number</Label>
                <Input id="certificateNumber" value={certificateNumber} onChange={e => setCertificateNumber(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="invoiceReference">Invoice Reference</Label>
                <Input id="invoiceReference" value={invoiceReference} onChange={e => setInvoiceReference(e.target.value)} placeholder="e.g., INV-2025-001" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Work Period Start *</Label>
                <DatePicker date={workPeriodStart} setDate={setWorkPeriodStart} className="w-full" />
              </div>
              <div>
                <Label>Work Period End *</Label>
                <DatePicker date={workPeriodEnd} setDate={setWorkPeriodEnd} className="w-full" />
              </div>
            </div>

            <div>
              <Label htmlFor="paymentFor">Payment For (Work Description) *</Label>
              <Textarea id="paymentFor" value={paymentFor} onChange={e => setPaymentFor(e.target.value)} placeholder="Describe the work/milestone being paid for..." rows={3} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="paymentAmount">Payment Amount (USD) *</Label>
                <Input id="paymentAmount" type="number" step="0.01" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} placeholder="0.00" />
              </div>
              <div>
                <Label htmlFor="retentionAmount">Retention Amount (USD)</Label>
                <Input id="retentionAmount" type="number" step="0.01" value={retentionAmount} onChange={e => setRetentionAmount(e.target.value)} placeholder="0.00" />
              </div>
              <div>
                <Label>Net Payable</Label>
                <div className="h-10 flex items-center px-3 bg-green-50 border rounded-md text-green-700 font-bold">
                  ${netPayable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2 border-t pt-6">
            <Button type="button" variant="outline" onClick={() => navigate('/forms-documents')}>Cancel</Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</> : 'Submit Certificate'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );
};

export default VendorPaymentCertificatePage;
