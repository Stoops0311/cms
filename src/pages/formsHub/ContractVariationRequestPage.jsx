import React, { useState } from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { Input } from '@/components/ui/input.jsx';
    import { Label } from '@/components/ui/label.jsx';
    import { Textarea } from '@/components/ui/textarea.jsx';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
    import { DatePicker } from '@/components/ui/date-picker.jsx';
    import { FileEdit, Briefcase, CalendarPlus, AlertTriangle, DollarSign, Clock, FileText, UserCheck, UploadCloud, Paperclip, Trash2 } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast.jsx';
    import useLocalStorage from '@/hooks/useLocalStorage.jsx';
    import { motion } from 'framer-motion';
    import { useNavigate } from 'react-router-dom';

    const variationTypes = ["Scope Change", "Time Extension", "Cost Adjustment", "Material Substitution", "Design Modification", "Other"];

    const ContractVariationRequestPage = () => {
        const { toast } = useToast();
        const navigate = useNavigate();
        const [projects] = useLocalStorage('projects', []);
        const [contractors] = useLocalStorage('contractors', []); // Assuming contractors are stored
        const [variationRequests, setVariationRequests] = useLocalStorage('cmsContractVariations', []);

        const [requestDate, setRequestDate] = useState(new Date());
        const [projectId, setProjectId] = useState('');
        const [contractorId, setContractorId] = useState('');
        const [variationType, setVariationType] = useState('');
        const [reasonForVariation, setReasonForVariation] = useState('');
        const [detailedDescription, setDetailedDescription] = useState('');
        const [costImpact, setCostImpact] = useState('');
        const [timeImpact, setTimeImpact] = useState('');
        const [requestedBy, setRequestedBy] = useState('');
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
            if (!projectId || !contractorId || !variationType || !reasonForVariation || !detailedDescription || !requestedBy) {
                toast({ variant: "destructive", title: "Missing Fields", description: "All fields except impact assessments and attachments are required." });
                return;
            }
            const newVariation = {
                id: `CVR-${Date.now()}`,
                requestDate: requestDate.toISOString(), projectId, contractorId, variationType,
                reasonForVariation, detailedDescription, costImpact, timeImpact, requestedBy, status: 'Pending Review',
                attachments: attachments.map(f => ({ name: f.name, type: f.type, size: f.size, id: f.id })),
            };
            setVariationRequests([...variationRequests, newVariation]);
            toast({ title: "Contract Variation Request Submitted", description: `Request ID: ${newVariation.id}` });
            navigate('/forms-documents');
        };

        return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto">
                <Card className="shadow-xl border-t-4 border-yellow-500">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-yellow-700 flex items-center"><FileEdit className="mr-3 h-7 w-7"/>Contract Variation Request</CardTitle>
                        <CardDescription>Submit a formal request for changes to an existing contract.</CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><Label htmlFor="requestDate-cvr">Request Date</Label><DatePicker id="requestDate-cvr" date={requestDate} setDate={setRequestDate} className="w-full"/></div>
                                <div><Label htmlFor="requestedBy-cvr">Requested By</Label><Input id="requestedBy-cvr" value={requestedBy} onChange={e=>setRequestedBy(e.target.value)} placeholder="Your Name / Department"/></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="projectId-cvr">Project</Label>
                                    <Select value={projectId} onValueChange={setProjectId}>
                                        <SelectTrigger id="projectId-cvr"><SelectValue placeholder="Select Project"/></SelectTrigger>
                                        <SelectContent>{projects.map(p=><SelectItem key={p.id} value={p.id}>{p.projectName} ({p.projectCode || p.id})</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="contractorId-cvr">Contractor / Party Involved</Label>
                                    <Select value={contractorId} onValueChange={setContractorId}>
                                        <SelectTrigger id="contractorId-cvr"><SelectValue placeholder="Select Contractor"/></SelectTrigger>
                                        <SelectContent>{contractors.map(c=><SelectItem key={c.id} value={c.id}>{c.companyName || c.name}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                            </div>
                             <div>
                                <Label htmlFor="variationType-cvr">Type of Variation</Label>
                                <Select value={variationType} onValueChange={setVariationType}>
                                    <SelectTrigger id="variationType-cvr"><SelectValue placeholder="Select Variation Type"/></SelectTrigger>
                                    <SelectContent>{variationTypes.map(vt=><SelectItem key={vt} value={vt}>{vt}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div><Label htmlFor="reasonForVariation-cvr" className="flex items-center"><AlertTriangle className="mr-1 h-4 w-4 text-yellow-600"/>Reason for Variation</Label><Textarea id="reasonForVariation-cvr" value={reasonForVariation} onChange={e=>setReasonForVariation(e.target.value)} placeholder="e.g., Unforeseen site conditions, Client request, Design improvement" rows={3}/></div>
                            <div><Label htmlFor="detailedDescription-cvr" className="flex items-center"><FileText className="mr-1 h-4 w-4"/>Detailed Description of Change</Label><Textarea id="detailedDescription-cvr" value={detailedDescription} onChange={e=>setDetailedDescription(e.target.value)} placeholder="Clearly describe the proposed change from the original contract." rows={4}/></div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><Label htmlFor="costImpact-cvr" className="flex items-center"><DollarSign className="mr-1 h-4 w-4"/>Estimated Cost Impact (USD)</Label><Input id="costImpact-cvr" type="number" value={costImpact} onChange={e=>setCostImpact(e.target.value)} placeholder="e.g., 5000 (Positive for increase, Negative for decrease)"/></div>
                                <div><Label htmlFor="timeImpact-cvr" className="flex items-center"><Clock className="mr-1 h-4 w-4"/>Estimated Time Impact (Days)</Label><Input id="timeImpact-cvr" type="number" value={timeImpact} onChange={e=>setTimeImpact(e.target.value)} placeholder="e.g., 14 (Positive for extension, Negative for reduction)"/></div>
                            </div>
                            <div>
                                <Label htmlFor="attachments-cvr" className="flex items-center"><UploadCloud className="mr-2 h-4 w-4" />Supporting Documents (Max 3)</Label>
                                <Input id="attachments-cvr" type="file" multiple onChange={handleFileChange} accept=".pdf,.doc,.docx,.jpg,.png" />
                                {attachments.length > 0 && (
                                  <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                                    {attachments.map(file => (<li key={file.id} className="flex justify-between items-center"><span className="flex items-center"><Paperclip className="inline mr-1 h-3 w-3"/>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span><Button type="button" variant="ghost" size="xs" onClick={() => removeAttachment(file.id)}><Trash2 className="h-3 w-3 text-destructive"/></Button></li>))}
                                  </ul>
                                )}
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end space-x-2 border-t pt-6">
                            <Button type="button" variant="outline" onClick={()=>navigate('/forms-documents')}>Cancel</Button>
                            <Button type="submit" className="bg-yellow-600 hover:bg-yellow-700 text-white">Submit Variation Request</Button>
                        </CardFooter>
                    </form>
                </Card>
            </motion.div>
        );
    };
    export default ContractVariationRequestPage;