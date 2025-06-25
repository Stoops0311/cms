import React, { useState, useMemo } from 'react';
    import { motion } from 'framer-motion';
    import { useToast } from '@/components/ui/use-toast.jsx';
    import useLocalStorage from '@/hooks/useLocalStorage.jsx';
    import { PackagePlus, PackageSearch, History, ArrowRightLeft, FileText, PlusSquare } from 'lucide-react';
    import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card.jsx';
    import InventoryItemForm from '@/components/inventory/InventoryItemForm.jsx';
    import InventoryList from '@/components/inventory/InventoryList.jsx';
    import InventoryLogModal from '@/components/inventory/InventoryLogModal.jsx';
    import InventoryTransferModal from '@/components/inventory/InventoryTransferModal.jsx';
    import RecentActivityCard from '@/components/inventory/RecentActivityCard.jsx';
    import InventoryRequestModal from '@/components/inventory/InventoryRequestModal.jsx';
    import InventoryRequestList from '@/components/inventory/InventoryRequestList.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog.jsx';
    import { format } from 'date-fns';

    const initialInventory = [
      { id: "MED001", name: "Paracetamol 500mg Tablets", quantity: 150, batchNo: "P00123", expiryDate: "2025-12-31", lowStockThreshold: 20, location: "Camp Alpha Clinic" },
      { id: "MED002", name: "Amoxicillin 250mg Capsules", quantity: 80, batchNo: "A00567", expiryDate: "2026-06-30", lowStockThreshold: 15, location: "Camp Alpha Clinic" },
      { id: "CON001", name: "Bandages (Pack of 100)", quantity: 30, batchNo: "B00890", expiryDate: "2027-01-31", lowStockThreshold: 5, location: "Central Pharmacy" },
      { id: "MED003", name: "Ibuprofen 200mg Tablets", quantity: 10, batchNo: "I00012", expiryDate: "2025-07-15", lowStockThreshold: 25, location: "Camp Beta Clinic" },
      { id: "MED004", name: "Saline Solution 500ml", quantity: 50, batchNo: "S00345", expiryDate: "2025-05-20", lowStockThreshold: 10, location: "Central Pharmacy" },
    ];

    const initialInventoryLogs = [
        {logId: "LOG001", itemId: "MED001", itemName: "Paracetamol 500mg Tablets", quantityChanged: -10, reason: "Issued to Patient P0012", staffIssuing: "Nurse Jane Doe", patientId: "P0012", timestamp: new Date("2025-05-11T10:00:00Z").toISOString(), type: "deduction", location: "Camp Alpha Clinic" },
        {logId: "LOG002", itemId: "MED002", itemName: "Amoxicillin 250mg Capsules", quantityChanged: 50, reason: "Stock Received from Supplier X", staffIssuing: "Admin John Smith", timestamp: new Date("2025-05-10T14:30:00Z").toISOString(), type: "addition", location: "Central Pharmacy" },
    ];
    
    const mockStaff = [
      { id: "EMP001", name: "Dr. Alice Smith" },
      { id: "EMP002", name: "Nurse Bob Johnson" },
      { id: "EMP003", name: "Pharmacist Carol White" },
      { id: "EMP004", name: "Admin Eve Green" },
    ];

    const mockPatients = [
      { id: "PAT001", fullName: "John Doe" },
      { id: "PAT002", fullName: "Jane Smith" },
    ];

    const mockLocations = ["Camp Alpha Clinic", "Camp Beta Clinic", "Central Pharmacy", "Mobile Unit 1", "HQ Warehouse"];
    
    const initialInventoryRequests = [
        { id: "REQ001", requestingUnit: "Camp Alpha Clinic", requestedBy: "Dr. Alice Smith", requestDate: new Date("2025-05-12T09:00:00Z").toISOString(), items: [{ itemId: "MED003", itemName: "Ibuprofen 200mg Tablets", quantityRequested: 50, unitOfMeasure: "Tablets" }], status: "Pending", notes: "Urgent need for upcoming outreach." },
        { id: "REQ002", requestingUnit: "Camp Beta Clinic", requestedBy: "Nurse Bob Johnson", requestDate: new Date("2025-05-11T15:30:00Z").toISOString(), items: [{ itemId: "CON001", itemName: "Bandages (Pack of 100)", quantityRequested: 10, unitOfMeasure: "Packs" }, { itemId: "MED004", itemName: "Saline Solution 500ml", quantityRequested: 20, unitOfMeasure: "Bottles" }], status: "Approved", notes: "" },
    ];


    const Inventory = () => {
      const { toast } = useToast();
      const [inventory, setInventory] = useLocalStorage('pamsInventory', initialInventory);
      const [inventoryLogs, setInventoryLogs] = useLocalStorage('pamsInventoryLogs', initialInventoryLogs);
      const [inventoryRequests, setInventoryRequests] = useLocalStorage('pamsInventoryRequests', initialInventoryRequests);
      
      const [editingItem, setEditingItem] = useState(null);
      const [isLogModalOpen, setIsLogModalOpen] = useState(false);
      const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
      const [itemToLog, setItemToLog] = useState(null);
      const [itemToTransfer, setItemToTransfer] = useState(null);

      const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
      const [editingRequest, setEditingRequest] = useState(null);
      const [viewingRequestDetails, setViewingRequestDetails] = useState(null);


      const handleSaveItem = (itemData) => {
        if (editingItem) {
          setInventory(prev => prev.map(item => item.id === editingItem.id ? { ...item, ...itemData } : item));
          toast({ title: "Item Updated", description: `${itemData.name} updated successfully.`, className: "bg-blue-500 text-white" });
        } else {
          const newItem = { 
            id: `ITEM${Math.floor(Math.random() * 100000)}`, 
            ...itemData,
            location: itemData.location || mockLocations[0] 
          };
          setInventory(prev => [newItem, ...prev]);
          toast({ title: "Item Added", description: `${itemData.name} added to inventory.`, className: "bg-green-500 text-white" });
        }
        setEditingItem(null);
      };

      const handleEdit = (item) => setEditingItem(item);
      const handleDelete = (itemId) => {
        const itemToDelete = inventory.find(item => item.id === itemId);
        setInventory(prev => prev.filter(item => item.id !== itemId));
        toast({ title: "Item Deleted", description: `${itemToDelete?.name || 'Item'} removed from inventory.`, className: "bg-red-500 text-white" });
      };

      const handleOpenLogModal = (item) => { setItemToLog(item); setIsLogModalOpen(true); };
      const handleLogUsage = (logData) => {
        const { itemId, quantityChanged, reason, staffIssuing, patientId } = logData;
        const itemIndex = inventory.findIndex(invItem => invItem.id === itemId);
        if (itemIndex === -1) {
          toast({ variant: "destructive", title: "Error", description: "Item not found." }); return;
        }
        const updatedInventory = [...inventory];
        const currentItem = updatedInventory[itemIndex];
        if (currentItem.quantity < quantityChanged && quantityChanged > 0) {
             toast({ variant: "destructive", title: "Insufficient Stock", description: `Not enough ${currentItem.name} in stock. Available: ${currentItem.quantity}` }); return;
        }
        updatedInventory[itemIndex] = { ...currentItem, quantity: currentItem.quantity - quantityChanged };
        setInventory(updatedInventory);
        const newLog = {
          logId: `LOG${Date.now()}`, itemId, itemName: currentItem.name, quantityChanged: -quantityChanged, 
          reason, staffIssuing, patientId, timestamp: new Date().toISOString(), type: 'deduction', location: currentItem.location,
        };
        setInventoryLogs(prevLogs => [newLog, ...prevLogs]);
        toast({ title: "Usage Logged", description: `${quantityChanged} of ${currentItem.name} issued.`, className: "bg-teal-500 text-white" });
        setIsLogModalOpen(false); setItemToLog(null);
      };

      const handleOpenTransferModal = (item) => { setItemToTransfer(item); setIsTransferModalOpen(true); };
      const handleTransferItem = (transferData) => {
        const { itemId, quantity, fromLocation, toLocation, staffMember } = transferData;
        const itemIndex = inventory.findIndex(invItem => invItem.id === itemId && invItem.location === fromLocation);
        if (itemIndex === -1) {
          toast({ variant: "destructive", title: "Error", description: `Item not found at ${fromLocation}.` }); return;
        }
        const updatedInventory = [...inventory];
        const itemToUpdate = updatedInventory[itemIndex];
        if (itemToUpdate.quantity < quantity) {
          toast({ variant: "destructive", title: "Insufficient Stock", description: `Not enough ${itemToUpdate.name} at ${fromLocation}. Available: ${itemToUpdate.quantity}` }); return;
        }
        itemToUpdate.quantity -= quantity;
        const existingDestinationItemIndex = updatedInventory.findIndex(invItem => invItem.name === itemToUpdate.name && invItem.batchNo === itemToUpdate.batchNo && invItem.expiryDate === itemToUpdate.expiryDate && invItem.location === toLocation);
        if (existingDestinationItemIndex !== -1) {
            updatedInventory[existingDestinationItemIndex].quantity += quantity;
        } else {
            updatedInventory.push({ ...itemToUpdate, id: `ITEM${Math.floor(Math.random() * 100000)}`, quantity: quantity, location: toLocation });
        }
        setInventory(updatedInventory.filter(item => item.quantity > 0 || item.id !== itemToUpdate.id));
        const newLog = {
          logId: `LOG${Date.now()}`, itemId, itemName: itemToUpdate.name, quantityChanged: quantity, 
          reason: `Transferred from ${fromLocation} to ${toLocation}`, staffIssuing: staffMember, 
          timestamp: new Date().toISOString(), type: 'transfer', fromLocation, toLocation,
        };
        setInventoryLogs(prevLogs => [newLog, ...prevLogs]);
        toast({ title: "Item Transferred", description: `${quantity} of ${itemToUpdate.name} transferred to ${toLocation}.`, className: "bg-sky-500 text-white" });
        setIsTransferModalOpen(false); setItemToTransfer(null);
      };

      const handleSaveRequest = (requestData) => {
        if (editingRequest) {
          setInventoryRequests(prev => prev.map(req => req.id === editingRequest.id ? { ...req, ...requestData } : req));
          toast({ title: "Request Updated", description: `Request ${editingRequest.id} updated.`, className: "bg-blue-500 text-white" });
        } else {
          const newRequest = { id: `REQ${Date.now()}`, ...requestData };
          setInventoryRequests(prev => [newRequest, ...prev]);
          toast({ title: "Request Submitted", description: `New shortage request ${newRequest.id} created.`, className: "bg-green-500 text-white" });
        }
        setEditingRequest(null);
        setIsRequestModalOpen(false);
      };

      const handleEditRequest = (request) => {
        setEditingRequest(request);
        setIsRequestModalOpen(true);
      };
      
      const handleOpenNewRequestModal = () => {
        setEditingRequest(null);
        setIsRequestModalOpen(true);
      };

      const handleUpdateRequestStatus = (requestId, newStatus) => {
        setInventoryRequests(prev => prev.map(req => req.id === requestId ? { ...req, status: newStatus } : req));
      };
      
      const handleViewRequestDetails = (request) => {
        setViewingRequestDetails(request);
      };

      const recentLogs = useMemo(() => {
        return inventoryLogs.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0,5);
      }, [inventoryLogs]);

      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
                <InventoryItemForm 
                    key={editingItem ? editingItem.id : 'new'} 
                    initialData={editingItem} 
                    onSave={handleSaveItem} 
                    onCancel={() => setEditingItem(null)}
                    mockLocations={mockLocations}
                />
                <RecentActivityCard recentLogs={recentLogs} />
            </div>

            <div className="lg:col-span-2 space-y-6">
              <InventoryList 
                inventory={inventory} 
                onEdit={handleEdit} 
                onDelete={handleDelete}
                onLogUsage={handleOpenLogModal}
                onTransfer={handleOpenTransferModal}
              />
              <div className="flex justify-end">
                <Button onClick={handleOpenNewRequestModal} className="bg-orange-500 hover:bg-orange-600 text-white">
                    <PlusSquare className="mr-2 h-5 w-5" /> Create Shortage Request
                </Button>
              </div>
              <InventoryRequestList
                requests={inventoryRequests}
                onUpdateRequestStatus={handleUpdateRequestStatus}
                onEditRequest={handleEditRequest}
                onViewRequestDetails={handleViewRequestDetails}
              />
            </div>
          </div>

          {isLogModalOpen && itemToLog && (
            <InventoryLogModal
              isOpen={isLogModalOpen}
              onClose={() => { setIsLogModalOpen(false); setItemToLog(null); }}
              item={itemToLog}
              onLogSubmit={handleLogUsage}
              staffList={mockStaff}
              patientList={mockPatients}
            />
          )}

          {isTransferModalOpen && itemToTransfer && (
            <InventoryTransferModal
              isOpen={isTransferModalOpen}
              onClose={() => { setIsTransferModalOpen(false); setItemToTransfer(null); }}
              item={itemToTransfer}
              onTransferSubmit={handleTransferItem}
              staffList={mockStaff}
              locationList={mockLocations}
              currentInventory={inventory}
            />
          )}

          {isRequestModalOpen && (
            <InventoryRequestModal
              isOpen={isRequestModalOpen}
              onClose={() => { setIsRequestModalOpen(false); setEditingRequest(null); }}
              onSaveRequest={handleSaveRequest}
              initialRequestData={editingRequest}
              inventoryItems={inventory}
              staffList={mockStaff}
              locationList={mockLocations.filter(loc => loc !== "HQ Warehouse")} 
            />
          )}

          {viewingRequestDetails && (
            <Dialog open={!!viewingRequestDetails} onOpenChange={() => setViewingRequestDetails(null)}>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Request Details: {viewingRequestDetails.id}</DialogTitle>
                  <DialogDescription>
                    Requested by {viewingRequestDetails.requestedBy} from {viewingRequestDetails.requestingUnit} on {format(new Date(viewingRequestDetails.requestDate), 'dd MMM yyyy, HH:mm')}.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-3">
                  <div><strong>Status:</strong> <span className={`px-2 py-0.5 text-xs rounded-full font-semibold ${
                      viewingRequestDetails.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                      viewingRequestDetails.status === 'Approved' ? 'bg-blue-100 text-blue-700' :
                      viewingRequestDetails.status === 'Fulfilled' ? 'bg-green-100 text-green-700' :
                      viewingRequestDetails.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>{viewingRequestDetails.status}</span>
                  </div>
                  <h4 className="font-semibold mt-2">Requested Items:</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    {viewingRequestDetails.items.map((item, index) => (
                      <li key={index}>{item.itemName} - Quantity: {item.quantityRequested} {item.unitOfMeasure}</li>
                    ))}
                  </ul>
                  {viewingRequestDetails.notes && (
                    <div>
                      <h4 className="font-semibold mt-2">Notes:</h4>
                      <p className="text-sm text-muted-foreground p-2 border rounded-md bg-slate-50">{viewingRequestDetails.notes}</p>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )}

        </motion.div>
      );
    };

    export default Inventory;