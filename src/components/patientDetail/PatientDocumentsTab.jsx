import React, { useState } from 'react';
    import { motion } from 'framer-motion';
    import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { Input } from '@/components/ui/input.jsx';
    import { Label } from '@/components/ui/label.jsx';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
    import { DatePicker } from '@/components/ui/date-picker.jsx';
    import { useToast } from '@/components/ui/use-toast.jsx';
    import { FileText, UploadCloud, Trash2, Edit3, PlusCircle, AlertTriangle } from 'lucide-react';
    import { format, parseISO, isValid } from 'date-fns';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog.jsx';

    const documentTypes = ["National ID/Iqama", "Passport", "Medical Insurance Card", "Referral Letter", "Previous Medical Report", "Other"];

    const PatientDocumentsTab = ({ patient, updatePatientData }) => {
        const { toast } = useToast();
        const [isModalOpen, setIsModalOpen] = useState(false);
        const [editingDoc, setEditingDoc] = useState(null);
        const [docFormData, setDocFormData] = useState({
            docName: '',
            docType: '',
            issueDate: null,
            expiryDate: null,
            docNumber: '',
        });

        const handleOpenModal = (doc = null) => {
            if (doc) {
                setEditingDoc(doc);
                setDocFormData({
                    docName: doc.name,
                    docType: doc.type,
                    issueDate: doc.issueDate ? parseISO(doc.issueDate) : null,
                    expiryDate: doc.expiryDate ? parseISO(doc.expiryDate) : null,
                    docNumber: doc.number || '',
                });
            } else {
                setEditingDoc(null);
                setDocFormData({ docName: '', docType: '', issueDate: null, expiryDate: null, docNumber: '' });
            }
            setIsModalOpen(true);
        };

        const handleDocSubmit = () => {
            if (!docFormData.docName || !docFormData.docType) {
                toast({ variant: "destructive", title: "Missing Fields", description: "Document name and type are required." });
                return;
            }
            
            const newDocument = {
                id: editingDoc ? editingDoc.id : `DOC-${Date.now()}`,
                name: docFormData.docName,
                type: docFormData.docType,
                issueDate: docFormData.issueDate ? docFormData.issueDate.toISOString().split('T')[0] : null,
                expiryDate: docFormData.expiryDate ? docFormData.expiryDate.toISOString().split('T')[0] : null,
                number: docFormData.docNumber,
                uploadDate: new Date().toISOString(),
                fileUrl: null, 
            };

            let updatedDocuments;
            if (editingDoc) {
                updatedDocuments = (patient.documents || []).map(d => d.id === editingDoc.id ? newDocument : d);
                toast({ title: "Document Updated", description: `${newDocument.name} updated successfully.` });
            } else {
                updatedDocuments = [...(patient.documents || []), newDocument];
                toast({ title: "Document Added", description: `${newDocument.name} added successfully.` });
            }
            updatePatientData({ documents: updatedDocuments });
            setIsModalOpen(false);
        };

        const handleDeleteDoc = (docId) => {
            const updatedDocuments = (patient.documents || []).filter(d => d.id !== docId);
            updatePatientData({ documents: updatedDocuments });
            toast({ title: "Document Deleted", variant: "destructive" });
        };

        const getStatus = (expiryDateStr) => {
            if (!expiryDateStr) return { text: "No Expiry", class: "text-gray-500", icon: null };
            const expiry = parseISO(expiryDateStr);
            if (!isValid(expiry)) return { text: "Invalid Date", class: "text-orange-500", icon: <AlertTriangle className="inline ml-1 h-3 w-3" /> };
            if (expiry < new Date()) return { text: `Expired on ${format(expiry, 'dd MMM yy')}`, class: "text-red-600 font-semibold", icon: <AlertTriangle className="inline ml-1 h-3 w-3" /> };
            return { text: `Expires ${format(expiry, 'dd MMM yy')}`, class: "text-green-600", icon: null };
        };

        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                <div className="flex justify-between items-center mb-6">
                    <CardTitle className="text-xl font-semibold text-gray-700">Patient Documents</CardTitle>
                    <Button onClick={() => handleOpenModal()} className="bg-blue-600 hover:bg-blue-700">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Document
                    </Button>
                </div>

                {(patient.documents && patient.documents.length > 0) ? (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                        {patient.documents.sort((a,b) => new Date(b.uploadDate) - new Date(a.uploadDate)).map(doc => {
                            const status = getStatus(doc.expiryDate);
                            return (
                            <Card key={doc.id} className={`shadow-sm hover:shadow-md transition-shadow ${status.class.includes('text-red-600') ? 'border-l-4 border-red-500' : 'border-l-4 border-blue-500'}`}>
                                <CardHeader className="py-3 px-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold text-base text-blue-700">{doc.name}</h3>
                                            <p className="text-xs text-muted-foreground">{doc.type} {doc.number && `(${doc.number})`}</p>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-slate-700" onClick={() => handleOpenModal(doc)}><Edit3 className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600" onClick={() => handleDeleteDoc(doc.id)}><Trash2 className="h-4 w-4" /></Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="py-2 px-4 text-sm">
                                    <p><strong>Issued:</strong> {doc.issueDate ? format(parseISO(doc.issueDate), 'dd MMM yyyy') : 'N/A'}</p>
                                    <p className={status.class}><strong>Status:</strong> {status.text} {status.icon}</p>
                                    <p className="text-xs text-muted-foreground mt-1">Uploaded: {format(parseISO(doc.uploadDate), 'dd MMM yyyy, p')}</p>
                                </CardContent>
                                <CardFooter className="py-2 px-4 border-t">
                                    <Button variant="link" size="sm" className="p-0 h-auto text-blue-600" disabled>
                                        <UploadCloud className="mr-1 h-3 w-3" /> View/Replace File (Upload Disabled)
                                    </Button>
                                </CardFooter>
                            </Card>
                        )})}
                    </div>
                ) : (
                    <div className="p-6 border-2 border-dashed rounded-md bg-slate-50 text-center text-muted-foreground">
                        <FileText className="mx-auto h-12 w-12 mb-2 text-gray-400" />
                        <p>No documents uploaded for this patient yet.</p>
                    </div>
                )}

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>{editingDoc ? 'Edit' : 'Add New'} Document</DialogTitle>
                            <DialogDescription>Enter details for the patient's document.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div>
                                <Label htmlFor="docName">Document Name / Title</Label>
                                <Input id="docName" value={docFormData.docName} onChange={(e) => setDocFormData({...docFormData, docName: e.target.value})} placeholder="e.g., Passport Scan, Recent Lab Results" className="mt-1"/>
                            </div>
                            <div>
                                <Label htmlFor="docType">Document Type</Label>
                                <Select value={docFormData.docType} onValueChange={(value) => setDocFormData({...docFormData, docType: value})}>
                                    <SelectTrigger id="docType" className="w-full mt-1"><SelectValue placeholder="Select type" /></SelectTrigger>
                                    <SelectContent>{documentTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                             <div>
                                <Label htmlFor="docNumber">Document Number (Optional)</Label>
                                <Input id="docNumber" value={docFormData.docNumber} onChange={(e) => setDocFormData({...docFormData, docNumber: e.target.value})} placeholder="e.g., A12345678" className="mt-1"/>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="issueDate">Issue Date (Optional)</Label>
                                    <DatePicker date={docFormData.issueDate} setDate={(date) => setDocFormData({...docFormData, issueDate: date})} placeholder="Select issue date" className="mt-1 w-full"/>
                                </div>
                                <div>
                                    <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
                                    <DatePicker date={docFormData.expiryDate} setDate={(date) => setDocFormData({...docFormData, expiryDate: date})} placeholder="Select expiry date" className="mt-1 w-full"/>
                                </div>
                            </div>
                            <div>
                               <Label htmlFor="docFile">Upload File (Placeholder)</Label>
                               <Input id="docFile" type="file" className="mt-1" disabled/>
                               <p className="text-xs text-muted-foreground mt-1">File upload functionality is a placeholder.</p>
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                            <Button type="button" onClick={handleDocSubmit}>{editingDoc ? 'Save Changes' : 'Add Document'}</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </motion.div>
        );
    };

    export default PatientDocumentsTab;