import React, { useState } from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
    import { Package, AlertCircle, ListChecks, PlusCircle, Archive, ArrowRightLeft, AlertTriangle, Edit } from 'lucide-react';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button.jsx';
    import {
      Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
    } from '@/components/ui/dialog.jsx';
    import { Input } from '@/components/ui/input.jsx';
    import { Label } from '@/components/ui/label.jsx';
    import { Textarea } from '@/components/ui/textarea.jsx';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
    import useLocalStorage from '@/hooks/useLocalStorage.jsx';
    import { useToast } from '@/components/ui/use-toast.jsx';

    const mockCategories = ["Cement", "Steel Rebar", "Sand", "Gravel", "Bricks", "Pipes", "Cables", "Tools"];
    const mockUnits = ["Bag", "Ton", "Cubic Meter", "Piece", "Meter", "Box"];
    const mockSites = [ { id: "siteA", name: "Downtown Tower Site" }, { id: "siteB", name: "West Bridge Project" }]; // From ShiftManagement

    const InventoryItemForm = ({ onSubmit, initialData = {}, onCancel }) => {
        const [formData, setFormData] = useState({
            itemName: initialData.itemName || '',
            category: initialData.category || mockCategories[0],
            quantity: initialData.quantity || '',
            unit: initialData.unit || mockUnits[0],
            minStockLevel: initialData.minStockLevel || '',
            qrBarcode: initialData.qrBarcode || `ITEM-${Date.now().toString(36).slice(-6)}`, // Auto-generate mock
            siteId: initialData.siteId || mockSites[0].id,
            description: initialData.description || '',
        });
        const {toast} = useToast();

        const handleChange = (name, value) => {
            setFormData(prev => ({ ...prev, [name]: value }));
        };

        const handleSubmit = (e) => {
            e.preventDefault();
            if(!formData.itemName || !formData.quantity || !formData.siteId) {
                toast({variant: "destructive", title: "Missing Fields", description:"Item Name, Quantity and Site are required."});
                return;
            }
            onSubmit({ ...formData, id: initialData.id || `INV-${Date.now()}`});
        };
        
        return (
            <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div><Label htmlFor="itemName">Item Name</Label><Input id="itemName" value={formData.itemName} onChange={e => handleChange('itemName', e.target.value)}/></div>
                    <div><Label htmlFor="category">Category</Label>
                        <Select value={formData.category} onValueChange={val => handleChange('category', val)}>
                            <SelectTrigger><SelectValue placeholder="Select Category"/></SelectTrigger>
                            <SelectContent>{mockCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div><Label htmlFor="quantity">Quantity</Label><Input id="quantity" type="number" value={formData.quantity} onChange={e => handleChange('quantity', e.target.value)}/></div>
                     <div><Label htmlFor="unit">Unit</Label>
                        <Select value={formData.unit} onValueChange={val => handleChange('unit', val)}>
                            <SelectTrigger><SelectValue placeholder="Select Unit"/></SelectTrigger>
                            <SelectContent>{mockUnits.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                    <div><Label htmlFor="minStockLevel">Min. Stock Level</Label><Input id="minStockLevel" type="number" value={formData.minStockLevel} onChange={e => handleChange('minStockLevel', e.target.value)}/></div>
                </div>
                 <div>
                    <Label htmlFor="siteId">Site/Location</Label>
                    <Select value={formData.siteId} onValueChange={val => handleChange('siteId', val)}>
                        <SelectTrigger><SelectValue placeholder="Select Site"/></SelectTrigger>
                        <SelectContent>{mockSites.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div><Label htmlFor="qrBarcode">QR/Barcode (Auto)</Label><Input id="qrBarcode" value={formData.qrBarcode} readOnly disabled/></div>
                <div><Label htmlFor="description">Description (Optional)</Label><Textarea id="description" value={formData.description} onChange={e => handleChange('description', e.target.value)} rows={2}/></div>
                <DialogFooter className="pt-2">
                    <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                    <Button type="submit">{initialData.id ? 'Update Item' : 'Add Item'}</Button>
                </DialogFooter>
            </form>
        );
    };

    const InventoryDashboard = () => {
      const [inventory, setInventory] = useLocalStorage('inventoryItems', []);
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [editingItem, setEditingItem] = useState(null);
      const { toast } = useToast();

      const handleSaveItem = (itemData) => {
          let updatedInventory;
          if (editingItem) {
              updatedInventory = inventory.map(item => item.id === editingItem.id ? {...item, ...itemData} : item);
              toast({title: "Item Updated", description: `${itemData.itemName} updated.`});
          } else {
              updatedInventory = [...inventory, itemData];
              toast({title: "Item Added", description: `${itemData.itemName} added to inventory.`});
          }
          setInventory(updatedInventory);
          setIsModalOpen(false);
          setEditingItem(null);
      };

      const openEditModal = (item) => {
          setEditingItem(item);
          setIsModalOpen(true);
      };
      
      const handleDeleteItem = (itemId) => {
          if (window.confirm("Are you sure you want to delete this inventory item?")) {
              setInventory(prev => prev.filter(item => item.id !== itemId));
              toast({title: "Item Deleted", variant: "destructive"});
          }
      };

      const lowStockItems = inventory.filter(item => parseFloat(item.quantity) < parseFloat(item.minStockLevel));

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
                        <Package className="mr-2 h-6 w-6"/>Real-Time Inventory Dashboard
                    </CardTitle>
                    <CardDescription>
                        Manage stock levels, track items with QR/Barcodes, and get re-order suggestions.
                    </CardDescription>
                </div>
                <Button onClick={() => {setEditingItem(null); setIsModalOpen(true);}} className="mt-4 md:mt-0 bg-teal-500 hover:bg-teal-600 text-white">
                    <PlusCircle className="mr-2 h-4 w-4"/>Add New Item
                </Button>
            </CardHeader>
             <CardContent>
                <div className="mt-2 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded-md flex items-start">
                  <AlertTriangle className="h-5 w-5 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Simplified View:</p>
                    <p className="text-sm">This dashboard shows a basic list. Advanced features like QR/Barcode scanning, site-wise consumption reports, and material request workflows will be implemented progressively.</p>
                  </div>
                </div>
            </CardContent>
          </Card>

          {lowStockItems.length > 0 && (
            <Card className="mb-6 bg-red-50 border-red-200">
                <CardHeader>
                    <CardTitle className="text-red-700 flex items-center"><AlertCircle className="mr-2 h-5 w-5"/>Low Stock Alerts ({lowStockItems.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="list-disc list-inside text-sm text-red-600">
                        {lowStockItems.map(item => (
                            <li key={item.id}>{item.itemName} ({item.quantity} {item.unit}) - Min. Stock: {item.minStockLevel} {item.unit} at {mockSites.find(s=>s.id===item.siteId)?.name}</li>
                        ))}
                    </ul>
                    <Button size="sm" variant="outline" className="mt-3 border-red-500 text-red-500 hover:bg-red-100">Generate Re-order List (Placeholder)</Button>
                </CardContent>
            </Card>
          )}
          
          <Card>
            <CardHeader><CardTitle className="flex items-center"><ListChecks className="mr-2 h-5 w-5"/>Current Inventory ({inventory.length} items)</CardTitle></CardHeader>
            <CardContent>
                {inventory.length === 0 ? (
                    <p className="text-muted-foreground text-center py-6">No items in inventory. Add items to get started.</p>
                ) : (
                    <div className="space-y-2">
                        {inventory.map(item => (
                            <Card key={item.id} className="p-3 shadow-sm">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold">{item.itemName} <span className="text-xs text-muted-foreground">({item.category})</span></p>
                                        <p className="text-sm">Qty: {item.quantity} {item.unit} (Min: {item.minStockLevel})</p>
                                        <p className="text-xs text-gray-500">Site: {mockSites.find(s=>s.id===item.siteId)?.name} | QR: {item.qrBarcode}</p>
                                    </div>
                                     <div className="space-x-1">
                                        <Button variant="ghost" size="icon" onClick={() => openEditModal(item)} title="Edit Item"><Edit className="h-4 w-4"/></Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item.id)} title="Delete Item"><Archive className="h-4 w-4 text-destructive"/></Button>
                                        <Button variant="ghost" size="icon" title="Log Usage/Transfer (Placeholder)"><ArrowRightLeft className="h-4 w-4 text-blue-500"/></Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </CardContent>
          </Card>

          <Dialog open={isModalOpen} onOpenChange={(open) => { if(!open) { setEditingItem(null); } setIsModalOpen(open); }}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}</DialogTitle>
                    </DialogHeader>
                    <InventoryItemForm onSubmit={handleSaveItem} initialData={editingItem || {}} onCancel={() => {setIsModalOpen(false); setEditingItem(null);}}/>
                </DialogContent>
            </Dialog>
        </motion.div>
      );
    };

    export default InventoryDashboard;