import React, { useState } from 'react';
    import { motion } from 'framer-motion';
    import { CardTitle } from '@/components/ui/card.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { Input } from '@/components/ui/input.jsx';
    import { Textarea } from '@/components/ui/textarea.jsx';
    import { DatePicker } from '@/components/ui/date-picker.jsx';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
    import { PlusCircle, MessageSquare, User, CalendarDays } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast.jsx';
    import { format } from 'date-fns';

    const LogEntryForm = ({ onSubmit, onCancel }) => {
      const [date, setDate] = useState(new Date());
      const [type, setType] = useState('Meeting');
      const [participants, setParticipants] = useState('');
      const [summary, setSummary] = useState('');
      const { toast } = useToast();

      const handleSubmit = (e) => {
        e.preventDefault();
        if (!summary || !participants) {
          toast({ variant: "destructive", title: "Participants and summary are required." });
          return;
        }
        onSubmit({ 
          id: `LOG-${Date.now()}`, 
          date: date.toISOString(), 
          type, 
          participants, 
          summary 
        });
        setDate(new Date()); setType('Meeting'); setParticipants(''); setSummary('');
      };

      return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-slate-50 mb-6">
          <DatePicker date={date} setDate={setDate} placeholder="Log Date" />
          <Select value={type} onValueChange={setType}>
            <SelectTrigger><SelectValue placeholder="Communication Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Meeting">Meeting Minutes</SelectItem>
              <SelectItem value="Email">Email Summary</SelectItem>
              <SelectItem value="Call">Phone Call Log</SelectItem>
              <SelectItem value="SiteInstruction">Site Instruction</SelectItem>
              <SelectItem value="ClientFeedback">Client Feedback</SelectItem>
            </SelectContent>
          </Select>
          <Input placeholder="Participants (e.g., John Doe, Jane Smith)" value={participants} onChange={(e) => setParticipants(e.target.value)} />
          <Textarea placeholder="Summary / Key Points / Decisions*" value={summary} onChange={(e) => setSummary(e.target.value)} rows={4} />
          <div className="flex justify-end space-x-2">
            {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
            <Button type="submit">Add Log Entry</Button>
          </div>
        </form>
      );
    };

    const ProjectCommunicationTab = ({ project, updateProjectData }) => {
      const [showForm, setShowForm] = useState(false);
      const { toast } = useToast();
      const communicationLog = project.communicationLog || [];

      const handleAddLogEntry = (logEntry) => {
        const newLog = [...communicationLog, logEntry];
        updateProjectData({ communicationLog: newLog });
        toast({ title: "Log Entry Added", description: `Communication on ${format(new Date(logEntry.date), 'PPP')} recorded.` });
        setShowForm(false);
      };
      
      // Placeholder for edit/delete if needed later

      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <div className="flex justify-between items-center mb-6">
            <CardTitle className="text-xl font-semibold text-gray-700">Communication Log</CardTitle>
            <Button onClick={() => setShowForm(!showForm)} variant={showForm ? "outline" : "default"}>
              <PlusCircle className="mr-2 h-4 w-4" /> {showForm ? "Cancel" : "Add New Log Entry"}
            </Button>
          </div>

          {showForm && <LogEntryForm onSubmit={handleAddLogEntry} onCancel={() => setShowForm(false)} />}

          {communicationLog.length === 0 && !showForm ? (
            <p className="text-muted-foreground text-center py-8">No communication logs recorded yet.</p>
          ) : (
            <div className="space-y-6">
              {communicationLog.sort((a,b) => new Date(b.date) - new Date(a.date)).map(log => (
                <div key={log.id} className="p-4 border rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-primary text-lg">{log.type}</h3>
                    <span className="text-xs text-muted-foreground flex items-center">
                      <CalendarDays className="mr-1 h-3 w-3" /> {format(new Date(log.date), 'PPP, p')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1 flex items-center">
                    <User className="mr-2 h-4 w-4 text-gray-400" /> <strong>Participants:</strong> {log.participants}
                  </p>
                  <div className="prose prose-sm max-w-none p-3 bg-slate-50 rounded">
                     <p className="font-medium text-gray-700">Summary:</p>
                     <p className="text-gray-600 whitespace-pre-wrap">{log.summary}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      );
    };

    export default ProjectCommunicationTab;