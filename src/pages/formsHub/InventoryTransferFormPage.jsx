import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Package, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast.jsx';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';

const transferReasons = [
  "Project Requirement",
  "Stock Rebalancing",
  "Emergency Need",
  "Equipment Maintenance",
  "Site Closure",
  "Other",
];

const InventoryTransferFormPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const users = useQuery(api.admin.listUsers, {});
  const inventoryItems = useQuery(api.inventory.listInventoryItems, {});
  const transferInventory = useMutation(api.inventory.transferInventory);

  const [selectedItem, setSelectedItem] = useState('');
  const [quantity, setQuantity] = useState('');
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get first user as default (in real app, this would be the logged-in user)
  const currentUser = users?.[0];

  // Get unique locations from inventory
  const locations = [...new Set(inventoryItems?.map(item => item.location) || [])];

  const selectedItemData = inventoryItems?.find(item => item._id === selectedItem);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedItem || !quantity || !fromLocation || !toLocation || !reason) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Please fill in all required fields." });
      return;
    }

    if (!currentUser) {
      toast({ variant: "destructive", title: "Error", description: "No user found. Please ensure users exist in the system." });
      return;
    }

    const qty = parseInt(quantity);
    if (qty <= 0) {
      toast({ variant: "destructive", title: "Invalid Quantity", description: "Quantity must be greater than 0." });
      return;
    }

    if (selectedItemData && qty > selectedItemData.quantity) {
      toast({ variant: "destructive", title: "Insufficient Stock", description: `Only ${selectedItemData.quantity} units available.` });
      return;
    }

    if (fromLocation === toLocation) {
      toast({ variant: "destructive", title: "Invalid Transfer", description: "Source and destination locations must be different." });
      return;
    }

    setIsSubmitting(true);
    try {
      await transferInventory({
        itemId: selectedItem,
        quantity: qty,
        fromLocation,
        toLocation,
        staffId: currentUser._id,
      });

      toast({ title: "Transfer Logged", description: `${qty} units transferred from ${fromLocation} to ${toLocation}.` });
      navigate('/forms-documents');
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to log transfer. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!users || !inventoryItems) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto">
      <Card className="shadow-xl border-t-4 border-orange-600">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-orange-700 flex items-center">
            <Package className="mr-3 h-7 w-7"/>Inventory Use/Transfer Form
          </CardTitle>
          <CardDescription>Log inventory transfers between locations or usage.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="selectedItem">Select Item *</Label>
              <Select value={selectedItem} onValueChange={setSelectedItem}>
                <SelectTrigger>
                  <SelectValue placeholder="Select inventory item" />
                </SelectTrigger>
                <SelectContent>
                  {inventoryItems?.map(item => (
                    <SelectItem key={item._id} value={item._id}>
                      {item.name} - {item.quantity} {item.unit} ({item.location})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedItemData && (
              <div className="p-3 bg-orange-50 rounded-lg text-sm">
                <p><strong>Current Stock:</strong> {selectedItemData.quantity} {selectedItemData.unit}</p>
                <p><strong>Category:</strong> {selectedItemData.category}</p>
                <p><strong>Location:</strong> {selectedItemData.location}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quantity">Quantity to Transfer *</Label>
                <Input id="quantity" type="number" min="1" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="Enter quantity" />
              </div>
              <div>
                <Label htmlFor="reason">Reason for Transfer *</Label>
                <Select value={reason} onValueChange={setReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {transferReasons.map(r => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fromLocation">From Location *</Label>
                <Select value={fromLocation} onValueChange={setFromLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map(loc => (
                      <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="toLocation">To Location *</Label>
                <Select value={toLocation} onValueChange={setToLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map(loc => (
                      <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                    ))}
                    <SelectItem value="new">+ New Location</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {toLocation === 'new' && (
              <div>
                <Label htmlFor="newLocation">New Location Name</Label>
                <Input id="newLocation" onChange={e => setToLocation(e.target.value)} placeholder="Enter new location name" />
              </div>
            )}

            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any additional details about this transfer..." rows={2} />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2 border-t pt-6">
            <Button type="button" variant="outline" onClick={() => navigate('/forms-documents')}>Cancel</Button>
            <Button type="submit" className="bg-orange-600 hover:bg-orange-700" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</> : 'Submit Transfer'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );
};

export default InventoryTransferFormPage;
