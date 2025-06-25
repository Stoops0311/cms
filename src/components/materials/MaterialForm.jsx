import React, { useState } from 'react';
    import { Button } from '@/components/ui/button.jsx';
    import { Input } from '@/components/ui/input.jsx';
    import { Label } from '@/components/ui/label.jsx';
    import { DatePicker } from '@/components/ui/date-picker.jsx';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
    import { useToast } from '@/components/ui/use-toast.jsx';

    export const materialCategories = ["Aggregates", "Cement & Concrete", "Bricks & Masonry", "Steel & Metals", "Wood & Timber", "Pipes & Fittings", "Electrical", "Finishing Materials", "Safety Gear"];
    export const materialUnits = ["Units", "kg", "Tonnes", "m", "sq.m", "cu.m", "Liters", "Bags", "Rolls", "Pallets"];
    export const mockLocations = ["Main Warehouse", "Site A Storage", "Site B Storage", "Fabrication Yard"];

    const MaterialForm = ({ onSubmit, initialData = {}, onCancel }) => {
      const [name, setName] = useState(initialData.name || '');
      const [category, setCategory] = useState(initialData.category || materialCategories[0]);
      const [sku, setSku] = useState(initialData.sku || `MAT-${Date.now().toString().slice(-5)}`);
      const [quantity, setQuantity] = useState(initialData.quantity?.toString() || '');
      const [unit, setUnit] = useState(initialData.unit || materialUnits[0]);
      const [location, setLocation] = useState(initialData.location || mockLocations[0]);
      const [supplier, setSupplier] = useState(initialData.supplier || '');
      const [purchaseDate, setPurchaseDate] = useState(initialData.purchaseDate ? new Date(initialData.purchaseDate) : null);
      const [lowStockThreshold, setLowStockThreshold] = useState(initialData.lowStockThreshold?.toString() || '10');
      const { toast } = useToast();

      const handleSubmit = (e) => {
        e.preventDefault();
        if (!name || !category || !sku || !quantity || !unit || !location) {
          toast({ variant: "destructive", title: "Missing Information", description: "Please fill all required fields." });
          return;
        }
        onSubmit({
          id: initialData.id || sku,
          name, category, sku, 
          quantity: parseInt(quantity, 10), 
          unit, location, supplier,
          purchaseDate: purchaseDate ? purchaseDate.toISOString() : null,
          lowStockThreshold: parseInt(lowStockThreshold, 10),
        });
      };

      return (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label htmlFor="name-matform">Material Name</Label><Input id="name-matform" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Portland Cement" /></div>
            <div><Label htmlFor="sku-matform">SKU/ID</Label><Input id="sku-matform" value={sku} onChange={e => setSku(e.target.value)} placeholder="e.g., CEM-001" disabled={!!initialData.id} /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category-matform">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category-matform"><SelectValue placeholder="Select Category" /></SelectTrigger>
                <SelectContent>{materialCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="location-matform">Location</Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger id="location-matform"><SelectValue placeholder="Select Location" /></SelectTrigger>
                <SelectContent>{mockLocations.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><Label htmlFor="quantity-matform">Quantity</Label><Input id="quantity-matform" type="number" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="e.g., 100" /></div>
            <div>
              <Label htmlFor="unit-matform">Unit</Label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger id="unit-matform"><SelectValue placeholder="Select Unit" /></SelectTrigger>
                <SelectContent>{materialUnits.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label htmlFor="lowStockThreshold-matform">Low Stock Threshold</Label><Input id="lowStockThreshold-matform" type="number" value={lowStockThreshold} onChange={e => setLowStockThreshold(e.target.value)} placeholder="e.g., 10" /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label htmlFor="supplier-matform">Supplier (Optional)</Label><Input id="supplier-matform" value={supplier} onChange={e => setSupplier(e.target.value)} placeholder="e.g., BuildMart Inc." /></div>
            <div><Label htmlFor="purchaseDate-matform">Purchase Date (Optional)</Label><DatePicker id="purchaseDate-matform" date={purchaseDate} setDate={setPurchaseDate} /></div>
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
            <Button type="submit">{initialData.id ? 'Update Material' : 'Add Material'}</Button>
          </div>
        </form>
      );
    };
    export default MaterialForm;