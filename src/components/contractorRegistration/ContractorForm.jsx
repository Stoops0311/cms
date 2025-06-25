import React, { useState } from 'react';
    import { Button } from '@/components/ui/button.jsx';
    import { Input } from '@/components/ui/input.jsx';
    import { Label } from '@/components/ui/label.jsx';
    import { Textarea } from '@/components/ui/textarea.jsx';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
    import { useToast } from '@/components/ui/use-toast.jsx';
    import { UploadCloud, Trash2 } from 'lucide-react';
    import { DialogFooter as DFooter } from '@/components/ui/dialog.jsx';

    const contractorCategories = ["General Contractor", "Civil Works", "MEP Contractor", "Finishing Works", "Specialized Consultant", "Supplier"];
    const nationalities = ["Saudi Arabian", "Indian", "Pakistani", "Filipino", "Egyptian", "Bangladeshi", "Emirati", "American", "British", "Other"];

    const ContractorForm = ({ onSubmit, initialData = {}, onCancel }) => {
        const [formData, setFormData] = useState({
            companyName: initialData.companyName || '',
            businessLicense: initialData.businessLicense || '',
            nationality: initialData.nationality || nationalities[0],
            categories: initialData.categories || [],
            contactPerson: initialData.contactPerson || '',
            email: initialData.email || '',
            phone: initialData.phone || '',
            address: initialData.address || '',
            previousProjects: initialData.previousProjects || '',
            rating: initialData.rating || '',
            documents: initialData.documents || [],
        });
        const { toast } = useToast();

        const handleChange = (name, value) => {
            setFormData(prev => ({ ...prev, [name]: value }));
        };

        const handleMultiSelectChange = (name, value) => {
           setFormData(prev => {
                const currentValues = prev[name] || [];
                if (currentValues.includes(value)) {
                    return { ...prev, [name]: currentValues.filter(item => item !== value) };
                } else {
                    return { ...prev, [name]: [...currentValues, value] };
                }
            });
        };
        
        const handleFileChange = (e) => {
            const files = Array.from(e.target.files);
            const newDocs = files.map(file => ({
                name: file.name,
                file: file, 
                id: `DOC-${Date.now()}-${Math.random().toString(36).substr(2,5)}`
            }));
            setFormData(prev => ({ ...prev, documents: [...(prev.documents || []), ...newDocs] }));
            e.target.value = null; 
        };

        const removeFile = (fileId) => {
            setFormData(prev => ({ ...prev, documents: prev.documents.filter(doc => doc.id !== fileId) }));
        };

        const handleSubmit = (e) => {
            e.preventDefault();
            if (!formData.companyName || !formData.businessLicense || formData.categories.length === 0) {
                toast({ variant: "destructive", title: "Missing Fields", description: "Company Name, Business License, and at least one Category are required." });
                return;
            }
            const storableDocs = formData.documents.map(d => ({name: d.name, id: d.id}));
            onSubmit({ ...formData, id: initialData.id || `CONTR-${Date.now()}`, documents: storableDocs });
        };

        return (
            <form onSubmit={handleSubmit} className="space-y-3 max-h-[75vh] overflow-y-auto p-1 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div><Label htmlFor="companyName">Company Name*</Label><Input id="companyName" value={formData.companyName} onChange={e => handleChange('companyName', e.target.value)} required/></div>
                    <div><Label htmlFor="businessLicense">Business License No.*</Label><Input id="businessLicense" value={formData.businessLicense} onChange={e => handleChange('businessLicense', e.target.value)} required/></div>
                </div>
                <div>
                    <Label htmlFor="nationality">Company Nationality/Origin*</Label>
                    <Select value={formData.nationality} onValueChange={val => handleChange('nationality', val)} required>
                        <SelectTrigger><SelectValue placeholder="Select Nationality"/></SelectTrigger>
                        <SelectContent>{nationalities.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div>
                    <Label>Categories (Select all applicable)*</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2 border rounded-md max-h-40 overflow-y-auto">
                        {contractorCategories.map(cat => (
                            <Button 
                                type="button"
                                key={cat} 
                                variant={formData.categories.includes(cat) ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleMultiSelectChange('categories', cat)}
                                className="text-xs justify-start"
                            >
                                {cat}
                            </Button>
                        ))}
                    </div>
                </div>
                 <h4 className="text-sm font-medium pt-2 border-t">Contact Information</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div><Label htmlFor="contactPerson">Contact Person</Label><Input id="contactPerson" value={formData.contactPerson} onChange={e => handleChange('contactPerson', e.target.value)}/></div>
                    <div><Label htmlFor="email">Email</Label><Input id="email" type="email" value={formData.email} onChange={e => handleChange('email', e.target.value)}/></div>
                    <div><Label htmlFor="phone">Phone</Label><Input id="phone" type="tel" value={formData.phone} onChange={e => handleChange('phone', e.target.value)}/></div>
                    <div><Label htmlFor="address">Address</Label><Input id="address" value={formData.address} onChange={e => handleChange('address', e.target.value)}/></div>
                </div>
                <h4 className="text-sm font-medium pt-2 border-t">Additional Details</h4>
                <div><Label htmlFor="previousProjects">Previous Projects (Summary)</Label><Textarea id="previousProjects" value={formData.previousProjects} onChange={e => handleChange('previousProjects', e.target.value)} placeholder="List key projects or experience"/></div>
                <div>
                    <Label htmlFor="rating">Internal Rating (Optional)</Label>
                    <Select value={formData.rating} onValueChange={val => handleChange('rating', val)}>
                        <SelectTrigger><SelectValue placeholder="Select Rating"/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="5">5 - Excellent</SelectItem>
                            <SelectItem value="4">4 - Good</SelectItem>
                            <SelectItem value="3">3 - Average</SelectItem>
                            <SelectItem value="2">2 - Fair</SelectItem>
                            <SelectItem value="1">1 - Poor</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="documents" className="flex items-center"><UploadCloud className="mr-2 h-4 w-4" />Upload Documents (e.g., Profile, Licenses)</Label>
                    <Input id="documents" type="file" multiple onChange={handleFileChange} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/>
                    {formData.documents && formData.documents.length > 0 && (
                    <div className="mt-2 space-y-1">
                        {formData.documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-1.5 bg-muted/50 rounded-md text-xs">
                            <span className="truncate" title={doc.name}>{doc.name}</span>
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeFile(doc.id)} className="h-6 w-6"><Trash2 className="h-3 w-3 text-destructive"/></Button>
                        </div>
                        ))}
                    </div>
                    )}
                </div>
                <DFooter className="pt-4">
                    <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                    <Button type="submit">{initialData.id ? 'Update Contractor' : 'Register Contractor'}</Button>
                </DFooter>
            </form>
        );
    };

    export default ContractorForm;