import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { DatePicker } from '@/components/ui/date-picker.jsx';
import { AlertTriangle, Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast.jsx';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { format } from 'date-fns';

const incidentTypes = [
  "Injury",
  "Near Miss",
  "Property Damage",
  "Environmental",
  "Security",
  "Vehicle Accident",
  "Equipment Failure",
  "Fire/Explosion",
  "Chemical Spill",
  "Other",
];

const severityLevels = [
  { value: "Minor", label: "Minor - No injury, minimal impact", color: "text-green-600" },
  { value: "Moderate", label: "Moderate - First aid needed, minor damage", color: "text-yellow-600" },
  { value: "Serious", label: "Serious - Medical treatment needed, significant damage", color: "text-orange-600" },
  { value: "Critical", label: "Critical - Life-threatening, major damage", color: "text-red-600" },
];

const IncidentReportFormPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const users = useQuery(api.admin.listUsers, {});
  const projects = useQuery(api.projects.listProjects, {});
  const createIncidentReport = useMutation(api.incidentReports.createIncidentReport);

  const [projectId, setProjectId] = useState('');
  const [location, setLocation] = useState('');
  const [incidentDate, setIncidentDate] = useState(new Date());
  const [incidentTime, setIncidentTime] = useState('');
  const [incidentType, setIncidentType] = useState('');
  const [severity, setSeverity] = useState('');
  const [description, setDescription] = useState('');
  const [personsInvolved, setPersonsInvolved] = useState(['']);
  const [witnesses, setWitnesses] = useState(['']);
  const [immediateActions, setImmediateActions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get first user as default reporter (in real app, this would be the logged-in user)
  const currentUser = users?.[0];

  const addPerson = () => setPersonsInvolved([...personsInvolved, '']);
  const removePerson = (index) => setPersonsInvolved(personsInvolved.filter((_, i) => i !== index));
  const updatePerson = (index, value) => {
    const updated = [...personsInvolved];
    updated[index] = value;
    setPersonsInvolved(updated);
  };

  const addWitness = () => setWitnesses([...witnesses, '']);
  const removeWitness = (index) => setWitnesses(witnesses.filter((_, i) => i !== index));
  const updateWitness = (index, value) => {
    const updated = [...witnesses];
    updated[index] = value;
    setWitnesses(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!location || !incidentTime || !incidentType || !severity || !description || !immediateActions) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Please fill in all required fields." });
      return;
    }

    if (!currentUser) {
      toast({ variant: "destructive", title: "Error", description: "No user found. Please ensure users exist in the system." });
      return;
    }

    const validPersons = personsInvolved.filter(p => p.trim());
    if (validPersons.length === 0) {
      toast({ variant: "destructive", title: "Missing Information", description: "Please add at least one person involved." });
      return;
    }

    setIsSubmitting(true);
    try {
      await createIncidentReport({
        projectId: projectId ? projectId : undefined,
        location,
        incidentDate: format(incidentDate, 'yyyy-MM-dd'),
        incidentTime,
        incidentType,
        severity,
        description,
        personsInvolved: validPersons,
        witnesses: witnesses.filter(w => w.trim()).length > 0 ? witnesses.filter(w => w.trim()) : undefined,
        immediateActions,
        reportedBy: currentUser._id,
      });

      toast({ title: "Incident Report Submitted", description: "Your incident report has been submitted and will be investigated." });
      navigate('/forms-documents');
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to submit incident report. Please try again." });
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
            <AlertTriangle className="mr-3 h-7 w-7"/>Incident Report Form
          </CardTitle>
          <CardDescription>Report safety incidents, near misses, or property damage.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="projectId">Related Project</Label>
                <Select value={projectId} onValueChange={setProjectId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project if applicable" />
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
                <Label htmlFor="location">Location *</Label>
                <Input id="location" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g., Site B - Block 3" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Incident Date *</Label>
                <DatePicker date={incidentDate} setDate={setIncidentDate} className="w-full" />
              </div>
              <div>
                <Label htmlFor="incidentTime">Incident Time *</Label>
                <Input id="incidentTime" type="time" value={incidentTime} onChange={e => setIncidentTime(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="incidentType">Incident Type *</Label>
                <Select value={incidentType} onValueChange={setIncidentType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {incidentTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="severity">Severity Level *</Label>
              <Select value={severity} onValueChange={setSeverity}>
                <SelectTrigger>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  {severityLevels.map(level => (
                    <SelectItem key={level.value} value={level.value}>
                      <span className={level.color}>{level.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Incident Description *</Label>
              <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe what happened, including events leading up to the incident..." rows={4} />
            </div>

            <Card className="p-4 bg-slate-50">
              <Label className="text-sm font-medium">Persons Involved *</Label>
              <div className="space-y-2 mt-2">
                {personsInvolved.map((person, index) => (
                  <div key={index} className="flex gap-2">
                    <Input value={person} onChange={e => updatePerson(index, e.target.value)} placeholder="Full name" className="flex-1" />
                    {personsInvolved.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => removePerson(index)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addPerson}>
                  <PlusCircle className="mr-2 h-4 w-4" />Add Person
                </Button>
              </div>
            </Card>

            <Card className="p-4 bg-slate-50">
              <Label className="text-sm font-medium">Witnesses (Optional)</Label>
              <div className="space-y-2 mt-2">
                {witnesses.map((witness, index) => (
                  <div key={index} className="flex gap-2">
                    <Input value={witness} onChange={e => updateWitness(index, e.target.value)} placeholder="Witness name" className="flex-1" />
                    {witnesses.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeWitness(index)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addWitness}>
                  <PlusCircle className="mr-2 h-4 w-4" />Add Witness
                </Button>
              </div>
            </Card>

            <div>
              <Label htmlFor="immediateActions">Immediate Actions Taken *</Label>
              <Textarea id="immediateActions" value={immediateActions} onChange={e => setImmediateActions(e.target.value)} placeholder="Describe any immediate actions taken to address the incident..." rows={3} />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2 border-t pt-6">
            <Button type="button" variant="outline" onClick={() => navigate('/forms-documents')}>Cancel</Button>
            <Button type="submit" className="bg-red-600 hover:bg-red-700" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</> : 'Submit Report'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );
};

export default IncidentReportFormPage;
