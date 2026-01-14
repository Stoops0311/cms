import React, { useState, useEffect } from 'react';
    import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { Input } from '@/components/ui/input.jsx';
    import { Label } from '@/components/ui/label.jsx';
    import { DatePicker } from '@/components/ui/date-picker.jsx';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
    import { PackagePlus } from 'lucide-react';
    import { format, parseISO } from 'date-fns';
    import { useToast } from '@/components/ui/use-toast.jsx';

    const InventoryItemForm = ({ initialData, onSave, onCancel, locations }) => {
      const { toast } = useToast();
      const [itemName, setItemName] = useState('');
      const [quantity, setQuantity] = useState('');
      const [batchNo, setBatchNo] = useState('');
      const [expiryDate, setExpiryDate] = useState(null);
      const [lowStockThreshold, setLowStockThreshold] = useState('10');
      const [location, setLocation] = useState(locations && locations.length > 0 ? locations[0] : '');

      useEffect(() => {
        if (initialData) {
          setItemName(initialData.name);
          setQuantity(initialData.quantity.toString());
          setBatchNo(initialData.batchNo);
          setExpiryDate(initialData.expiryDate ? parseISO(initialData.expiryDate) : null);
          setLowStockThreshold(initialData.lowStockThreshold.toString());
          setLocation(initialData.location || (locations && locations.length > 0 ? locations[0] : ''));
        } else {
            resetForm();
        }
      }, [initialData, locations]);

      const resetForm = () => {
        setItemName('');
        setQuantity('');
        setBatchNo('');
        setExpiryDate(null);
        setLowStockThreshold('10');
        setLocation(locations && locations.length > 0 ? locations[0] : '');
        if (onCancel) onCancel(); 
      };

      const handleSubmit = (e) => {
        e.preventDefault();
        if (!itemName || !quantity || !batchNo || !expiryDate || !location) {
          toast({ variant: "destructive", title: "Missing Information", description: "Please fill all required fields." });
          return;
        }
        onSave({
          name: itemName,
          quantity: parseInt(quantity, 10),
          batchNo,
          expiryDate: format(expiryDate, 'yyyy-MM-dd'),
          lowStockThreshold: parseInt(lowStockThreshold, 10),
          location,
        });
        if (!initialData) { 
            resetForm();
        }
      };

      return (
        <Card className="shadow-lg border-t-4 border-accent">
          <CardHeader className="bg-gradient-to-r from-accent/10 to-amber-500/10">
            <CardTitle className="text-xl font-semibold text-accent flex items-center">
              <PackagePlus className="mr-2 h-6 w-6" /> {initialData ? "Edit Item" : "Add New Item"}
            </CardTitle>
            <CardDescription>{initialData ? "Update item details in the inventory." : "Add medicines or consumables."}</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label htmlFor="itemName">Item Name</Label>
                <Input id="itemName" value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="e.g., Paracetamol 500mg" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="e.g., 100" min="0"/>
                </div>
                <div>
                  <Label htmlFor="batchNo">Batch No.</Label>
                  <Input id="batchNo" value={batchNo} onChange={(e) => setBatchNo(e.target.value)} placeholder="e.g., BATCH123" />
                </div>
              </div>
              <div>
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <DatePicker date={expiryDate} setDate={setExpiryDate} className="w-full" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                  <Input id="lowStockThreshold" type="number" value={lowStockThreshold} onChange={(e) => setLowStockThreshold(e.target.value)} placeholder="e.g., 10" min="0"/>
                </div>
                <div>
                    <Label htmlFor="location">Location</Label>
                    <Select value={location} onValueChange={setLocation}>
                        <SelectTrigger id="location" className="w-full">
                            <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                            {locations && locations.map(loc => (
                                <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-6 flex space-x-2">
              <Button type="submit" className="flex-1 bg-gradient-to-r from-accent to-amber-600 hover:from-accent/90 hover:to-amber-600/90 text-white">
                {initialData ? "Update Item" : "Add Item"}
              </Button>
              { (initialData || itemName || quantity || batchNo || expiryDate) && 
                <Button type="button" variant="outline" onClick={resetForm}>
                  {initialData ? "Cancel Edit" : "Clear Form"}
                </Button>
              }
            </CardFooter>
          </form>
        </Card>
      );
    };

    export default InventoryItemForm;