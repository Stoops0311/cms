import React, { useState, useMemo, useCallback } from 'react';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription as DDescription } from '@/components/ui/dialog.jsx';
    import { useToast } from '@/components/ui/use-toast.jsx';
    import useLocalStorage from '@/hooks/useLocalStorage.jsx';
    import { motion } from 'framer-motion';
    import { TabsContent } from "@/components/ui/tabs.jsx";
    import AgreementForm from '@/components/legalAgreements/AgreementForm.jsx';
    import AgreementsList from '@/components/legalAgreements/AgreementsList.jsx';
    import StakeholderDirectory from '@/components/legalAgreements/StakeholderDirectory.jsx';
    import LegalPageHeader from '@/components/legalAgreements/LegalPageHeader.jsx';
    import LegalTabs from '@/components/legalAgreements/LegalTabs.jsx';

    const LegalAgreements = () => {
      const [agreements, setAgreements] = useLocalStorage('cmsLegalAgreements', []);
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [editingAgreement, setEditingAgreement] = useState(null);
      const [activeTab, setActiveTab] = useState("agreements");
      const [isAiModeActive, setIsAiModeActive] = useState(false);
      
      const [contractors] = useLocalStorage('contractors', []);
      const [partners] = useLocalStorage('cmsPartners', []); 
      const [suppliers] = useLocalStorage('cmsSuppliers', []);
      const [clients] = useLocalStorage('cmsClients', []);
      const [investors] = useLocalStorage('cmsInvestors', []);


      const allStakeholders = useMemo(() => {
        const mapStakeholder = (item, defaultType) => ({
            id: item.id || `item-${Math.random().toString(36).substr(2, 9)}`, 
            name: item.name || item.companyName || item.clientName || item.investorName || 'Unknown Stakeholder',
            type: item.type || item.category || defaultType,
            email: item.email || item.contactEmail,
            phone: item.phone || item.contactPhone,
            contactPerson: item.contactPerson,
            crNumber: item.crNumber || item.registrationNumber, 
            idNumber: item.idNumber,
            nationality: item.nationality, 
        });

        return [
            ...(contractors || []).map(c => mapStakeholder(c, "Contractor")),
            ...(partners || []).map(p => mapStakeholder(p, "Partner")),
            ...(suppliers || []).map(s => mapStakeholder(s, "Supplier")),
            ...(clients || []).map(cl => mapStakeholder(cl, "Client")),
            ...(investors || []).map(i => mapStakeholder(i, "Investor")),
        ].filter((value, index, self) => self.findIndex(s => s.id === value.id) === index); 
      }, [contractors, partners, suppliers, clients, investors]);


      const { toast } = useToast();

      const handleOpenModal = useCallback((agreement = null, aiMode = false) => {
        setEditingAgreement(agreement);
        setIsAiModeActive(aiMode);
        setIsModalOpen(true);
      }, []);
      
      const handleOpenAiModal = useCallback(() => {
        handleOpenModal(null, true);
      }, [handleOpenModal]);


      const handleCloseModal = useCallback(() => {
        setEditingAgreement(null);
        setIsModalOpen(false);
        setIsAiModeActive(false);
      }, []);

      const handleSaveAgreement = useCallback((data) => {
        if (editingAgreement) {
          setAgreements(prev => prev.map(agr => agr.id === data.id ? data : agr));
          toast({ title: "Agreement Updated", description: `"${data.agreementTitle}" has been updated.` });
        } else {
          setAgreements(prev => [data, ...prev].sort((a,b) => new Date(b.effectiveDate) - new Date(a.effectiveDate)));
          toast({ title: "Agreement Added", description: `"${data.agreementTitle}" has been added.` });
        }
        handleCloseModal();
      }, [editingAgreement, setAgreements, toast, handleCloseModal]);

      const handleDeleteAgreement = useCallback((agreementId) => {
        if (window.confirm("Are you sure you want to delete this agreement? This action cannot be undone.")) {
          setAgreements(prev => prev.filter(agr => agr.id !== agreementId));
          toast({ title: "Agreement Deleted", variant: "destructive" });
        }
      }, [setAgreements, toast]);

      const handleDownloadDocument = useCallback((fileName) => {
          toast({ title: "Download Initiated (Placeholder)", description: `Preparing to download ${fileName}. This is a conceptual feature for uploaded physical documents.`});
      }, [toast]);
      
      return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }} 
            className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-indigo-50 min-h-screen"
        >
           <LegalPageHeader 
             activeTab={activeTab} 
             onAddNew={() => handleOpenModal(null, false)}
             onAiGenerate={handleOpenAiModal}
           />

           <LegalTabs activeTab={activeTab} onTabChange={setActiveTab}>
                <TabsContent value="agreements">
                    <AgreementsList 
                        agreements={agreements} 
                        onEdit={(agr) => handleOpenModal(agr, false)} 
                        onDelete={handleDeleteAgreement}
                        onDownloadDocument={handleDownloadDocument}
                        allStakeholders={allStakeholders}
                    />
                </TabsContent>
                <TabsContent value="stakeholders">
                    <StakeholderDirectory allStakeholders={allStakeholders} agreements={agreements} />
                </TabsContent>
           </LegalTabs>

          <Dialog open={isModalOpen} onOpenChange={(open) => { if(!open) handleCloseModal(); else setIsModalOpen(open); }}>
            <DialogContent className="sm:max-w-3xl lg:max-w-4xl bg-white rounded-lg shadow-2xl">
              <DialogHeader className="border-b pb-4">
                <DialogTitle className="text-xl font-semibold text-slate-800">
                  {editingAgreement ? 'Edit Agreement' : (isAiModeActive ? 'AI Assisted Agreement Draft' : 'Create New Agreement')}
                </DialogTitle>
                <DDescription className="text-sm text-slate-500">
                  {isAiModeActive ? "Use AI to help draft content, then review and finalize." : "Fill in the details for the agreement. Upload the signed document if available."}
                </DDescription>
              </DialogHeader>
              <AgreementForm 
                onSubmit={handleSaveAgreement} 
                initialData={editingAgreement || {}} 
                onCancel={handleCloseModal}
                stakeholdersList={allStakeholders}
                isAiMode={isAiModeActive}
               />
            </DialogContent>
          </Dialog>
        </motion.div>
      );
    };

    export default LegalAgreements;