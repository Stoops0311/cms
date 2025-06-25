import React from 'react';
    import { Textarea } from '@/components/ui/textarea.jsx';
    import { AlertTriangle } from 'lucide-react';
    import ExpandableSection from './ExpandableSection.jsx';

    const ObligationsSection = ({ obligationsBreachRemedies, setObligationsBreachRemedies }) => {
      return (
        <ExpandableSection title="Key Obligations, Breach & Remedies" icon={AlertTriangle}>
          <Textarea value={obligationsBreachRemedies} onChange={e => setObligationsBreachRemedies(e.target.value)} placeholder="Detail main obligations of parties, conditions constituting a breach, default clauses, and remedies available (e.g., based on Clause 14 of JV example)." rows={5}/>
        </ExpandableSection>
      );
    };
    export default ObligationsSection;