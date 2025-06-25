import React, { useState } from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { Input } from '@/components/ui/input.jsx';
    import { Label } from '@/components/ui/label.jsx';
    import { Textarea } from '@/components/ui/textarea.jsx';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
    import { Checkbox } from '@/components/ui/checkbox.jsx';
    import { DatePicker } from '@/components/ui/date-picker.jsx';
    import { ClipboardList, MapPin, User, CalendarClock, AlertTriangle, PlusCircle, Trash2 } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast.jsx';
    import useLocalStorage from '@/hooks/useLocalStorage.jsx';
    import { motion } from 'framer-motion';
    import { useNavigate } from 'react-router-dom';

    const checklistCategories = [
        { name: "General Site Safety", items: ["Site Access & Egress Clear", "PPE Compliance", "First Aid Kit Available", "Emergency Exits Clear", "Fire Extinguishers Checked"] },
        { name: "Work Area Specific", items: ["Scaffolding Secure", "Excavation Barricaded", "Electrical Tools Grounded", "Welding Area Safe", "Confined Space Entry Permit"] },
        { name: "Equipment Checks", items: ["Heavy Equipment Pre-start Checks", "Power Tools Guarded", "Lifting Gear Inspected", "Vehicle Reversing Alarms Functional"] },
        { name: "Environmental", items: ["Waste Management Area Tidy", "Spill Kits Available", "Dust Control Measures In Place"] }
    ];


    const SiteInspectionChecklistPage = () => {
        const { toast } = useToast();
        const navigate = useNavigate();
        const [projects] = useLocalStorage('projects', []);
        const [siteInspections, setSiteInspections] = useLocalStorage('cmsSiteInspections', []);
        
        const [inspectionDate, setInspectionDate] = useState(new Date());
        const [projectId, setProjectId] = useState('');
        const [locationArea, setLocationArea] = useState('');
        const [inspectedBy, setInspectedBy] = useState('');
        const [overallSiteCondition, setOverallSiteCondition] = useState('Good');
        const [checklistItems, setChecklistItems] = useState(
            checklistCategories.reduce((acc, category) => {
                category.items.forEach(item => { acc[item] = { status: 'N/A', remarks: '' }; });
                return acc;
            }, {})
        );
        const [correctiveActions, setCorrectiveActions] = useState([{ action: '', responsible: '', dueDate: null, status: 'Open' }]);
        const [summaryNotes, setSummaryNotes] = useState('');


        const handleChecklistItemChange = (item, field, value) => {
            setChecklistItems(prev => ({ ...prev, [item]: { ...prev[item], [field]: value } }));
        };

        const handleCorrectiveActionChange = (index, field, value) => {
            const newActions = [...correctiveActions];
            newActions[index][field] = value;
            setCorrectiveActions(newActions);
        };
        const addCorrectiveAction = () => setCorrectiveActions([...correctiveActions, { action: '', responsible: '', dueDate: null, status: 'Open' }]);
        const removeCorrectiveAction = (index) => setCorrectiveActions(correctiveActions.filter((_, i) => i !== index));

        const handleSubmit = (e) => {
            e.preventDefault();
            if (!projectId || !locationArea || !inspectedBy) {
                toast({ variant: "destructive", title: "Missing Fields", description: "Project, Location, and Inspector Name are required." });
                return;
            }
            const newInspection = {
                id: `INSP-${Date.now()}`,
                inspectionDate: inspectionDate.toISOString(), projectId, locationArea, inspectedBy,
                overallSiteCondition, checklistItems, 
                correctiveActions: correctiveActions.filter(ca => ca.action), 
                summaryNotes
            };
            setSiteInspections([...siteInspections, newInspection]);
            toast({ title: "Site Inspection Submitted", description: `Inspection ID: ${newInspection.id}` });
            navigate('/forms-documents');
        };

        return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
                <Card className="shadow-xl border-t-4 border-orange-500">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-orange-600 flex items-center"><ClipboardList className="mr-3 h-7 w-7"/>Site Inspection Checklist</CardTitle>
                        <CardDescription>Conduct and record regular site safety and operational inspections.</CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><Label htmlFor="inspectionDate">Inspection Date</Label><DatePicker id="inspectionDate" date={inspectionDate} setDate={setInspectionDate} className="w-full"/></div>
                                <div>
                                    <Label htmlFor="projectId-insp">Project</Label>
                                    <Select value={projectId} onValueChange={setProjectId}><SelectTrigger id="projectId-insp"><SelectValue placeholder="Select Project"/></SelectTrigger><SelectContent>{projects.map(p=><SelectItem key={p.id} value={p.id}>{p.projectName} ({p.projectCode || p.id})</SelectItem>)}</SelectContent></Select>
                                </div>
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><Label htmlFor="locationArea">Location / Area Inspected</Label><Input id="locationArea" value={locationArea} onChange={e=>setLocationArea(e.target.value)} placeholder="e.g., Sector B, Workshop, Floor 5"/></div>
                                <div><Label htmlFor="inspectedBy">Inspected By</Label><Input id="inspectedBy" value={inspectedBy} onChange={e=>setInspectedBy(e.target.value)} placeholder="Inspector's Name"/></div>
                            </div>
                            <div>
                                <Label htmlFor="overallSiteCondition">Overall Site Condition</Label>
                                <Select value={overallSiteCondition} onValueChange={setOverallSiteCondition}><SelectTrigger id="overallSiteCondition"><SelectValue placeholder="Select Condition"/></SelectTrigger><SelectContent><SelectItem value="Good">Good</SelectItem><SelectItem value="Satisfactory">Satisfactory</SelectItem><SelectItem value="Needs Improvement">Needs Improvement</SelectItem><SelectItem value="Unsatisfactory">Unsatisfactory</SelectItem></SelectContent></Select>
                            </div>

                            {checklistCategories.map(category => (
                                <Card key={category.name} className="p-3 bg-slate-50">
                                    <CardHeader className="p-0 pb-2"><CardTitle className="text-md text-orange-700">{category.name}</CardTitle></CardHeader>
                                    <CardContent className="p-0 space-y-2">
                                        {category.items.map(item => (
                                            <div key={item} className="grid grid-cols-12 gap-2 items-center py-1 border-b border-slate-200 last:border-b-0">
                                                <Label htmlFor={`item-${item}`} className="col-span-12 md:col-span-5 text-sm font-normal">{item}</Label>
                                                <div className="col-span-6 md:col-span-3">
                                                    <Select value={checklistItems[item]?.status || 'N/A'} onValueChange={val => handleChecklistItemChange(item, 'status', val)}>
                                                        <SelectTrigger className="h-8 text-xs"><SelectValue/></SelectTrigger>
                                                        <SelectContent><SelectItem value="OK">OK</SelectItem><SelectItem value="N/A">N/A</SelectItem><SelectItem value="Action Required">Action Required</SelectItem></SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="col-span-6 md:col-span-4"><Input value={checklistItems[item]?.remarks || ''} onChange={e=>handleChecklistItemChange(item, 'remarks', e.target.value)} placeholder="Remarks..." className="h-8 text-xs"/></div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            ))}
                            
                            <Card className="p-3 bg-red-50 border-red-200">
                                <CardHeader className="p-0 pb-2"><CardTitle className="text-md flex items-center text-red-700"><AlertTriangle className="mr-2 h-5 w-5"/>Corrective Actions Required</CardTitle></CardHeader>
                                <CardContent className="p-0 space-y-2">
                                {correctiveActions.map((ca, index) => (
                                    <div key={index} className="p-2 border rounded bg-white grid grid-cols-12 gap-2 items-end">
                                        <div className="col-span-12 md:col-span-4"><Label className="text-xs">Action Required</Label><Textarea value={ca.action} onChange={e=>handleCorrectiveActionChange(index, 'action', e.target.value)} placeholder="Describe action" rows={1} className="text-xs"/></div>
                                        <div className="col-span-6 md:col-span-3"><Label className="text-xs">Responsible</Label><Input value={ca.responsible} onChange={e=>handleCorrectiveActionChange(index, 'responsible', e.target.value)} placeholder="Name/Dept" className="text-xs h-8"/></div>
                                        <div className="col-span-6 md:col-span-2"><Label className="text-xs">Due Date</Label><DatePicker date={ca.dueDate} setDate={val => handleCorrectiveActionChange(index, 'dueDate', val)} className="h-8 text-xs"/></div>
                                        <div className="col-span-8 md:col-span-2"><Label className="text-xs">Status</Label><Select value={ca.status} onValueChange={val=>handleCorrectiveActionChange(index, 'status', val)}><SelectTrigger className="h-8 text-xs"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Open">Open</SelectItem><SelectItem value="In Progress">In Progress</SelectItem><SelectItem value="Closed">Closed</SelectItem></SelectContent></Select></div>
                                        <div className="col-span-4 md:col-span-1"><Button type="button" variant="destructive" size="icon" onClick={()=>removeCorrectiveAction(index)} className="h-8 w-full"><Trash2 className="h-3 w-3"/></Button></div>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" size="sm" onClick={addCorrectiveAction} className="border-red-500 text-red-600 hover:bg-red-100"><PlusCircle className="mr-2 h-4 w-4"/>Add Corrective Action</Button>
                                </CardContent>
                            </Card>

                            <div><Label htmlFor="summaryNotes">Summary Notes / Overall Assessment</Label><Textarea id="summaryNotes" value={summaryNotes} onChange={e=>setSummaryNotes(e.target.value)} placeholder="General observations, recommendations, etc." rows={3}/></div>
                        </CardContent>
                        <CardFooter className="flex justify-end space-x-2 border-t pt-6">
                            <Button type="button" variant="outline" onClick={()=>navigate('/forms-documents')}>Cancel</Button>
                            <Button type="submit" className="bg-orange-500 hover:bg-orange-600">Submit Inspection</Button>
                        </CardFooter>
                    </form>
                </Card>
            </motion.div>
        );
    };
    export default SiteInspectionChecklistPage;