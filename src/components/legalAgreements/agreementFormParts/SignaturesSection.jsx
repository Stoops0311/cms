import React from 'react';
    import { Textarea } from '@/components/ui/textarea.jsx';
    import { Edit3 } from 'lucide-react';
    import ExpandableSection from './ExpandableSection.jsx';

    const SignaturesSection = ({ firstPartSignatory, setFirstPartSignatory, secondPartSignatory, setSecondPartSignatory }) => {
      return (
        <ExpandableSection title="Signatures & Execution Details" icon={Edit3}>
          <div className="space-y-3">
            <div>
              <label htmlFor="firstPartSignatory" className="block text-sm font-medium text-gray-700 mb-1">First Part Signatory Details</label>
              <Textarea 
                id="firstPartSignatory"
                value={firstPartSignatory} 
                onChange={e => setFirstPartSignatory(e.target.value)} 
                placeholder="e.g., SIGNED AND DELIVERED by the Party of the FIRST PART: M/s [Company Name] Through its Director MR. [Name]" 
                rows={3}
              />
            </div>
            <div>
              <label htmlFor="secondPartSignatory" className="block text-sm font-medium text-gray-700 mb-1">Second Part (and Subsequent) Signatory Details</label>
              <Textarea 
                id="secondPartSignatory"
                value={secondPartSignatory} 
                onChange={e => setSecondPartSignatory(e.target.value)} 
                placeholder="e.g., SIGNED AND DELIVERED by the Party of the SECOND PART: M/s [Company Name] Through its Director MR. [Name]" 
                rows={3}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Note: Record details about how the agreement was signed. If the physical document is uploaded, this can be supplementary.
            </p>
          </div>
        </ExpandableSection>
      );
    };
    export default SignaturesSection;