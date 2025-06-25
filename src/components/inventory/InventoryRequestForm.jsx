import React, { useState, useEffect } from 'react';
    import { Button } from '@/components/ui/button.jsx';
    import { Input } from '@/components/ui/input.jsx';
    import { Label } from '@/components/ui/label.jsx';
    import { Textarea } from '@/components/ui/textarea.jsx';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
    import { PlusCircle, Trash2, Send } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast.jsx';

    const InventoryRequestForm = ({ initialData, onSaveRequest, onCancel, inventoryItems, staffList, locationList }) => {
      const { toast } = useToast();
      const [requestingUnit, setRequestingUnit] = useState('');
      const [requestedBy, setRequestedBy] = useState('');
      const [requestedItems, setRequestedItems] = useState([{ itemId: '', itemName: '', quantityRequested: '', unitOfMeasure: 'Units' }]);
      const [notes, setNotes] = useState('');

      useEffect(() => {
        if (initialData) {
          setRequestingUnit(initialData.requestingUnit || '');
          setRequestedBy(initialData.requestedBy || '');
          setRequestedItems(initialData.items && initialData.items.length > 0 ? initialData.items : [{ itemId: '', itemName: '', quantityRequested: '', unitOfMeasure: 'Units' }]);
          setNotes(initialData.notes || '');
        } else {
          setRequestingUnit(locationList && locationList.length > 0 ? locationList[0] : '');
          setRequestedBy(staffList && staffList.length > 0 ? staffList[0].name : '');
          setRequestedItems([{ itemId: '', itemName: '', quantityRequested: '', unitOfMeasure: 'Units' }]);
          setNotes('');
        }
      }, [initialData, locationList, staffList]);

      const handleItemChange = (index, field, value) => {
        const newItems = [...requestedItems];
        newItems[index][field] = value;
        if (field === 'itemId') {
          const selectedInventoryItem = inventoryItems.find(item => item.id === value);
          newItems[index]['itemName'] = selectedInventoryItem ? selectedInventoryItem.name : '';
        }
        setRequestedItems(newItems);
      };

      const addItemEntry = () => {
        setRequestedItems([...requestedItems, { itemId: '', itemName: '', quantityRequested: '', unitOfMeasure: 'Units' }]);
      };

      const removeItemEntry = (index) => {
        const newItems = requestedItems.filter((_, i) => i !== index);
        setRequestedItems(newItems);
      };

      const handleSubmit = (e) => {
        e.preventDefault();
        if (!requestingUnit || !requestedBy) {
          toast({ variant: "destructive", title: "Missing Information", description: "Please select requesting unit and requester." });
          return;
        }
        const validItems = requestedItems.filter(item => item.itemId && parseInt(item.quantityRequested, 10) > 0);
        if (validItems.length === 0) {
          toast({ variant: "destructive", title: "No Items Requested", description: "Please add at least one item with a valid quantity." });
          return;
        }

        onSaveRequest({
          requestingUnit,
          requestedBy,
          items: validItems.map(item => ({
            itemId: item.itemId,
            itemName: inventoryItems.find(invItem => invItem.id === item.itemId)?.name || 'Unknown Item',
            quantityRequested: parseInt(item.quantityRequested, 10),
            unitOfMeasure: item.unitOfMeasure,
          })),
          notes,
          status: initialData?.status || 'Pending', 
          requestDate: initialData?.requestDate || new Date().toISOString(),
        });
      };

      return (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="requestingUnit">Requesting Unit/Clinic</Label>
              <Select value={requestingUnit} onValueChange={setRequestingUnit}>
                <SelectTrigger id="requestingUnit"><SelectValue placeholder="Select Unit" /></SelectTrigger>
                <SelectContent>
                  {locationList.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="requestedBy">Requested By</Label>
              <Select value={requestedBy} onValueChange={setRequestedBy}>
                <SelectTrigger id="requestedBy"><SelectValue placeholder="Select Staff" /></SelectTrigger>
                <SelectContent>
                  {staffList.map(staff => <SelectItem key={staff.id} value={staff.name}>{staff.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Label className="block text-sm font-medium">Requested Items</Label>
          {requestedItems.map((item, index) => (
            <div key={index} className="p-3 border rounded-md space-y-2 bg-slate-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
                <div className="md:col-span-2">
                  <Label htmlFor={`item-${index}`}>Item</Label>
                  <Select value={item.itemId} onValueChange={(value) => handleItemChange(index, 'itemId', value)}>
                    <SelectTrigger id={`item-${index}`}><SelectValue placeholder="Select Item" /></SelectTrigger>
                    <SelectContent>
                      {inventoryItems.map(invItem => (
                        <SelectItem key={invItem.id} value={invItem.id}>
                          {invItem.name} (Batch: {invItem.batchNo}, Stock: {invItem.quantity}, Loc: {invItem.location})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                  <Input
                    id={`quantity-${index}`}
                    type="number"
                    placeholder="Qty"
                    value={item.quantityRequested}
                    onChange={(e) => handleItemChange(index, 'quantityRequested', e.target.value)}
                    min="1"
                  />
                </div>
              </div>
              {requestedItems.length > 1 && (
                <Button type="button" variant="destructive" size="sm" onClick={() => removeItemEntry(index)} className="mt-1">
                  <Trash2 className="h-4 w-4 mr-1" /> Remove Item
                </Button>
              )}
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addItemEntry} className="w-full">
            <PlusCircle className="h-4 w-4 mr-2" /> Add Another Item
          </Button>

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any specific instructions or details..." />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">
              <Send className="h-4 w-4 mr-2" /> {initialData ? 'Update Request' : 'Submit Request'}
            </Button>
          </div>
        </form>
      );
    };

    export default InventoryRequestForm;