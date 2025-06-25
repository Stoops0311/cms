import React from 'react';
    import { Input } from '@/components/ui/input.jsx';
    import { Label } from '@/components/ui/label.jsx';
    import { UploadCloud } from 'lucide-react';

    const AgreementFormFileUpload = ({ documentFileName, onDocumentFileChange }) => {
        return (
            <div>
                <Label htmlFor="documentFile-form" className="flex items-center"><UploadCloud className="mr-2 h-4 w-4" />Upload Signed Agreement (PDF/DOCX, Max 10MB)</Label>
                <Input id="documentFile-form" type="file" onChange={onDocumentFileChange} accept=".pdf,.doc,.docx" />
                {documentFileName && <p className="text-xs text-muted-foreground mt-1">Current file: {documentFileName}</p>}
            </div>
        );
    };

    export default AgreementFormFileUpload;