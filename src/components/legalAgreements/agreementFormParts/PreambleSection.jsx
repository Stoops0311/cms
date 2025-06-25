import React from 'react';
    import { Textarea } from '@/components/ui/textarea.jsx';
    import { BookOpen } from 'lucide-react';
    import ExpandableSection from './ExpandableSection.jsx';

    const PreambleSection = ({ preamble, setPreamble }) => {
      return (
        <ExpandableSection title="Preamble / Recitals / Purpose" icon={BookOpen}>
          <Textarea value={preamble} onChange={e => setPreamble(e.target.value)} placeholder="Enter the 'WHEREAS...' clauses, background, and overall purpose of the agreement." rows={5}/>
        </ExpandableSection>
      );
    };
    export default PreambleSection;