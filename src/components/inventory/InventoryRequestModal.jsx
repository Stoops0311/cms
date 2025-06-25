import React from 'react';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog.jsx';
    import InventoryRequestForm from '@/components/inventory/InventoryRequestForm.jsx';

    const InventoryRequestModal = ({ isOpen, onClose, onSaveRequest, initialRequestData, inventoryItems, staffList, locationList }) => {
      return (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{initialRequestData ? 'Edit Inventory Request' : 'Create New Inventory Request'}</DialogTitle>
              <DialogDescription>
                {initialRequestData ? 'Update the details of the shortage request.' : 'Request items from HQ due to shortage at your unit.'}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <InventoryRequestForm
                initialData={initialRequestData}
                onSaveRequest={(data) => {
                  onSaveRequest(data);
                  onClose(); 
                }}
                onCancel={onClose}
                inventoryItems={inventoryItems}
                staffList={staffList}
                locationList={locationList}
              />
            </div>
          </DialogContent>
        </Dialog>
      );
    };

    export default InventoryRequestModal;