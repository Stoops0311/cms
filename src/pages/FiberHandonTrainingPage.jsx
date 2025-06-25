import React, { useState } from 'react';
    import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription as DDesc } from '@/components/ui/dialog.jsx';
    import { useToast } from '@/components/ui/use-toast.jsx';
    import useLocalStorage from '@/hooks/useLocalStorage.jsx';
    import { motion } from 'framer-motion';
    import { Award, UserPlus, Users, ListChecks, DollarSign, UploadCloud, Paperclip, Trash2 } from 'lucide-react';
    import { Input } from '@/components/ui/input.jsx';
    import { Label } from '@/components/ui/label.jsx';
    import { Textarea } from '@/components/ui/textarea.jsx';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';

    const trainingTypes = [
        { id: "FOT1M", name: "Fiber Optics Technician (1 Month)", duration: "1 Month" },
        { id: "AFS2M", name: "Advanced Fiber Splicing (2 Months)", duration: "2 Months" },
        { id: "FND4M", name: "Fiber Network Design (4 Months)", duration: "4 Months" },
        { id: "MFP6M", name: "Master Fiber Optic Professional (6 Months)", duration: "6 Months" },
    ];

    const FiberTrainingRegistrationForm = ({ onSubmit, onCancel }) => {
        const [candidateName, setCandidateName] = useState('');
        const [email, setEmail] = useState('');
        const [phone, setPhone] = useState('');
        const [address, setAddress] = useState('');
        const [previousExperience, setPreviousExperience] = useState('');
        const [trainingTypeId, setTrainingTypeId] = useState(trainingTypes[0].id);
        const [idProof, setIdProof] = useState(null);
        const { toast } = useToast();

        const handleFileChange = (e) => {
            if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                if (file.size > 5 * 1024 * 1024) { // Max 5MB
                    toast({ variant: "destructive", title: "File too large", description: "ID proof max size is 5MB." });
                    return;
                }
                setIdProof(file);
            }
        };

        const handleSubmit = (e) => {
            e.preventDefault();
            if (!candidateName || !email || !phone || !trainingTypeId) {
                toast({ variant: "destructive", title: "Missing Fields", description: "Name, Email, Phone, and Training Type are required." });
                return;
            }
            onSubmit({
                id: `FIBER-CAND-${Date.now()}`,
                candidateName, email, phone, address, previousExperience, trainingTypeId,
                idProofName: idProof ? idProof.name : null,
                registrationDate: new Date().toISOString(),
                status: "Pending Payment"
            });
        };

        return (
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto p-1 custom-scrollbar">
                <div><Label htmlFor="candidateName">Full Name</Label><Input id="candidateName" value={candidateName} onChange={e => setCandidateName(e.target.value)} placeholder="Enter candidate's full name" /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><Label htmlFor="email">Email Address</Label><Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="candidate@example.com" /></div>
                    <div><Label htmlFor="phone">Phone Number</Label><Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" /></div>
                </div>
                <div><Label htmlFor="address">Full Address</Label><Textarea id="address" value={address} onChange={e => setAddress(e.target.value)} placeholder="Enter full residential address" rows={2}/></div>
                <div><Label htmlFor="experience">Previous Experience (Optional)</Label><Textarea id="experience" value={previousExperience} onChange={e => setPreviousExperience(e.target.value)} placeholder="Briefly describe any relevant experience" rows={2}/></div>
                <div>
                    <Label htmlFor="trainingType">Select Training Program</Label>
                    <Select value={trainingTypeId} onValueChange={setTrainingTypeId}>
                        <SelectTrigger id="trainingType"><SelectValue placeholder="Select Training" /></SelectTrigger>
                        <SelectContent>{trainingTypes.map(t => <SelectItem key={t.id} value={t.id}>{t.name} ({t.duration})</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="idProof" className="flex items-center"><UploadCloud className="mr-2 h-4 w-4" />Upload ID Proof (PDF/JPG, Max 5MB)</Label>
                    <Input id="idProof" type="file" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" />
                    {idProof && <p className="text-xs text-muted-foreground mt-1 flex items-center"><Paperclip className="h-3 w-3 mr-1"/>{idProof.name} <Button type="button" variant="ghost" size="xs" onClick={() => setIdProof(null)} className="ml-2 text-destructive"><Trash2 className="h-3 w-3"/></Button></p>}
                </div>
                <Card className="mt-4 bg-slate-50 border-slate-200">
                    <CardHeader className="pb-2"><CardTitle className="text-md flex items-center text-slate-700"><DollarSign className="mr-2 h-5 w-5"/>Payment Information</CardTitle></CardHeader>
                    <CardContent className="text-sm text-slate-600 space-y-1">
                        <p>Course fees vary by program. Upon submission, you will receive an email with detailed payment instructions.</p>
                        <p>Accepted methods: Bank Transfer, Online Payment Gateway (Details will be provided).</p>
                        <p className="font-semibold">All programs include a certificate from our 33-year experienced company upon successful completion.</p>
                    </CardContent>
                </Card>
                <DialogFooter className="pt-4">
                    <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                    <Button type="submit" className="bg-purple-600 hover:bg-purple-700">Register Candidate</Button>
                </DialogFooter>
            </form>
        );
    };

    const FiberHandonTrainingPage = () => {
        const [registrations, setRegistrations] = useLocalStorage('cmsFiberTrainingRegistrations', []);
        const [isModalOpen, setIsModalOpen] = useState(false);
        const { toast } = useToast();

        const handleSaveRegistration = (data) => {
            setRegistrations(prev => [data, ...prev]);
            toast({ title: "Candidate Registration Submitted", description: `${data.candidateName} is pending payment for ${trainingTypes.find(t=>t.id === data.trainingTypeId)?.name}.` });
            setIsModalOpen(false);
        };

        return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="p-4 md:p-6 lg:p-8">
                <Card className="shadow-xl border-t-4 border-purple-600 mb-8">
                    <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div>
                            <CardTitle className="text-2xl font-bold text-purple-700 flex items-center"><Award className="mr-3 h-7 w-7"/>Fiber Handon Training Program</CardTitle>
                            <CardDescription>Register candidates for specialized fiber optics training courses. Certified by a 33-year experienced company.</CardDescription>
                        </div>
                        <Button onClick={() => setIsModalOpen(true)} className="mt-4 md:mt-0 bg-purple-600 hover:bg-purple-700">
                            <UserPlus className="mr-2 h-4 w-4"/>Register New Candidate
                        </Button>
                    </CardHeader>
                </Card>

                <Card>
                    <CardHeader><CardTitle className="flex items-center"><ListChecks className="mr-2 h-5 w-5"/>Registered Candidates ({registrations.length})</CardTitle></CardHeader>
                    <CardContent>
                        {registrations.length === 0 ? (
                            <p className="text-muted-foreground text-center py-8">No candidates registered yet. Click "Register New Candidate" to begin.</p>
                        ) : (
                            <div className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
                                {registrations.map(reg => (
                                    <Card key={reg.id} className="bg-slate-50/70">
                                        <CardHeader className="flex flex-row justify-between items-start p-4">
                                            <div>
                                                <CardTitle className="text-md">{reg.candidateName}</CardTitle>
                                                <CardDescription className="text-xs">{reg.email} | {reg.phone}</CardDescription>
                                            </div>
                                            <span className={`px-2 py-1 text-xs rounded-full ${reg.status === "Paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{reg.status}</span>
                                        </CardHeader>
                                        <CardContent className="p-4 pt-0 text-sm">
                                            <p><strong>Training:</strong> {trainingTypes.find(t=>t.id === reg.trainingTypeId)?.name || 'N/A'}</p>
                                            <p><strong>Registered On:</strong> {new Date(reg.registrationDate).toLocaleDateString()}</p>
                                            {reg.idProofName && <p className="flex items-center text-xs text-muted-foreground"><Paperclip className="h-3 w-3 mr-1"/>ID Proof: {reg.idProofName}</p>}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="sm:max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>New Candidate Registration</DialogTitle>
                            <DDesc>Fill in the details for the new training candidate.</DDesc>
                        </DialogHeader>
                        <FiberTrainingRegistrationForm onSubmit={handleSaveRegistration} onCancel={() => setIsModalOpen(false)} />
                    </DialogContent>
                </Dialog>
            </motion.div>
        );
    };

    export default FiberHandonTrainingPage;