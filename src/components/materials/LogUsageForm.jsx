import React, { useState } from 'react';
    import { Button } from '@/components/ui/button.jsx';
    import { Input } from '@/components/ui/input.jsx';
    import { Label } from '@/components/ui/label.jsx';
    import { Textarea } from '@/components/ui/textarea.jsx';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
    import { useToast } from '@/components/ui/use-toast.jsx';

    const projectList = [{id: "PROJ123", name: "Alpha Site Construction"}, {id: "PROJ456", name: "Beta Tower Renovation"}]; // Mock

    const LogUsageForm = ({ item, onSubmit, onCancel }) => {
        const [quantityUsed, setQuantityUsed] = useState('1');
        const [projectId, setProjectId] = useState('');
        const [notes, setNotes] = useState('');
        const { toast } = useToast();

        const handleSubmit = (e) => {
            e.preventDefault();
            const qty = parseInt(quantityUsed, 10);
            if (isNaN(qty) || qty <= 0) {
                toast({ variant: "destructive", title: "Invalid Quantity" }); return;
            }
            if (qty > item.quantity) {
                toast({ variant: "destructive", title: "Insufficient Stock" }); return;
            }
            if (!projectId) {
                toast({ variant: "destructive", title: "Project Required" }); return;
            }
            onSubmit({ materialId: item.id, quantityUsed: qty, projectId, notes, dateLogged: new Date().toISOString() });
        };

        return (
            <form onSubmit={handleSubmit} className="space-y-4">
                <div><Label>Material: {item.name} (Available: {item.quantity} {item.unit})</Label></div>
                <div><Label htmlFor="quantityUsed-logusage">Quantity Used</Label><Input id="quantityUsed-logusage" type="number" value={quantityUsed} onChange={e => setQuantityUsed(e.target.value)} min="1" max={item.quantity} /></div>
                <div>
                    <Label htmlFor="projectId-logusage">Project</Label>
                    <Select value={projectId} onValueChange={setProjectId}>
                        <SelectTrigger id="projectId-logusage"><SelectValue placeholder="Select Project" /></SelectTrigger>
                        <SelectContent>{projectList.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div><Label htmlFor="notes-logusage">Notes (Optional)</Label><Textarea id="notes-logusage" value={notes} onChange={e => setNotes(e.target.value)} /></div>
                <div className="flex justify-end space-x-2 pt-2">
                    <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                    <Button type="submit">Log Usage</Button>
                </div>
            </form>
        );
    };
    export default LogUsageForm;