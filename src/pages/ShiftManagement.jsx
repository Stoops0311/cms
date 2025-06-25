import React, { useState } from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
    import { Calendar, Users, Edit, PlusCircle, AlertTriangle, Trash2 } from 'lucide-react';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button.jsx';
    import {
      Dialog,
      DialogContent,
      DialogHeader,
      DialogTitle,
      DialogDescription,
      DialogFooter,
    } from '@/components/ui/dialog.jsx';
    import { Input } from '@/components/ui/input.jsx';
    import { Label } from '@/components/ui/label.jsx';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
    import { DatePicker } from '@/components/ui/date-picker.jsx';
    import useLocalStorage from '@/hooks/useLocalStorage.jsx';
    import { useToast } from '@/components/ui/use-toast.jsx';

    // Mock data - replace with actual data fetching
    const mockStaff = [
      { id: "staff1", name: "John Doe", role: "Site Engineer" },
      { id: "staff2", name: "Jane Smith", role: "Safety Officer" },
      { id: "staff3", name: "Ali Khan", role: "Foreman" },
    ];
    const mockSites = [
      { id: "siteA", name: "Downtown Tower Site" },
      { id: "siteB", name: "West Bridge Project" },
    ];
    const shiftTypes = ["Morning (8AM-4PM)", "Evening (4PM-12AM)", "Night (12AM-8AM)", "General (9AM-5PM)"];


    const ShiftForm = ({ onSubmit, initialData = {}, onCancel }) => {
        const [staffId, setStaffId] = useState(initialData.staffId || '');
        const [siteId, setSiteId] = useState(initialData.siteId || '');
        const [shiftDate, setShiftDate] = useState(initialData.shiftDate ? new Date(initialData.shiftDate) : new Date());
        const [shiftType, setShiftType] = useState(initialData.shiftType || shiftTypes[0]);
        const [notes, setNotes] = useState(initialData.notes || '');
        const { toast } = useToast();

        const handleSubmit = (e) => {
            e.preventDefault();
            if (!staffId || !siteId || !shiftDate || !shiftType) {
                toast({ variant: "destructive", title: "Missing Fields", description: "Please select staff, site, date, and shift type." });
                return;
            }
            onSubmit({ 
                id: initialData.id || `SHIFT-${Date.now()}`, 
                staffId, siteId, shiftDate, shiftType, notes, 
                staffName: mockStaff.find(s=>s.id === staffId)?.name,
                siteName: mockSites.find(s=>s.id === siteId)?.name,
             });
        };
        
        return (
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label htmlFor="staffId">Staff Member</Label>
                    <Select value={staffId} onValueChange={setStaffId}>
                        <SelectTrigger id="staffId"><SelectValue placeholder="Select Staff"/></SelectTrigger>
                        <SelectContent>{mockStaff.map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.role})</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="siteId">Site/Location</Label>
                    <Select value={siteId} onValueChange={setSiteId}>
                        <SelectTrigger id="siteId"><SelectValue placeholder="Select Site"/></SelectTrigger>
                        <SelectContent>{mockSites.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                 <div>
                    <Label htmlFor="shiftDate">Shift Date</Label>
                    <DatePicker date={shiftDate} setDate={setShiftDate} />
                </div>
                 <div>
                    <Label htmlFor="shiftType">Shift Type</Label>
                    <Select value={shiftType} onValueChange={setShiftType}>
                        <SelectTrigger id="shiftType"><SelectValue placeholder="Select Shift Type"/></SelectTrigger>
                        <SelectContent>{shiftTypes.map(st => <SelectItem key={st} value={st}>{st}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Input id="notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any specific instructions or notes"/>
                </div>
                <DialogFooter className="pt-2">
                    <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                    <Button type="submit">{initialData.id ? 'Update Shift' : 'Assign Shift'}</Button>
                </DialogFooter>
            </form>
        );
    };


    const ShiftManagement = () => {
      const [shifts, setShifts] = useLocalStorage('shifts', []);
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [editingShift, setEditingShift] = useState(null);
      const {toast} = useToast();

      // Drag and drop state (very simplified for now)
      const [draggedShift, setDraggedShift] = useState(null);

      const handleSaveShift = (shiftData) => {
          let updatedShifts;
          if (editingShift) {
              updatedShifts = shifts.map(s => s.id === editingShift.id ? {...s, ...shiftData} : s);
              toast({ title: "Shift Updated", description: `Shift for ${shiftData.staffName} updated.` });
          } else {
              updatedShifts = [...shifts, shiftData];
              toast({ title: "Shift Assigned", description: `New shift assigned to ${shiftData.staffName}.` });
          }
          setShifts(updatedShifts);
          setIsModalOpen(false);
          setEditingShift(null);
      };
      
      const openEditModal = (shift) => {
          setEditingShift(shift);
          setIsModalOpen(true);
      };

      const handleDeleteShift = (shiftId) => {
          if (window.confirm("Are you sure you want to delete this shift?")) {
              setShifts(prevShifts => prevShifts.filter(s => s.id !== shiftId));
              toast({ title: "Shift Deleted", variant: "destructive" });
          }
      };
      
      // Placeholder for drag & drop
      const handleDragStart = (e, shift) => {
          setDraggedShift(shift);
          e.dataTransfer.effectAllowed = "move";
      };
      const handleDragOver = (e) => {
          e.preventDefault(); // Necessary to allow drop
      };
      const handleDrop = (e, targetDate, targetStaffId) => {
          e.preventDefault();
          if (draggedShift) {
              // This is a very basic simulation. Real drag-and-drop calendar would be complex.
              const updatedShift = { ...draggedShift, shiftDate: targetDate, staffId: targetStaffId, staffName: mockStaff.find(s => s.id === targetStaffId)?.name };
              // Find and update the shift
              const updatedShifts = shifts.map(s => s.id === draggedShift.id ? updatedShift : s);
              setShifts(updatedShifts);
              toast({ title: "Shift Moved (Mock)", description: `Shift for ${updatedShift.staffName} moved to new slot.` });
              setDraggedShift(null);
          }
      };


      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-4 md:p-6 lg:p-8"
        >
          <Card className="shadow-xl border-t-4 border-orange-500">
            <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                    <CardTitle className="text-2xl font-bold tracking-tight text-orange-600 flex items-center">
                        <Calendar className="mr-2 h-6 w-6"/>Shift Management
                    </CardTitle>
                    <CardDescription>
                        Assign shifts by role/site. Drag-and-drop shift changes (conceptual).
                    </CardDescription>
                </div>
                <Button onClick={() => {setEditingShift(null); setIsModalOpen(true);}} className="mt-4 md:mt-0 bg-orange-500 hover:bg-orange-600 text-white">
                    <PlusCircle className="mr-2 h-4 w-4"/>Assign New Shift
                </Button>
            </CardHeader>
            <CardContent>
                <div className="mb-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded-md flex items-start">
                  <AlertTriangle className="h-5 w-5 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Simplified View & Drag-and-Drop:</p>
                    <p className="text-sm">This page provides a basic list of shifts. A full calendar view with drag-and-drop functionality is a complex feature planned for later development. The current drag-and-drop is a conceptual placeholder.</p>
                  </div>
                </div>

                {shifts.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No shifts assigned yet. Click "Assign New Shift" to start.</p>
                ) : (
                    <div className="space-y-3">
                        {shifts.sort((a,b) => new Date(a.shiftDate) - new Date(b.shiftDate)).map(shift => (
                            <Card 
                                key={shift.id} 
                                className="p-3 shadow-sm hover:shadow-md transition-shadow"
                                draggable 
                                onDragStart={(e) => handleDragStart(e, shift)}
                                onDragOver={handleDragOver} // Mock drop target
                                onDrop={(e) => handleDrop(e, new Date(), shift.staffId)} // Mock drop target
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold">{shift.staffName} <span className="text-xs text-muted-foreground">({mockStaff.find(s=>s.id === shift.staffId)?.role})</span></p>
                                        <p className="text-sm text-muted-foreground">{new Date(shift.shiftDate).toLocaleDateString()} - {shift.shiftType}</p>
                                        <p className="text-xs text-gray-500">Site: {shift.siteName}</p>
                                        {shift.notes && <p className="text-xs italic text-gray-500 mt-1">Notes: {shift.notes}</p>}
                                    </div>
                                    <div className="space-x-1">
                                        <Button variant="ghost" size="icon" onClick={() => openEditModal(shift)} title="Edit Shift"><Edit className="h-4 w-4"/></Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteShift(shift.id)} title="Delete Shift"><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </CardContent>
          </Card>
          
           <Dialog open={isModalOpen} onOpenChange={(open) => { if(!open) { setEditingShift(null); } setIsModalOpen(open); }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingShift ? 'Edit Shift' : 'Assign New Shift'}</DialogTitle>
                        <DialogDescription>Fill in the details for the staff shift.</DialogDescription>
                    </DialogHeader>
                    <ShiftForm onSubmit={handleSaveShift} initialData={editingShift || {}} onCancel={() => {setIsModalOpen(false); setEditingShift(null);}}/>
                </DialogContent>
            </Dialog>

        </motion.div>
      );
    };

    export default ShiftManagement;