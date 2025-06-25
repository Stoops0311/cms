import React, { useState } from 'react';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { Label } from '@/components/ui/label.jsx';
    import { Input } from '@/components/ui/input.jsx';
    import { Textarea } from '@/components/ui/textarea.jsx';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
    import { DatePicker } from '@/components/ui/date-picker.jsx';
    import { useToast } from '@/components/ui/use-toast.jsx';
    import useLocalStorage from '@/hooks/useLocalStorage.jsx';

    const materialUnits = ["Units", "kg", "Tonnes", "m", "sq.m", "cu.m", "Liters", "Bags", "Rolls", "Pallets"];
    const urgencyLevels = ["Low", "Medium", "High", "Critical"];

    const MaterialRequestModal = ({ isOpen, onClose, onSubmit, projects }) => {
      const [materialsInventory] = useLocalStorage('cmsMaterials', []); // For item selection
      const [selectedMaterialId, setSelectedMaterialId] = useState('');
      const [quantity, setQuantity] = useState('');
      const [unit, setUnit] = useState(materialUnits[0]);
      const [projectId, setProjectId] = useState('');
      const [deliveryDate, setDeliveryDate] = useState(new Date());
      const [urgency, setUrgency] = useState(urgencyLevels[1]);
      const [deliveryLocation, setDeliveryLocation] = useState('');
      const [notes, setNotes] = useState('');
      const { toast } = useToast();

      const handleSubmit = () => {
        if (!selectedMaterialId || !quantity || !projectId || !deliveryLocation) {
          toast({ variant: "destructive", title: "Missing Fields", description: "Material, quantity, project, and delivery location are required."});
          return;
        }
        const material = materialsInventory.find(m => m.id === selectedMaterialId);
        onSubmit({
          materialId: selectedMaterialId,
          materialName: material?.name || 'N/A',
          quantity: parseFloat(quantity),
          unit: material?.unit || unit, // Prefer unit from inventory, fallback to selected
          projectId,
          deliveryDate: deliveryDate.toISOString(),
          urgency,
          deliveryLocation,
          notes
        });
        toast({ title: "Material Request Submitted", description: `${quantity} ${unit} of ${material?.name || 'material'} requested.`});
        onClose();
        // Reset form
        setSelectedMaterialId(''); setQuantity(''); setProjectId(''); setDeliveryLocation(''); setNotes(''); setUrgency(urgencyLevels[1]);
      };
      
      const projectOptions = projects || [];

      return (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar">
            <DialogHeader>
              <DialogTitle>Request New Material</DialogTitle>
              <DialogDescription>Submit a request for materials needed on site.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="materialId">Material</Label>
                <Select value={selectedMaterialId} onValueChange={setSelectedMaterialId}>
                  <SelectTrigger id="materialId"><SelectValue placeholder="Select Material from Inventory" /></SelectTrigger>
                  <SelectContent>
                    {materialsInventory.map(mat => <SelectItem key={mat.id} value={mat.id}>{mat.name} ({mat.sku}) - Available: {mat.quantity} {mat.unit}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
               <div className="grid grid-cols-2 gap-4">
                <div><Label htmlFor="quantity-materialreq">Quantity</Label><Input id="quantity-materialreq" type="number" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="e.g., 50" /></div>
                <div>
                  <Label htmlFor="unit-materialreq">Unit</Label>
                  <Select value={unit} onValueChange={setUnit} disabled={!!materialsInventory.find(m=>m.id === selectedMaterialId)?.unit}>
                    <SelectTrigger id="unit-materialreq"><SelectValue placeholder="Unit" /></SelectTrigger>
                    <SelectContent>{materialUnits.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                  </Select>
                  {materialsInventory.find(m=>m.id === selectedMaterialId)?.unit && <p className="text-xs text-muted-foreground mt-1">Unit auto-selected from inventory.</p>}
                </div>
              </div>
              <div>
                <Label htmlFor="projectId-materialreq">Project</Label>
                <Select value={projectId} onValueChange={setProjectId}>
                  <SelectTrigger id="projectId-materialreq"><SelectValue placeholder="Select Project" /></SelectTrigger>
                  <SelectContent>{projectOptions.map(p => <SelectItem key={p.id} value={p.id}>{p.projectName} ({p.projectCode})</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label htmlFor="deliveryDate">Required Delivery Date</Label><DatePicker id="deliveryDate" date={deliveryDate} setDate={setDeliveryDate} /></div>
              <div>
                <Label htmlFor="urgency">Urgency Level</Label>
                <Select value={urgency} onValueChange={setUrgency}>
                  <SelectTrigger id="urgency"><SelectValue placeholder="Select Urgency" /></SelectTrigger>
                  <SelectContent>{urgencyLevels.map(level => <SelectItem key={level} value={level}>{level}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label htmlFor="deliveryLocation">Delivery Location on Site</Label><Input id="deliveryLocation" value={deliveryLocation} onChange={e => setDeliveryLocation(e.target.value)} placeholder="e.g., Sector B, Laydown Area 3" /></div>
              <div><Label htmlFor="notes-materialreq">Notes (Optional)</Label><Textarea id="notes-materialreq" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Specific instructions, vendor preference, etc." /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={handleSubmit}>Submit Request</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    };
    export default MaterialRequestModal;