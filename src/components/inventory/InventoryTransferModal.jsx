import React, { useState, useEffect } from 'react';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { Input } from '@/components/ui/input.jsx';
    import { Label } from '@/components/ui/label.jsx';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
    import { Textarea } from '@/components/ui/textarea.jsx';
    import { useToast } from '@/components/ui/use-toast.jsx';

    const InventoryTransferModal = ({ isOpen, onClose, item, onTransferSubmit, staffList, locationList, currentInventory }) => {
      const { toast } = useToast();
      const [quantityToTransfer, setQuantityToTransfer] = useState('1');
      const [fromLocation, setFromLocation] = useState('');
      const [toLocation, setToLocation] = useState('');
      const [transferReason, setTransferReason] = useState('');
      const [responsibleStaff, setResponsibleStaff] = useState(staffList && staffList.length > 0 ? staffList[0].name : '');

      useEffect(() => {
        if (item) {
          setFromLocation(item.location);
          setQuantityToTransfer('1'); 
          setTransferReason('');
          setToLocation('');
          setResponsibleStaff(staffList && staffList.length > 0 ? staffList[0].name : '');
        }
      }, [item, staffList]);

      if (!item) return null;

      const availableQuantityAtFromLocation = currentInventory
        .filter(i => i.name === item.name && i.batchNo === item.batchNo && i.expiryDate === item.expiryDate && i.location === fromLocation)
        .reduce((sum, i) => sum + i.quantity, 0);

      const handleSubmit = () => {
        const qty = parseInt(quantityToTransfer, 10);
        if (isNaN(qty) || qty <= 0) {
          toast({ variant: "destructive", title: "Invalid Quantity", description: "Please enter a valid positive quantity." });
          return;
        }
        if (qty > availableQuantityAtFromLocation) {
          toast({ variant: "destructive", title: "Insufficient Stock", description: `Only ${availableQuantityAtFromLocation} units available at ${fromLocation}.` });
          return;
        }
        if (!toLocation || toLocation === fromLocation) {
          toast({ variant: "destructive", title: "Invalid Location", description: "Please select a valid and different destination location." });
          return;
        }
        if (!responsibleStaff) {
          toast({ variant: "destructive", title: "Staff Required", description: "Please select the staff member responsible for transfer." });
          return;
        }

        onTransferSubmit({
          itemId: item.id,
          itemName: item.name,
          batchNo: item.batchNo,
          expiryDate: item.expiryDate,
          quantity: qty,
          fromLocation,
          toLocation,
          reason: transferReason || `Internal Transfer`,
          staffMember: responsibleStaff,
        });
        handleModalClose(); 
      };

      const handleModalClose = () => {
        setQuantityToTransfer('1');
        setTransferReason('');
        setToLocation('');
        onClose();
      };
      
      const filteredLocationList = locationList.filter(loc => loc !== fromLocation);

      return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleModalClose()}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Transfer Item: {item.name}</DialogTitle>
              <DialogDescription>
                Move stock between locations. Available at {fromLocation}: {availableQuantityAtFromLocation} (Batch: {item.batchNo})
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="fromLocation">From Location</Label>
                <Input id="fromLocation" value={fromLocation} disabled className="mt-1" />
              </div>
              <div>
                <Label htmlFor="toLocation">To Location</Label>
                <Select value={toLocation} onValueChange={setToLocation}>
                  <SelectTrigger id="toLocation" className="w-full mt-1">
                    <SelectValue placeholder="Select destination" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredLocationList.map(loc => (
                      <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="quantityToTransfer">Quantity to Transfer</Label>
                <Input
                  id="quantityToTransfer"
                  type="number"
                  value={quantityToTransfer}
                  onChange={(e) => setQuantityToTransfer(e.target.value)}
                  className="mt-1"
                  min="1"
                  max={availableQuantityAtFromLocation}
                />
              </div>
              <div>
                <Label htmlFor="responsibleStaff">Responsible Staff</Label>
                <Select value={responsibleStaff} onValueChange={setResponsibleStaff}>
                    <SelectTrigger id="responsibleStaff" className="w-full mt-1">
                        <SelectValue placeholder="Select staff" />
                    </SelectTrigger>
                    <SelectContent>
                        {staffList && staffList.map(staff => (
                            <SelectItem key={staff.id} value={staff.name}>{staff.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="transferReason">Reason for Transfer (Optional)</Label>
                <Textarea
                  id="transferReason"
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  className="mt-1 min-h-[60px]"
                  placeholder="e.g., Stock balancing, clinic request"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={handleModalClose}>Cancel</Button>
              </DialogClose>
              <Button type="button" onClick={handleSubmit} className="bg-sky-600 hover:bg-sky-700">Confirm Transfer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    };

    export default InventoryTransferModal;