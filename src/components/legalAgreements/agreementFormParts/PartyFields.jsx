import React from 'react';
    import { Button } from '@/components/ui/button.jsx';
    import { Input } from '@/components/ui/input.jsx';
    import { Label } from '@/components/ui/label.jsx';
    import { Textarea } from '@/components/ui/textarea.jsx';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
    import { Users, PlusCircle, Trash2, UserCheck, Landmark } from 'lucide-react';

    const partyRoles = ["First Part (Party A)", "Second Part (Party B)", "Party C", "Party D", "Other Party"];
    const MANUAL_ENTRY_VALUE = "__manual__";

    const PartyFields = ({ parties, setParties, stakeholdersList }) => {
      const addParty = () => {
        let newRole = partyRoles[0];
        if (parties.length > 0) {
            const lastRoleIndex = partyRoles.indexOf(parties[parties.length - 1].role);
            newRole = partyRoles[lastRoleIndex + 1] || partyRoles[partyRoles.length - 1];
        }
        setParties([...parties, { id: `party-${Date.now()}`, role: newRole, stakeholderId: MANUAL_ENTRY_VALUE, manualName: '', representative: '', witnessDetails: '' }]);
      };

      const updateParty = (index, field, value) => {
        const newParties = [...parties];
        newParties[index][field] = value;
        if (field === 'stakeholderId' && value !== MANUAL_ENTRY_VALUE) {
            newParties[index]['manualName'] = ''; 
        } else if (field === 'manualName' && value !== '') {
            newParties[index]['stakeholderId'] = MANUAL_ENTRY_VALUE; 
        } else if (field === 'stakeholderId' && value === MANUAL_ENTRY_VALUE) {
             // Keep manualName if it exists, or allow user to type
        }
        setParties(newParties);
      };

      const removeParty = (index) => {
        setParties(parties.filter((_, i) => i !== index));
      };
      
      const renderPartyGroup = (groupTitle, partySubset) => (
        <div className="mb-4">
          <h4 className="text-sm font-semibold mb-2 text-indigo-600 flex items-center"><Landmark className="mr-2 h-4 w-4"/>{groupTitle}</h4>
          {partySubset.map((party, index) => (
            <div key={party.id} className="p-3 border rounded-md bg-white space-y-2 relative mb-3 shadow-sm">
              <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => removeParty(parties.findIndex(p => p.id === party.id))}><Trash2 className="h-4 w-4 text-destructive"/></Button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor={`partyRole-${party.id}`}>Role in Agreement</Label>
                  <Select value={party.role} onValueChange={val => updateParty(parties.findIndex(p => p.id === party.id), 'role', val)}>
                    <SelectTrigger id={`partyRole-${party.id}`}><SelectValue placeholder="Select Role"/></SelectTrigger>
                    <SelectContent>{partyRoles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor={`partyStakeholder-${party.id}`}>Select Stakeholder (from Directory)</Label>
                  <Select value={party.stakeholderId} onValueChange={val => updateParty(parties.findIndex(p => p.id === party.id), 'stakeholderId', val)} disabled={!!party.manualName && party.stakeholderId !== MANUAL_ENTRY_VALUE}>
                    <SelectTrigger id={`partyStakeholder-${party.id}`}><SelectValue placeholder="Select from directory"/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={MANUAL_ENTRY_VALUE}>None (Enter Manually)</SelectItem>
                      {stakeholdersList.map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.type})</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor={`partyManualName-${party.id}`}>OR Enter Party Name Manually</Label>
                <Input id={`partyManualName-${party.id}`} value={party.manualName} onChange={e => updateParty(parties.findIndex(p => p.id === party.id), 'manualName', e.target.value)} placeholder="e.g., XYZ Corp Ltd., represented by..." disabled={party.stakeholderId !== MANUAL_ENTRY_VALUE}/>
              </div>
              <div>
                <Label htmlFor={`partyRepresentative-${party.id}`}>Through its Representative (Optional)</Label>
                <Input id={`partyRepresentative-${party.id}`} value={party.representative} onChange={e => updateParty(parties.findIndex(p => p.id === party.id), 'representative', e.target.value)} placeholder="e.g., Mr. John Doe, Director"/>
              </div>
              <div>
                <Label htmlFor={`partyWitness-${party.id}`} className="flex items-center"><UserCheck className="mr-2 h-4 w-4 text-muted-foreground"/>Witness Details (Optional)</Label>
                <Textarea id={`partyWitness-${party.id}`} value={party.witnessDetails} onChange={e => updateParty(parties.findIndex(p => p.id === party.id), 'witnessDetails', e.target.value)} placeholder="e.g., Witnessed by: Name, Address" rows={2}/>
              </div>
            </div>
          ))}
        </div>
      );


      const firstParties = parties.filter(p => p.role === partyRoles[0]);
      const secondAndOtherParties = parties.filter(p => p.role !== partyRoles[0]);

      return (
        <div className="space-y-4 p-3 border rounded-md bg-slate-50/70 shadow-inner">
          <div className="flex justify-between items-center mb-2">
            <Label className="text-base font-semibold flex items-center"><Users className="mr-2 h-5 w-5 text-primary"/>Parties Involved*</Label>
            <Button type="button" size="sm" onClick={addParty} className="bg-indigo-500 hover:bg-indigo-600"><PlusCircle className="mr-2 h-4 w-4"/>Add Party</Button>
          </div>
          
          {renderPartyGroup("BETWEEN (First Part)", firstParties)}
          {secondAndOtherParties.length > 0 && renderPartyGroup("AND (Second & Subsequent Parts)", secondAndOtherParties)}
          
          {parties.length === 0 && <p className="text-xs text-muted-foreground p-2 text-center">Please add at least one party (typically a "First Part" and a "Second Part").</p>}
        </div>
      );
    };

    export default PartyFields;
    export { MANUAL_ENTRY_VALUE };