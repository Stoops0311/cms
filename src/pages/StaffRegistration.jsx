import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card.jsx';
import { DatePicker } from '@/components/ui/date-picker.jsx';
import { useToast } from '@/components/ui/use-toast.jsx';
import { UserPlus, Save, ArrowLeft, UploadCloud, Trash2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { format } from 'date-fns';

const nationalities = ["Saudi Arabian", "Indian", "Pakistani", "Filipino", "Egyptian", "Bangladeshi", "Other"];
const roles = ["staff", "manager", "admin", "contractor"];

const StaffRegistration = () => {
  const navigate = useNavigate();
  const { staffId } = useParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Convex queries
  const existingUser = useQuery(
    api.users.getUserById,
    staffId ? { userId: staffId } : "skip"
  );

  // Convex mutations
  const createUser = useMutation(api.users.createUser);
  const updateUser = useMutation(api.users.updateUser);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);

  const isEditing = !!staffId && existingUser;

  const initialFormData = {
    fullName: '',
    email: '',
    iqamaNumber: '',
    nationality: '',
    passportNumber: '',
    mobileNumber: '',
    insuranceProvider: '',
    insurancePolicyNumber: '',
    insuranceExpiryDate: null,
    photoId: null,
    medicalInsuranceCard: null,
    joiningDate: new Date(),
    position: '',
    department: '',
    role: 'staff',
  };

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    if (existingUser) {
      setFormData({
        fullName: existingUser.fullName || '',
        email: existingUser.email || '',
        iqamaNumber: existingUser.iqamaNumber || '',
        nationality: existingUser.nationality || '',
        passportNumber: existingUser.passportNumber || '',
        mobileNumber: existingUser.mobileNumber || '',
        insuranceProvider: existingUser.insuranceProvider || '',
        insurancePolicyNumber: existingUser.insurancePolicyNumber || '',
        insuranceExpiryDate: existingUser.insuranceExpiryDate ? new Date(existingUser.insuranceExpiryDate) : null,
        photoId: existingUser.photoId || null,
        medicalInsuranceCard: existingUser.medicalInsuranceCard || null,
        joiningDate: existingUser.joiningDate ? new Date(existingUser.joiningDate) : new Date(),
        position: existingUser.position || '',
        department: existingUser.department || '',
        role: existingUser.role || 'staff',
      });
    }
  }, [existingUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name, date) => {
    setFormData(prev => ({ ...prev, [name]: date }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      try {
        // Upload file to Convex storage
        const uploadUrl = await generateUploadUrl();
        const response = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        const { storageId } = await response.json();
        setFormData(prev => ({ ...prev, [fieldName]: storageId }));
        toast({ title: "File Uploaded", description: `${file.name} uploaded successfully.` });
      } catch (error) {
        toast({ variant: "destructive", title: "Upload Failed", description: error.message || "Failed to upload file." });
      }
    }
    e.target.value = null;
  };

  const removeFile = (fieldName) => {
    setFormData(prev => ({ ...prev, [fieldName]: null }));
    toast({ title: "File Removed", description: `File has been cleared.` });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.iqamaNumber || !formData.nationality || !formData.mobileNumber) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Full Name, Email, IQAMA/ID, Nationality, and Mobile Number are required." });
      return;
    }

    const qrData = `Name: ${formData.fullName}, ID: ${formData.iqamaNumber}, Email: ${formData.email}`;

    setIsSubmitting(true);
    try {
      if (isEditing) {
        await updateUser({
          userId: staffId,
          fullName: formData.fullName,
          department: formData.department || undefined,
          position: formData.position || undefined,
          mobileNumber: formData.mobileNumber || undefined,
          iqamaNumber: formData.iqamaNumber || undefined,
          nationality: formData.nationality || undefined,
          passportNumber: formData.passportNumber || undefined,
          joiningDate: formData.joiningDate ? format(formData.joiningDate, 'yyyy-MM-dd') : undefined,
          insuranceProvider: formData.insuranceProvider || undefined,
          insurancePolicyNumber: formData.insurancePolicyNumber || undefined,
          insuranceExpiryDate: formData.insuranceExpiryDate ? format(formData.insuranceExpiryDate, 'yyyy-MM-dd') : undefined,
          qrCodeData: qrData,
        });
        toast({ title: "Staff Updated", description: `${formData.fullName}'s details updated.` });
      } else {
        await createUser({
          email: formData.email,
          fullName: formData.fullName,
          role: formData.role,
          department: formData.department || undefined,
          position: formData.position || undefined,
          mobileNumber: formData.mobileNumber || undefined,
          iqamaNumber: formData.iqamaNumber || undefined,
          nationality: formData.nationality || undefined,
          passportNumber: formData.passportNumber || undefined,
          joiningDate: formData.joiningDate ? format(formData.joiningDate, 'yyyy-MM-dd') : undefined,
          insuranceProvider: formData.insuranceProvider || undefined,
          insurancePolicyNumber: formData.insurancePolicyNumber || undefined,
          insuranceExpiryDate: formData.insuranceExpiryDate ? format(formData.insuranceExpiryDate, 'yyyy-MM-dd') : undefined,
          qrCodeData: qrData,
        });
        toast({ title: "Staff Registered", description: `${formData.fullName} has been registered.` });
      }
      navigate('/hr-dashboard');
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to save staff member." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFileInput = (label, fieldName, currentFile) => (
    <div className="space-y-1">
      <Label htmlFor={fieldName} className="flex items-center"><UploadCloud className="mr-2 h-4 w-4" />{label}</Label>
      <Input id={fieldName} type="file" onChange={(e) => handleFileChange(e, fieldName)} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
      {currentFile && (
        <div className="mt-1 flex items-center justify-between p-1.5 bg-muted/50 rounded-md text-xs">
          <span className="truncate">File uploaded (ID: {currentFile.toString().slice(-8)})</span>
          <Button type="button" variant="ghost" size="icon" onClick={() => removeFile(fieldName)} className="h-6 w-6"><Trash2 className="h-3 w-3 text-destructive" /></Button>
        </div>
      )}
    </div>
  );

  if (staffId && existingUser === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
        <span className="ml-2 text-muted-foreground">Loading staff details...</span>
      </div>
    );
  }

  if (staffId && existingUser === null) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground mb-4">Staff member not found.</p>
        <Button variant="outline" onClick={() => navigate('/hr-dashboard')}>
          <ArrowLeft className="mr-2 h-4 w-4" />Back to HR
        </Button>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
      <Card className="shadow-xl border-t-4 border-green-500">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold tracking-tight text-green-600 flex items-center">
                <UserPlus className="mr-2 h-6 w-6" />{isEditing ? 'Edit Staff Details' : 'New Staff Registration'}
              </CardTitle>
              <CardDescription>Enter the required information for the staff member.</CardDescription>
            </div>
            <Button variant="outline" onClick={() => navigate('/hr-dashboard')}><ArrowLeft className="mr-2 h-4 w-4" />Back to HR</Button>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <section>
              <h3 className="text-md font-semibold mb-2 border-b pb-1 text-gray-700">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label htmlFor="fullName">Full Name</Label><Input id="fullName" name="fullName" value={formData.fullName} onChange={handleInputChange} required /></div>
                <div><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required disabled={isEditing} /></div>
                <div>
                  <Label htmlFor="nationality">Nationality</Label>
                  <Select name="nationality" value={formData.nationality} onValueChange={(value) => handleSelectChange('nationality', value)}>
                    <SelectTrigger id="nationality"><SelectValue placeholder="Select nationality" /></SelectTrigger>
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
                <div><Label htmlFor="position">Position / Title</Label><Input id="position" name="position" value={formData.position} onChange={handleInputChange} placeholder="e.g., Site Engineer, HR Officer" /></div>
                <div><Label htmlFor="department">Department</Label><Input id="department" name="department" value={formData.department} onChange={handleInputChange} placeholder="e.g., Civil, MEP, HR" /></div>
                <div><Label htmlFor="joiningDate">Joining Date</Label><DatePicker date={formData.joiningDate} setDate={(date) => handleDateChange('joiningDate', date)} /></div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select name="role" value={formData.role} onValueChange={(value) => handleSelectChange('role', value)} disabled={isEditing}>
                    <SelectTrigger id="role"><SelectValue placeholder="Select role" /></SelectTrigger>
                    <SelectContent>{roles.map(r => <SelectItem key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
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
            <Button type="button" variant="outline" onClick={() => navigate('/hr-dashboard')} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />{isEditing ? 'Save Changes' : 'Register Staff'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );
};

export default StaffRegistration;
