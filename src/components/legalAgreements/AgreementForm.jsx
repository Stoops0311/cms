import React, { useState, useEffect } from 'react';
    import { Button } from '@/components/ui/button.jsx';
    import { Input } from '@/components/ui/input.jsx';
    import { Label } from '@/components/ui/label.jsx';
    import { Textarea } from '@/components/ui/textarea.jsx';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
    import { DatePicker } from '@/components/ui/date-picker.jsx';
    import { Checkbox } from '@/components/ui/checkbox.jsx';
    import { DialogFooter as DFooter } from '@/components/ui/dialog.jsx';
    import { useToast } from '@/components/ui/use-toast.jsx';
    import { UploadCloud, MapPin as MapPinIcon, CalendarPlus as CalendarIcon, Brain, FileText } from 'lucide-react';
    import { mockApiCallGlobal } from '@/lib/aiUtils.jsx';
    
    import PartyFields, { MANUAL_ENTRY_VALUE } from './agreementFormParts/PartyFields.jsx';
    import PreambleSection from './agreementFormParts/PreambleSection.jsx';
    import ObligationsSection from './agreementFormParts/ObligationsSection.jsx';
    import StandardClausesSection from './agreementFormParts/StandardClausesSection.jsx';
    import AgreementFormHeader from './agreementFormParts/AgreementFormHeader.jsx';
    import AgreementFormFields from './agreementFormParts/AgreementFormFields.jsx';
    import AgreementFormFileUpload from './agreementFormParts/AgreementFormFileUpload.jsx';
    import AgreementFormMetaFields from './agreementFormParts/AgreementFormMetaFields.jsx';


    const agreementTypes = ["MOU", "NCNDA", "General Agreement", "JV Agreement", "NDA", "Supply Contract", "Service Agreement", "Partnership Agreement", "Subcontractor Agreement", "Master Subcontractor Agreement", "Other"];
    const stakeholderCategories = ["Partner", "Investor", "Contractor", "Master Contractor", "Master Subcontractor", "Subcontractor", "Government Entity", "Supplier", "Consultant", "Client", "Multiple"];
    const confidentialityLevels = ["Public", "Internal", "Confidential"];
    const agreementStatuses = ["Draft", "Signed", "Under Review", "Active", "Expired", "Terminated"];
    const partyRoles = ["First Part (Party A)", "Second Part (Party B)", "Party C", "Party D", "Other Party"];


    const AgreementForm = ({ onSubmit, initialData = {}, onCancel, stakeholdersList = [], isAiMode = false }) => {
      const [formData, setFormData] = useState({
        agreementTitle: '', agreementType: agreementTypes[0], agreementDate: null, placeOfAgreement: '',
        stakeholderCategoryAggr: stakeholderCategories[0], parties: [{ id: `party-${Date.now()}`, role: partyRoles[0], stakeholderId: MANUAL_ENTRY_VALUE, manualName: '', representative: '', witnessDetails: '' }],
        effectiveDate: null, expiryDate: null, summary: '', documentFileName: '',
        confidentialityLevel: confidentialityLevels[1], autoReminders: false, status: agreementStatuses[0],
        preamble: '', obligationsBreachRemedies: '', externalDocumentLinks: [],
        paymentTerms: '', nonCompeteClause: '', ipRights: '', terminationConditions: '',
        disputeJurisdiction: '', appendixFileName: '', firstPartSignatory: '', secondPartSignatory: '',
      });
      const [documentFile, setDocumentFile] = useState(null);
      const [appendixFile, setAppendixFile] = useState(null);
      const [isAiGenerating, setIsAiGenerating] = useState(false);

      const { toast } = useToast();

      useEffect(() => {
        setFormData({
          agreementTitle: initialData.agreementTitle || '',
          agreementType: initialData.agreementType || agreementTypes[0],
          agreementDate: initialData.agreementDate ? new Date(initialData.agreementDate) : null,
          placeOfAgreement: initialData.placeOfAgreement || '',
          stakeholderCategoryAggr: initialData.stakeholderCategoryAggr || stakeholderCategories[0],
          parties: initialData.parties || [{ id: `party-${Date.now()}`, role: partyRoles[0], stakeholderId: MANUAL_ENTRY_VALUE, manualName: '', representative: '', witnessDetails: '' }],
          effectiveDate: initialData.effectiveDate ? new Date(initialData.effectiveDate) : null,
          expiryDate: initialData.expiryDate ? new Date(initialData.expiryDate) : null,
          summary: initialData.summary || '',
          documentFileName: initialData.documentFileName || '',
          confidentialityLevel: initialData.confidentialityLevel || confidentialityLevels[1],
          autoReminders: initialData.autoReminders || false,
          status: initialData.status || agreementStatuses[0],
          preamble: initialData.preamble || '',
          obligationsBreachRemedies: initialData.obligationsBreachRemedies || '',
          externalDocumentLinks: initialData.externalDocumentLinks || [],
          paymentTerms: initialData.paymentTerms || '',
          nonCompeteClause: initialData.nonCompeteClause || '',
          ipRights: initialData.ipRights || '',
          terminationConditions: initialData.terminationConditions || '',
          disputeJurisdiction: initialData.disputeJurisdiction || '',
          appendixFileName: initialData.appendixFileName || '',
          firstPartSignatory: initialData.firstPartSignatory || '',
          secondPartSignatory: initialData.secondPartSignatory || '',
        });
        setDocumentFile(null);
        setAppendixFile(null);
      }, [initialData]);
      
      const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
      };

      const handlePartyChange = (newParties) => {
        setFormData(prev => ({ ...prev, parties: newParties }));
      };
      
      const handleDateChange = (field, date) => {
        handleChange(field, date);
      };

      const handleFileChange = (e, setFile, fieldName) => {
        if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          if (file.size > 10 * 1024 * 1024) { 
            toast({ variant: "destructive", title: "File too large", description: "Maximum file size is 10MB." });
            return;
          }
          if (setFile) setFile(file);
          handleChange(fieldName, file.name);
        }
      };

      const handleAiGenerateContent = async () => {
        setIsAiGenerating(true);
        try {
            const aiGeneratedText = await mockApiCallGlobal(
                toast, 
                `Agreement Content (${formData.agreementType})`, 
                {
                    summary: `This is an AI-generated summary for a ${formData.agreementType} concerning ${formData.agreementTitle || 'the specified project/matter'}. It outlines key objectives and involved parties.`,
                    preamble: `WHEREAS, the parties are desirous of entering into a ${formData.agreementType} for the purpose of [AI: Insert primary purpose based on title/type: e.g., 'collaborating on Project Alpha', 'ensuring confidentiality of shared information'].\nWHEREAS, Party A ([AI: Specify Party A from form]) and Party B ([AI: Specify Party B from form]) have agreed to the terms herein.`,
                    obligationsBreachRemedies: `1. Each party shall diligently perform its obligations as set forth.\n2. A breach of this ${formData.agreementType} includes failure to meet key deliverables or confidentiality terms.\n3. Remedies for breach may include termination or legal action as per the dispute resolution clause.`
                }
            );

            handleChange('summary', `${formData.summary ? formData.summary + "\n\n" : ""}AI Generated: ${aiGeneratedText.summary}`);
            handleChange('preamble', `${formData.preamble ? formData.preamble + "\n\n" : ""}AI Generated: ${aiGeneratedText.preamble}`);
            handleChange('obligationsBreachRemedies', `${formData.obligationsBreachRemedies ? formData.obligationsBreachRemedies + "\n\n" : ""}AI Generated: ${aiGeneratedText.obligationsBreachRemedies}`);
            
            toast({ title: "AI Content Generated", description: "Review and refine the AI-generated text."});
        } catch (error) {
            toast({ variant: "destructive", title: "AI Generation Failed", description: error.message });
        } finally {
            setIsAiGenerating(false);
        }
      };
      
      const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.agreementTitle || !formData.agreementType || formData.parties.length === 0 || !formData.effectiveDate || !formData.stakeholderCategoryAggr || !formData.status || !formData.agreementDate || !formData.placeOfAgreement) {
          toast({ variant: "destructive", title: "Missing Required Fields", description: "Title, Type, Agreement Date, Place, Category, Parties, Effective Date, and Status are required." });
          return;
        }
        if (formData.parties.some(p => p.stakeholderId === MANUAL_ENTRY_VALUE && !p.manualName)) {
            toast({ variant: "destructive", title: "Incomplete Party Information", description: "Each manually entered party must have a name." });
            return;
        }
        
        const dataToSubmit = { ...formData };
        dataToSubmit.agreementDate = formData.agreementDate ? formData.agreementDate.toISOString() : null;
        dataToSubmit.effectiveDate = formData.effectiveDate ? formData.effectiveDate.toISOString() : null;
        dataToSubmit.expiryDate = formData.expiryDate ? formData.expiryDate.toISOString() : null;
        dataToSubmit.id = initialData.id || `AGR-${Date.now().toString(36)}`;
        dataToSubmit.lastModified = new Date().toISOString();
        
        onSubmit(dataToSubmit);
      };

      return (
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto p-2 custom-scrollbar">
          <AgreementFormHeader 
            agreementTitle={formData.agreementTitle} 
            onTitleChange={val => handleChange('agreementTitle', val)}
            agreementType={formData.agreementType}
            onAgreementTypeChange={val => handleChange('agreementType', val)}
            stakeholderCategoryAggr={formData.stakeholderCategoryAggr}
            onStakeholderCategoryChange={val => handleChange('stakeholderCategoryAggr', val)}
            agreementTypes={agreementTypes}
            stakeholderCategories={stakeholderCategories}
          />
          
          <AgreementFormFields
            agreementDate={formData.agreementDate}
            onAgreementDateChange={date => handleDateChange('agreementDate', date)}
            placeOfAgreement={formData.placeOfAgreement}
            onPlaceOfAgreementChange={val => handleChange('placeOfAgreement', val)}
            effectiveDate={formData.effectiveDate}
            onEffectiveDateChange={date => handleDateChange('effectiveDate', date)}
            expiryDate={formData.expiryDate}
            onExpiryDateChange={date => handleDateChange('expiryDate', date)}
          />

          <PartyFields parties={formData.parties} setParties={handlePartyChange} stakeholdersList={stakeholdersList} />

          <div><Label htmlFor="summary-form">Summary / Key Terms</Label><Textarea id="summary-form" value={formData.summary} onChange={e => handleChange('summary', e.target.value)} placeholder="Brief overview of the agreement's main clauses and business intent." rows={3}/></div>
          
          <PreambleSection preamble={formData.preamble} setPreamble={val => handleChange('preamble', val)} />
          <ObligationsSection obligationsBreachRemedies={formData.obligationsBreachRemedies} setObligationsBreachRemedies={val => handleChange('obligationsBreachRemedies', val)} />

          {isAiMode && (
            <div className="my-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <Button type="button" onClick={handleAiGenerateContent} disabled={isAiGenerating} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    <Brain className="mr-2 h-4 w-4"/> {isAiGenerating ? 'Generating Content...' : 'Use AI to Draft Content Sections'}
                </Button>
                <p className="text-xs text-blue-700 mt-2 text-center">AI will help populate Summary, Preamble, and Obligations based on the Agreement Type. Review and edit as needed.</p>
            </div>
          )}

          <AgreementFormFileUpload
            documentFileName={formData.documentFileName}
            onDocumentFileChange={e => handleFileChange(e, setDocumentFile, 'documentFileName')}
          />
          
          <AgreementFormMetaFields
            status={formData.status}
            onStatusChange={val => handleChange('status', val)}
            agreementStatuses={agreementStatuses}
            confidentialityLevel={formData.confidentialityLevel}
            onConfidentialityLevelChange={val => handleChange('confidentialityLevel', val)}
            confidentialityLevels={confidentialityLevels}
            autoReminders={formData.autoReminders}
            onAutoRemindersChange={val => handleChange('autoReminders', val)}
          />

          <StandardClausesSection
            paymentTerms={formData.paymentTerms} setPaymentTerms={val => handleChange('paymentTerms', val)}
            nonCompeteClause={formData.nonCompeteClause} setNonCompeteClause={val => handleChange('nonCompeteClause', val)}
            ipRights={formData.ipRights} setIpRights={val => handleChange('ipRights', val)}
            terminationConditions={formData.terminationConditions} setTerminationConditions={val => handleChange('terminationConditions', val)}
            disputeJurisdiction={formData.disputeJurisdiction} setDisputeJurisdiction={val => handleChange('disputeJurisdiction', val)}
            appendixFile={appendixFile} setAppendixFile={setAppendixFile}
            appendixFileName={formData.appendixFileName} setAppendixFileName={val => handleChange('appendixFileName', val)}
            externalDocumentLinks={formData.externalDocumentLinks} setExternalDocumentLinks={val => handleChange('externalDocumentLinks', val)}
            firstPartSignatory={formData.firstPartSignatory} setFirstPartSignatory={val => handleChange('firstPartSignatory', val)}
            secondPartSignatory={formData.secondPartSignatory} setSecondPartSignatory={val => handleChange('secondPartSignatory', val)}
            handleFileChange={(e, setFileState, fieldName) => handleFileChange(e, setFileState, fieldName)}
          />

          <DFooter className="pt-8">
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
            <Button type="submit">{initialData.id ? 'Update Agreement' : (isAiMode ? 'Finalize AI Draft' : 'Create Agreement')}</Button>
          </DFooter>
        </form>
      );
    };

    export default AgreementForm;