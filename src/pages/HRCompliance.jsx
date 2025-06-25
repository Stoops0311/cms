import React, { useState, useMemo } from 'react';
    import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { ShieldCheck, FilePlus } from 'lucide-react';
    import { motion } from 'framer-motion';
    import { useToast } from '@/components/ui/use-toast.jsx';
    import useLocalStorage from '@/hooks/useLocalStorage.jsx';
    import HRDocumentForm from '@/components/hr/HRDocumentForm.jsx';
    import HRDocumentList from '@/components/hr/HRDocumentList.jsx';
    import HRFilterControls from '@/components/hr/HRFilterControls.jsx'; 
    import { parseISO } from 'date-fns';

    const documentTypes = ["National ID/Iqama", "Passport", "Medical Insurance", "Medical License", "Employment Contract", "Driving License"];
    const approvedInsuranceProviders = ["Bupa Arabia", "Tawuniya", "Medgulf", "AXA Cooperative", "Allianz SF", "Malath Insurance", "Al Rajhi Takaful"];
    
    const initialDocuments = [
      { id: "DOC001", staffId: "EMP001", staffName: "Dr. Alice Smith", documentType: "Passport", documentNumber: "P123456", expiryDate: "2025-12-31", insuranceProvider: null, fileUrl: null, fileName: "Alice_Passport.pdf" },
      { id: "DOC002", staffId: "EMP001", staffName: "Dr. Alice Smith", documentType: "Medical Insurance", documentNumber: "MI654321", expiryDate: "2025-06-15", insuranceProvider: "Bupa Arabia", fileUrl: null, fileName: "Alice_Insurance.pdf" },
      { id: "DOC003", staffId: "EMP002", staffName: "Nurse Bob Johnson", documentType: "National ID/Iqama", documentNumber: "NID987654", expiryDate: "2026-03-01", insuranceProvider: null, fileUrl: null, fileName: "Bob_Iqama.jpg" },
      { id: "DOC004", staffId: "EMP003", staffName: "Driver Carol White", documentType: "Medical Insurance", documentNumber: "MI112233", expiryDate: "2025-05-20", insuranceProvider: "Tawuniya", fileUrl: null, fileName: null },
      { id: "DOC005", staffId: "EMP001", staffName: "Dr. Alice Smith", documentType: "Medical License", documentNumber: "LIC789012", expiryDate: "2024-11-30", insuranceProvider: null, fileUrl: null, fileName: "Alice_License.pdf" },
      { id: "DOC006", staffId: "EMP004", staffName: "Pharmacist David Lee", documentType: "Passport", documentNumber: "PZXY987", expiryDate: "2027-02-10", insuranceProvider: null, fileUrl: null, fileName: "David_Passport.pdf" },
    ];

    const HRCompliance = () => {
      const { toast } = useToast();
      const [personnelList] = useLocalStorage('personnelList', []);
      const [documents, setDocuments] = useLocalStorage('pamsHrDocuments', initialDocuments);
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [editingDocument, setEditingDocument] = useState(null);
      
      const [filterType, setFilterType] = useState('all');
      const [filterStaff, setFilterStaff] = useState('all');

      const mockStaffList = useMemo(() => {
        return personnelList.map(p => ({ id: p.id, name: p.fullName }));
      }, [personnelList]);


      const openModal = (doc = null) => {
        setEditingDocument(doc);
        setIsModalOpen(true);
      };

      const handleSubmitDocument = (formData, currentEditingDocument) => {
        const staffMember = mockStaffList.find(s => s.id === formData.staffId);

        const newDocData = {
            ...formData,
            staffName: staffMember?.name || 'Unknown Staff',
            expiryDate: formData.expiryDate ? formData.expiryDate.toISOString().split('T')[0] : null,
            fileName: formData.file ? formData.file.name : (currentEditingDocument?.fileName || null),
            fileUrl: null, 
        };
        delete newDocData.file;


        if (currentEditingDocument) {
          setDocuments(prev => prev.map(doc => doc.id === currentEditingDocument.id ? { ...currentEditingDocument, ...newDocData } : doc));
          toast({ title: "Document Updated", description: `${newDocData.documentType} for ${newDocData.staffName} updated successfully.`, className: "bg-blue-500 text-white" });
        } else {
          const newDocumentWithId = {
            ...newDocData,
            id: `DOC${Date.now()}`,
          };
          setDocuments(prev => [newDocumentWithId, ...prev]);
          toast({ title: "Document Added", description: `${newDocData.documentType} for ${newDocData.staffName} added successfully.`, className: "bg-green-500 text-white" });
        }
        setIsModalOpen(false);
        setEditingDocument(null);
      };

      const handleDelete = (docId) => {
        setDocuments(prev => prev.filter(doc => doc.id !== docId));
        toast({ title: "Document Deleted", description: "Document removed successfully.", className: "bg-red-500 text-white" });
      };
      
      const filteredDocuments = useMemo(() => {
        return documents
          .filter(doc => filterType === 'all' || doc.documentType === filterType)
          .filter(doc => filterStaff === 'all' || doc.staffId === filterStaff)
          .sort((a, b) => {
            const dateA = a.expiryDate ? parseISO(a.expiryDate) : new Date(0); 
            const dateB = b.expiryDate ? parseISO(b.expiryDate) : new Date(0);
            return dateA - dateB;
          });
      }, [documents, filterType, filterStaff]);


      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <Card className="shadow-lg border-t-4 border-indigo-500">
            <CardHeader className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <CardTitle className="text-xl font-semibold text-indigo-600 flex items-center">
                  <ShieldCheck className="mr-2 h-6 w-6" /> HR & Compliance Monitoring
                </CardTitle>
                <CardDescription className="mt-1">Track staff document expirations and manage compliance.</CardDescription>
              </div>
              <Button onClick={() => openModal()} className="bg-indigo-600 hover:bg-indigo-700 mt-3 sm:mt-0">
                <FilePlus className="mr-2 h-4 w-4" /> Add Document
              </Button>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <HRFilterControls
                filterType={filterType}
                setFilterType={setFilterType}
                filterStaff={filterStaff}
                setFilterStaff={setFilterStaff}
                documentTypes={documentTypes}
                mockStaffList={mockStaffList}
                onGenerateReport={() => toast({title: "Compliance Report", description:"Generating compliance report (placeholder)."}) }
              />
              <HRDocumentList documents={filteredDocuments} onEdit={openModal} onDelete={handleDelete} />
            </CardContent>
            <CardFooter className="p-6 border-t">
                <p className="text-sm text-muted-foreground">Automatic expiry alerts to employee & admin panel are simulated via UI status.</p>
            </CardFooter>
          </Card>

          <HRDocumentForm
            isOpen={isModalOpen}
            onClose={() => { setIsModalOpen(false); setEditingDocument(null); }}
            onSubmit={handleSubmitDocument}
            editingDocument={editingDocument}
            mockStaffList={mockStaffList}
            documentTypes={documentTypes}
            approvedInsuranceProviders={approvedInsuranceProviders}
          />
        </motion.div>
      );
    };

    export default HRCompliance;