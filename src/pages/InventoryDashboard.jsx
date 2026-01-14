import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { Package, AlertCircle, ListChecks, PlusCircle, Archive, Edit, Loader2, Download, ArrowRightLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button.jsx';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { useToast } from '@/components/ui/use-toast.jsx';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

const categories = ["Cement", "Steel Rebar", "Sand", "Gravel", "Bricks", "Pipes", "Cables", "Tools", "Safety Equipment", "General"];
const units = ["Bag", "Ton", "Cubic Meter", "Piece", "Meter", "Box", "Roll", "Unit"];

const InventoryItemForm = ({ onSubmit, initialData = {}, onCancel, projects, isSubmitting }) => {
  const [formData, setFormData] = useState({
    itemName: initialData.name || '',
    category: initialData.category || categories[0],
    quantity: initialData.quantity?.toString() || '',
    unit: initialData.unit || units[0],
    minStockLevel: initialData.lowStockThreshold?.toString() || '',
    qrBarcode: initialData.batchNo || `ITEM-${Date.now().toString(36).slice(-6)}`,
    projectId: initialData.projectId || '',
    description: initialData.description || '',
    location: initialData.location || '',
  });
  const { toast } = useToast();

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.itemName || !formData.quantity) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Item Name and Quantity are required." });
      return;
    }
    onSubmit({
      ...formData,
      id: initialData._id,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div><Label htmlFor="itemName">Item Name</Label><Input id="itemName" value={formData.itemName} onChange={e => handleChange('itemName', e.target.value)} /></div>
        <div><Label htmlFor="category">Category</Label>
          <Select value={formData.category} onValueChange={val => handleChange('category', val)}>
            <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
            <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div><Label htmlFor="quantity">Quantity</Label><Input id="quantity" type="number" value={formData.quantity} onChange={e => handleChange('quantity', e.target.value)} /></div>
        <div><Label htmlFor="unit">Unit</Label>
          <Select value={formData.unit} onValueChange={val => handleChange('unit', val)}>
            <SelectTrigger><SelectValue placeholder="Select Unit" /></SelectTrigger>
            <SelectContent>{units.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label htmlFor="minStockLevel">Min. Stock Level</Label><Input id="minStockLevel" type="number" value={formData.minStockLevel} onChange={e => handleChange('minStockLevel', e.target.value)} /></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label htmlFor="projectId">Project/Site</Label>
          <Select value={formData.projectId} onValueChange={val => handleChange('projectId', val)}>
            <SelectTrigger><SelectValue placeholder="Select Project" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">No Project</SelectItem>
              {projects?.map(p => <SelectItem key={p._id} value={p._id}>{p.projectName}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div><Label htmlFor="location">Storage Location</Label><Input id="location" value={formData.location} onChange={e => handleChange('location', e.target.value)} placeholder="e.g., Warehouse A, Site Storage" /></div>
      </div>
      <div><Label htmlFor="qrBarcode">QR/Barcode (Auto)</Label><Input id="qrBarcode" value={formData.qrBarcode} readOnly disabled /></div>
      <div><Label htmlFor="description">Description (Optional)</Label><Textarea id="description" value={formData.description} onChange={e => handleChange('description', e.target.value)} rows={2} /></div>
      <DialogFooter className="pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData._id ? 'Update Item' : 'Add Item'}
        </Button>
      </DialogFooter>
    </form>
  );
};

const InventoryDashboard = () => {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Convex queries
  const inventoryItems = useQuery(api.inventory.listInventoryItems, {});
  const lowStockItems = useQuery(api.inventory.getLowStockItems, {});
  const inventoryStats = useQuery(api.inventory.getInventoryStats, {});
  const projects = useQuery(api.projects.listProjects, {});
  const users = useQuery(api.admin.listUsers, { isActive: true });
  const inventoryLogs = useQuery(api.inventory.getInventoryLogs, {});

  // Convex mutations
  const createInventoryItem = useMutation(api.inventory.createInventoryItem);
  const updateInventoryItem = useMutation(api.inventory.updateInventoryItem);
  const deleteInventoryItem = useMutation(api.inventory.deleteInventoryItem);

  // Get first admin user as createdBy
  const adminUser = users?.find(u => u.role === 'admin') || users?.[0];

  const handleSaveItem = async (itemData) => {
    if (!adminUser) {
      toast({ variant: "destructive", title: "Error", description: "No admin user found." });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingItem) {
        await updateInventoryItem({
          itemId: editingItem._id,
          name: itemData.itemName,
          lowStockThreshold: parseInt(itemData.minStockLevel) || 0,
          location: itemData.location || "Warehouse",
          unit: itemData.unit,
          category: itemData.category,
        });
        toast({ title: "Item Updated", description: `${itemData.itemName} updated.` });
      } else {
        await createInventoryItem({
          name: itemData.itemName,
          quantity: parseInt(itemData.quantity) || 0,
          batchNo: itemData.qrBarcode || `BATCH-${Date.now()}`,
          lowStockThreshold: parseInt(itemData.minStockLevel) || 0,
          location: itemData.location || "Warehouse",
          unit: itemData.unit,
          category: itemData.category,
          createdBy: adminUser._id,
        });
        toast({ title: "Item Added", description: `${itemData.itemName} added to inventory.` });
      }
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to save item." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm("Are you sure you want to delete this inventory item?")) {
      try {
        await deleteInventoryItem({ itemId });
        toast({ title: "Item Deleted", variant: "destructive" });
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: error.message || "Failed to delete item." });
      }
    }
  };

  const handleGenerateReorderList = () => {
    if (!lowStockItems || lowStockItems.length === 0) {
      toast({ variant: "destructive", title: "No Data", description: "No low stock items to generate re-order list." });
      return;
    }

    const headers = ['Item Name', 'Category', 'Current Qty', 'Min Stock', 'Unit', 'Location', 'Needed'];
    const rows = lowStockItems.map(item => [
      item.name,
      item.category,
      item.quantity,
      item.lowStockThreshold,
      item.unit,
      item.location,
      Math.max(0, item.lowStockThreshold - item.quantity),
    ].join(','));

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reorder-list-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({ title: "Re-order List Generated", description: "CSV file downloaded successfully." });
  };

  const isLoading = inventoryItems === undefined || users === undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 md:p-6 lg:p-8"
    >
      <Card className="shadow-xl border-t-4 border-teal-500 mb-8">
        <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight text-teal-600 flex items-center">
              <Package className="mr-2 h-6 w-6" />Real-Time Inventory Dashboard
            </CardTitle>
            <CardDescription>
              Manage stock levels, track items with QR/Barcodes, and get re-order suggestions.
            </CardDescription>
          </div>
          <Button onClick={() => { setEditingItem(null); setIsModalOpen(true); }} className="mt-4 md:mt-0 bg-teal-500 hover:bg-teal-600 text-white" disabled={!adminUser}>
            <PlusCircle className="mr-2 h-4 w-4" />Add New Item
          </Button>
        </CardHeader>
        <CardContent>
          {inventoryStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <Card className="p-3 border-l-4 border-blue-500">
                <div className="text-sm text-muted-foreground">Total Items</div>
                <div className="text-2xl font-bold text-blue-600">{inventoryStats.totalItems}</div>
              </Card>
              <Card className="p-3 border-l-4 border-red-500">
                <div className="text-sm text-muted-foreground">Low Stock</div>
                <div className="text-2xl font-bold text-red-600">{inventoryStats.lowStockCount}</div>
              </Card>
              <Card className="p-3 border-l-4 border-yellow-500">
                <div className="text-sm text-muted-foreground">Expiring Soon</div>
                <div className="text-2xl font-bold text-yellow-600">{inventoryStats.expiringSoonCount}</div>
              </Card>
              <Card className="p-3 border-l-4 border-green-500">
                <div className="text-sm text-muted-foreground">Locations</div>
                <div className="text-2xl font-bold text-green-600">{inventoryStats.locationCounts?.length || 0}</div>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
          <span className="ml-2 text-muted-foreground">Loading inventory...</span>
        </div>
      ) : (
        <>
          {lowStockItems && lowStockItems.length > 0 && (
            <Card className="mb-6 bg-red-50 border-red-200">
              <CardHeader>
                <CardTitle className="text-red-700 flex items-center"><AlertCircle className="mr-2 h-5 w-5" />Low Stock Alerts ({lowStockItems.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside text-sm text-red-600">
                  {lowStockItems.map(item => (
                    <li key={item._id}>{item.name} ({item.quantity} {item.unit}) - Min. Stock: {item.lowStockThreshold} {item.unit} at {item.location}</li>
                  ))}
                </ul>
                <Button size="sm" variant="outline" className="mt-3 border-red-500 text-red-500 hover:bg-red-100" onClick={handleGenerateReorderList}>
                  <Download className="mr-2 h-4 w-4" />Generate Re-order List
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle className="flex items-center"><ListChecks className="mr-2 h-5 w-5" />Current Inventory ({inventoryItems?.length || 0} items)</CardTitle></CardHeader>
            <CardContent>
              {inventoryItems?.length === 0 ? (
                <p className="text-muted-foreground text-center py-6">No items in inventory. Add items to get started.</p>
              ) : (
                <div className="space-y-2">
                  {inventoryItems?.map(item => (
                    <Card key={item._id} className={`p-3 shadow-sm ${item.isLowStock ? 'border-l-4 border-red-500' : ''}`}>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold">{item.name} <span className="text-xs text-muted-foreground">({item.category})</span></p>
                          <p className="text-sm">Qty: {item.quantity} {item.unit} (Min: {item.lowStockThreshold})</p>
                          <p className="text-xs text-gray-500">Location: {item.location} | Batch: {item.batchNo}</p>
                          {item.isExpiringSoon && item.expiryDate && (
                            <p className="text-xs text-yellow-600">Expiring: {item.expiryDate}</p>
                          )}
                        </div>
                        <div className="space-x-1">
                          <Button variant="ghost" size="icon" onClick={() => openEditModal(item)} title="Edit Item"><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item._id)} title="Delete Item"><Archive className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Inventory Transfer Log */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <ArrowRightLeft className="mr-2 h-5 w-5 text-blue-600" />
                Transfer Log
              </CardTitle>
              <CardDescription>Recent inventory transfers between locations</CardDescription>
            </CardHeader>
            <CardContent>
              {inventoryLogs && inventoryLogs.length > 0 ? (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {inventoryLogs.slice(0, 10).map(log => (
                    <div key={log._id} className="p-3 rounded-lg border bg-white shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{log.itemName}</p>
                          <p className="text-sm text-muted-foreground">
                            {log.fromLocation} → {log.toLocation}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Qty: {log.quantity} | By: {log.staffName}
                          </p>
                          {log.transferDate && (
                            <p className="text-xs text-gray-500">Date: {log.transferDate}</p>
                          )}
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          log.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          log.status === 'In Transit' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {log.status || 'Completed'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  No transfer records found. Use the Inventory Transfer form to move items.
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}

      <Dialog open={isModalOpen} onOpenChange={(open) => { if (!open) { setEditingItem(null); } setIsModalOpen(open); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}</DialogTitle>
          </DialogHeader>
          <InventoryItemForm
            onSubmit={handleSaveItem}
            initialData={editingItem || {}}
            onCancel={() => { setIsModalOpen(false); setEditingItem(null); }}
            projects={projects}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default InventoryDashboard;
