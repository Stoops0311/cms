import React, { useState } from 'react';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { Label } from '@/components/ui/label.jsx';
    import { Input } from '@/components/ui/input.jsx';
    import { Textarea } from '@/components/ui/textarea.jsx';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
    import { useToast } from '@/components/ui/use-toast.jsx';

    const requestCategories = ["Unforeseen Site Conditions", "Scope Change", "Material Price Increase", "Equipment Rental Overrun", "Additional Labor", "Other"];

    const BudgetRequestModal = ({ isOpen, onClose, onSubmit, projects }) => {
      const [projectId, setProjectId] = useState('');
      const [amountRequested, setAmountRequested] = useState('');
      const [category, setCategory] = useState(requestCategories[0]);
      const [justification, setJustification] = useState('');
      const [breakdown, setBreakdown] = useState('');
      const { toast } = useToast();

      const handleSubmit = () => {
        if (!projectId || !amountRequested || !justification) {
          toast({ variant: "destructive", title: "Missing Fields", description: "Project, amount, and justification are required."});
          return;
        }
        onSubmit({
          projectId,
          amountRequested: parseFloat(amountRequested),
          category,
          justification,
          breakdown,
          requestDate: new Date().toISOString()
        });
        toast({ title: "Budget Request Submitted", description: `Request of $${amountRequested} for ${projects.find(p=>p.id === projectId)?.projectName} submitted.`});
        onClose();
        // Reset form
        setProjectId(''); setAmountRequested(''); setCategory(requestCategories[0]); setJustification(''); setBreakdown('');
      };
      
      const projectOptions = projects || [];

      return (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar">
            <DialogHeader>
              <DialogTitle>Request Additional Budget</DialogTitle>
              <DialogDescription>Submit a request for additional funds for a project.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="projectId-budgetreq">Project</Label>
                <Select value={projectId} onValueChange={setProjectId}>
                  <SelectTrigger id="projectId-budgetreq"><SelectValue placeholder="Select Project" /></SelectTrigger>
                  <SelectContent>{projectOptions.map(p => <SelectItem key={p.id} value={p.id}>{p.projectName} (Current Budget: ${parseFloat(p.projectBudget || 0).toLocaleString()})</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label htmlFor="amountRequested">Amount Requested (USD)</Label><Input id="amountRequested" type="number" value={amountRequested} onChange={e => setAmountRequested(e.target.value)} placeholder="e.g., 5000" /></div>
              <div>
                <Label htmlFor="category-budgetreq">Reason/Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category-budgetreq"><SelectValue placeholder="Select Category" /></SelectTrigger>
                  <SelectContent>{requestCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label htmlFor="justification">Justification</Label><Textarea id="justification" value={justification} onChange={e => setJustification(e.target.value)} placeholder="Detailed reason for the additional budget..." /></div>
              <div><Label htmlFor="breakdown">Cost Breakdown (Optional)</Label><Textarea id="breakdown" value={breakdown} onChange={e => setBreakdown(e.target.value)} placeholder="e.g., Item 1: $X, Item 2: $Y..." /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={handleSubmit}>Submit Request</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    };

    export default BudgetRequestModal;