import React, { useState } from 'react';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { Input } from '@/components/ui/input.jsx';
    import { Label } from '@/components/ui/label.jsx';
    import { Textarea } from '@/components/ui/textarea.jsx';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
    import { useToast } from '@/components/ui/use-toast.jsx';

    const InventoryLogModal = ({ isOpen, onClose, item, onLogSubmit, staffList, patientList }) => {
      const { toast } = useToast();
      const [quantityIssued, setQuantityIssued] = useState('1');
      const [reason, setReason] = useState('');
      const [staffIssuing, setStaffIssuing] = useState(staffList && staffList.length > 0 ? staffList[0].name : '');
      const [patientId, setPatientId] = useState('');

      if (!item) return null;

      const handleSubmit = () => {
        const qty = parseInt(quantityIssued, 10);
        if (isNaN(qty) || qty <= 0) {
          toast({ variant: "destructive", title: "Invalid Quantity", description: "Please enter a valid positive quantity." });
          return;
        }
        if (!reason.trim()) {
          toast({ variant: "destructive", title: "Reason Required", description: "Please provide a reason for issuance." });
          return;
        }
         if (!staffIssuing) {
          toast({ variant: "destructive", title: "Staff Required", description: "Please select the issuing staff member." });
          return;
        }

        onLogSubmit({
          itemId: item.id,
          quantityChanged: qty,
          reason,
          staffIssuing,
          patientId: patientId || null,
        });
        resetForm();
      };
      
      const resetForm = () => {
        setQuantityIssued('1');
        setReason('');
        setStaffIssuing(staffList && staffList.length > 0 ? staffList[0].name : '');
        setPatientId('');
      };

      const handleModalClose = () => {
        resetForm();
        onClose();
      };

      return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleModalClose()}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>Log Usage for: {item.name}</DialogTitle>
              <DialogDescription>
                Record deduction from inventory. Current stock: {item.quantity} (Batch: {item.batchNo})
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quantityIssued" className="text-right">Quantity</Label>
                <Input
                  id="quantityIssued"
                  type="number"
                  value={quantityIssued}
                  onChange={(e) => setQuantityIssued(e.target.value)}
                  className="col-span-3"
                  min="1"
                  max={item.quantity}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="staffIssuing" className="text-right">Issued By</Label>
                <Select value={staffIssuing} onValueChange={setStaffIssuing}>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select staff" />
                    </SelectTrigger>
                    <SelectContent>
                        {staffList && staffList.map(staff => (
                            <SelectItem key={staff.id} value={staff.name}>{staff.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="patientId" className="text-right">Patient ID</Label>
                <Input
                  id="patientId"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="col-span-3"
                  placeholder="(Optional)"
                />
              </div>
               <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="reason" className="text-right pt-2">Reason</Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="col-span-3 min-h-[80px]"
                  placeholder="e.g., Issued to patient, Damaged, Expired"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={handleModalClose}>Cancel</Button>
              </DialogClose>
              <Button type="button" onClick={handleSubmit} className="bg-teal-600 hover:bg-teal-700">Log Deduction</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    };

    export default InventoryLogModal;