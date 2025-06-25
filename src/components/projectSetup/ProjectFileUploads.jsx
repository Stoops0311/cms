import React from 'react';
    import { Input } from '@/components/ui/input.jsx';
    import { Label } from '@/components/ui/label.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { UploadCloud, Trash2 } from 'lucide-react';

    const SectionHeader = ({ title, icon: Icon }) => (
      <h3 className="text-lg font-semibold mb-3 border-b pb-2 text-primary flex items-center">
        <Icon className="mr-2 h-5 w-5" />{title}
      </h3>
    );
    
    const ProjectFileUploads = ({ formData, handleFileChange, removeFile }) => {
      const renderFileInput = (label, docType, filesState) => (
        <div className="space-y-2">
          <Label htmlFor={docType} className="flex items-center"><UploadCloud className="mr-2 h-4 w-4" />{label}</Label>
          <Input id={docType} type="file" multiple onChange={(e) => handleFileChange(e, docType)} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
          {filesState && filesState.length > 0 && (
            <div className="mt-2 space-y-1">
              {filesState.map((file) => (
                <div key={file.id || file.name} className="flex items-center justify-between p-1.5 bg-muted/50 rounded-md text-xs">
                  <span className="truncate" title={file.name}>{file.name}</span>
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeFile(docType, file.id || file.name)} className="h-6 w-6"><Trash2 className="h-3 w-3 text-destructive" /></Button>
                </div>
              ))}
            </div>
          )}
        </div>
      );

      return (
        <section>
          <SectionHeader title="Document Uploads" icon={UploadCloud} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderFileInput('Drawings (.pdf, .dwg)', 'drawings', formData.drawings)}
            {renderFileInput('Bill of Quantities (BOQ) (.xls, .pdf)', 'boq', formData.boq)}
            {renderFileInput('Legal Documents (.pdf, .doc)', 'legalDocs', formData.legalDocs)}
            {renderFileInput('Safety Certificates (.pdf)', 'safetyCerts', formData.safetyCerts)}
          </div>
        </section>
      );
    };
    export default ProjectFileUploads;