import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { DatePicker } from '@/components/ui/date-picker.jsx';
import { Clock, Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast.jsx';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { format, startOfWeek, endOfWeek, addDays } from 'date-fns';

const TimesheetSubmissionFormPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const users = useQuery(api.admin.listUsers, {});
  const projects = useQuery(api.projects.listProjects, {});
  const createTimesheet = useMutation(api.timesheets.createTimesheet);

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 }); // Sunday

  const [projectId, setProjectId] = useState('');
  const [weekStartDate, setWeekStartDate] = useState(weekStart);
  const [entries, setEntries] = useState([
    { date: format(weekStart, 'yyyy-MM-dd'), hoursWorked: 8, taskDescription: '', overtime: 0 },
  ]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get first user as default (in real app, this would be the logged-in user)
  const currentUser = users?.[0];

  // Generate week dates
  const generateWeekEntries = () => {
    const newEntries = [];
    for (let i = 0; i < 7; i++) {
      const date = addDays(weekStartDate, i);
      newEntries.push({
        date: format(date, 'yyyy-MM-dd'),
        hoursWorked: i < 5 ? 8 : 0, // Default 8 hours for weekdays
        taskDescription: '',
        overtime: 0,
      });
    }
    setEntries(newEntries);
  };

  const addEntry = () => {
    setEntries([...entries, { date: '', hoursWorked: 0, taskDescription: '', overtime: 0 }]);
  };

  const removeEntry = (index) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const updateEntry = (index, field, value) => {
    const updated = [...entries];
    updated[index] = { ...updated[index], [field]: value };
    setEntries(updated);
  };

  const calculateTotals = () => {
    const totalRegular = entries.reduce((sum, e) => sum + (parseFloat(e.hoursWorked) || 0), 0);
    const totalOvertime = entries.reduce((sum, e) => sum + (parseFloat(e.overtime) || 0), 0);
    return { totalRegular, totalOvertime };
  };

  const { totalRegular, totalOvertime } = calculateTotals();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      toast({ variant: "destructive", title: "Error", description: "No user found. Please ensure users exist in the system." });
      return;
    }

    const validEntries = entries.filter(e => e.date && (e.hoursWorked > 0 || e.overtime > 0));
    if (validEntries.length === 0) {
      toast({ variant: "destructive", title: "Missing Entries", description: "Please add at least one timesheet entry." });
      return;
    }

    setIsSubmitting(true);
    try {
      await createTimesheet({
        userId: currentUser._id,
        projectId: projectId ? projectId : undefined,
        weekStartDate: format(weekStartDate, 'yyyy-MM-dd'),
        weekEndDate: format(endOfWeek(weekStartDate, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
        entries: validEntries.map(e => ({
          date: e.date,
          hoursWorked: parseFloat(e.hoursWorked) || 0,
          taskDescription: e.taskDescription || 'General work',
          overtime: parseFloat(e.overtime) || 0,
        })),
        notes: notes || undefined,
      });

      toast({ title: "Timesheet Submitted", description: "Your timesheet has been submitted for approval." });
      navigate('/forms-documents');
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to submit timesheet. Please try again." });
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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
      <Card className="shadow-xl border-t-4 border-indigo-600">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-indigo-700 flex items-center">
            <Clock className="mr-3 h-7 w-7"/>Weekly Timesheet Submission
          </CardTitle>
          <CardDescription>Submit your weekly work hours for approval.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Week Starting *</Label>
                <DatePicker date={weekStartDate} setDate={setWeekStartDate} className="w-full" />
              </div>
              <div>
                <Label htmlFor="projectId">Project (Optional)</Label>
                <Select value={projectId} onValueChange={setProjectId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">General</SelectItem>
                    {projects?.map(project => (
                      <SelectItem key={project._id} value={project._id}>{project.projectName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button type="button" variant="outline" onClick={generateWeekEntries} className="w-full">
                  Generate Week
                </Button>
              </div>
            </div>

            <Card className="p-4 bg-slate-50">
              <div className="flex justify-between items-center mb-4">
                <Label className="text-sm font-medium">Daily Entries</Label>
                <Button type="button" variant="outline" size="sm" onClick={addEntry}>
                  <PlusCircle className="mr-2 h-4 w-4" />Add Entry
                </Button>
              </div>
              <div className="space-y-3">
                {entries.map((entry, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-center p-2 bg-white rounded border">
                    <div className="col-span-3">
                      <Input type="date" value={entry.date} onChange={e => updateEntry(index, 'date', e.target.value)} className="text-sm" />
                    </div>
                    <div className="col-span-2">
                      <Input type="number" step="0.5" min="0" max="24" value={entry.hoursWorked} onChange={e => updateEntry(index, 'hoursWorked', e.target.value)} placeholder="Hours" className="text-sm" />
                    </div>
                    <div className="col-span-2">
                      <Input type="number" step="0.5" min="0" max="24" value={entry.overtime} onChange={e => updateEntry(index, 'overtime', e.target.value)} placeholder="OT" className="text-sm" />
                    </div>
                    <div className="col-span-4">
                      <Input value={entry.taskDescription} onChange={e => updateEntry(index, 'taskDescription', e.target.value)} placeholder="Task description" className="text-sm" />
                    </div>
                    <div className="col-span-1">
                      {entries.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeEntry(index)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t flex justify-end gap-6 text-sm">
                <span className="font-medium">Total Regular: <span className="text-indigo-600">{totalRegular.toFixed(1)} hrs</span></span>
                <span className="font-medium">Total Overtime: <span className="text-orange-600">{totalOvertime.toFixed(1)} hrs</span></span>
                <span className="font-medium">Grand Total: <span className="text-green-600">{(totalRegular + totalOvertime).toFixed(1)} hrs</span></span>
              </div>
            </Card>

            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any additional notes about this timesheet..." rows={2} />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2 border-t pt-6">
            <Button type="button" variant="outline" onClick={() => navigate('/forms-documents')}>Cancel</Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</> : 'Submit Timesheet'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );
};

export default TimesheetSubmissionFormPage;
