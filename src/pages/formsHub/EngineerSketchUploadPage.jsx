import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { PenTool, Loader2, Upload } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast.jsx';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';

const documentTypes = [
  "Engineer Sketch",
  "Technical Drawing",
  "As-Built Drawing",
  "Site Survey Report",
  "Structural Report",
  "Design Specification",
  "Field Report",
  "Other",
];

const EngineerSketchUploadPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const users = useQuery(api.admin.listUsers, {});
  const projects = useQuery(api.projects.listProjects, {});
  const createProjectDocument = useMutation(api.projectDocuments.createProjectDocument);
  const generateUploadUrl = useMutation(api.projectDocuments.generateUploadUrl);

  const [projectId, setProjectId] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [revisionNumber, setRevisionNumber] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (20MB max)
      if (file.size > 20 * 1024 * 1024) {
        toast({ variant: "destructive", title: "File Too Large", description: "Maximum file size is 20MB." });
        return;
      }
      setSelectedFile(file);
    }
  };

  // Get first user as default (in real app, this would be the logged-in user)
  const currentUser = users?.[0];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!projectId || !documentType || !title) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Please fill in all required fields." });
      return;
    }

    if (!selectedFile) {
      toast({ variant: "destructive", title: "No File Selected", description: "Please select a file to upload." });
      return;
    }

    if (!currentUser) {
      toast({ variant: "destructive", title: "Error", description: "No user found. Please ensure users exist in the system." });
      return;
    }

    setIsSubmitting(true);
    try {
      // Step 1: Get upload URL from Convex storage
      const uploadUrl = await generateUploadUrl();

      // Step 2: Upload file to Convex storage
      const uploadResult = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": selectedFile.type },
        body: selectedFile,
      });

      if (!uploadResult.ok) {
        throw new Error("Failed to upload file to storage");
      }

      const { storageId } = await uploadResult.json();

      // Step 3: Create document record with the storage ID
      await createProjectDocument({
        projectId,
        documentType,
        title,
        description: `${description || ''}${revisionNumber ? `\nRevision: ${revisionNumber}` : ''}`,
        fileId: storageId,
        fileName: selectedFile.name,
        uploadedBy: currentUser._id,
      });

      toast({ title: "Document Uploaded", description: `${documentType} has been uploaded successfully.` });
      navigate('/forms-documents');
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to upload document. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!users || !projects) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto">
      <Card className="shadow-xl border-t-4 border-indigo-600">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-indigo-700 flex items-center">
            <PenTool className="mr-3 h-7 w-7"/>Engineer's Sketch/Report Upload
          </CardTitle>
          <CardDescription>Upload engineering sketches, technical drawings, and reports.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="projectId">Project *</Label>
                <Select value={projectId} onValueChange={setProjectId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects?.map(project => (
                      <SelectItem key={project._id} value={project._id}>{project.projectName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="documentType">Document Type *</Label>
                <Select value={documentType} onValueChange={setDocumentType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Document Title *</Label>
                <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Site Layout Drawing Rev-A" />
              </div>
              <div>
                <Label htmlFor="revisionNumber">Revision Number</Label>
                <Input id="revisionNumber" value={revisionNumber} onChange={e => setRevisionNumber(e.target.value)} placeholder="e.g., Rev-A, v1.0" />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description of the document contents..." rows={3} />
            </div>

            <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
              <div className="flex items-center gap-2 mb-2">
                <Upload className="h-5 w-5 text-indigo-600" />
                <Label className="text-indigo-700 font-medium">Upload Document *</Label>
              </div>
              <Input type="file" accept="image/*,.pdf,.dwg,.dxf" onChange={handleFileChange} className="cursor-pointer" />
              {selectedFile && (
                <p className="text-sm text-indigo-600 mt-2">Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">Accepted formats: JPG, PNG, PDF, DWG, DXF (max 20MB)</p>
            </div>

            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-sm text-amber-800">
              <strong>Note:</strong> All engineering documents are subject to review by the project engineer.
              Please ensure document quality and accuracy before submission.
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2 border-t pt-6">
            <Button type="button" variant="outline" onClick={() => navigate('/forms-documents')}>Cancel</Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Uploading...</> : 'Upload Document'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );
};

export default EngineerSketchUploadPage;
