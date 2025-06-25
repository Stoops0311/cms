import React, { useState } from 'react';
    import { Input } from '@/components/ui/input.jsx';
    import { Label } from '@/components/ui/label.jsx';
    import { Textarea } from '@/components/ui/textarea.jsx';
    import { DatePicker } from '@/components/ui/date-picker.jsx';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { useToast } from '@/components/ui/use-toast.jsx';

    const equipmentTypes = ["Excavator", "Bulldozer", "Crane", "Loader", "Dump Truck", "Concrete Mixer", "Generator", "Scaffolding", "Splicing Machine", "OTDR", "Cable Puller"];
    const equipmentStatuses = ["Available", "In Use", "Maintenance", "Unavailable"];
    const dispatchStatuses = ["Pending", "Approved", "Dispatched", "Returned", "Cancelled"];
    
    const EquipmentForm = ({ onSubmit, initialData = {}, onCancel, isDispatchForm = false, projectList = [] }) => {
      const [name, setName] = useState(initialData.name || '');
      const [type, setType] = useState(initialData.type || equipmentTypes[0]);
      const [identifier, setIdentifier] = useState(initialData.identifier || `EQ-${Date.now().toString().slice(-4)}`);
      const [status, setStatus] = useState(initialData.status || equipmentStatuses[0]);
      const [lastMaintenance, setLastMaintenance] = useState(initialData.lastMaintenance ? new Date(initialData.lastMaintenance) : null);
      const [nextMaintenance, setNextMaintenance] = useState(initialData.nextMaintenance ? new Date(initialData.nextMaintenance) : null);
      
      const [projectId, setProjectId] = useState(initialData.projectId || '');
      const [dispatchDate, setDispatchDate] = useState(initialData.dispatchDate ? new Date(initialData.dispatchDate) : new Date());
      const [expectedReturnDate, setExpectedReturnDate] = useState(initialData.expectedReturnDate ? new Date(initialData.expectedReturnDate) : null);
      const [notes, setNotes] = useState(initialData.notes || '');
      const [dispatchStatus, setDispatchStatus] = useState(initialData.dispatchStatus || dispatchStatuses[0]);

      const { toast } = useToast();

      const handleSubmit = (e) => {
        e.preventDefault();
        if (!name || !type || !identifier) {
          toast({ variant: "destructive", title: "Missing Information", description: "Name, type, and identifier are required." });
          return;
        }
        
        let dataToSave = {
          id: initialData.id || identifier,
          name, type, identifier, status, 
          lastMaintenance: lastMaintenance ? lastMaintenance.toISOString() : null,
          nextMaintenance: nextMaintenance ? nextMaintenance.toISOString() : null,
        };

        if (isDispatchForm) {
          if(!projectId || !dispatchDate) {
            toast({ variant: "destructive", title: "Missing Dispatch Info", description: "Project and dispatch date are required for dispatch." });
            return;
          }
          dataToSave = {
            ...dataToSave, // Includes equipment details like name, id (as equipmentId)
            dispatchId: initialData.dispatchId || `DISP-${Date.now().toString().slice(-4)}`,
            equipmentId: initialData.equipmentId || initialData.id || identifier, 
            equipmentName: name, 
            projectId,
            dispatchDate: dispatchDate.toISOString(),
            expectedReturnDate: expectedReturnDate ? expectedReturnDate.toISOString() : null,
            notes,
            dispatchStatus,
          };
        }
        onSubmit(dataToSave);
      };

      return (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label htmlFor="name-eq-form">Equipment Name</Label><Input id="name-eq-form" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., CAT 320D" /></div>
            <div><Label htmlFor="identifier-eq-form">Identifier/Tag</Label><Input id="identifier-eq-form" value={identifier} onChange={e => setIdentifier(e.target.value)} placeholder="e.g., EQ-001" disabled={!!initialData.id && !isDispatchForm} /></div>
          </div>
          <div>
            <Label htmlFor="type-eq-form">Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="type-eq-form"><SelectValue placeholder="Select Type" /></SelectTrigger>
              <SelectContent>{equipmentTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          {!isDispatchForm && (
            <>
              <div>
                <Label htmlFor="status-eq-form">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status-eq-form"><SelectValue placeholder="Select Status" /></SelectTrigger>
                  <SelectContent>{equipmentStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label htmlFor="lastMaintenance-eq-form">Last Maintenance</Label><DatePicker id="lastMaintenance-eq-form" date={lastMaintenance} setDate={setLastMaintenance} /></div>
                <div><Label htmlFor="nextMaintenance-eq-form">Next Maintenance</Label><DatePicker id="nextMaintenance-eq-form" date={nextMaintenance} setDate={setNextMaintenance} /></div>
              </div>
            </>
          )}
          {isDispatchForm && (
            <>
              <div>
                <Label htmlFor="projectId-eq-form">Project</Label>
                <Select value={projectId} onValueChange={setProjectId}>
                  <SelectTrigger id="projectId-eq-form"><SelectValue placeholder="Select Project" /></SelectTrigger>
                  <SelectContent>{projectList.map(p => <SelectItem key={p.id} value={p.id}>{p.projectName} ({p.projectCode || p.id})</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label htmlFor="dispatchDate-eq-form">Dispatch Date</Label><DatePicker id="dispatchDate-eq-form" date={dispatchDate} setDate={setDispatchDate} /></div>
                <div><Label htmlFor="expectedReturnDate-eq-form">Expected Return</Label><DatePicker id="expectedReturnDate-eq-form" date={expectedReturnDate} setDate={setExpectedReturnDate} /></div>
              </div>
               <div>
                <Label htmlFor="dispatchStatus-eq-form">Dispatch Status</Label>
                <Select value={dispatchStatus} onValueChange={setDispatchStatus}>
                  <SelectTrigger id="dispatchStatus-eq-form"><SelectValue placeholder="Select Dispatch Status" /></SelectTrigger>
                  <SelectContent>{dispatchStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label htmlFor="notes-eq-form">Notes</Label><Textarea id="notes-eq-form" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Dispatch notes, conditions..." /></div>
            </>
          )}
          <div className="flex justify-end space-x-2 pt-2">
            {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
            <Button type="submit">{initialData.id || initialData.dispatchId ? (isDispatchForm ? 'Update Dispatch' : 'Update Equipment') : (isDispatchForm ? 'Create Dispatch' : 'Add Equipment')}</Button>
          </div>
        </form>
      );
    };
    export default EquipmentForm;