import React, { useState } from 'react';
    import { motion } from 'framer-motion';
    import { CardTitle } from '@/components/ui/card.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { Input } from '@/components/ui/input.jsx';
    import { DatePicker } from '@/components/ui/date-picker.jsx';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
    import { UploadCloud, FileText, Download, Trash2, Edit2, AlertTriangle } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast.jsx';
    import { format } from 'date-fns';

    const DocumentForm = ({ onSubmit, initialData = {}, onCancel }) => {
      const [docName, setDocName] = useState(initialData.name || '');
      const [docType, setDocType] = useState(initialData.type || '');
      const [uploadDate, setUploadDate] = useState(initialData.uploadDate ? new Date(initialData.uploadDate) : new Date());
      const [expiryDate, setExpiryDate] = useState(initialData.expiryDate ? new Date(initialData.expiryDate) : null);
      const [file, setFile] = useState(null); // For actual file upload, not fully implemented here
      const { toast } = useToast();

      const handleSubmit = (e) => {
        e.preventDefault();
        if (!docName || !docType) {
          toast({ variant: "destructive", title: "Document name and type are required." });
          return;
        }
        // In a real app, handle file upload here
        onSubmit({ 
          id: initialData.id || `DOC-${Date.now()}`, 
          name: docName, 
          type: docType, 
          uploadDate: uploadDate.toISOString(), 
          expiryDate: expiryDate ? expiryDate.toISOString() : null,
          fileName: file ? file.name : initialData.fileName || "sample_document.pdf", // Placeholder
          fileSize: file ? `${(file.size / 1024).toFixed(1)} KB` : initialData.fileSize || "128 KB" // Placeholder
        });
        if (!initialData.id) {
          setDocName(''); setDocType(''); setUploadDate(new Date()); setExpiryDate(null); setFile(null);
        }
      };

      return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-slate-50 mb-6">
          <Input placeholder="Document Name*" value={docName} onChange={(e) => setDocName(e.target.value)} />
          <Input placeholder="Document Type* (e.g., Blueprint, Contract, Permit)" value={docType} onChange={(e) => setDocType(e.target.value)} />
          <DatePicker date={uploadDate} setDate={setUploadDate} placeholder="Upload Date" />
          <DatePicker date={expiryDate} setDate={setExpiryDate} placeholder="Expiry Date (Optional)" />
          <div className="flex items-center justify-center w-full">
            <label htmlFor="doc-file-upload" className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <UploadCloud className="w-6 h-6 mb-1 text-gray-500" />
              <p className="text-sm text-gray-500">{file ? file.name : "Click to upload or drag & drop"}</p>
              <input id="doc-file-upload" type="file" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
            </label>
          </div>
          <div className="flex justify-end space-x-2">
            {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
            <Button type="submit">{initialData.id ? 'Update Document' : 'Add Document'}</Button>
          </div>
        </form>
      );
    };

    const ProjectDocumentsTab = ({ project, updateProjectData }) => {
      const [showForm, setShowForm] = useState(false);
      const [editingDoc, setEditingDoc] = useState(null);
      const { toast } = useToast();
      const documents = project.documents || [];

      const handleAddDocument = (docData) => {
        const newDocs = [...documents, docData];
        updateProjectData({ documents: newDocs });
        toast({ title: "Document Added", description: `${docData.name} has been added.` });
        setShowForm(false);
      };

      const handleUpdateDocument = (docData) => {
        const updatedDocs = documents.map(d => d.id === docData.id ? docData : d);
        updateProjectData({ documents: updatedDocs });
        toast({ title: "Document Updated", description: `${docData.name} has been updated.` });
        setEditingDoc(null);
      };

      const handleDeleteDocument = (docId) => {
        if (window.confirm("Are you sure you want to delete this document?")) {
          const updatedDocs = documents.filter(d => d.id !== docId);
          updateProjectData({ documents: updatedDocs });
          toast({ title: "Document Deleted", variant: "destructive" });
        }
      };

      const handleDownload = (docName) => {
        // Simulate download
        toast({ title: "Downloading...", description: `Preparing ${docName} for download.` });
      };

      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <div className="flex justify-between items-center mb-6">
            <CardTitle className="text-xl font-semibold text-gray-700">Project Documents</CardTitle>
            <Button onClick={() => { setShowForm(!showForm); setEditingDoc(null); }} variant={showForm ? "outline" : "default"}>
              <UploadCloud className="mr-2 h-4 w-4" /> {showForm ? "Cancel" : "Upload New Document"}
            </Button>
          </div>

          {showForm && !editingDoc && <DocumentForm onSubmit={handleAddDocument} onCancel={() => setShowForm(false)} />}
          {editingDoc && <DocumentForm onSubmit={handleUpdateDocument} initialData={editingDoc} onCancel={() => setEditingDoc(null)} />}

          {documents.length === 0 && !showForm ? (
            <p className="text-muted-foreground text-center py-8">No documents uploaded yet. Click "Upload New Document" to add files.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Upload Date</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>File</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map(doc => {
                    const isExpired = doc.expiryDate && new Date(doc.expiryDate) < new Date();
                    return (
                      <TableRow key={doc.id} className={isExpired ? 'bg-red-500/10' : ''}>
                        <TableCell className="font-medium flex items-center">
                          <FileText className="mr-2 h-4 w-4 text-primary" /> {doc.name}
                        </TableCell>
                        <TableCell>{doc.type}</TableCell>
                        <TableCell>{format(new Date(doc.uploadDate), 'PPP')}</TableCell>
                        <TableCell>
                          {doc.expiryDate ? format(new Date(doc.expiryDate), 'PPP') : 'N/A'}
                          {isExpired && <AlertTriangle className="inline ml-2 h-4 w-4 text-red-500" title="Expired"/>}
                        </TableCell>
                        <TableCell>{doc.fileName} ({doc.fileSize})</TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button variant="ghost" size="icon" onClick={() => handleDownload(doc.fileName)} title="Download Document">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => { setEditingDoc(doc); setShowForm(false); }} title="Edit Document">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteDocument(doc.id)} title="Delete Document">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </motion.div>
      );
    };

    export default ProjectDocumentsTab;