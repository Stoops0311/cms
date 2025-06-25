import React, { useState, useEffect } from 'react';
    import { useNavigate, useParams } from 'react-router-dom';
    import useLocalStorage from '@/hooks/useLocalStorage.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { Input } from '@/components/ui/input.jsx';
    import { Label } from '@/components/ui/label.jsx';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card.jsx';
    import { DatePicker } from '@/components/ui/date-picker.jsx';
    import { useToast } from '@/components/ui/use-toast.jsx';
    import { UserPlus, Save, ArrowLeft, UploadCloud, Trash2 } from 'lucide-react';
    import { motion } from 'framer-motion';

    const nationalities = ["Saudi Arabian", "Indian", "Pakistani", "Filipino", "Egyptian", "Bangladeshi", "Other"]; // Example list

    const StaffRegistration = () => {
        const navigate = useNavigate();
        const { staffId } = useParams();
        const { toast } = useToast();
        const [staffList, setStaffList] = useLocalStorage('staffList', []);
        const [isEditing, setIsEditing] = useState(false);

        const initialFormData = {
            id: `STAFF-${Date.now().toString(36).substr(2, 9).toUpperCase()}`,
            fullName: '',
            iqamaNumber: '', // For KSA, or National ID / Passport for others
            nationality: '',
            passportNumber: '',
            mobileNumber: '',
            insuranceProvider: '',
            insurancePolicyNumber: '',
            insuranceExpiryDate: null,
            photoId: null, // Placeholder for uploaded photo ID
            medicalInsuranceCard: null, // Placeholder for uploaded insurance card
            joiningDate: new Date(),
            position: '',
            department: '',
            qrCodeData: '', // Will be generated
        };
        const [formData, setFormData] = useState(initialFormData);

        useEffect(() => {
            if (staffId) {
                const staffToEdit = staffList.find(s => s.id === staffId);
                if (staffToEdit) {
                    setFormData({
                        ...staffToEdit,
                        insuranceExpiryDate: staffToEdit.insuranceExpiryDate ? new Date(staffToEdit.insuranceExpiryDate) : null,
                        joiningDate: staffToEdit.joiningDate ? new Date(staffToEdit.joiningDate) : new Date(),
                    });
                    setIsEditing(true);
                } else {
                    toast({ variant: "destructive", title: "Error", description: "Staff member not found." });
                    navigate('/hr-dashboard'); 
                }
            } else {
                setFormData(initialFormData); // Reset for new registration
                setIsEditing(false);
            }
        }, [staffId, staffList, navigate, toast]);

        const handleInputChange = (e) => {
            const { name, value } = e.target;
            setFormData(prev => ({ ...prev, [name]: value }));
        };

        const handleDateChange = (name, date) => {
            setFormData(prev => ({ ...prev, [name]: date }));
        };
        
        const handleSelectChange = (name, value) => {
            setFormData(prev => ({...prev, [name]: value}));
        };

        const handleFileChange = (e, fieldName) => {
            const file = e.target.files[0];
            if (file) {
                setFormData(prev => ({ ...prev, [fieldName]: { name: file.name, type: file.type, size: file.size } }));
                 // In a real app, you would handle the file upload here (e.g., to a server or cloud storage)
                 // and store the URL or reference. For now, just storing metadata.
                 toast({ title: "File Selected", description: `${file.name} ready for upload.`});
            }
             e.target.value = null; // Reset file input
        };

        const removeFile = (fieldName) => {
            setFormData(prev => ({...prev, [fieldName]: null}));
            toast({ title: "File Removed", description: `File for ${fieldName} has been cleared.`});
        };

        const handleSubmit = (e) => {
            e.preventDefault();
            if (!formData.fullName || !formData.iqamaNumber || !formData.nationality || !formData.mobileNumber) {
                toast({ variant: "destructive", title: "Missing Fields", description: "Full Name, IQAMA/ID, Nationality, and Mobile Number are required." });
                return;
            }
            
            // QR Code Data Generation (Simple example)
            const qrData = `Name: ${formData.fullName}, ID: ${formData.iqamaNumber}, StaffID: ${formData.id}`;
            const finalData = { ...formData, qrCodeData: qrData, lastModified: new Date().toISOString() };


            if (isEditing) {
                const updatedStaffList = staffList.map(s => s.id === staffId ? finalData : s);
                setStaffList(updatedStaffList);
                toast({ title: "Staff Updated", description: `${finalData.fullName}'s details updated.` });
            } else {
                setStaffList([...staffList, finalData]);
                toast({ title: "Staff Registered", description: `${finalData.fullName} has been registered.` });
            }
            navigate('/hr-dashboard'); // Or to a staff list page
        };
        
        const renderFileInput = (label, fieldName, currentFile) => (
            <div className="space-y-1">
                <Label htmlFor={fieldName} className="flex items-center"><UploadCloud className="mr-2 h-4 w-4" />{label}</Label>
                <Input id={fieldName} type="file" onChange={(e) => handleFileChange(e, fieldName)} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/>
                {currentFile && (
                <div className="mt-1 flex items-center justify-between p-1.5 bg-muted/50 rounded-md text-xs">
                    <span className="truncate" title={currentFile.name}>{currentFile.name} ({ (currentFile.size / 1024).toFixed(1)} KB)</span>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeFile(fieldName)} className="h-6 w-6"><Trash2 className="h-3 w-3 text-destructive"/></Button>
                </div>
                )}
            </div>
        );


        return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
                <Card className="shadow-xl border-t-4 border-green-500">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="text-2xl font-bold tracking-tight text-green-600 flex items-center">
                                    <UserPlus className="mr-2 h-6 w-6"/>{isEditing ? 'Edit Staff Details' : 'New Staff Registration'}
                                </CardTitle>
                                <CardDescription>Enter the required information for the staff member.</CardDescription>
                            </div>
                            <Button variant="outline" onClick={() => navigate('/hr-dashboard')}><ArrowLeft className="mr-2 h-4 w-4"/>Back to HR</Button>
                        </div>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-6">
                            <section>
                                <h3 className="text-md font-semibold mb-2 border-b pb-1 text-gray-700">Personal Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div><Label htmlFor="fullName">Full Name</Label><Input id="fullName" name="fullName" value={formData.fullName} onChange={handleInputChange} required /></div>
                                    <div>
                                        <Label htmlFor="nationality">Nationality</Label>
                                        <Select name="nationality" value={formData.nationality} onValueChange={(value) => handleSelectChange('nationality', value)}>
                                            <SelectTrigger id="nationality"><SelectValue placeholder="Select nationality"/></SelectTrigger>
                                            <SelectContent>{nationalities.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </div>
                                    <div><Label htmlFor="iqamaNumber">IQAMA / National ID</Label><Input id="iqamaNumber" name="iqamaNumber" value={formData.iqamaNumber} onChange={handleInputChange} required /></div>
                                    <div><Label htmlFor="passportNumber">Passport Number (Optional)</Label><Input id="passportNumber" name="passportNumber" value={formData.passportNumber} onChange={handleInputChange} /></div>
                                    <div><Label htmlFor="mobileNumber">Mobile Number</Label><Input id="mobileNumber" name="mobileNumber" type="tel" value={formData.mobileNumber} onChange={handleInputChange} required /></div>
                                </div>
                            </section>
                            
                            <section>
                                <h3 className="text-md font-semibold mb-2 border-b pb-1 text-gray-700">Employment Details</h3>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div><Label htmlFor="position">Position / Title</Label><Input id="position" name="position" value={formData.position} onChange={handleInputChange} placeholder="e.g., Site Engineer, HR Officer"/></div>
                                    <div><Label htmlFor="department">Department</Label><Input id="department" name="department" value={formData.department} onChange={handleInputChange} placeholder="e.g., Civil, MEP, HR"/></div>
                                    <div><Label htmlFor="joiningDate">Joining Date</Label><DatePicker date={formData.joiningDate} setDate={(date) => handleDateChange('joiningDate', date)} /></div>
                                </div>
                            </section>

                            <section>
                                <h3 className="text-md font-semibold mb-2 border-b pb-1 text-gray-700">Insurance Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div><Label htmlFor="insuranceProvider">Insurance Provider</Label><Input id="insuranceProvider" name="insuranceProvider" value={formData.insuranceProvider} onChange={handleInputChange} /></div>
                                    <div><Label htmlFor="insurancePolicyNumber">Policy Number</Label><Input id="insurancePolicyNumber" name="insurancePolicyNumber" value={formData.insurancePolicyNumber} onChange={handleInputChange} /></div>
                                    <div><Label htmlFor="insuranceExpiryDate">Insurance Expiry Date</Label><DatePicker date={formData.insuranceExpiryDate} setDate={(date) => handleDateChange('insuranceExpiryDate', date)} /></div>
                                </div>
                            </section>
                            
                            <section>
                                <h3 className="text-md font-semibold mb-2 border-b pb-1 text-gray-700">Document Uploads</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                   {renderFileInput("Photo ID (IQAMA/Passport)", "photoId", formData.photoId)}
                                   {renderFileInput("Medical Insurance Card", "medicalInsuranceCard", formData.medicalInsuranceCard)}
                                </div>
                            </section>

                        </CardContent>
                        <CardFooter className="flex justify-end space-x-3 py-4 border-t">
                            <Button type="button" variant="outline" onClick={() => navigate('/hr-dashboard')}>Cancel</Button>
                            <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white"><Save className="mr-2 h-4 w-4"/>{isEditing ? 'Save Changes' : 'Register Staff'}</Button>
                        </CardFooter>
                    </form>
                </Card>
            </motion.div>
        );
    };

    export default StaffRegistration;