import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { DatePicker } from '@/components/ui/date-picker.jsx';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast.jsx';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { format } from 'date-fns';

const qualityRatings = ["Excellent", "Good", "Satisfactory", "Needs Improvement"];

const VendorCompletionCertificatePage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const users = useQuery(api.admin.listUsers, {});
  const projects = useQuery(api.projects.listProjects, {});
  const contractors = useQuery(api.contractors.listContractors, {});
  const createVendorCompletion = useMutation(api.vendorCompletions.createVendorCompletion);

  const [vendorId, setVendorId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [certificateNumber, setCertificateNumber] = useState(`WCC-${Date.now()}`);
  const [workDescription, setWorkDescription] = useState('');
  const [completionDate, setCompletionDate] = useState(new Date());
  const [qualityRating, setQualityRating] = useState('');
  const [defectsNoted, setDefectsNoted] = useState('');
  const [warrantyPeriod, setWarrantyPeriod] = useState('');
  const [clientRepresentative, setClientRepresentative] = useState('');
  const [contractorRepresentative, setContractorRepresentative] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get first user as default (in real app, this would be the logged-in user)
  const currentUser = users?.[0];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!vendorId || !projectId || !workDescription || !clientRepresentative || !contractorRepresentative) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Please fill in all required fields." });
      return;
    }

    if (!currentUser) {
      toast({ variant: "destructive", title: "Error", description: "No user found. Please ensure users exist in the system." });
      return;
    }

    setIsSubmitting(true);
    try {
      await createVendorCompletion({
        vendorId,
        projectId,
        certificateNumber,
        workDescription,
        completionDate: format(completionDate, 'yyyy-MM-dd'),
        qualityRating: qualityRating || undefined,
        defectsNoted: defectsNoted || undefined,
        warrantyPeriod: warrantyPeriod || undefined,
        clientRepresentative,
        contractorRepresentative,
        createdBy: currentUser._id,
      });

      toast({ title: "Completion Certificate Submitted", description: `Certificate ${certificateNumber} has been submitted for review.` });
      navigate('/forms-documents');
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to submit completion certificate. Please try again." });
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
      <Card className="shadow-xl border-t-4 border-teal-600">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-teal-700 flex items-center">
            <CheckCircle className="mr-3 h-7 w-7"/>Vendor Work Completion Certificate
          </CardTitle>
          <CardDescription>Document completion of vendor/contractor work.</CardDescription>
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
                <Label>Completion Date *</Label>
                <DatePicker date={completionDate} setDate={setCompletionDate} className="w-full" />
              </div>
            </div>

            <div>
              <Label htmlFor="workDescription">Work Description *</Label>
              <Textarea id="workDescription" value={workDescription} onChange={e => setWorkDescription(e.target.value)} placeholder="Describe the completed work in detail..." rows={4} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="qualityRating">Quality Rating</Label>
                <Select value={qualityRating} onValueChange={setQualityRating}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select rating" />
                  </SelectTrigger>
                  <SelectContent>
                    {qualityRatings.map(rating => (
                      <SelectItem key={rating} value={rating}>{rating}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="warrantyPeriod">Warranty Period</Label>
                <Input id="warrantyPeriod" value={warrantyPeriod} onChange={e => setWarrantyPeriod(e.target.value)} placeholder="e.g., 12 months" />
              </div>
            </div>

            <div>
              <Label htmlFor="defectsNoted">Defects Noted (if any)</Label>
              <Textarea id="defectsNoted" value={defectsNoted} onChange={e => setDefectsNoted(e.target.value)} placeholder="List any defects or issues noted..." rows={2} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientRepresentative">Client Representative *</Label>
                <Input id="clientRepresentative" value={clientRepresentative} onChange={e => setClientRepresentative(e.target.value)} placeholder="Name of client representative" />
              </div>
              <div>
                <Label htmlFor="contractorRepresentative">Contractor Representative *</Label>
                <Input id="contractorRepresentative" value={contractorRepresentative} onChange={e => setContractorRepresentative(e.target.value)} placeholder="Name of contractor representative" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2 border-t pt-6">
            <Button type="button" variant="outline" onClick={() => navigate('/forms-documents')}>Cancel</Button>
            <Button type="submit" className="bg-teal-600 hover:bg-teal-700" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</> : 'Submit Certificate'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );
};

export default VendorCompletionCertificatePage;
