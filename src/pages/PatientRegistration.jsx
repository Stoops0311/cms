import React, { useState } from 'react';
    import { Button } from '@/components/ui/button.jsx';
    import { Input } from '@/components/ui/input.jsx';
    import { Label } from '@/components/ui/label.jsx';
    import { Textarea } from '@/components/ui/textarea.jsx';
    import { DatePicker } from '@/components/ui/date-picker.jsx';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card.jsx';
    import { useToast } from '@/components/ui/use-toast.jsx';
    import useLocalStorage from '@/hooks/useLocalStorage.jsx';
    import { motion } from 'framer-motion';
    import { UserPlus, UploadCloud } from 'lucide-react';
    import { cn } from '@/lib/utils.jsx';

    const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
    const nationalities = ["Saudi Arabian", "Indian", "Pakistani", "Bangladeshi", "Filipino", "Egyptian", "Other"];
    const insuranceProviders = ["Bupa", "Tawuniya", "Medgulf", "AXA", "Allianz", "Other"];
    const campLocations = ["Camp Alpha", "Camp Beta", "Camp Gamma", "Remote Site 1", "Remote Site 2"];

    const PatientRegistration = () => {
      const { toast } = useToast();
      const [patients, setPatients] = useLocalStorage('patients', []);

      const [formData, setFormData] = useState({
        fullName: '',
        nationalId: '',
        passportNumber: '',
        nationality: '',
        mobileNumber: '',
        emergencyContact: '',
        bloodGroup: '',
        knownConditions: '',
        campLocation: '',
        insuranceProvider: '',
        insurancePolicyNumber: '',
        insuranceExpiryDate: null,
      });
      const [errors, setErrors] = useState({});

      const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
          setErrors(prev => ({...prev, [name]: null}));
        }
      };

      const handleSelectChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
         if (errors[name]) {
          setErrors(prev => ({...prev, [name]: null}));
        }
      };

      const handleDateChange = (name, date) => {
        setFormData((prev) => ({ ...prev, [name]: date }));
         if (errors[name]) {
          setErrors(prev => ({...prev, [name]: null}));
        }
      };
      
      const validateForm = () => {
        const newErrors = {};
        if (!formData.fullName.trim()) newErrors.fullName = "Full Name is required.";
        if (!formData.nationalId.trim() && !formData.passportNumber.trim()) {
            newErrors.nationalId = "Either National ID or Passport Number is required.";
            newErrors.passportNumber = "Either National ID or Passport Number is required.";
        }
        if (formData.nationalId.trim() && !/^\d{10}$/.test(formData.nationalId)) newErrors.nationalId = "National ID must be 10 digits.";
        if (!formData.mobileNumber.trim()) newErrors.mobileNumber = "Mobile Number is required.";
        else if (!/^\+?\d{7,15}$/.test(formData.mobileNumber)) newErrors.mobileNumber = "Invalid mobile number format.";
        if (!formData.campLocation) newErrors.campLocation = "Camp Location is required.";
        if (!formData.insuranceProvider) newErrors.insuranceProvider = "Insurance Provider is required.";
        if (!formData.insurancePolicyNumber.trim()) newErrors.insurancePolicyNumber = "Insurance Policy Number is required.";
        if (!formData.insuranceExpiryDate) newErrors.insuranceExpiryDate = "Insurance Expiry Date is required.";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
      };

      const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) {
          toast({
            variant: "destructive",
            title: "Validation Error",
            description: "Please correct the errors in the form.",
          });
          return;
        }

        const newPatient = { 
          id: `P${Date.now()}`, 
          ...formData, 
          registrationDate: new Date().toISOString() 
        };
        setPatients((prevPatients) => [...prevPatients, newPatient]);
        toast({
          title: 'Patient Registered!',
          description: `${formData.fullName} has been successfully registered with ID ${newPatient.id}.`,
        });
        // Reset form (optional)
        setFormData({
          fullName: '', nationalId: '', passportNumber: '', nationality: '', mobileNumber: '',
          emergencyContact: '', bloodGroup: '', knownConditions: '', campLocation: '',
          insuranceProvider: '', insurancePolicyNumber: '', insuranceExpiryDate: null,
        });
        setErrors({});
      };

      const formFields = [
        { name: "fullName", label: "Full Name", type: "text", placeholder: "Enter full name" },
        { name: "nationalId", label: "National ID / Iqama", type: "text", placeholder: "10-digit ID" },
        { name: "passportNumber", label: "Passport Number", type: "text", placeholder: "Enter passport number" },
        { name: "nationality", label: "Nationality", type: "select", options: nationalities, placeholder: "Select nationality" },
        { name: "mobileNumber", label: "Mobile Number", type: "tel", placeholder: "+966 5X XXX XXXX" },
        { name: "emergencyContact", label: "Emergency Contact", type: "tel", placeholder: "Contact number" },
        { name: "bloodGroup", label: "Blood Group", type: "select", options: bloodGroups, placeholder: "Select blood group" },
        { name: "campLocation", label: "Assigned Camp Location", type: "select", options: campLocations, placeholder: "Select camp" },
        { name: "insuranceProvider", label: "Insurance Provider", type: "select", options: insuranceProviders, placeholder: "Select provider" },
        { name: "insurancePolicyNumber", label: "Insurance Policy Number", type: "text", placeholder: "Enter policy number" },
        { name: "insuranceExpiryDate", label: "Insurance Expiry Date", type: "date" },
      ];

      return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="max-w-4xl mx-auto shadow-2xl border-t-4 border-primary">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 rounded-t-lg">
              <div className="flex items-center space-x-3">
                <UserPlus className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle className="text-2xl font-bold text-primary">New Patient Registration</CardTitle>
                  <CardDescription>Enter patient details to create a new record.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {formFields.map(field => (
                    <div key={field.name} className="space-y-1.5">
                      <Label htmlFor={field.name} className={cn(errors[field.name] && "text-destructive")}>{field.label} {field.name === 'fullName' || field.name === 'mobileNumber' || field.name === 'campLocation' || field.name === 'insuranceProvider' || field.name === 'insurancePolicyNumber' || field.name === 'insuranceExpiryDate' ? <span className="text-destructive">*</span> : ''}</Label>
                      {field.type === "select" ? (
                        <Select onValueChange={(value) => handleSelectChange(field.name, value)} value={formData[field.name] || ''}>
                          <SelectTrigger id={field.name} className={cn(errors[field.name] && "border-destructive")}>
                            <SelectValue placeholder={field.placeholder} />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      ) : field.type === "date" ? (
                        <DatePicker 
                          date={formData[field.name]} 
                          setDate={(date) => handleDateChange(field.name, date)} 
                          className={cn(errors[field.name] && "border-destructive focus-visible:ring-destructive")}
                          placeholder={field.placeholder || "Select date"}
                        />
                      ) : (
                        <Input
                          type={field.type}
                          id={field.name}
                          name={field.name}
                          placeholder={field.placeholder}
                          value={formData[field.name]}
                          onChange={handleInputChange}
                          className={cn(errors[field.name] && "border-destructive")}
                        />
                      )}
                      {errors[field.name] && <p className="text-xs text-destructive">{errors[field.name]}</p>}
                    </div>
                  ))}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="knownConditions">Known Conditions / Allergies</Label>
                  <Textarea
                    id="knownConditions"
                    name="knownConditions"
                    placeholder="List any known medical conditions or allergies..."
                    value={formData.knownConditions}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Upload Documents (Optional)</Label>
                  <div className="flex items-center justify-center w-full">
                      <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 border-gray-300 hover:border-gray-400 transition-colors">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <UploadCloud className="w-8 h-8 mb-2 text-gray-500" />
                              <p className="mb-1 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                              <p className="text-xs text-gray-500">ID, Passport, Insurance, Prescriptions etc.</p>
                          </div>
                          <input id="dropzone-file" type="file" className="hidden" multiple />
                      </label>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t p-6 bg-slate-50 rounded-b-lg">
                <Button type="submit" size="lg" className="w-full md:w-auto ml-auto bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white shadow-md hover:shadow-lg transition-all duration-150 ease-in-out transform hover:scale-105">
                  <UserPlus className="mr-2 h-5 w-5" /> Register Patient
                </Button>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      );
    };

    export default PatientRegistration;