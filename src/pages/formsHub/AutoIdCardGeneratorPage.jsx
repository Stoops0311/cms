import React, { useState } from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { Input } from '@/components/ui/input.jsx';
    import { Label } from '@/components/ui/label.jsx';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
    import { DatePicker } from '@/components/ui/date-picker.jsx';
    import { WalletCards as IdCard, QrCode, User, Briefcase, UploadCloud, Download, AlertTriangle } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast.jsx';
    import { motion } from 'framer-motion';
    import { useNavigate } from 'react-router-dom';

    const AutoIdCardGeneratorPage = () => {
        const { toast } = useToast();
        const navigate = useNavigate();

        const [fullName, setFullName] = useState('');
        const [employeeId, setEmployeeId] = useState('');
        const [role, setRole] = useState('');
        const [department, setDepartment] = useState('');
        const [issueDate, setIssueDate] = useState(new Date());
        const [expiryDate, setExpiryDate] = useState(null);
        const [photo, setPhoto] = useState(null);
        const [photoPreview, setPhotoPreview] = useState(null);

        const handlePhotoChange = (e) => {
            if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                if (file.size > 2 * 1024 * 1024) { // Max 2MB
                    toast({ variant: "destructive", title: "Photo too large", description: "Maximum photo size is 2MB." });
                    return;
                }
                setPhoto(file);
                setPhotoPreview(URL.createObjectURL(file));
            }
        };

        const handleSubmit = (e) => {
            e.preventDefault();
            if (!fullName || !employeeId || !role || !department || !issueDate || !photo) {
                toast({ variant: "destructive", title: "Missing Fields", description: "All fields including photo are required to generate ID card." });
                return;
            }
            
            toast({ 
                title: "ID Card Generation (Conceptual)", 
                description: `Simulating ID card generation for ${fullName}. QR code and download would be available here.`,
                className: "bg-blue-500 text-white"
            });
            // In a real app, this would trigger backend processing or client-side generation
        };

        return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
                <Card className="shadow-xl border-t-4 border-sky-600">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-sky-700 flex items-center"><IdCard className="mr-3 h-7 w-7"/>Auto ID Card with QR Code Generator</CardTitle>
                        <CardDescription>Generate official ID cards with QR codes for staff members.</CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-sky-700 border-b pb-2">Staff Details</h3>
                                <div><Label htmlFor="fullName-id">Full Name</Label><Input id="fullName-id" value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="e.g., John Doe"/></div>
                                <div><Label htmlFor="employeeId-id">Employee ID</Label><Input id="employeeId-id" value={employeeId} onChange={e=>setEmployeeId(e.target.value)} placeholder="e.g., EMP00123"/></div>
                                <div><Label htmlFor="role-id">Role / Designation</Label><Input id="role-id" value={role} onChange={e=>setRole(e.target.value)} placeholder="e.g., Site Engineer"/></div>
                                <div><Label htmlFor="department-id">Department</Label><Input id="department-id" value={department} onChange={e=>setDepartment(e.target.value)} placeholder="e.g., Civil Engineering"/></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><Label htmlFor="issueDate-id">Issue Date</Label><DatePicker id="issueDate-id" date={issueDate} setDate={setIssueDate} className="w-full"/></div>
                                    <div><Label htmlFor="expiryDate-id">Expiry Date (Optional)</Label><DatePicker id="expiryDate-id" date={expiryDate} setDate={setExpiryDate} className="w-full"/></div>
                                </div>
                                <div>
                                    <Label htmlFor="photo-id" className="flex items-center"><UploadCloud className="mr-2 h-4 w-4" />Upload Staff Photo (Max 2MB)</Label>
                                    <Input id="photo-id" type="file" onChange={handlePhotoChange} accept="image/jpeg, image/png" />
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-sky-700 border-b pb-2">ID Card Preview (Conceptual)</h3>
                                <Card className="p-4 bg-gradient-to-br from-slate-100 to-slate-200 min-h-[280px] flex flex-col items-center justify-center">
                                    {photoPreview ? (
                                        <img-replace src={photoPreview} alt="Staff Preview" className="w-24 h-24 rounded-full object-cover mb-3 border-2 border-sky-500 shadow-md" />
                                    ) : (
                                        <div className="w-24 h-24 rounded-full bg-slate-300 flex items-center justify-center mb-3 border-2 border-dashed border-slate-400">
                                            <User className="h-12 w-12 text-slate-500"/>
                                        </div>
                                    )}
                                    <p className="font-bold text-lg text-sky-800">{fullName || "Full Name"}</p>
                                    <p className="text-sm text-slate-700">{employeeId || "Employee ID"}</p>
                                    <p className="text-xs text-slate-600">{role || "Designation"} - {department || "Department"}</p>
                                    <div className="mt-3 p-2 bg-white rounded shadow">
                                        <QrCode className="h-16 w-16 text-slate-700"/>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">QR Code (Conceptual)</p>
                                </Card>
                                <div className="mt-2 p-3 bg-sky-50 border-l-4 border-sky-400 text-sky-700 rounded-md text-sm">
                                    <div className="flex">
                                        <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
                                        <span>Actual ID card layout and QR code generation will be more detailed. This is a simplified preview.</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end space-x-2 border-t pt-6">
                            <Button type="button" variant="outline" onClick={()=>navigate('/forms-documents')}>Cancel</Button>
                            <Button type="submit" className="bg-sky-600 hover:bg-sky-700 flex items-center">
                                <Download className="mr-2 h-4 w-4"/>Generate & Download ID (Conceptual)
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </motion.div>
        );
    };
    export default AutoIdCardGeneratorPage;