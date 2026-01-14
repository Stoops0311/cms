import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { DatePicker } from '@/components/ui/date-picker.jsx';
import { FileText, Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast.jsx';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { format } from 'date-fns';

const weatherOptions = ["Sunny", "Cloudy", "Rainy", "Windy", "Stormy", "Hot", "Cold"];

const DPRSubmissionFormPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const users = useQuery(api.admin.listUsers, {});
  const projects = useQuery(api.projects.listProjects, {});
  const createDailyLog = useMutation(api.dailyLogs.createDailyLog);

  const [projectId, setProjectId] = useState('');
  const [date, setDate] = useState(new Date());
  const [weather, setWeather] = useState('');
  const [workCompleted, setWorkCompleted] = useState('');
  const [issues, setIssues] = useState('');
  const [safetyIncidents, setSafetyIncidents] = useState('');
  const [manpowerCount, setManpowerCount] = useState('');
  const [equipmentUsed, setEquipmentUsed] = useState(['']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get first user as default (in real app, this would be the logged-in user)
  const currentUser = users?.[0];

  const addEquipment = () => setEquipmentUsed([...equipmentUsed, '']);
  const removeEquipment = (index) => setEquipmentUsed(equipmentUsed.filter((_, i) => i !== index));
  const updateEquipment = (index, value) => {
    const updated = [...equipmentUsed];
    updated[index] = value;
    setEquipmentUsed(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!projectId || !weather || !workCompleted || !manpowerCount) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Please fill in all required fields." });
      return;
    }

    if (!currentUser) {
      toast({ variant: "destructive", title: "Error", description: "No user found. Please ensure users exist in the system." });
      return;
    }

    setIsSubmitting(true);
    try {
      await createDailyLog({
        projectId,
        date: format(date, 'yyyy-MM-dd'),
        weather,
        workCompleted,
        issues: issues || 'None reported',
        safetyIncidents: safetyIncidents || 'None reported',
        manpowerCount: parseInt(manpowerCount),
        equipmentUsed: equipmentUsed.filter(e => e.trim()),
        materialsUsed: [],
        createdBy: currentUser._id,
        photos: [],
      });

      toast({ title: "DPR Submitted", description: "Your Daily Progress Report has been submitted successfully." });
      navigate('/forms-documents');
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to submit DPR. Please try again." });
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
      <Card className="shadow-xl border-t-4 border-cyan-600">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-cyan-700 flex items-center">
            <FileText className="mr-3 h-7 w-7"/>Daily Progress Report (DPR)
          </CardTitle>
          <CardDescription>Submit your daily site progress report.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <div>
                <Label>Report Date *</Label>
                <DatePicker date={date} setDate={setDate} className="w-full" />
              </div>
              <div>
                <Label htmlFor="weather">Weather *</Label>
                <Select value={weather} onValueChange={setWeather}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select weather" />
                  </SelectTrigger>
                  <SelectContent>
                    {weatherOptions.map(w => (
                      <SelectItem key={w} value={w}>{w}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="manpowerCount">Manpower Count *</Label>
              <Input id="manpowerCount" type="number" min="0" value={manpowerCount} onChange={e => setManpowerCount(e.target.value)} placeholder="Total workers on site" />
            </div>

            <div>
              <Label htmlFor="workCompleted">Work Completed *</Label>
              <Textarea id="workCompleted" value={workCompleted} onChange={e => setWorkCompleted(e.target.value)} placeholder="Describe the work completed today..." rows={4} />
            </div>

            <div>
              <Label htmlFor="issues">Issues / Challenges</Label>
              <Textarea id="issues" value={issues} onChange={e => setIssues(e.target.value)} placeholder="Any issues or challenges encountered..." rows={3} />
            </div>

            <div>
              <Label htmlFor="safetyIncidents">Safety Incidents</Label>
              <Textarea id="safetyIncidents" value={safetyIncidents} onChange={e => setSafetyIncidents(e.target.value)} placeholder="Report any safety incidents or near misses..." rows={2} />
            </div>

            <Card className="p-4 bg-slate-50">
              <Label className="text-sm font-medium">Equipment Used</Label>
              <div className="space-y-2 mt-2">
                {equipmentUsed.map((equipment, index) => (
                  <div key={index} className="flex gap-2">
                    <Input value={equipment} onChange={e => updateEquipment(index, e.target.value)} placeholder="Equipment name/ID" className="flex-1" />
                    {equipmentUsed.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeEquipment(index)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addEquipment}>
                  <PlusCircle className="mr-2 h-4 w-4" />Add Equipment
                </Button>
              </div>
            </Card>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2 border-t pt-6">
            <Button type="button" variant="outline" onClick={() => navigate('/forms-documents')}>Cancel</Button>
            <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</> : 'Submit DPR'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );
};

export default DPRSubmissionFormPage;
