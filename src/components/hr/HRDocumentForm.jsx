import React, { useState, useEffect } from 'react';
    import { Button } from '@/components/ui/button.jsx';
    import { Input } from '@/components/ui/input.jsx';
    import { Label } from '@/components/ui/label.jsx';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
    import { DatePicker } from '@/components/ui/date-picker.jsx';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog.jsx';
    import { useToast } from '@/components/ui/use-toast.jsx';
    import { parseISO } from 'date-fns';

    const HRDocumentForm = ({ 
        isOpen, 
        onClose, 
        onSubmit, 
        editingDocument, 
        mockStaffList, 
        documentTypes, 
        approvedInsuranceProviders 
    }) => {
      const { toast } = useToast();
      const initialFormState = {
        staffId: '',
        documentType: '',
        documentNumber: '',
        expiryDate: null,
        insuranceProvider: '',
        file: null,
      };
      const [formData, setFormData] = useState(initialFormState);

      useEffect(() => {
        if (isOpen) {
            if (editingDocument) {
              setFormData({
                staffId: editingDocument.staffId || '',
                documentType: editingDocument.documentType || '',
                documentNumber: editingDocument.documentNumber || '',
                expiryDate: editingDocument.expiryDate ? parseISO(editingDocument.expiryDate) : null,
                insuranceProvider: editingDocument.insuranceProvider || '',
                file: null, 
                fileName: editingDocument.fileName || null,
              });
            } else {
              setFormData(initialFormState);
            }
        }
      }, [editingDocument, isOpen]);

      const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
      };
      
      const handleFileChange = (e) => {
        setFormData(prev => ({ ...prev, file: e.target.files[0] }));
      };

      const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === "documentType" && value !== "Medical Insurance") {
          setFormData(prev => ({ ...prev, insuranceProvider: '' }));
        }
      };
      
      const handleDateChange = (date) => {
        setFormData(prev => ({ ...prev, expiryDate: date }));
      };

      const handleSubmitForm = () => {
        if (!formData.staffId || !formData.documentType || !formData.documentNumber) {
          toast({ variant: "destructive", title: "Missing Fields", description: "Staff, Document Type, and Document Number are required." });
          return;
        }
        if (formData.documentType === "Medical Insurance" && !formData.insuranceProvider) {
          toast({ variant: "destructive", title: "Missing Provider", description: "Please select an insurance provider for medical insurance." });
          return;
        }
        onSubmit(formData, editingDocument);
        onClose(); 
      };

      return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingDocument ? 'Edit' : 'Add New'} Document</DialogTitle>
                <DialogDescription>
                  {editingDocument ? `Update details for ${editingDocument.documentType} of ${editingDocument.staffName}.` : 'Enter details for the new staff document.'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
                <div>
                  <Label htmlFor="staffId">Staff Member *</Label>
                  <Select name="staffId" value={formData.staffId} onValueChange={(value) => handleSelectChange('staffId', value)}>
                    <SelectTrigger id="staffId" className="w-full mt-1">
                      <SelectValue placeholder="Select staff member" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockStaffList.map(staff => <SelectItem key={staff.id} value={staff.id}>{staff.name} ({staff.id})</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="documentType">Document Type *</Label>
                  <Select name="documentType" value={formData.documentType} onValueChange={(value) => handleSelectChange('documentType', value)}>
                    <SelectTrigger id="documentType" className="w-full mt-1">
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      {documentTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="documentNumber">Document Number *</Label>
                  <Input id="documentNumber" name="documentNumber" value={formData.documentNumber} onChange={handleInputChange} placeholder="e.g., P123456" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
                  <DatePicker date={formData.expiryDate} setDate={handleDateChange} className="mt-1 w-full" placeholder="Select expiry date" />
                </div>
                {formData.documentType === "Medical Insurance" && (
                  <div>
                    <Label htmlFor="insuranceProvider">Insurance Provider *</Label>
                    <Select name="insuranceProvider" value={formData.insuranceProvider} onValueChange={(value) => handleSelectChange('insuranceProvider', value)}>
                      <SelectTrigger id="insuranceProvider" className="w-full mt-1">
                        <SelectValue placeholder="Select approved provider" />
                      </SelectTrigger>
                      <SelectContent>
                        {approvedInsuranceProviders.map(provider => <SelectItem key={provider} value={provider}>{provider}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div>
                    <Label htmlFor="fileUpload">Upload Document (PDF/JPG - Max 2MB)</Label>
                    <Input id="fileUpload" type="file" onChange={handleFileChange} className="mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" accept=".pdf,.jpg,.jpeg"/>
                    {formData.fileName && !formData.file && <p className="text-xs text-muted-foreground mt-1">Current file: {formData.fileName}</p>}
                    {formData.file && <p className="text-xs text-muted-foreground mt-1">Selected file: {formData.file.name}</p>}
                    <p className="text-xs text-muted-foreground mt-1">File upload is simulated. Actual file storage not implemented.</p>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="button" onClick={handleSubmitForm} className="bg-indigo-600 hover:bg-indigo-700">{editingDocument ? 'Save Changes' : 'Add Document'}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
      );
    };

    export default HRDocumentForm;