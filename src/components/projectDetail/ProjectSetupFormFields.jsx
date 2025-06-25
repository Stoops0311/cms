import React from 'react';
    import { Input } from '@/components/ui/input.jsx';
    import { Label } from '@/components/ui/label.jsx';
    import { DatePicker } from '@/components/ui/date-picker.jsx';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
    import { cn } from '@/lib/utils.jsx';

    export const projectTypes = ["Commercial Building", "Residential Complex", "Infrastructure", "Industrial Plant", "Renovation"];
    export const siteLocations = ["North Sector", "South Sector", "East Sector", "West Sector", "Central Hub", "Remote Site A"];
    export const clientList = ["Client A Corp", "Client B Ltd.", "Govt. Entity X", "Private Investor Y", "Other"];
    export const projectStatuses = ["Planning", "In Progress", "On Hold", "Completed", "Cancelled"];


    export const FormFieldGrid = ({ children }) => (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{children}</div>
    );

    export const FormField = ({ field, formData, handleInputChange, handleSelectChange, handleDateChange, errors }) => (
      <div className="space-y-1.5">
        <Label htmlFor={field.name} className={cn(errors[field.name] && "text-destructive")}>
          {field.label} {field.required && <span className="text-destructive">*</span>}
        </Label>
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
            className={cn("w-full", errors[field.name] && "border-destructive focus-visible:ring-destructive")}
            placeholder={field.placeholder || "Select date"}
          />
        ) : (
          <Input
            type={field.type}
            id={field.name}
            name={field.name}
            placeholder={field.placeholder}
            value={formData[field.name] || ''}
            onChange={handleInputChange}
            className={cn(errors[field.name] && "border-destructive")}
          />
        )}
        {errors[field.name] && <p className="text-xs text-destructive">{errors[field.name]}</p>}
      </div>
    );

    export const getProjectFormFields = () => [
      { name: "projectName", label: "Project Name", type: "text", placeholder: "Enter project name", required: true },
      { name: "projectCode", label: "Project Code/ID", type: "text", placeholder: "e.g., BLD-001-2025", required: true },
      { name: "clientName", label: "Client Name", type: "select", options: clientList, placeholder: "Select client", required: true },
      { name: "projectType", label: "Project Type", type: "select", options: projectTypes, placeholder: "Select project type", required: true },
      { name: "siteManager", label: "Site Manager", type: "text", placeholder: "Enter site manager's name", required: true },
      { name: "projectBudget", label: "Project Budget (USD)", type: "number", placeholder: "e.g., 1000000" },
      { name: "startDate", label: "Start Date", type: "date", required: true },
      { name: "expectedEndDate", label: "Expected End Date", type: "date", required: true },
      { name: "siteLocation", label: "Site Location", type: "select", options: siteLocations, placeholder: "Select site location", required: true },
      { name: "projectStatus", label: "Project Status", type: "select", options: projectStatuses, placeholder: "Select status" },
      { name: "contractValue", label: "Contract Value (USD)", type: "number", placeholder: "e.g., 1200000" },
      { name: "contractSignDate", label: "Contract Sign Date", type: "date" },
    ];