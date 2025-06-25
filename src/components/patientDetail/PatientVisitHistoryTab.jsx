import React, { useState } from 'react';
    import { motion } from 'framer-motion';
    import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { Input } from '@/components/ui/input.jsx';
    import { Textarea } from '@/components/ui/textarea.jsx';
    import { Label } from '@/components/ui/label.jsx';
    import { DatePicker } from '@/components/ui/date-picker.jsx';
    import { useToast } from '@/components/ui/use-toast.jsx';
    import { CalendarDays, PlusCircle, Trash2, Edit3, Hotel as Hospital, Stethoscope as StethoscopeIcon } from 'lucide-react';
    import { format, parseISO } from 'date-fns';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog.jsx';

    const PatientVisitHistoryTab = ({ patient, updatePatientData }) => {
        const { toast } = useToast();
        const [isModalOpen, setIsModalOpen] = useState(false);
        const [editingVisit, setEditingVisit] = useState(null);
        const [visitFormData, setVisitFormData] = useState({
            date: new Date(),
            reason: '',
            doctor: '',
            notes: '',
            isEmergency: false
        });
        
        const mockDoctors = ["Dr. Smith", "Dr. Jones", "Dr. Aisha Khan", "Dr. Omar Ali"];

        const handleOpenModal = (visit = null) => {
            if (visit) {
                setEditingVisit(visit);
                setVisitFormData({
                    date: visit.date ? parseISO(visit.date) : new Date(),
                    reason: visit.reason || '',
                    doctor: visit.doctor || '',
                    notes: visit.notes || '',
                    isEmergency: visit.isEmergency || false,
                });
            } else {
                setEditingVisit(null);
                setVisitFormData({ date: new Date(), reason: '', doctor: '', notes: '', isEmergency: false });
            }
            setIsModalOpen(true);
        };

        const handleVisitSubmit = () => {
            if (!visitFormData.reason || !visitFormData.doctor) {
                toast({ variant: "destructive", title: "Missing Fields", description: "Visit reason and doctor are required." });
                return;
            }
            
            const newVisit = {
                id: editingVisit ? editingVisit.id : `VISIT-${Date.now()}`,
                date: visitFormData.date.toISOString(),
                reason: visitFormData.reason,
                doctor: visitFormData.doctor,
                notes: visitFormData.notes,
                isEmergency: visitFormData.isEmergency,
            };

            let updatedVisits;
            if (editingVisit) {
                updatedVisits = (patient.visitHistory || []).map(v => v.id === editingVisit.id ? newVisit : v);
                toast({ title: "Visit Updated", description: `Visit on ${format(parseISO(newVisit.date), 'PPP')} updated.` });
            } else {
                updatedVisits = [...(patient.visitHistory || []), newVisit];
                toast({ title: "Visit Added", description: `New visit on ${format(parseISO(newVisit.date), 'PPP')} added.` });
            }
            updatePatientData({ visitHistory: updatedVisits });
            setIsModalOpen(false);
        };
        
        const handleDeleteVisit = (visitId) => {
            const updatedVisits = (patient.visitHistory || []).filter(v => v.id !== visitId);
            updatePatientData({ visitHistory: updatedVisits });
            toast({ title: "Visit Deleted", variant: "destructive" });
        };

        const sortedVisits = (patient.visitHistory || []).sort((a,b) => parseISO(b.date) - parseISO(a.date));

        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                <div className="flex justify-between items-center mb-6">
                    <CardTitle className="text-xl font-semibold text-gray-700">Patient Visit History</CardTitle>
                    <Button onClick={() => handleOpenModal()} className="bg-green-600 hover:bg-green-700">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Visit
                    </Button>
                </div>

                {sortedVisits.length > 0 ? (
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                        {sortedVisits.map(visit => (
                            <Card key={visit.id} className={`shadow-sm hover:shadow-md transition-shadow ${visit.isEmergency ? 'border-l-4 border-red-500 bg-red-50/50' : 'border-l-4 border-green-500'}`}>
                                <CardHeader className="py-3 px-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold text-base text-green-700">
                                                <Hospital className="inline mr-2 h-5 w-5"/>
                                                Visit on {format(parseISO(visit.date), 'PPP')}
                                                {visit.isEmergency && <span className="ml-2 px-1.5 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-sm">EMERGENCY</span>}
                                            </h3>
                                            <p className="text-xs text-muted-foreground">Reason: {visit.reason}</p>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-slate-700" onClick={() => handleOpenModal(visit)}><Edit3 className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600" onClick={() => handleDeleteVisit(visit.id)}><Trash2 className="h-4 w-4" /></Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="py-2 px-4 text-sm">
                                    <p><StethoscopeIcon className="inline mr-1 h-4 w-4 text-muted-foreground" /><strong>Doctor:</strong> {visit.doctor}</p>
                                    {visit.notes && <p className="mt-1 whitespace-pre-wrap"><strong>Notes:</strong> {visit.notes}</p>}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="p-6 border-2 border-dashed rounded-md bg-slate-50 text-center text-muted-foreground">
                        <CalendarDays className="mx-auto h-12 w-12 mb-2 text-gray-400" />
                        <p>No visit history recorded for this patient yet.</p>
                    </div>
                )}

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>{editingVisit ? 'Edit' : 'Add New'} Visit Record</DialogTitle>
                            <DialogDescription>Enter details for the patient's visit.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div>
                                <Label htmlFor="visitDate">Visit Date</Label>
                                <DatePicker date={visitFormData.date} setDate={(date) => setVisitFormData({...visitFormData, date: date})} placeholder="Select visit date" className="mt-1 w-full"/>
                            </div>
                             <div>
                                <Label htmlFor="visitReason">Reason for Visit</Label>
                                <Input id="visitReason" value={visitFormData.reason} onChange={(e) => setVisitFormData({...visitFormData, reason: e.target.value})} placeholder="e.g., Annual Checkup, Fever" className="mt-1"/>
                            </div>
                            <div>
                                <Label htmlFor="visitDoctor">Consulting Doctor</Label>
                                 <select id="visitDoctor" value={visitFormData.doctor} onChange={(e) => setVisitFormData({...visitFormData, doctor: e.target.value})} className="mt-1 flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                    <option value="" disabled>Select Doctor</option>
                                    {mockDoctors.map(doc => <option key={doc} value={doc}>{doc}</option>)}
                                </select>
                            </div>
                            <div>
                                <Label htmlFor="visitNotes">Visit Notes (Optional)</Label>
                                <Textarea id="visitNotes" value={visitFormData.notes} onChange={(e) => setVisitFormData({...visitFormData, notes: e.target.value})} placeholder="e.g., Advised rest, follow up in 1 week." className="mt-1 min-h-[80px]"/>
                            </div>
                            <div className="flex items-center space-x-2">
                                <input type="checkbox" id="isEmergencyVisit" checked={visitFormData.isEmergency} onChange={(e) => setVisitFormData({...visitFormData, isEmergency: e.target.checked})} className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"/>
                                <Label htmlFor="isEmergencyVisit" className="font-medium text-red-600">Mark as Emergency Visit</Label>
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                            <Button type="button" onClick={handleVisitSubmit}>{editingVisit ? 'Save Changes' : 'Add Visit'}</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </motion.div>
        );
    };

    export default PatientVisitHistoryTab;