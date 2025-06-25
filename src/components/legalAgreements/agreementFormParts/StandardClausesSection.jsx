import React from 'react';
    import { Input } from '@/components/ui/input.jsx';
    import { Label } from '@/components/ui/label.jsx';
    import { Textarea } from '@/components/ui/textarea.jsx';
    import { UploadCloud, FileText, DollarSign, Scale, ShieldAlert, CalendarOff, MapPin, Link2, Edit3 } from 'lucide-react';
    import ExpandableSection from './ExpandableSection.jsx';
    import ExternalLinksField from './ExternalLinksField.jsx';
    import SignaturesSection from './SignaturesSection.jsx';


    const StandardClausesSection = ({
      paymentTerms, setPaymentTerms,
      nonCompeteClause, setNonCompeteClause,
      ipRights, setIpRights,
      terminationConditions, setTerminationConditions,
      disputeJurisdiction, setDisputeJurisdiction,
      appendixFile, setAppendixFile, appendixFileName, setAppendixFileName,
      externalDocumentLinks, setExternalDocumentLinks,
      firstPartSignatory, setFirstPartSignatory,
      secondPartSignatory, setSecondPartSignatory,
      handleFileChange
    }) => {
      return (
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-medium text-muted-foreground">Standard Optional Clauses & Details:</h3>
          <ExpandableSection title="Payment Terms" icon={DollarSign}>
            <Textarea value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} placeholder="Describe payment schedules, amounts, methods..." rows={3}/>
          </ExpandableSection>
          <ExpandableSection title="Non-Compete Clause" icon={ShieldAlert}>
            <Textarea value={nonCompeteClause} onChange={e => setNonCompeteClause(e.target.value)} placeholder="Specify non-compete conditions, duration, scope..." rows={3}/>
          </ExpandableSection>
          <ExpandableSection title="IP Rights" icon={Scale}>
            <Textarea value={ipRights} onChange={e => setIpRights(e.target.value)} placeholder="Outline intellectual property ownership and rights..." rows={3}/>
          </ExpandableSection>
          <ExpandableSection title="Termination Conditions" icon={CalendarOff}>
            <Textarea value={terminationConditions} onChange={e => setTerminationConditions(e.target.value)} placeholder="Detail conditions under which the agreement can be terminated..." rows={3}/>
          </ExpandableSection>
          <ExpandableSection title="Dispute Jurisdiction" icon={MapPin}>
            <Input value={disputeJurisdiction} onChange={e => setDisputeJurisdiction(e.target.value)} placeholder="e.g., Courts of London, UK"/>
          </ExpandableSection>
          <ExpandableSection title="Appendix / Reference Documents (Upload)" icon={FileText}>
            <Label htmlFor="appendixFile-form" className="flex items-center text-xs"><UploadCloud className="mr-2 h-3 w-3" />Upload Appendix (PDF/DOCX, Max 10MB)</Label>
            <Input id="appendixFile-form" type="file" onChange={(e) => handleFileChange(e, setAppendixFile, setAppendixFileName)} accept=".pdf,.doc,.docx" />
            {appendixFileName && <p className="text-xs text-muted-foreground mt-1">Current appendix: {appendixFileName}</p>}
          </ExpandableSection>
          <ExpandableSection title="External Document Links" icon={Link2}>
            <ExternalLinksField externalDocumentLinks={externalDocumentLinks} setExternalDocumentLinks={setExternalDocumentLinks} />
          </ExpandableSection>
          <SignaturesSection 
            firstPartSignatory={firstPartSignatory} 
            setFirstPartSignatory={setFirstPartSignatory}
            secondPartSignatory={secondPartSignatory}
            setSecondPartSignatory={setSecondPartSignatory}
          />
        </div>
      );
    };

    export default StandardClausesSection;