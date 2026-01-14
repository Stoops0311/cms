import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { GraduationCap, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast.jsx';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';

const trainingTypes = [
  { value: "General", label: "General Training" },
  { value: "Fiber", label: "Fiber Optic Training" },
  { value: "Engineering", label: "Engineering Training" },
  { value: "Telecom", label: "Telecom Training" },
  { value: "Civil Engineering", label: "Civil Engineering Training" },
];

const departments = ["Engineering", "Operations", "HR", "Finance", "IT", "Safety", "Quality", "Procurement"];

const TrainingRequestFormPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine default training type from route
  const getDefaultTrainingType = () => {
    const path = location.pathname;
    if (path.includes('fiber')) return 'Fiber';
    if (path.includes('eng-training')) return 'Engineering';
    if (path.includes('telecom')) return 'Telecom';
    if (path.includes('civil-eng')) return 'Civil Engineering';
    return 'General';
  };

  const users = useQuery(api.admin.listUsers, {});
  const createTrainingRequest = useMutation(api.trainingRequests.createTrainingRequest);

  const [trainingType, setTrainingType] = useState(getDefaultTrainingType());
  const [employeeName, setEmployeeName] = useState('');
  const [department, setDepartment] = useState('');
  const [trainingTitle, setTrainingTitle] = useState('');
  const [trainingProvider, setTrainingProvider] = useState('');
  const [justification, setJustification] = useState('');
  const [preferredDates, setPreferredDates] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get first user as default requester (in real app, this would be the logged-in user)
  const currentUser = users?.[0];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!employeeName || !department || !trainingTitle || !justification) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Please fill in all required fields." });
      return;
    }

    if (!currentUser) {
      toast({ variant: "destructive", title: "Error", description: "No user found. Please ensure users exist in the system." });
      return;
    }

    setIsSubmitting(true);
    try {
      await createTrainingRequest({
        trainingType,
        requestedBy: currentUser._id,
        employeeName,
        department,
        trainingTitle,
        trainingProvider: trainingProvider || undefined,
        justification,
        preferredDates: preferredDates || undefined,
        estimatedCost: estimatedCost ? parseFloat(estimatedCost) : undefined,
        notes: notes || undefined,
      });

      toast({ title: "Training Request Submitted", description: `Your ${trainingType} training request has been submitted for approval.` });
      navigate('/forms-documents');
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to submit training request. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!users) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto">
      <Card className="shadow-xl border-t-4 border-emerald-600">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-emerald-700 flex items-center">
            <GraduationCap className="mr-3 h-7 w-7"/>Training Request Form
          </CardTitle>
          <CardDescription>Submit a request for training or professional development.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="trainingType">Training Type *</Label>
                <Select value={trainingType} onValueChange={setTrainingType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select training type" />
                  </SelectTrigger>
                  <SelectContent>
                    {trainingTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="employeeName">Employee Name *</Label>
                <Input id="employeeName" value={employeeName} onChange={e => setEmployeeName(e.target.value)} placeholder="Your full name" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="department">Department *</Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="trainingTitle">Training Title/Course *</Label>
                <Input id="trainingTitle" value={trainingTitle} onChange={e => setTrainingTitle(e.target.value)} placeholder="e.g., Advanced Fiber Splicing" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="trainingProvider">Training Provider</Label>
                <Input id="trainingProvider" value={trainingProvider} onChange={e => setTrainingProvider(e.target.value)} placeholder="e.g., BICSI, Corning, etc." />
              </div>
              <div>
                <Label htmlFor="preferredDates">Preferred Dates</Label>
                <Input id="preferredDates" value={preferredDates} onChange={e => setPreferredDates(e.target.value)} placeholder="e.g., March 15-17, 2025" />
              </div>
            </div>

            <div>
              <Label htmlFor="estimatedCost">Estimated Cost (USD)</Label>
              <Input id="estimatedCost" type="number" step="0.01" value={estimatedCost} onChange={e => setEstimatedCost(e.target.value)} placeholder="e.g., 1500.00" />
            </div>

            <div>
              <Label htmlFor="justification">Justification / Business Need *</Label>
              <Textarea id="justification" value={justification} onChange={e => setJustification(e.target.value)} placeholder="Explain why this training is needed and how it will benefit the organization..." rows={4} />
            </div>

            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any additional information or special requirements..." rows={2} />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2 border-t pt-6">
            <Button type="button" variant="outline" onClick={() => navigate('/forms-documents')}>Cancel</Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</> : 'Submit Request'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );
};

export default TrainingRequestFormPage;
