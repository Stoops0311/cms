import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { DollarSign, Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast.jsx';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';

const BudgetRevisionRequestPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const users = useQuery(api.admin.listUsers, {});
  const projects = useQuery(api.projects.listProjects, {});
  const createBudgetRevision = useMutation(api.budgetRevisions.createBudgetRevision);

  const [projectId, setProjectId] = useState('');
  const [currentBudget, setCurrentBudget] = useState('');
  const [proposedBudget, setProposedBudget] = useState('');
  const [reason, setReason] = useState('');
  const [impactAnalysis, setImpactAnalysis] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get first user as default (in real app, this would be the logged-in user)
  const currentUser = users?.[0];

  // Auto-populate current budget when project is selected
  const selectedProject = projects?.find(p => p._id === projectId);
  useEffect(() => {
    if (selectedProject) {
      setCurrentBudget(selectedProject.budgetAllocation || '0');
    }
  }, [selectedProject]);

  const revisionAmount = proposedBudget && currentBudget
    ? parseFloat(proposedBudget) - parseFloat(currentBudget)
    : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!projectId || !proposedBudget || !reason) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Please fill in all required fields." });
      return;
    }

    if (!currentUser) {
      toast({ variant: "destructive", title: "Error", description: "No user found. Please ensure users exist in the system." });
      return;
    }

    if (parseFloat(proposedBudget) === parseFloat(currentBudget)) {
      toast({ variant: "destructive", title: "No Change", description: "Proposed budget is the same as current budget." });
      return;
    }

    setIsSubmitting(true);
    try {
      await createBudgetRevision({
        projectId,
        requestedBy: currentUser._id,
        currentBudget: parseFloat(currentBudget),
        proposedBudget: parseFloat(proposedBudget),
        reason,
        impactAnalysis: impactAnalysis || undefined,
      });

      toast({ title: "Budget Revision Submitted", description: "Your budget revision request has been submitted for approval." });
      navigate('/forms-documents');
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to submit budget revision. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!users || !projects) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto">
      <Card className="shadow-xl border-t-4 border-amber-600">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-amber-700 flex items-center">
            <DollarSign className="mr-3 h-7 w-7"/>Budget Revision Request
          </CardTitle>
          <CardDescription>Request a change to project budget allocation.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="projectId">Select Project *</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects?.map(project => (
                    <SelectItem key={project._id} value={project._id}>
                      {project.projectName} ({project.currency} {parseFloat(project.budgetAllocation).toLocaleString()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedProject && (
              <div className="p-4 bg-amber-50 rounded-lg">
                <h4 className="font-medium text-amber-800 mb-2">Project Details</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p><strong>Status:</strong> {selectedProject.projectStatus}</p>
                  <p><strong>Currency:</strong> {selectedProject.currency}</p>
                  <p><strong>Location:</strong> {selectedProject.location}</p>
                  <p><strong>Current Budget:</strong> {parseFloat(selectedProject.budgetAllocation).toLocaleString()}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="currentBudget">Current Budget *</Label>
                <Input id="currentBudget" type="number" step="0.01" value={currentBudget} onChange={e => setCurrentBudget(e.target.value)} placeholder="Current budget amount" disabled={!!selectedProject} />
              </div>
              <div>
                <Label htmlFor="proposedBudget">Proposed Budget *</Label>
                <Input id="proposedBudget" type="number" step="0.01" value={proposedBudget} onChange={e => setProposedBudget(e.target.value)} placeholder="New budget amount" />
              </div>
            </div>

            {revisionAmount !== 0 && (
              <div className={`p-4 rounded-lg flex items-center gap-3 ${revisionAmount > 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                {revisionAmount > 0 ? (
                  <TrendingUp className="h-6 w-6 text-green-600" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-red-600" />
                )}
                <div>
                  <p className={`font-medium ${revisionAmount > 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {revisionAmount > 0 ? 'Budget Increase' : 'Budget Decrease'}
                  </p>
                  <p className="text-lg font-bold">
                    {revisionAmount > 0 ? '+' : ''}{revisionAmount.toLocaleString()} ({selectedProject?.currency || 'USD'})
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {currentBudget && ((Math.abs(revisionAmount) / parseFloat(currentBudget)) * 100).toFixed(1)}% change
                  </p>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="reason">Reason for Revision *</Label>
              <Textarea id="reason" value={reason} onChange={e => setReason(e.target.value)} placeholder="Explain why this budget revision is needed..." rows={4} />
            </div>

            <div>
              <Label htmlFor="impactAnalysis">Impact Analysis</Label>
              <Textarea id="impactAnalysis" value={impactAnalysis} onChange={e => setImpactAnalysis(e.target.value)} placeholder="Describe the impact of this budget change on project timeline, resources, deliverables..." rows={3} />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2 border-t pt-6">
            <Button type="button" variant="outline" onClick={() => navigate('/forms-documents')}>Cancel</Button>
            <Button type="submit" className="bg-amber-600 hover:bg-amber-700" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</> : 'Submit Request'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );
};

export default BudgetRevisionRequestPage;
