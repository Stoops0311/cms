import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { ShieldCheck, FilePlus, Loader2, FileWarning, Download, GraduationCap, CheckCircle, XCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast.jsx';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import HRDocumentForm from '@/components/hr/HRDocumentForm.jsx';
import HRDocumentList from '@/components/hr/HRDocumentList.jsx';
import HRFilterControls from '@/components/hr/HRFilterControls.jsx';
import { parseISO } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';

const documentTypes = ["National ID/Iqama", "Passport", "Medical Insurance", "Medical License", "Employment Contract", "Driving License", "Visa", "Work Permit", "Medical Certificate"];
const approvedInsuranceProviders = ["Bupa Arabia", "Tawuniya", "Medgulf", "AXA Cooperative", "Allianz SF", "Malath Insurance", "Al Rajhi Takaful"];

const HRCompliance = () => {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [filterType, setFilterType] = useState('all');
  const [filterStaff, setFilterStaff] = useState('all');

  // Convex queries
  const documents = useQuery(api.hrDocuments.listHRDocuments, {});
  const users = useQuery(api.admin.listUsers, { isActive: true });
  const documentStats = useQuery(api.hrDocuments.getDocumentStats, {});
  const expiringDocs = useQuery(api.hrDocuments.getExpiringDocuments, { daysUntilExpiry: 30 });
  const trainingRequests = useQuery(api.trainingRequests.listTrainingRequests, {});
  const trainingStats = useQuery(api.trainingRequests.getTrainingStats, {});

  // Convex mutations
  const createDocument = useMutation(api.hrDocuments.createHRDocument);
  const updateDocument = useMutation(api.hrDocuments.updateHRDocument);
  const deleteDocument = useMutation(api.hrDocuments.deleteHRDocument);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const approveTraining = useMutation(api.trainingRequests.approveTrainingRequest);
  const rejectTraining = useMutation(api.trainingRequests.rejectTrainingRequest);

  // Get first admin user as createdBy
  const adminUser = users?.find(u => u.role === 'admin') || users?.[0];

  const staffList = useMemo(() => {
    return users?.map(u => ({ id: u._id, name: u.fullName })) || [];
  }, [users]);

  const openModal = (doc = null) => {
    setEditingDocument(doc);
    setIsModalOpen(true);
  };

  const handleSubmitDocument = async (formData, currentEditingDocument) => {
    if (!adminUser) {
      toast({ variant: "destructive", title: "Error", description: "No admin user found." });
      return;
    }

    setIsSubmitting(true);
    try {
      let fileId = currentEditingDocument?.fileId;
      let fileName = currentEditingDocument?.fileName;

      // Handle file upload if a new file was selected
      if (formData.file) {
        const uploadUrl = await generateUploadUrl();
        const response = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": formData.file.type },
          body: formData.file,
        });
        const { storageId } = await response.json();
        fileId = storageId;
        fileName = formData.file.name;
      }

      const docData = {
        userId: formData.staffId,
        documentType: formData.documentType,
        documentNumber: formData.documentNumber,
        expiryDate: formData.expiryDate ? formData.expiryDate.toISOString().split('T')[0] : undefined,
        insuranceProvider: formData.insuranceProvider || undefined,
        fileId,
        fileName,
        notes: formData.notes || undefined,
      };

      if (currentEditingDocument) {
        await updateDocument({
          id: currentEditingDocument._id,
          ...docData,
        });
        toast({ title: "Document Updated", description: `${docData.documentType} updated successfully.`, className: "bg-blue-500 text-white" });
      } else {
        await createDocument({
          ...docData,
          createdBy: adminUser._id,
        });
        toast({ title: "Document Added", description: `${docData.documentType} added successfully.`, className: "bg-green-500 text-white" });
      }
      setIsModalOpen(false);
      setEditingDocument(null);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to save document." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (docId) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      try {
        await deleteDocument({ id: docId });
        toast({ title: "Document Deleted", description: "Document removed successfully.", className: "bg-red-500 text-white" });
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: error.message || "Failed to delete document." });
      }
    }
  };

  const handleApproveTraining = async (id) => {
    if (!adminUser) return;
    try {
      await approveTraining({ id, approvedBy: adminUser._id });
      toast({ title: "Training Approved", description: "Training request has been approved." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to approve." });
    }
  };

  const handleRejectTraining = async (id) => {
    if (!adminUser) return;
    const reason = window.prompt("Enter rejection reason:");
    if (reason) {
      try {
        await rejectTraining({ id, approvedBy: adminUser._id, notes: reason });
        toast({ title: "Training Rejected", description: "Training request has been rejected." });
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: error.message || "Failed to reject." });
      }
    }
  };

  const handleGenerateReport = () => {
    if (!documents || documents.length === 0) {
      toast({ variant: "destructive", title: "No Data", description: "No documents to generate report from." });
      return;
    }

    // Generate CSV report
    const headers = ['Staff Name', 'Document Type', 'Document Number', 'Expiry Date', 'Insurance Provider', 'Status'];
    const today = new Date().toISOString().split('T')[0];

    const rows = filteredDocuments.map(doc => {
      let status = 'Valid';
      if (doc.expiryDate) {
        if (doc.expiryDate < today) status = 'Expired';
        else {
          const thirtyDaysFromNow = new Date();
          thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
          if (doc.expiryDate <= thirtyDaysFromNow.toISOString().split('T')[0]) status = 'Expiring Soon';
        }
      }
      return [
        doc.staffName,
        doc.documentType,
        doc.documentNumber,
        doc.expiryDate || 'N/A',
        doc.insuranceProvider || 'N/A',
        status
      ].join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hr-compliance-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({ title: "Report Generated", description: "Compliance report downloaded successfully." });
  };

  const filteredDocuments = useMemo(() => {
    if (!documents) return [];
    return documents
      .filter(doc => filterType === 'all' || doc.documentType === filterType)
      .filter(doc => filterStaff === 'all' || doc.userId === filterStaff)
      .sort((a, b) => {
        const dateA = a.expiryDate ? parseISO(a.expiryDate) : new Date(0);
        const dateB = b.expiryDate ? parseISO(b.expiryDate) : new Date(0);
        return dateA - dateB;
      });
  }, [documents, filterType, filterStaff]);

  const isLoading = documents === undefined || users === undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Stats Cards */}
      {documentStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 border-l-4 border-green-500">
            <div className="text-sm text-muted-foreground">Total Documents</div>
            <div className="text-2xl font-bold text-green-600">{documentStats.total}</div>
          </Card>
          <Card className="p-4 border-l-4 border-blue-500">
            <div className="text-sm text-muted-foreground">Valid</div>
            <div className="text-2xl font-bold text-blue-600">{documentStats.valid}</div>
          </Card>
          <Card className="p-4 border-l-4 border-yellow-500">
            <div className="text-sm text-muted-foreground">Expiring Soon (30 days)</div>
            <div className="text-2xl font-bold text-yellow-600">{documentStats.expiringSoon}</div>
          </Card>
          <Card className="p-4 border-l-4 border-red-500">
            <div className="text-sm text-muted-foreground">Expired</div>
            <div className="text-2xl font-bold text-red-600">{documentStats.expired}</div>
          </Card>
        </div>
      )}

      {/* Expiring Documents Alert */}
      {expiringDocs && expiringDocs.length > 0 && (
        <Card className="border-l-4 border-yellow-500 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <FileWarning className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-800">Documents Expiring Soon</p>
                <p className="text-sm text-yellow-700">
                  {expiringDocs.length} document(s) will expire within 30 days. Review and renew them promptly.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-lg border-t-4 border-indigo-500">
        <CardHeader className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <CardTitle className="text-xl font-semibold text-indigo-600 flex items-center">
              <ShieldCheck className="mr-2 h-6 w-6" /> HR & Compliance Monitoring
            </CardTitle>
            <CardDescription className="mt-1">Track staff document expirations and manage compliance.</CardDescription>
          </div>
          <Button
            onClick={() => openModal()}
            className="bg-indigo-600 hover:bg-indigo-700 mt-3 sm:mt-0"
            disabled={!adminUser}
          >
            <FilePlus className="mr-2 h-4 w-4" /> Add Document
          </Button>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
              <span className="ml-2 text-muted-foreground">Loading documents...</span>
            </div>
          ) : (
            <>
              <HRFilterControls
                filterType={filterType}
                setFilterType={setFilterType}
                filterStaff={filterStaff}
                setFilterStaff={setFilterStaff}
                documentTypes={documentTypes}
                mockStaffList={staffList}
                onGenerateReport={handleGenerateReport}
              />
              <HRDocumentList
                documents={filteredDocuments}
                onEdit={openModal}
                onDelete={handleDelete}
              />
            </>
          )}
        </CardContent>
        <CardFooter className="p-6 border-t flex justify-between items-center">
          <p className="text-sm text-muted-foreground">Documents are automatically monitored for expiry.</p>
          <Button variant="outline" onClick={handleGenerateReport} disabled={!documents || documents.length === 0}>
            <Download className="mr-2 h-4 w-4" /> Export Report
          </Button>
        </CardFooter>
      </Card>

      {/* Training Requests Section */}
      <Card className="shadow-lg border-t-4 border-purple-500">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-purple-600 flex items-center">
            <GraduationCap className="mr-2 h-6 w-6" /> Training Requests
          </CardTitle>
          <CardDescription>Review and manage training requests from staff.</CardDescription>
        </CardHeader>
        <CardContent>
          {trainingStats && (
            <div className="grid grid-cols-4 gap-3 mb-4">
              <div className="p-2 bg-yellow-50 rounded text-center">
                <p className="text-lg font-bold text-yellow-600">{trainingStats.pending}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
              <div className="p-2 bg-green-50 rounded text-center">
                <p className="text-lg font-bold text-green-600">{trainingStats.approved}</p>
                <p className="text-xs text-muted-foreground">Approved</p>
              </div>
              <div className="p-2 bg-red-50 rounded text-center">
                <p className="text-lg font-bold text-red-600">{trainingStats.rejected}</p>
                <p className="text-xs text-muted-foreground">Rejected</p>
              </div>
              <div className="p-2 bg-blue-50 rounded text-center">
                <p className="text-lg font-bold text-blue-600">{trainingStats.completed}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          )}
          {trainingRequests?.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No training requests submitted.</p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {trainingRequests?.map(req => (
                <div key={req._id} className="p-3 rounded-lg border bg-white shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{req.trainingTitle}</p>
                      <p className="text-sm text-muted-foreground">{req.employeeName} - {req.department}</p>
                      <p className="text-xs text-muted-foreground">Type: {req.trainingType}</p>
                      {req.estimatedCost && <p className="text-xs text-muted-foreground">Cost: ${req.estimatedCost}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        req.status === 'Approved' ? 'bg-green-100 text-green-800' :
                        req.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                        req.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {req.status}
                      </span>
                      {req.status === 'Pending' && (
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => handleApproveTraining(req._id)}>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleRejectTraining(req._id)}>
                            <XCircle className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs mt-1">{req.justification}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <HRDocumentForm
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingDocument(null); }}
        onSubmit={handleSubmitDocument}
        editingDocument={editingDocument}
        mockStaffList={staffList}
        documentTypes={documentTypes}
        approvedInsuranceProviders={approvedInsuranceProviders}
        isSubmitting={isSubmitting}
      />
    </motion.div>
  );
};

export default HRCompliance;
