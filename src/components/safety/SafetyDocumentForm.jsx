import React, { useState } from 'react';
    import { Button } from '@/components/ui/button.jsx';
    import { Input } from '@/components/ui/input.jsx';
    import { Label } from '@/components/ui/label.jsx';
    import { Textarea } from '@/components/ui/textarea.jsx';
    import { DatePicker } from '@/components/ui/date-picker.jsx';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
    import { useToast } from '@/components/ui/use-toast.jsx';

    export const documentTypes = ["Safety Certificate", "Permit", "License", "Training Record", "Incident Report", "Audit Report", "Toolbox Talk Record", "Method Statement", "Risk Assessment", "Inspection Report", "Environmental Permit"];

    const SafetyDocumentForm = ({ onSubmit, initialData = {}, onCancel, projects, personnelList, equipmentList }) => {
      const [docName, setDocName] = useState(initialData.docName || '');
      const [docType, setDocType] = useState(initialData.docType || documentTypes[0]);
      const [docNumber, setDocNumber] = useState(initialData.docNumber || '');
      const [issuedBy, setIssuedBy] = useState(initialData.issuedBy || '');
      const [issueDate, setIssueDate] = useState(initialData.issueDate ? new Date(initialData.issueDate) : null);
      const [expiryDate, setExpiryDate] = useState(initialData.expiryDate ? new Date(initialData.expiryDate) : null);
      const [relatedTo, setRelatedTo] = useState(initialData.relatedTo || 'Project'); // Project, Personnel, Equipment
      const [relatedId, setRelatedId] = useState(initialData.relatedId || '');
      const [file, setFile] = useState(null); // For file upload simulation
      const [fileUrl, setFileUrl] = useState(initialData.fileUrl || ''); // For linking to cloud storage
      const [notes, setNotes] = useState(initialData.notes || '');
      const { toast } = useToast();

      const handleSubmit = (e) => {
        e.preventDefault();
        if (!docName || !docType || !issueDate) {
          toast({ variant: "destructive", title: "Missing Information", description: "Document name, type, and issue date are required." });
          return;
        }
        if (fileUrl && (!fileUrl.startsWith('http://') && !fileUrl.startsWith('https://'))) {
            toast({ variant: "destructive", title: "Invalid URL", description: "File URL must start with http:// or https:// if provided." });
            return;
        }
        onSubmit({
          id: initialData.id || `SAFE-${Date.now().toString().slice(-5)}`,
          docName, docType, docNumber, issuedBy,
          issueDate: issueDate.toISOString(),
          expiryDate: expiryDate ? expiryDate.toISOString() : null,
          relatedTo, relatedId,
          fileName: file ? file.name : (initialData.fileName || (fileUrl ? "Link to Cloud Document" : "No file attached")),
          fileUrl, notes
        });
      };

      return (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label htmlFor="docName-safety">Document Name</Label><Input id="docName-safety" value={docName} onChange={e => setDocName(e.target.value)} placeholder="e.g., Forklift Operator License" /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="docType-safety">Document Type</Label>
              <Select value={docType} onValueChange={setDocType}>
                <SelectTrigger id="docType-safety"><SelectValue placeholder="Select Type" /></SelectTrigger>
                <SelectContent>{documentTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label htmlFor="docNumber-safety">Document/Certificate No.</Label><Input id="docNumber-safety" value={docNumber} onChange={e => setDocNumber(e.target.value)} placeholder="e.g., CERT-12345" /></div>
          </div>
          <div><Label htmlFor="issuedBy-safety">Issuing Authority/Company</Label><Input id="issuedBy-safety" value={issuedBy} onChange={e => setIssuedBy(e.target.value)} placeholder="e.g., National Safety Council" /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label htmlFor="issueDate-safety">Issue Date</Label><DatePicker id="issueDate-safety" date={issueDate} setDate={setIssueDate} /></div>
            <div><Label htmlFor="expiryDate-safety">Expiry Date (Optional)</Label><DatePicker id="expiryDate-safety" date={expiryDate} setDate={setExpiryDate} /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="relatedTo-safety">Related To</Label>
              <Select value={relatedTo} onValueChange={(value) => { setRelatedTo(value); setRelatedId(''); }}>
                <SelectTrigger id="relatedTo-safety"><SelectValue placeholder="Select Relation" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Project">Project</SelectItem>
                  <SelectItem value="Personnel">Personnel</SelectItem>
                  <SelectItem value="Equipment">Equipment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="relatedId-safety">Related Entity ID/Name</Label>
              {relatedTo === 'Project' && (
                <Select value={relatedId} onValueChange={setRelatedId}>
                  <SelectTrigger id="relatedId-safety-project"><SelectValue placeholder="Select Project" /></SelectTrigger>
                  <SelectContent>{(projects || []).map(p => <SelectItem key={p.id} value={p.id}>{p.projectName} ({p.projectCode})</SelectItem>)}</SelectContent>
                </Select>
              )}
              {relatedTo === 'Personnel' && (
                <Select value={relatedId} onValueChange={setRelatedId}>
                  <SelectTrigger id="relatedId-safety-personnel"><SelectValue placeholder="Select Personnel" /></SelectTrigger>
                  <SelectContent>{(personnelList || []).map(p => <SelectItem key={p.id} value={p.id}>{p.fullName} ({p.staffId})</SelectItem>)}</SelectContent>
                </Select>
              )}
              {relatedTo === 'Equipment' && (
                 <Select value={relatedId} onValueChange={setRelatedId}>
                  <SelectTrigger id="relatedId-safety-equipment"><SelectValue placeholder="Select Equipment" /></SelectTrigger>
                  <SelectContent>{(equipmentList || []).map(e => <SelectItem key={e.id} value={e.id}>{e.name} ({e.equipmentId})</SelectItem>)}</SelectContent>
                </Select>
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="fileUpload-safety">Upload Document (PDF, JPG, etc.) - Simulated</Label>
            <Input id="fileUpload-safety" type="file" onChange={(e) => setFile(e.target.files[0])} className="mt-1" />
            {file && <p className="text-xs text-muted-foreground mt-1">Selected: {file.name}</p>}
            {!file && initialData.fileName && initialData.fileName !== "Link to Cloud Document" && <p className="text-xs text-muted-foreground mt-1">Current file: {initialData.fileName}</p>}
          </div>
          <div>
            <Label htmlFor="fileUrl-safety">Or Provide Cloud Storage Link (e.g., Google Drive, Dropbox)</Label>
            <Input id="fileUrl-safety" value={fileUrl} onChange={e => setFileUrl(e.target.value)} placeholder="https://..." className="mt-1" />
             {initialData.fileName === "Link to Cloud Document" && !fileUrl && <p className="text-xs text-muted-foreground mt-1">Current: Link to cloud document provided.</p>}
          </div>
          <div>
             <Label htmlFor="notes-safety">Notes</Label>
             <Textarea id="notes-safety" value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Any specific notes about this document or its compliance status."/>
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
            <Button type="submit">{initialData.id ? 'Update Document' : 'Add Document'}</Button>
          </div>
        </form>
      );
    };

    export default SafetyDocumentForm;