import React, { useState, useMemo } from 'react';
    import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { Input } from '@/components/ui/input.jsx';
    import { Label } from '@/components/ui/label.jsx';
    import { DatePicker } from '@/components/ui/date-picker.jsx';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog.jsx';
    import { ShieldCheck, PlusCircle, Edit2, Trash2, Search, Filter, AlertTriangle, FileText, Download, ExternalLink } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast.jsx';
    import useLocalStorage from '@/hooks/useLocalStorage.jsx';
    import { motion } from 'framer-motion';
    import { format, differenceInDays, parseISO } from 'date-fns';
    import SafetyDocumentForm, { documentTypes } from '@/components/safety/SafetyDocumentForm.jsx';
    import ViewSafetyDocumentModal from '@/components/safety/ViewSafetyDocumentModal.jsx';

    const SafetyCompliance = () => {
      const [documents, setDocuments] = useLocalStorage('cmsSafetyDocs', []);
      const [projects] = useLocalStorage('projects', []); // Assuming projects list is needed for relating docs
      const [personnel] = useLocalStorage('cmsPersonnel', []); // Assuming personnel list for relating docs
      const [equipment] = useLocalStorage('cmsEquipment', []); // Assuming equipment list for relating docs

      const [isFormModalOpen, setIsFormModalOpen] = useState(false);
      const [isViewModalOpen, setIsViewModalOpen] = useState(false);
      const [editingDoc, setEditingDoc] = useState(null);
      const [viewingDoc, setViewingDoc] = useState(null);
      const [searchTerm, setSearchTerm] = useState('');
      const [filterDocType, setFilterDocType] = useState('All Types');
      const [filterStatus, setFilterStatus] = useState('All Statuses'); // Valid, Expiring Soon, Expired
      const { toast } = useToast();

      const handleSaveDocument = (data) => {
        if (editingDoc) {
          setDocuments(prev => prev.map(d => d.id === data.id ? data : d));
          toast({ title: "Document Updated", description: `${data.docName} details updated.` });
        } else {
          setDocuments(prev => [...prev, data]);
          toast({ title: "Document Added", description: `${data.docName} added to records.` });
        }
        setIsFormModalOpen(false);
        setEditingDoc(null);
      };

      const handleDeleteDocument = (id) => {
        const docToDelete = documents.find(d => d.id === id);
        if (window.confirm(`Are you sure you want to delete ${docToDelete?.docName || 'this document'}?`)) {
          setDocuments(prev => prev.filter(d => d.id !== id));
          toast({ title: "Document Deleted", variant: "destructive" });
        }
      };

      const openEditModal = (doc) => {
        setEditingDoc(doc);
        setIsFormModalOpen(true);
      };
      
      const openViewModal = (doc) => {
        setViewingDoc(doc);
        setIsViewModalOpen(true);
      }

      const handleDownload = (doc) => {
        if (doc.fileUrl) {
             window.open(doc.fileUrl, '_blank'); // Open link if URL exists
             toast({ title: "Opening Document Link", description: `Attempting to open ${doc.docName}.` });
        } else {
            toast({ title: "Simulating Download", description: `Preparing ${doc.fileName || doc.docName} for download. (No direct URL provided)` });
        }
      };

      const getRelatedName = (doc) => {
          if (!doc.relatedId) return 'N/A';
          if (doc.relatedTo === 'Project') return projects.find(p => p.id === doc.relatedId)?.projectName || doc.relatedId;
          if (doc.relatedTo === 'Personnel') return personnel.find(p => p.id === doc.relatedId)?.fullName || doc.relatedId;
          if (doc.relatedTo === 'Equipment') return equipment.find(e => e.id === doc.relatedId)?.name || doc.relatedId;
          return doc.relatedId;
      };

      const filteredDocuments = useMemo(() => {
        return documents.filter(doc => {
          const relatedName = getRelatedName(doc);
          const matchesSearch = doc.docName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                (doc.docNumber && doc.docNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
                                (relatedName && relatedName.toLowerCase().includes(searchTerm.toLowerCase()));
          const matchesDocType = filterDocType === 'All Types' || doc.docType === filterDocType;
          
          let matchesStatus = true;
          if (filterStatus !== 'All Statuses') {
            const daysToExpiry = doc.expiryDate ? differenceInDays(parseISO(doc.expiryDate), new Date()) : null;
            if (filterStatus === 'Valid' && (daysToExpiry === null || daysToExpiry > 30)) matchesStatus = true;
            else if (filterStatus === 'Expiring Soon' && daysToExpiry !== null && daysToExpiry <= 30 && daysToExpiry >= 0) matchesStatus = true; // Changed >0 to >=0
            else if (filterStatus === 'Expired' && daysToExpiry !== null && daysToExpiry < 0) matchesStatus = true; // Changed <=0 to <0
            else matchesStatus = false;
             if (filterStatus === 'Valid' && doc.expiryDate === null && !matchesStatus) matchesStatus = true; // Treat no expiry as valid if not already covered
          }
          return matchesSearch && matchesDocType && matchesStatus;
        }).sort((a,b) => (a.expiryDate && b.expiryDate) ? new Date(a.expiryDate) - new Date(b.expiryDate) : (a.expiryDate ? -1 : 1) );
      }, [documents, searchTerm, filterDocType, filterStatus, projects, personnel, equipment]);

      return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-8">
          <Card className="shadow-xl border-t-4 border-red-600">
            <CardHeader className="bg-gradient-to-r from-red-600/10 to-rose-600/10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <CardTitle className="text-2xl font-bold text-red-700 flex items-center"><ShieldCheck className="mr-3 h-7 w-7" />Safety & Compliance Records</CardTitle>
                  <CardDescription>Manage safety documents, certifications, and compliance for personnel, equipment, and projects.</CardDescription>
                </div>
                <Button onClick={() => { setEditingDoc(null); setIsFormModalOpen(true); }} className="mt-4 md:mt-0 bg-red-600 hover:bg-red-700">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add New Document
                </Button>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input placeholder="Search by name, number, related entity..." className="pl-10 w-full" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <Select value={filterDocType} onValueChange={setFilterDocType}>
                  <SelectTrigger><div className="flex items-center"><Filter className="mr-2 h-4 w-4 text-muted-foreground" /> <SelectValue placeholder="Filter by Document Type" /></div></SelectTrigger>
                  <SelectContent>{['All Types', ...documentTypes].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger><div className="flex items-center"><Filter className="mr-2 h-4 w-4 text-muted-foreground" /> <SelectValue placeholder="Filter by Status" /></div></SelectTrigger>
                  <SelectContent>{['All Statuses', 'Valid', 'Expiring Soon', 'Expired'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document Name</TableHead><TableHead>Type</TableHead><TableHead>Related To</TableHead>
                      <TableHead>Issue Date</TableHead><TableHead>Expiry Date</TableHead><TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments.length === 0 && (
                        <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No safety documents found. Adjust filters or add new records.</TableCell></TableRow>
                    )}
                    {filteredDocuments.map(doc => {
                      const daysToExpiry = doc.expiryDate ? differenceInDays(parseISO(doc.expiryDate), new Date()) : null;
                      let statusText = "Valid";
                      let statusClass = "bg-green-100 text-green-700";
                      if (daysToExpiry !== null) {
                        if (daysToExpiry < 0) { statusText = "Expired"; statusClass = "bg-red-100 text-red-700"; }
                        else if (daysToExpiry <= 30) { statusText = `Expires in ${daysToExpiry + 1}d`; statusClass = "bg-orange-100 text-orange-700"; } // +1 to make it inclusive of today
                      } else {
                         statusText = "No Expiry"; statusClass = "bg-slate-100 text-slate-700";
                      }
                      
                      return (
                        <TableRow key={doc.id} className={`hover:bg-muted/50 ${daysToExpiry !== null && daysToExpiry < 0 ? 'bg-red-500/5' : (daysToExpiry !== null && daysToExpiry <= 30 ? 'bg-orange-500/5' : '')}`}>
                          <TableCell className="font-medium">{doc.docName}</TableCell><TableCell>{doc.docType}</TableCell>
                          <TableCell>{doc.relatedTo}: {getRelatedName(doc)}</TableCell>
                          <TableCell>{format(new Date(doc.issueDate), 'dd MMM yyyy')}</TableCell>
                          <TableCell>{doc.expiryDate ? format(new Date(doc.expiryDate), 'dd MMM yyyy') : 'N/A'}</TableCell>
                          <TableCell><span className={`px-2 py-1 text-xs rounded-full font-medium ${statusClass}`}>{statusText}</span></TableCell>
                          <TableCell className="text-right space-x-1">
                            <Button variant="ghost" size="icon" onClick={() => openViewModal(doc)} title="View Details"><FileText className="h-4 w-4 text-indigo-600" /></Button>
                            {doc.fileUrl && <Button variant="ghost" size="icon" onClick={() => handleDownload(doc)} title="Open Document Link"><ExternalLink className="h-4 w-4 text-blue-600" /></Button>}
                            {!doc.fileUrl && doc.fileName && <Button variant="ghost" size="icon" onClick={() => handleDownload(doc)} title="Download (Simulated)"><Download className="h-4 w-4 text-blue-600" /></Button>}
                            <Button variant="ghost" size="icon" onClick={() => openEditModal(doc)} title="Edit"><Edit2 className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteDocument(doc.id)} title="Delete"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
             {filteredDocuments.length > 0 && (
                <CardFooter className="p-4 border-t text-sm text-muted-foreground">
                    Showing {filteredDocuments.length} of {documents.length} total documents.
                </CardFooter>
            )}
          </Card>

          <Dialog open={isFormModalOpen} onOpenChange={(open) => { if(!open) { setEditingDoc(null); setIsFormModalOpen(false); } else { setIsFormModalOpen(true); }}}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
              <DialogHeader>
                <DialogTitle>{editingDoc ? 'Edit Safety Document' : 'Add New Safety Document'}</DialogTitle>
                <DialogDescription>Fill in the details for the safety or compliance document.</DialogDescription>
              </DialogHeader>
              <SafetyDocumentForm 
                onSubmit={handleSaveDocument} 
                initialData={editingDoc || {}} 
                onCancel={() => { setIsFormModalOpen(false); setEditingDoc(null); }}
                projects={projects}
                personnelList={personnel}
                equipmentList={equipment}
              />
            </DialogContent>
          </Dialog>

          {viewingDoc && (
            <ViewSafetyDocumentModal 
                isOpen={isViewModalOpen} 
                onClose={() => { setIsViewModalOpen(false); setViewingDoc(null); }} 
                doc={viewingDoc}
                getRelatedName={getRelatedName}
                onDownload={handleDownload}
            />
          )}

        </motion.div>
      );
    };

    export default SafetyCompliance;