import React from 'react';
    import { Label } from '@/components/ui/label.jsx';
    import { UploadCloud } from 'lucide-react';

    const ProjectSetupFileUpload = ({ onFileSelect }) => {
      const handleFileChange = (event) => {
        if (event.target.files && event.target.files.length > 0) {
          // Pass the FileList object or an array of files
          if (onFileSelect) onFileSelect(event.target.files); 
        }
      };

      return (
        <div className="space-y-1.5">
          <Label>Upload Project Documents (Optional)</Label>
          <div className="flex items-center justify-center w-full">
            <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 border-gray-300 hover:border-gray-400 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadCloud className="w-8 h-8 mb-2 text-gray-500" />
                <p className="mb-1 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                <p className="text-xs text-gray-500">Blueprints, Contracts, Permits, etc. (PDF, JPG, DOCX)</p>
              </div>
              <input id="dropzone-file" type="file" className="hidden" multiple onChange={handleFileChange} />
            </label>
          </div>
        </div>
      );
    };

    export default ProjectSetupFileUpload;