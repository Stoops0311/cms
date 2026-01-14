import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { DatePicker } from '@/components/ui/date-picker.jsx';
import { Stethoscope, Loader2, Upload } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast.jsx';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { format } from 'date-fns';

const MedicalPrescriptionUploadPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const users = useQuery(api.admin.listUsers, {});
  const createHRDocument = useMutation(api.hrDocuments.createHRDocument);

  const [employeeId, setEmployeeId] = useState('');
  const [prescriptionDate, setPrescriptionDate] = useState(new Date());
  const [doctorName, setDoctorName] = useState('');
  const [hospitalClinic, setHospitalClinic] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [sickLeaveDays, setSickLeaveDays] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get first user as default (in real app, this would be the logged-in user)
  const currentUser = users?.[0];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!employeeId || !doctorName) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Please fill in all required fields." });
      return;
    }

    if (!currentUser) {
      toast({ variant: "destructive", title: "Error", description: "No user found. Please ensure users exist in the system." });
      return;
    }

    setIsSubmitting(true);
    try {
      await createHRDocument({
        userId: employeeId,
        documentType: "Medical Prescription",
        documentNumber: `RX-${Date.now()}`,
        expiryDate: format(prescriptionDate, 'yyyy-MM-dd'),
        notes: `Doctor: ${doctorName}\nHospital/Clinic: ${hospitalClinic || 'N/A'}\nDiagnosis: ${diagnosis || 'N/A'}\nSick Leave Days: ${sickLeaveDays || 'N/A'}\n${notes || ''}`,
        createdBy: currentUser._id,
      });

      toast({ title: "Prescription Uploaded", description: "Medical prescription has been recorded." });
      navigate('/forms-documents');
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to upload prescription. Please try again." });
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
      <Card className="shadow-xl border-t-4 border-red-600">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-red-700 flex items-center">
            <Stethoscope className="mr-3 h-7 w-7"/>Medical Prescription Upload
          </CardTitle>
          <CardDescription>Upload medical prescriptions and sick leave documentation.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="employeeId">Employee *</Label>
              <Select value={employeeId} onValueChange={setEmployeeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {users?.map(user => (
                    <SelectItem key={user._id} value={user._id}>{user.fullName} ({user.email})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Prescription Date *</Label>
                <DatePicker date={prescriptionDate} setDate={setPrescriptionDate} className="w-full" />
              </div>
              <div>
                <Label htmlFor="sickLeaveDays">Sick Leave Days (if applicable)</Label>
                <Input id="sickLeaveDays" type="number" min="0" value={sickLeaveDays} onChange={e => setSickLeaveDays(e.target.value)} placeholder="Number of days" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="doctorName">Doctor Name *</Label>
                <Input id="doctorName" value={doctorName} onChange={e => setDoctorName(e.target.value)} placeholder="Dr. Name" />
              </div>
              <div>
                <Label htmlFor="hospitalClinic">Hospital/Clinic</Label>
                <Input id="hospitalClinic" value={hospitalClinic} onChange={e => setHospitalClinic(e.target.value)} placeholder="Hospital or clinic name" />
              </div>
            </div>

            <div>
              <Label htmlFor="diagnosis">Diagnosis/Condition</Label>
              <Textarea id="diagnosis" value={diagnosis} onChange={e => setDiagnosis(e.target.value)} placeholder="Brief description of diagnosis or medical condition..." rows={2} />
            </div>

            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <Upload className="h-5 w-5 text-red-600" />
                <Label className="text-red-700 font-medium">Upload Prescription Document</Label>
              </div>
              <Input type="file" accept="image/*,.pdf" className="cursor-pointer" />
              <p className="text-xs text-muted-foreground mt-1">Accepted formats: JPG, PNG, PDF (max 5MB)</p>
            </div>

            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any additional information..." rows={2} />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2 border-t pt-6">
            <Button type="button" variant="outline" onClick={() => navigate('/forms-documents')}>Cancel</Button>
            <Button type="submit" className="bg-red-600 hover:bg-red-700" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Uploading...</> : 'Upload Prescription'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );
};

export default MedicalPrescriptionUploadPage;
