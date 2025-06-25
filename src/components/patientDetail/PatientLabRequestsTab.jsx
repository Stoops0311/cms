import React, { useState, useMemo } from 'react';
    import { motion } from 'framer-motion';
    import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { Input } from '@/components/ui/input.jsx';
    import { Textarea } from '@/components/ui/textarea.jsx';
    import { Label } from '@/components/ui/label.jsx';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
    import { DatePicker } from '@/components/ui/date-picker.jsx';
    import { useToast } from '@/components/ui/use-toast.jsx';
    import { Beaker, PlusCircle, Trash2, Edit3, FileText, UploadCloud, Microscope } from 'lucide-react';
    import { format, parseISO } from 'date-fns';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog.jsx';

    const labTestTypes = ["Blood Test (CBC)", "Urinalysis", "X-Ray", "MRI Scan", "ECG", "Lipid Profile", "Glucose Test", "Other"];
    const requestStatuses = ["Pending", "Sample Collected", "Processing", "Completed", "Cancelled"];

    const PatientLabRequestsTab = ({ patient, updatePatientData }) => {
        const { toast } = useToast();
        const [isModalOpen, setIsModalOpen] = useState(false);
        const [editingRequest, setEditingRequest] = useState(null);
        const [requestFormData, setRequestFormData] = useState({
            testName: '',
            testType: '',
            requestDate: new Date(),
            reason: '',
            status: 'Pending',
            resultsSummary: '',
        });

        const handleOpenModal = (request = null) => {
            if (request) {
                setEditingRequest(request);
                setRequestFormData({
                    testName: request.testName || '',
                    testType: request.testType || '',
                    requestDate: request.requestDate ? parseISO(request.requestDate) : new Date(),
                    reason: request.reason || '',
                    status: request.status || 'Pending',
                    resultsSummary: request.resultsSummary || '',
                });
            } else {
                setEditingRequest(null);
                setRequestFormData({ testName: '', testType: '', requestDate: new Date(), reason: '', status: 'Pending', resultsSummary: ''});
            }
            setIsModalOpen(true);
        };

        const handleRequestSubmit = () => {
            if (!requestFormData.testName || !requestFormData.testType) {
                toast({ variant: "destructive", title: "Missing Fields", description: "Test name and type are required." });
                return;
            }
            
            const newRequest = {
                id: editingRequest ? editingRequest.id : `LAB-${Date.now()}`,
                testName: requestFormData.testName,
                testType: requestFormData.testType,
                requestDate: requestFormData.requestDate.toISOString(),
                reason: requestFormData.reason,
                status: requestFormData.status,
                resultsSummary: requestFormData.resultsSummary,
                resultFileUrl: null, 
            };

            let updatedLabRequests;
            if (editingRequest) {
                updatedLabRequests = (patient.labRequests || []).map(r => r.id === editingRequest.id ? newRequest : r);
                toast({ title: "Lab Request Updated", description: `${newRequest.testName} updated successfully.` });
            } else {
                updatedLabRequests = [...(patient.labRequests || []), newRequest];
                toast({ title: "Lab Request Added", description: `${newRequest.testName} added successfully.` });
            }
            updatePatientData({ labRequests: updatedLabRequests });
            setIsModalOpen(false);
        };

        const handleDeleteRequest = (requestId) => {
            const updatedLabRequests = (patient.labRequests || []).filter(r => r.id !== requestId);
            updatePatientData({ labRequests: updatedLabRequests });
            toast({ title: "Lab Request Deleted", variant: "destructive" });
        };
        
        const sortedRequests = useMemo(() => 
            (patient.labRequests || []).sort((a,b) => parseISO(b.requestDate) - parseISO(a.requestDate)), 
        [patient.labRequests]);

        const getStatusColor = (status) => {
            if (status === "Completed") return "text-green-600 bg-green-100";
            if (status === "Pending" || status === "Sample Collected") return "text-yellow-600 bg-yellow-100";
            if (status === "Processing") return "text-blue-600 bg-blue-100";
            if (status === "Cancelled") return "text-red-600 bg-red-100";
            return "text-gray-600 bg-gray-100";
        };

        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                <div className="flex justify-between items-center mb-6">
                    <CardTitle className="text-xl font-semibold text-gray-700 flex items-center"><Beaker className="mr-2 h-5 w-5 text-purple-600"/>Test/Lab Requests</CardTitle>
                    <Button onClick={() => handleOpenModal()} className="bg-purple-600 hover:bg-purple-700">
                        <PlusCircle className="mr-2 h-4 w-4" /> New Lab Request
                    </Button>
                </div>

                {sortedRequests.length > 0 ? (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                        {sortedRequests.map(req => (
                            <Card key={req.id} className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-purple-500">
                                <CardHeader className="py-3 px-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold text-base text-purple-700">{req.testName}</h3>
                                            <p className="text-xs text-muted-foreground">{req.testType} - Requested: {format(parseISO(req.requestDate), 'dd MMM yyyy')}</p>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(req.status)}`}>{req.status}</span>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-slate-700" onClick={() => handleOpenModal(req)}><Edit3 className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600" onClick={() => handleDeleteRequest(req.id)}><Trash2 className="h-4 w-4" /></Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="py-2 px-4 text-sm">
                                    {req.reason && <p><strong>Reason:</strong> {req.reason}</p>}
                                    {req.resultsSummary && <p className="mt-1"><strong>Results:</strong> {req.resultsSummary}</p>}
                                </CardContent>
                                {req.status === "Completed" && (
                                     <CardFooter className="py-2 px-4 border-t">
                                        <Button variant="link" size="sm" className="p-0 h-auto text-purple-600" disabled>
                                            <FileText className="mr-1 h-3 w-3" /> View Full Report (Upload Disabled)
                                        </Button>
                                    </CardFooter>
                                )}
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="p-6 border-2 border-dashed rounded-md bg-slate-50 text-center text-muted-foreground">
                        <Microscope className="mx-auto h-12 w-12 mb-2 text-gray-400" />
                        <p>No lab requests found for this patient.</p>
                    </div>
                )}

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>{editingRequest ? 'Edit' : 'New'} Lab Request</DialogTitle>
                            <DialogDescription>Enter details for the lab test request.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div>
                                <Label htmlFor="testName">Test Name</Label>
                                <Input id="testName" value={requestFormData.testName} onChange={(e) => setRequestFormData({...requestFormData, testName: e.target.value})} placeholder="e.g., Complete Blood Count" className="mt-1"/>
                            </div>
                            <div>
                                <Label htmlFor="testType">Test Type</Label>
                                <Select value={requestFormData.testType} onValueChange={(value) => setRequestFormData({...requestFormData, testType: value})}>
                                    <SelectTrigger id="testType" className="w-full mt-1"><SelectValue placeholder="Select test type" /></SelectTrigger>
                                    <SelectContent>{labTestTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="requestDate">Request Date</Label>
                                <DatePicker date={requestFormData.requestDate} setDate={(date) => setRequestFormData({...requestFormData, requestDate: date})} placeholder="Select request date" className="mt-1 w-full"/>
                            </div>
                            <div>
                                <Label htmlFor="reason">Reason for Test (Optional)</Label>
                                <Textarea id="reason" value={requestFormData.reason} onChange={(e) => setRequestFormData({...requestFormData, reason: e.target.value})} placeholder="e.g., Routine check, suspected infection" className="mt-1"/>
                            </div>
                            <div>
                                <Label htmlFor="status">Status</Label>
                                <Select value={requestFormData.status} onValueChange={(value) => setRequestFormData({...requestFormData, status: value})}>
                                    <SelectTrigger id="status" className="w-full mt-1"><SelectValue placeholder="Select status" /></SelectTrigger>
                                    <SelectContent>{requestStatuses.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            {requestFormData.status === "Completed" && (
                                <div>
                                    <Label htmlFor="resultsSummary">Results Summary (Optional)</Label>
                                    <Textarea id="resultsSummary" value={requestFormData.resultsSummary} onChange={(e) => setRequestFormData({...requestFormData, resultsSummary: e.target.value})} placeholder="e.g., All values within normal range." className="mt-1"/>
                                    <div className="mt-2">
                                       <Label htmlFor="resultFile">Upload Result File (Placeholder)</Label>
                                       <div className="mt-1 flex items-center space-x-2">
                                         <Input id="resultFile" type="file" className="flex-grow" disabled/>
                                         <Button variant="outline" size="icon" disabled><UploadCloud className="h-4 w-4"/></Button>
                                       </div>
                                       <p className="text-xs text-muted-foreground mt-1">File upload functionality is a placeholder.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                            <Button type="button" onClick={handleRequestSubmit} className="bg-purple-600 hover:bg-purple-700">{editingRequest ? 'Save Changes' : 'Add Request'}</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </motion.div>
        );
    };

    export default PatientLabRequestsTab;