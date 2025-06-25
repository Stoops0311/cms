import React, { useState, useMemo } from 'react';
    import { motion } from 'framer-motion';
    import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { Input } from '@/components/ui/input.jsx';
    import { Textarea } from '@/components/ui/textarea.jsx';
    import { Label } from '@/components/ui/label.jsx';
    import { useToast } from '@/components/ui/use-toast.jsx';
    import { UploadCloud, Pill, PenLine as FilePenLine, Trash2, Edit3, Mail, Download, MessageSquare } from 'lucide-react';
    import { format, parseISO } from 'date-fns';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog.jsx';

    const PatientPrescriptionsTab = ({ patient, updatePatientData }) => {
        const { toast } = useToast();
        const [newPrescription, setNewPrescription] = useState('');
        const [newNote, setNewNote] = useState('');
        const [editingRecord, setEditingRecord] = useState(null);
        const [editText, setEditText] = useState('');

        const handleAddPrescription = () => {
            if (!newPrescription.trim()) {
                toast({ variant: "destructive", title: "Error", description: "Prescription cannot be empty." });
                return;
            }
            const updatedPrescriptions = [...(patient.prescriptions || []), { id: `PRES-${Date.now()}`, text: newPrescription, date: new Date().toISOString(), type: 'prescription' }];
            updatePatientData({ prescriptions: updatedPrescriptions });
            setNewPrescription('');
            toast({ title: "Success", description: "Prescription added.", className: "bg-green-500 text-white" });
        };

        const handleAddNote = () => {
            if (!newNote.trim()) {
                toast({ variant: "destructive", title: "Error", description: "Note cannot be empty." });
                return;
            }
            const updatedMedicalNotes = [...(patient.medicalNotes || []), { id: `NOTE-${Date.now()}`, text: newNote, date: new Date().toISOString(), type: 'note' }];
            updatePatientData({ medicalNotes: updatedMedicalNotes });
            setNewNote('');
            toast({ title: "Success", description: "Note added.", className: "bg-green-500 text-white" });
        };
        
        const combinedMedicalRecords = useMemo(() => [
            ...(patient.prescriptions || []).map(item => ({...item, recordType: 'Prescription'})),
            ...(patient.medicalNotes || []).map(item => ({...item, recordType: 'Medical Note'})),
        ].sort((a, b) => parseISO(b.date) - parseISO(a.date)), [patient.prescriptions, patient.medicalNotes]);

        const openEditModal = (record) => {
            setEditingRecord(record);
            setEditText(record.text);
        };

        const handleSaveEdit = () => {
            if (!editText.trim()) {
                toast({ variant: "destructive", title: "Error", description: "Content cannot be empty." });
                return;
            }
            if (editingRecord.type === 'prescription') {
                const updatedPrescriptions = patient.prescriptions.map(p => p.id === editingRecord.id ? { ...p, text: editText, date: new Date().toISOString() } : p);
                updatePatientData({ prescriptions: updatedPrescriptions });
            } else if (editingRecord.type === 'note') {
                const updatedMedicalNotes = patient.medicalNotes.map(n => n.id === editingRecord.id ? { ...n, text: editText, date: new Date().toISOString() } : n);
                updatePatientData({ medicalNotes: updatedMedicalNotes });
            }
            toast({ title: "Success", description: `${editingRecord.recordType} updated.`, className: "bg-blue-500 text-white" });
            setEditingRecord(null);
            setEditText('');
        };

        const handleDeleteRecord = (recordId, recordType) => {
            if (recordType === 'Prescription') {
                const updatedPrescriptions = patient.prescriptions.filter(p => p.id !== recordId);
                updatePatientData({ prescriptions: updatedPrescriptions });
            } else if (recordType === 'Medical Note') {
                const updatedMedicalNotes = patient.medicalNotes.filter(n => n.id !== recordId);
                updatePatientData({ medicalNotes: updatedMedicalNotes });
            }
             toast({ title: "Deleted", description: `${recordType} removed.`, className: "bg-red-500 text-white" });
        };

        const handleEmailPrescription = (prescription) => {
            toast({
                title: "Simulating Email",
                description: `Prescription for "${prescription.text.substring(0,30)}..." would be emailed. (Not a real email)`,
                className: "bg-sky-500 text-white"
            });
        };

        const handleDownloadPdf = (prescription) => {
            toast({
                title: "Simulating PDF Download",
                description: `Prescription for "${prescription.text.substring(0,30)}..." would be prepared for download. (Not a real PDF)`,
                className: "bg-emerald-500 text-white"
            });
        };

        const handleSendWhatsApp = (prescription) => {
            toast({
                title: "Simulating WhatsApp Message",
                description: `Prescription for "${prescription.text.substring(0,30)}..." would be sent via WhatsApp. (Not a real message)`,
                className: "bg-green-500 text-white"
            });
        };


        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                <CardTitle className="text-xl mb-6 font-semibold text-gray-700">Prescriptions & Medical Notes</CardTitle>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <Label htmlFor="newPrescription" className="text-base font-medium">Add New Prescription</Label>
                        <Textarea 
                            id="newPrescription" 
                            value={newPrescription} 
                            onChange={(e) => setNewPrescription(e.target.value)} 
                            placeholder="e.g., Paracetamol 500mg, 1 tablet TID for 3 days" 
                            className="min-h-[100px] mt-1"
                        />
                        <Button onClick={handleAddPrescription} className="mt-2 w-full md:w-auto bg-blue-600 hover:bg-blue-700">
                            <Pill className="mr-2 h-4 w-4" /> Add Prescription
                        </Button>
                    </div>
                    <div>
                        <Label htmlFor="newNote" className="text-base font-medium">Add Medical Note / Vital</Label>
                        <Textarea 
                            id="newNote" 
                            value={newNote} 
                            onChange={(e) => setNewNote(e.target.value)} 
                            placeholder="e.g., Patient reports mild headache. BP: 120/80 mmHg." 
                            className="min-h-[100px] mt-1"
                        />
                        <Button onClick={handleAddNote} className="mt-2 w-full md:w-auto">
                            <FilePenLine className="mr-2 h-4 w-4" /> Add Note
                        </Button>
                    </div>
                </div>

                <div className="mb-6">
                    <Label className="text-base font-medium">Upload Scanned Document (e.g., Prescription)</Label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                            <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="flex text-sm text-gray-600">
                                <label htmlFor="prescription-file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-focus focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                                    <span>Upload a file</span>
                                    <input id="prescription-file-upload" name="prescription-file-upload" type="file" className="sr-only" disabled />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB. (Upload disabled)</p>
                        </div>
                    </div>
                </div>

                <CardTitle className="text-lg mb-4 font-semibold text-gray-600">Record History</CardTitle>
                {combinedMedicalRecords.length > 0 ? (
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {combinedMedicalRecords.map(record => (
                            <Card key={record.id} className="bg-slate-50 shadow-sm">
                                <CardHeader className="pb-2 pt-3 px-4">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className={`text-md font-medium ${record.recordType === 'Prescription' ? 'text-blue-600' : 'text-indigo-600'}`}>
                                            {record.recordType === 'Prescription' ? <Pill className="inline mr-2 h-5 w-5"/> : <FilePenLine className="inline mr-2 h-5 w-5"/>}
                                            {record.recordType}
                                        </CardTitle>
                                        <div className="flex items-center space-x-1">
                                            <span className="text-xs text-muted-foreground">{format(parseISO(record.date), 'dd MMM yy, HH:mm')}</span>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-500 hover:text-slate-700" onClick={() => openEditModal(record)} title="Edit">
                                                <Edit3 className="h-3 w-3" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400 hover:text-red-600" onClick={() => handleDeleteRecord(record.id, record.recordType)} title="Delete">
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="text-sm pt-0 pb-3 px-4">
                                    <p className="whitespace-pre-wrap">{record.text}</p>
                                    {record.recordType === 'Prescription' && (
                                      <div className="mt-3 pt-2 border-t border-slate-200 flex flex-wrap gap-2">
                                        <Button size="xs" variant="outline" onClick={() => handleEmailPrescription(record)} className="text-xs">
                                          <Mail className="mr-1.5 h-3 w-3" /> Email
                                        </Button>
                                        <Button size="xs" variant="outline" onClick={() => handleDownloadPdf(record)} className="text-xs">
                                          <Download className="mr-1.5 h-3 w-3" /> PDF
                                        </Button>
                                        <Button size="xs" variant="outline" onClick={() => handleSendWhatsApp(record)} className="text-xs">
                                          <MessageSquare className="mr-1.5 h-3 w-3" /> WhatsApp
                                        </Button>
                                      </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground text-center py-4">No prescriptions or notes added yet.</p>
                )}

                {editingRecord && (
                    <Dialog open={!!editingRecord} onOpenChange={() => setEditingRecord(null)}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Edit {editingRecord.recordType}</DialogTitle>
                            </DialogHeader>
                            <Textarea value={editText} onChange={(e) => setEditText(e.target.value)} className="min-h-[150px] my-4" />
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button onClick={handleSaveEdit}>Save Changes</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </motion.div>
        );
    };
    export default PatientPrescriptionsTab;