import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast.jsx';
import { PlusSquare, Loader2 } from 'lucide-react';
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
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

// Default locations shown when no inventory exists yet
const defaultLocations = ["HQ Warehouse", "Site Office", "Field Storage"];

const Inventory = () => {
  const { toast } = useToast();

  // Convex queries
  const inventoryItems = useQuery(api.inventory.listInventoryItems, {});
  const inventoryLogs = useQuery(api.inventory.getInventoryLogs, { limit: 100 });
  const inventoryRequests = useQuery(api.inventory.listInventoryRequests, {});
  const users = useQuery(api.admin.listUsers, { isActive: true });
  const dbLocations = useQuery(api.inventory.getUniqueLocations, {});

  // Use database locations if available, otherwise use defaults
  const locations = useMemo(() => {
    if (dbLocations && dbLocations.length > 0) {
      return dbLocations;
    }
    return defaultLocations;
  }, [dbLocations]);

  // Convex mutations
  const createInventoryItem = useMutation(api.inventory.createInventoryItem);
  const updateInventoryItem = useMutation(api.inventory.updateInventoryItem);
  const deleteInventoryItem = useMutation(api.inventory.deleteInventoryItem);
  const adjustInventoryQuantity = useMutation(api.inventory.adjustInventoryQuantity);
  const transferInventory = useMutation(api.inventory.transferInventory);
  const createInventoryRequest = useMutation(api.inventory.createInventoryRequest);
  const approveInventoryRequest = useMutation(api.inventory.approveInventoryRequest);
  const fulfillInventoryRequest = useMutation(api.inventory.fulfillInventoryRequest);
  const rejectInventoryRequest = useMutation(api.inventory.rejectInventoryRequest);

  const [editingItem, setEditingItem] = useState(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [itemToLog, setItemToLog] = useState(null);
  const [itemToTransfer, setItemToTransfer] = useState(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [viewingRequestDetails, setViewingRequestDetails] = useState(null);

  // Get first admin user as createdBy
  const adminUser = users?.find(u => u.role === 'admin') || users?.[0];

  // Convert users to staff list for modals
  const staffList = useMemo(() => {
    return users?.map(u => ({ id: u._id, name: u.fullName })) || [];
  }, [users]);

  // Transform inventory items for display
  const inventory = useMemo(() => {
    if (!inventoryItems) return [];
    return inventoryItems.map(item => ({
      id: item._id,
      name: item.name,
      quantity: item.quantity,
      batchNo: item.batchNo,
      expiryDate: item.expiryDate,
      lowStockThreshold: item.lowStockThreshold,
      location: item.location,
      unit: item.unit,
      category: item.category,
      isLowStock: item.isLowStock,
      isExpiringSoon: item.isExpiringSoon,
    }));
  }, [inventoryItems]);

  const handleSaveItem = async (itemData) => {
    if (!adminUser) {
      toast({ variant: "destructive", title: "Error", description: "No admin user found." });
      return;
    }

        try {
      if (editingItem) {
        await updateInventoryItem({
          itemId: editingItem.id,
          name: itemData.name,
          lowStockThreshold: parseInt(itemData.lowStockThreshold) || 0,
          location: itemData.location,
          unit: itemData.unit || "Unit",
          category: itemData.category || "General",
        });
        toast({ title: "Item Updated", description: `${itemData.name} updated successfully.`, className: "bg-blue-500 text-white" });
      } else {
        await createInventoryItem({
          name: itemData.name,
          quantity: parseInt(itemData.quantity) || 0,
          batchNo: itemData.batchNo || `BATCH-${Date.now()}`,
          expiryDate: itemData.expiryDate,
          lowStockThreshold: parseInt(itemData.lowStockThreshold) || 0,
          location: itemData.location || locations[0],
          unit: itemData.unit || "Unit",
          category: itemData.category || "General",
          createdBy: adminUser._id,
        });
        toast({ title: "Item Added", description: `${itemData.name} added to inventory.`, className: "bg-green-500 text-white" });
      }
      setEditingItem(null);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to save item." });
    } finally {
          }
  };

  const handleEdit = (item) => setEditingItem(item);

  const handleDelete = async (itemId) => {
    const itemToDelete = inventory.find(item => item.id === itemId);
    try {
      await deleteInventoryItem({ itemId });
      toast({ title: "Item Deleted", description: `${itemToDelete?.name || 'Item'} removed from inventory.`, className: "bg-red-500 text-white" });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to delete item." });
    }
  };

  const handleOpenLogModal = (item) => { setItemToLog(item); setIsLogModalOpen(true); };

  const handleLogUsage = async (logData) => {
    if (!adminUser) {
      toast({ variant: "destructive", title: "Error", description: "No admin user found." });
      return;
    }

    const { itemId, quantityChanged, reason, patientId } = logData;
    const item = inventory.find(invItem => invItem.id === itemId);
    if (!item) {
      toast({ variant: "destructive", title: "Error", description: "Item not found." });
      return;
    }

        try {
      await adjustInventoryQuantity({
        itemId,
        quantityChange: parseInt(quantityChanged),
        reason,
        type: "deduction",
        staffId: adminUser._id,
        patientId: patientId || undefined,
      });
      toast({ title: "Usage Logged", description: `${quantityChanged} of ${item.name} issued.`, className: "bg-teal-500 text-white" });
      setIsLogModalOpen(false);
      setItemToLog(null);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to log usage." });
    } finally {
          }
  };

  const handleOpenTransferModal = (item) => { setItemToTransfer(item); setIsTransferModalOpen(true); };

  const handleTransferItem = async (transferData) => {
    if (!adminUser) {
      toast({ variant: "destructive", title: "Error", description: "No admin user found." });
      return;
    }

    const { itemId, quantity, fromLocation, toLocation } = transferData;
    const item = inventory.find(invItem => invItem.id === itemId);

        try {
      await transferInventory({
        itemId,
        quantity: parseInt(quantity),
        fromLocation,
        toLocation,
        staffId: adminUser._id,
      });
      toast({ title: "Item Transferred", description: `${quantity} of ${item?.name} transferred to ${toLocation}.`, className: "bg-sky-500 text-white" });
      setIsTransferModalOpen(false);
      setItemToTransfer(null);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to transfer item." });
    } finally {
          }
  };

  const handleSaveRequest = async (requestData) => {
    if (!adminUser) {
      toast({ variant: "destructive", title: "Error", description: "No admin user found." });
      return;
    }

        try {
      // Transform items to use proper IDs
      const itemsForRequest = requestData.items.map(item => ({
        itemId: item.itemId,
        quantityRequested: parseInt(item.quantityRequested),
        unitOfMeasure: item.unitOfMeasure || "Unit",
      }));

      await createInventoryRequest({
        requestingUnit: requestData.requestingUnit,
        requestedBy: adminUser._id,
        items: itemsForRequest,
        notes: requestData.notes || "",
      });
      toast({ title: "Request Submitted", description: "New shortage request created.", className: "bg-green-500 text-white" });
      setEditingRequest(null);
      setIsRequestModalOpen(false);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to create request." });
    } finally {
          }
  };

  const handleEditRequest = (request) => {
    setEditingRequest(request);
    setIsRequestModalOpen(true);
  };

  const handleOpenNewRequestModal = () => {
    setEditingRequest(null);
    setIsRequestModalOpen(true);
  };

  const handleUpdateRequestStatus = async (requestId, newStatus) => {
    if (!adminUser) {
      toast({ variant: "destructive", title: "Error", description: "No admin user found." });
      return;
    }

    try {
      if (newStatus === 'Approved') {
        await approveInventoryRequest({ requestId, approvedBy: adminUser._id });
      } else if (newStatus === 'Fulfilled') {
        await fulfillInventoryRequest({ requestId, fulfilledBy: adminUser._id });
      } else if (newStatus === 'Rejected') {
        await rejectInventoryRequest({ requestId, rejectedBy: adminUser._id });
      }
      toast({ title: "Status Updated", description: `Request status changed to ${newStatus}.` });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to update status." });
    }
  };

  const handleViewRequestDetails = (request) => {
    setViewingRequestDetails(request);
  };

  // Transform inventory logs for display
  const recentLogs = useMemo(() => {
    if (!inventoryLogs) return [];
    return inventoryLogs.slice(0, 5).map(log => ({
      logId: log._id,
      itemId: log.itemId,
      itemName: log.itemName,
      quantityChanged: log.quantityChanged,
      reason: log.reason,
      staffIssuing: log.staffName,
      patientId: log.patientId,
      timestamp: new Date(log._creationTime).toISOString(),
      type: log.type,
      fromLocation: log.fromLocation,
      toLocation: log.toLocation,
    }));
  }, [inventoryLogs]);

  // Transform requests for display
  const requests = useMemo(() => {
    if (!inventoryRequests) return [];
    return inventoryRequests.map(req => ({
      id: req._id,
      requestingUnit: req.requestingUnit,
      requestedBy: req.requestedByName,
      requestDate: new Date(req._creationTime).toISOString(),
      items: req.items.map(item => ({
        itemId: item.itemId,
        itemName: item.itemName,
        quantityRequested: item.quantityRequested,
        unitOfMeasure: item.unitOfMeasure,
      })),
      status: req.status,
      notes: req.notes,
    }));
  }, [inventoryRequests]);

  const isLoading = inventoryItems === undefined || users === undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
          <span className="ml-2 text-muted-foreground">Loading inventory...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <InventoryItemForm
              key={editingItem ? editingItem.id : 'new'}
              initialData={editingItem}
              onSave={handleSaveItem}
              onCancel={() => setEditingItem(null)}
              locations={locations}
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
              requests={requests}
              onUpdateRequestStatus={handleUpdateRequestStatus}
              onEditRequest={handleEditRequest}
              onViewRequestDetails={handleViewRequestDetails}
            />
          </div>
        </div>
      )}

      {isLogModalOpen && itemToLog && (
        <InventoryLogModal
          isOpen={isLogModalOpen}
          onClose={() => { setIsLogModalOpen(false); setItemToLog(null); }}
          item={itemToLog}
          onLogSubmit={handleLogUsage}
          staffList={staffList}
          patientList={[]}
        />
      )}

      {isTransferModalOpen && itemToTransfer && (
        <InventoryTransferModal
          isOpen={isTransferModalOpen}
          onClose={() => { setIsTransferModalOpen(false); setItemToTransfer(null); }}
          item={itemToTransfer}
          onTransferSubmit={handleTransferItem}
          staffList={staffList}
          locationList={locations}
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
          staffList={staffList}
          locationList={locations.filter(loc => loc !== "HQ Warehouse")}
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
