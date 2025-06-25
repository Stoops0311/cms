import React from 'react';
    import { Input } from '@/components/ui/input.jsx';
    import { Label } from '@/components/ui/label.jsx';
    import { DatePicker } from '@/components/ui/date-picker.jsx';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
    import { Info, UserPlus, DollarSign, MapPin } from 'lucide-react';

    const SectionHeader = ({ title, icon: Icon }) => (
      <h3 className="text-lg font-semibold mb-3 border-b pb-2 text-primary flex items-center">
        <Icon className="mr-2 h-5 w-5" />{title}
      </h3>
    );

    const ProjectFormFields = ({ formData, handleInputChange, handleClientInfoChange, handleDateChange, setFormData }) => {
      return (
        <>
          <section>
            <SectionHeader title="Basic Information" icon={Info} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><Label htmlFor="projectName">Project Name*</Label><Input id="projectName" name="projectName" value={formData.projectName} onChange={handleInputChange} placeholder="e.g., Downtown Residential Tower" required /></div>
              <div><Label htmlFor="projectIDString">Project ID (Custom)</Label><Input id="projectIDString" name="projectIDString" value={formData.projectIDString} onChange={handleInputChange} placeholder="e.g., DT-RES-001" /></div>
              <div><Label htmlFor="location"><MapPin className="inline mr-1 h-4 w-4" />Location</Label><Input id="location" name="location" value={formData.location} onChange={handleInputChange} placeholder="e.g., 123 Main St, Anytown (GPS later)" /></div>
              <div>
                <Label htmlFor="projectStatus">Project Status</Label>
                <Select name="projectStatus" value={formData.projectStatus} onValueChange={(value) => setFormData(prev => ({ ...prev, projectStatus: value }))}>
                    <SelectTrigger id="projectStatus"><SelectValue placeholder="Select status"/></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Planning">Planning</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="On Hold">On Hold</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div><Label htmlFor="startDate">Start Date*</Label><DatePicker date={formData.startDate} setDate={(date) => handleDateChange('startDate', date)} required /></div>
              <div><Label htmlFor="endDate">End Date*</Label><DatePicker date={formData.endDate} setDate={(date) => handleDateChange('endDate', date)} required /></div>
            </div>
          </section>

          <section>
            <SectionHeader title="Client Information" icon={UserPlus} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><Label htmlFor="clientName">Client Company Name*</Label><Input id="clientName" name="name" value={formData.clientInfo.name} onChange={handleClientInfoChange} placeholder="Client Company LLC" required /></div>
              <div><Label htmlFor="contactPerson">Contact Person</Label><Input id="contactPerson" name="contactPerson" value={formData.clientInfo.contactPerson} onChange={handleClientInfoChange} placeholder="John Doe" /></div>
              <div><Label htmlFor="email">Client Email</Label><Input id="email" name="email" type="email" value={formData.clientInfo.email} onChange={handleClientInfoChange} placeholder="contact@client.com" /></div>
              <div><Label htmlFor="phone">Client Phone</Label><Input id="phone" name="phone" type="tel" value={formData.clientInfo.phone} onChange={handleClientInfoChange} placeholder="+1-555-123-4567" /></div>
            </div>
          </section>

          <section>
            <SectionHeader title="Financials" icon={DollarSign} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div><Label htmlFor="budgetAllocation">Budget Allocation</Label><Input id="budgetAllocation" name="budgetAllocation" type="number" value={formData.budgetAllocation} onChange={handleInputChange} placeholder="e.g., 1000000" /></div>
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select name="currency" value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
                  <SelectTrigger id="currency"><SelectValue placeholder="Select currency" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem><SelectItem value="EUR">EUR</SelectItem><SelectItem value="GBP">GBP</SelectItem><SelectItem value="SAR">SAR</SelectItem><SelectItem value="AED">AED</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label htmlFor="taxationInfo">Taxation Info</Label><Input id="taxationInfo" name="taxationInfo" value={formData.taxationInfo} onChange={handleInputChange} placeholder="e.g., VAT 15% Applicable" /></div>
            </div>
          </section>
        </>
      );
    };
    export default ProjectFormFields;