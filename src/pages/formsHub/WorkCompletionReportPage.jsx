import React, { useState } from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { Input } from '@/components/ui/input.jsx';
    import { Label } from '@/components/ui/label.jsx';
    import { Textarea } from '@/components/ui/textarea.jsx';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
    import { DatePicker } from '@/components/ui/date-picker.jsx';
    import { CheckSquare, CalendarDays, User, Percent, FileText, PlusCircle, Trash2, UploadCloud, Paperclip } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast.jsx';
    import useLocalStorage from '@/hooks/useLocalStorage.jsx';
    import { motion } from 'framer-motion';
    import { useNavigate } from 'react-router-dom';

    const WorkCompletionReportPage = () => {
        const { toast } = useToast();
        const navigate = useNavigate();
        const [projects] = useLocalStorage('projects', []);
        const [completionReports, setCompletionReports] = useLocalStorage('cmsWorkCompletionReports', []);

        const [reportDate, setReportDate] = useState(new Date());
        const [projectId, setProjectId] = useState('');
        const [taskActivity, setTaskActivity] = useState('');
        const [dateCompleted, setDateCompleted] = useState(new Date());
        const [supervisor, setSupervisor] = useState('');
        const [percentageComplete, setPercentageComplete] = useState('100');
        const [qualityRemarks, setQualityRemarks] = useState('');
        const [challengesFaced, setChallengesFaced] = useState('');
        const [attachments, setAttachments] = useState([]);

        const handleFileChange = (event) => {
            if (event.target.files) {
              const newFiles = Array.from(event.target.files).map(file => ({ name: file.name, type: file.type, size: file.size, id: `FILE-${Date.now()}-${Math.random().toString(36).substr(2,5)}`}));
              setAttachments(prev => [...prev, ...newFiles].slice(0, 3)); 
              if (attachments.length + newFiles.length > 3) { toast({variant: "warning", title: "File Limit", description: "Max 3 attachments."}) }
            }
        };
        const removeAttachment = (id) => setAttachments(attachments.filter(file => file.id !== id));

        const handleSubmit = (e) => {
            e.preventDefault();
            if (!projectId || !taskActivity || !supervisor) {
                toast({ variant: "destructive", title: "Missing Fields", description: "Project, Task/Activity, and Supervisor are required." });
                return;
            }
            const newReport = {
                id: `WCR-${Date.now()}`,
                reportDate: reportDate.toISOString(), projectId, taskActivity, dateCompleted: dateCompleted.toISOString(),
                supervisor, percentageComplete: parseInt(percentageComplete), qualityRemarks, challengesFaced,
                attachments: attachments.map(f => ({ name: f.name, type: f.type, size: f.size, id: f.id })), // Store simplified file info
            };
            setCompletionReports([...completionReports, newReport]);
            toast({ title: "Work Completion Report Submitted", description: `Report ID: ${newReport.id}` });
            navigate('/forms-documents');
        };

        return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto">
                <Card className="shadow-xl border-t-4 border-blue-600">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-blue-700 flex items-center"><CheckSquare className="mr-3 h-7 w-7"/>Work Completion Report</CardTitle>
                        <CardDescription>Document completed tasks, activities, or project milestones.</CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><Label htmlFor="reportDate">Report Date</Label><DatePicker id="reportDate" date={reportDate} setDate={setReportDate} className="w-full"/></div>
                                <div>
                                    <Label htmlFor="projectId-wcr">Project</Label>
                                    <Select value={projectId} onValueChange={setProjectId}>
                                        <SelectTrigger id="projectId-wcr"><SelectValue placeholder="Select Project"/></SelectTrigger>
                                        <SelectContent>{projects.map(p=><SelectItem key={p.id} value={p.id}>{p.projectName} ({p.projectCode || p.id})</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div><Label htmlFor="taskActivity">Task / Activity Completed</Label><Input id="taskActivity" value={taskActivity} onChange={e=>setTaskActivity(e.target.value)} placeholder="e.g., Installation of Fiber Optic Cable - Section A"/></div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><Label htmlFor="dateCompleted">Date Completed</Label><DatePicker id="dateCompleted" date={dateCompleted} setDate={setDateCompleted} className="w-full"/></div>
                                <div><Label htmlFor="supervisor">Supervisor / Person Responsible</Label><Input id="supervisor" value={supervisor} onChange={e=>setSupervisor(e.target.value)} placeholder="Supervisor's Name"/></div>
                            </div>
                             <div>
                                <Label htmlFor="percentageComplete">Percentage Complete (if not 100%)</Label>
                                <div className="flex items-center gap-2">
                                    <Input id="percentageComplete" type="number" min="0" max="100" value={percentageComplete} onChange={e=>setPercentageComplete(e.target.value)} className="w-24"/>
                                    <Percent className="h-5 w-5 text-muted-foreground"/>
                                </div>
                            </div>
                            <div><Label htmlFor="qualityRemarks">Quality Remarks / Acceptance Criteria Met</Label><Textarea id="qualityRemarks" value={qualityRemarks} onChange={e=>setQualityRemarks(e.target.value)} placeholder="e.g., All tests passed, client signed off." rows={3}/></div>
                            <div><Label htmlFor="challengesFaced">Challenges Faced / Lessons Learned (Optional)</Label><Textarea id="challengesFaced" value={challengesFaced} onChange={e=>setChallengesFaced(e.target.value)} placeholder="e.g., Unexpected soil conditions, equipment delay." rows={3}/></div>
                             <div>
                                <Label htmlFor="attachments-wcr" className="flex items-center"><UploadCloud className="mr-2 h-4 w-4" />Attachments (Max 3, e.g., Photos, Test Results)</Label>
                                <Input id="attachments-wcr" type="file" multiple onChange={handleFileChange} accept="image/*,.pdf,.doc,.docx" />
                                {attachments.length > 0 && (
                                  <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                                    {attachments.map(file => (<li key={file.id} className="flex justify-between items-center"><span className="flex items-center"><Paperclip className="inline mr-1 h-3 w-3"/>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span><Button type="button" variant="ghost" size="xs" onClick={() => removeAttachment(file.id)}><Trash2 className="h-3 w-3 text-destructive"/></Button></li>))}
                                  </ul>
                                )}
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end space-x-2 border-t pt-6">
                            <Button type="button" variant="outline" onClick={()=>navigate('/forms-documents')}>Cancel</Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Submit Report</Button>
                        </CardFooter>
                    </form>
                </Card>
            </motion.div>
        );
    };
    export default WorkCompletionReportPage;