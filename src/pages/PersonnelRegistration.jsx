import React, { useState, useEffect } from 'react';
    import { useParams, useNavigate } from 'react-router-dom';
    import { motion } from 'framer-motion';
    import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { Input } from '@/components/ui/input.jsx';
    import { Label } from '@/components/ui/label.jsx';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
    import { DatePicker } from '@/components/ui/date-picker.jsx';
    import { Textarea } from '@/components/ui/textarea.jsx';
    import { useToast } from '@/components/ui/use-toast.jsx';
    import useLocalStorage from '@/hooks/useLocalStorage.jsx';
    import { UserPlus, UploadCloud, QrCode, Save, ArrowLeft, Trash2, ShieldCheck } from 'lucide-react';
    import { format, parseISO, isValid } from 'date-fns';

    const initialFormData = {
      fullName: '',
      role: '',
      department: '',
      mobileNumber: '',
      email: '',
      nationalId: '',
      passportNumber: '',
      nationality: '',
      dob: null,
      gender: '',
      address: '',
      assignedLocation: '',
      documents: [], 
    };
    
    const roles = ["Doctor", "Nurse", "Driver", "Pharmacist", "Admin", "Paramedic", "Facility Manager", "Technician", "Support Staff"];
    const departments = ["General Medicine", "Cardiology", "Pediatrics", "Emergency Services", "Pharmacy", "Administration", "Logistics", "Radiology", "Laboratory"];
    const genders = ["Male", "Female", "Other"];
    const documentTypes = ["Passport Copy", "ID/Iqama", "Medical License", "Medical Insurance Card", "Employment Contract", "Photo ID", "Driving License", "Educational Certificate"];

    const PersonnelRegistration = () => {
      const { staffId: editingStaffId } = useParams();
      const navigate = useNavigate();
      const { toast } = useToast();
      const [personnelList, setPersonnelList] = useLocalStorage('personnelList', []);
      const [formData, setFormData] = useState(initialFormData);
      const [currentDocument, setCurrentDocument] = useState({ type: '', number: '', expiryDate: null, file: null });
      const [isEditing, setIsEditing] = useState(false);

      useEffect(() => {
        if (editingStaffId) {
          const staffToEdit = personnelList.find(p => p.id === editingStaffId);
          if (staffToEdit) {
            setFormData({
              ...staffToEdit,
              dob: staffToEdit.dob ? parseISO(staffToEdit.dob) : null,
              documents: staffToEdit.documents ? staffToEdit.documents.map(doc => ({...doc, expiryDate: doc.expiryDate ? parseISO(doc.expiryDate) : null })) : []
            });
            setIsEditing(true);
          } else {
            toast({ variant: "destructive", title: "Error", description: "Staff member not found." });
            navigate('/personnel-dashboard');
          }
        } else {
          setFormData(initialFormData);
          setIsEditing(false);
        }
      }, [editingStaffId, personnelList, toast, navigate]);

      const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
      };

      const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
      };

      const handleDateChange = (name, date) => {
        setFormData(prev => ({ ...prev, [name]: date }));
      };
      
      const handleCurrentDocChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "file") {
            setCurrentDocument(prev => ({ ...prev, [name]: files[0] }));
        } else {
            setCurrentDocument(prev => ({ ...prev, [name]: value }));
        }
      };

      const handleCurrentDocDateChange = (date) => {
        setCurrentDocument(prev => ({ ...prev, expiryDate: date }));
      };
      
      const handleAddDocument = () => {
        if (!currentDocument.type || !currentDocument.number || !currentDocument.expiryDate) {
            toast({ variant: "destructive", title: "Missing Document Info", description: "Please provide document type, number, and expiry date." });
            return;
        }
        setFormData(prev => ({
            ...prev,
            documents: [...prev.documents, { ...currentDocument, id: `doc_${Date.now()}` }]
        }));
        setCurrentDocument({ type: '', number: '', expiryDate: null, file: null });
        toast({ title: "Document Added", description: `${currentDocument.type} ready to be saved with profile.`, className: "bg-sky-500 text-white" });
      };

      const handleRemoveDocument = (docId) => {
        setFormData(prev => ({
            ...prev,
            documents: prev.documents.filter(doc => doc.id !== docId)
        }));
        toast({ title: "Document Removed", description: "Document removed from list.", className: "bg-orange-500 text-white" });
      };


      const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.fullName || !formData.role || !formData.nationalId || !formData.mobileNumber) {
          toast({ variant: "destructive", title: "Missing Required Fields", description: "Full Name, Role, National ID, and Mobile Number are required." });
          return;
        }

        const staffData = {
          ...formData,
          id: isEditing ? editingStaffId : `STAFF${Date.now()}`,
          dob: formData.dob ? format(formData.dob, 'yyyy-MM-dd') : null,
          documents: formData.documents.map(doc => ({
            ...doc,
            expiryDate: doc.expiryDate ? format(doc.expiryDate, 'yyyy-MM-dd') : null,
            fileName: doc.file ? doc.file.name : doc.fileName || null, 
            file: null 
          })),
          qrCode: `PAMS-STAFF-${isEditing ? editingStaffId : `STAFF${Date.now()}`}`, 
          onboardingStatus: formData.documents.length > 0 ? "Pending Document Verification" : "Awaiting Documents",
          status: formData.status || "Active"
        };

        if (isEditing) {
          setPersonnelList(personnelList.map(p => p.id === editingStaffId ? staffData : p));
          toast({ title: "Personnel Updated", description: `${staffData.fullName}'s profile has been updated.`, className: "bg-green-500 text-white" });
        } else {
          setPersonnelList([...personnelList, staffData]);
          toast({ title: "Personnel Registered", description: `${staffData.fullName} has been successfully registered.`, className: "bg-green-500 text-white" });
        }
        navigate('/personnel-dashboard');
      };
      
      const inputFieldClass = "mt-1";
      const sectionTitleClass = "text-lg font-semibold text-primary mb-3 border-b pb-2";

      return (
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="shadow-xl border-t-4 border-primary">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-blue-600/10">
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl font-bold text-primary flex items-center">
                  <UserPlus className="mr-3 h-7 w-7" /> {isEditing ? "Edit Personnel Profile" : "Register New Personnel"}
                </CardTitle>
                <Button variant="outline" onClick={() => navigate('/personnel-dashboard')}><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Button>
              </div>
              <CardDescription className="mt-1">{isEditing ? `Updating profile for ${formData.fullName || 'staff member'}.` : "Complete the form to add new healthcare personnel."}</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="p-6 space-y-8">
                
                <div>
                  <h3 className={sectionTitleClass}>Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div><Label htmlFor="fullName">Full Name *</Label><Input id="fullName" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Enter full name" className={inputFieldClass} required /></div>
                    <div><Label htmlFor="role">Role/Designation *</Label><Select name="role" value={formData.role} onValueChange={(val) => handleSelectChange('role', val)} required><SelectTrigger id="role" className={inputFieldClass}><SelectValue placeholder="Select role" /></SelectTrigger><SelectContent>{roles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select></div>
                    <div><Label htmlFor="department">Department/Unit</Label><Select name="department" value={formData.department} onValueChange={(val) => handleSelectChange('department', val)}><SelectTrigger id="department" className={inputFieldClass}><SelectValue placeholder="Select department" /></SelectTrigger><SelectContent>{departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></div>
                    <div><Label htmlFor="mobileNumber">Mobile Number * (OTP Simulated)</Label><Input id="mobileNumber" name="mobileNumber" type="tel" value={formData.mobileNumber} onChange={handleInputChange} placeholder="e.g., 05XXXXXXXX" className={inputFieldClass} required /></div>
                    <div><Label htmlFor="email">Email Address (Optional)</Label><Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="Enter email address" className={inputFieldClass} /></div>
                    <div><Label htmlFor="dob">Date of Birth</Label><DatePicker date={formData.dob} setDate={(date) => handleDateChange('dob', date)} className={inputFieldClass} placeholder="Select date of birth" /></div>
                    <div><Label htmlFor="gender">Gender</Label><Select name="gender" value={formData.gender} onValueChange={(val) => handleSelectChange('gender', val)}><SelectTrigger id="gender" className={inputFieldClass}><SelectValue placeholder="Select gender" /></SelectTrigger><SelectContent>{genders.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent></Select></div>
                    <div><Label htmlFor="nationality">Nationality</Label><Input id="nationality" name="nationality" value={formData.nationality} onChange={handleInputChange} placeholder="Enter nationality" className={inputFieldClass} /></div>
                  </div>
                </div>

                <div>
                  <h3 className={sectionTitleClass}>Identification & Location</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div><Label htmlFor="nationalId">National ID/Iqama Number *</Label><Input id="nationalId" name="nationalId" value={formData.nationalId} onChange={handleInputChange} placeholder="Enter ID/Iqama number" className={inputFieldClass} required /></div>
                    <div><Label htmlFor="passportNumber">Passport Number</Label><Input id="passportNumber" name="passportNumber" value={formData.passportNumber} onChange={handleInputChange} placeholder="Enter passport number" className={inputFieldClass} /></div>
                    <div><Label htmlFor="assignedLocation">Camp/Clinic Assigned Location</Label><Input id="assignedLocation" name="assignedLocation" value={formData.assignedLocation} onChange={handleInputChange} placeholder="e.g., Camp Alpha Clinic" className={inputFieldClass} /></div>
                    <div className="md:col-span-2 lg:col-span-3"><Label htmlFor="address">Address</Label><Textarea id="address" name="address" value={formData.address} onChange={handleInputChange} placeholder="Enter full address" className={inputFieldClass} /></div>
                  </div>
                </div>

                <div>
                    <h3 className={sectionTitleClass}>Document Management</h3>
                    <Card className="bg-slate-50 p-4">
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                <div><Label htmlFor="docType">Document Type</Label><Select name="type" value={currentDocument.type} onValueChange={(val) => setCurrentDocument(prev => ({...prev, type: val}))}><SelectTrigger id="docType" className={inputFieldClass}><SelectValue placeholder="Select type"/></SelectTrigger><SelectContent>{documentTypes.map(dt => <SelectItem key={dt} value={dt}>{dt}</SelectItem>)}</SelectContent></Select></div>
                                <div><Label htmlFor="docNumber">Document Number</Label><Input id="docNumber" name="number" value={currentDocument.number} onChange={handleCurrentDocChange} placeholder="Number" className={inputFieldClass}/></div>
                                <div><Label htmlFor="docExpiry">Expiry Date</Label><DatePicker date={currentDocument.expiryDate} setDate={handleCurrentDocDateChange} className={inputFieldClass} placeholder="Expiry"/></div>
                                <Button type="button" onClick={handleAddDocument} variant="secondary" className="w-full md:w-auto"><UploadCloud className="mr-2 h-4 w-4"/>Add Document</Button>
                            </div>
                             <div><Label htmlFor="docFile">Upload File (Simulated)</Label><Input id="docFile" name="file" type="file" onChange={handleCurrentDocChange} className={inputFieldClass + " file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"}/></div>
                        </CardContent>
                    </Card>
                    {formData.documents && formData.documents.length > 0 && (
                        <div className="mt-4 space-y-2">
                            <h4 className="text-md font-medium text-muted-foreground">Uploaded Documents:</h4>
                            <ul className="list-none space-y-2">
                                {formData.documents.map(doc => (
                                    <li key={doc.id} className="flex justify-between items-center p-3 border rounded-md bg-white shadow-sm">
                                        <div>
                                            <p className="font-semibold">{doc.type}: <span className="font-normal">{doc.number}</span></p>
                                            <p className="text-xs text-gray-600">
                                                Expires: {doc.expiryDate ? format(doc.expiryDate, 'dd MMM yyyy') : 'N/A'}
                                                {doc.file && ` | File: ${doc.file.name}`}
                                                {!doc.file && doc.fileName && ` | File: ${doc.fileName}`}
                                            </p>
                                        </div>
                                        <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveDocument(doc.id)} className="text-red-500 hover:text-red-700">
                                            <Trash2 className="h-4 w-4"/>
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {isEditing && (
                    <div>
                        <h3 className={sectionTitleClass}>System Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div><Label>Staff ID</Label><Input value={editingStaffId} className={inputFieldClass} readOnly disabled /></div>
                            <div><Label>QR Code (Simulated)</Label>
                                <div className="p-2 border rounded-md mt-1 bg-gray-100 flex items-center justify-center h-10">
                                    <QrCode className="h-6 w-6 text-gray-600"/> <span className="ml-2 text-sm text-gray-700">Viewable on Profile</span>
                                </div>
                            </div>
                             <div><Label htmlFor="status">Account Status</Label><Select name="status" value={formData.status} onValueChange={(val) => handleSelectChange('status', val)}><SelectTrigger id="status" className={inputFieldClass}><SelectValue placeholder="Select status" /></SelectTrigger><SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Onboarding">Onboarding</SelectItem><SelectItem value="Archived">Archived</SelectItem></SelectContent></Select></div>
                        </div>
                    </div>
                )}

              </CardContent>
              <CardFooter className="p-6 border-t flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={() => navigate('/personnel-dashboard')}>Cancel</Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">
                  <Save className="mr-2 h-5 w-5" /> {isEditing ? "Save Changes" : "Register Personnel"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      );
    };

    export default PersonnelRegistration;