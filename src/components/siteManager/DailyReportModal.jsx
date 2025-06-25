import React, { useState } from 'react';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { Label } from '@/components/ui/label.jsx';
    import { Input } from '@/components/ui/input.jsx';
    import { Textarea } from '@/components/ui/textarea.jsx';
    import { DatePicker } from '@/components/ui/date-picker.jsx';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
    import { useToast } from '@/components/ui/use-toast.jsx';

    const DailyReportModal = ({ isOpen, onClose, onSubmit, projects }) => {
      const [reportDate, setReportDate] = useState(new Date());
      const [projectId, setProjectId] = useState('');
      const [weather, setWeather] = useState('');
      const [workAccomplished, setWorkAccomplished] = useState('');
      const [manpowerCount, setManpowerCount] = useState('');
      const [equipmentUsed, setEquipmentUsed] = useState('');
      const [safetyObservations, setSafetyObservations] = useState('');
      const [issuesEncountered, setIssuesEncountered] = useState('');
      const { toast } = useToast();

      const handleSubmit = () => {
        if (!projectId || !workAccomplished) {
          toast({ variant: "destructive", title: "Missing Fields", description: "Project and Work Accomplished are required."});
          return;
        }
        onSubmit({
          reportDate: reportDate.toISOString(), projectId, weather, workAccomplished, 
          manpowerCount: parseInt(manpowerCount) || 0, 
          equipmentUsed, safetyObservations, issuesEncountered
        });
        toast({ title: "Daily Report Submitted", description: `Report for ${projects.find(p=>p.id === projectId)?.projectName} on ${reportDate.toLocaleDateString()}`});
        onClose(); // Reset form or clear fields if needed
        setProjectId(''); setWeather(''); setWorkAccomplished(''); setManpowerCount(''); setEquipmentUsed(''); setSafetyObservations(''); setIssuesEncountered('');
      };
      
      const projectOptions = projects || [];

      return (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar">
            <DialogHeader>
              <DialogTitle>Create Daily Report</DialogTitle>
              <DialogDescription>Log activities and progress for the selected project and date.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div><Label htmlFor="reportDate">Report Date</Label><DatePicker id="reportDate" date={reportDate} setDate={setReportDate} /></div>
              <div>
                <Label htmlFor="projectId-dailyreport">Project</Label>
                <Select value={projectId} onValueChange={setProjectId}>
                  <SelectTrigger id="projectId-dailyreport"><SelectValue placeholder="Select Project" /></SelectTrigger>
                  <SelectContent>{projectOptions.map(p => <SelectItem key={p.id} value={p.id}>{p.projectName} ({p.projectCode})</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label htmlFor="weather">Weather Conditions</Label><Input id="weather" value={weather} onChange={e => setWeather(e.target.value)} placeholder="e.g., Sunny, 25°C, Light breeze" /></div>
              <div><Label htmlFor="workAccomplished">Work Accomplished</Label><Textarea id="workAccomplished" value={workAccomplished} onChange={e => setWorkAccomplished(e.target.value)} placeholder="Detail tasks completed, progress made..." /></div>
              <div><Label htmlFor="manpowerCount">Manpower on Site (Count)</Label><Input id="manpowerCount" type="number" value={manpowerCount} onChange={e => setManpowerCount(e.target.value)} placeholder="e.g., 25" /></div>
              <div><Label htmlFor="equipmentUsed">Equipment Used</Label><Textarea id="equipmentUsed" value={equipmentUsed} onChange={e => setEquipmentUsed(e.target.value)} placeholder="List equipment and hours, e.g., Excavator (8hrs), Crane (4hrs)" /></div>
              <div><Label htmlFor="safetyObservations">Safety Observations/Incidents</Label><Textarea id="safetyObservations" value={safetyObservations} onChange={e => setSafetyObservations(e.target.value)} placeholder="Toolbox talks, near misses, incidents, positive observations..." /></div>
              <div><Label htmlFor="issuesEncountered">Issues/Delays Encountered</Label><Textarea id="issuesEncountered" value={issuesEncountered} onChange={e => setIssuesEncountered(e.target.value)} placeholder="Any challenges, delays, or issues faced today..." /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={handleSubmit}>Submit Report</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    };

    export default DailyReportModal;