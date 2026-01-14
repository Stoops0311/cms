import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.jsx";
import { Bus as Ambulance, UserCircle, MapPin, ListChecks, Send, Clock, Loader2, PlusCircle, Wrench } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast.jsx';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog.jsx';

const AmbulanceForm = ({ onSubmit, onCancel, isSubmitting }) => {
  const [vehicleId, setVehicleId] = useState('');
  const [driver, setDriver] = useState('');
  const [currentLocation, setCurrentLocation] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!vehicleId) {
      toast({ variant: "destructive", title: "Missing fields", description: "Vehicle ID is required." });
      return;
    }
    onSubmit({
      vehicleId,
      driver: driver || undefined,
      currentLocation: currentLocation || undefined,
      status: "Available",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="vehicleId">Vehicle ID</Label>
        <Input id="vehicleId" value={vehicleId} onChange={e => setVehicleId(e.target.value)} placeholder="e.g., AMB001" />
      </div>
      <div>
        <Label htmlFor="driver">Driver Name (Optional)</Label>
        <Input id="driver" value={driver} onChange={e => setDriver(e.target.value)} placeholder="Driver name" />
      </div>
      <div>
        <Label htmlFor="currentLocation">Current Location (Optional)</Label>
        <Input id="currentLocation" value={currentLocation} onChange={e => setCurrentLocation(e.target.value)} placeholder="e.g., Camp A" />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Add Ambulance
        </Button>
      </DialogFooter>
    </form>
  );
};

const AmbulanceDispatch = () => {
  const { toast } = useToast();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [patientId, setPatientId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedAmbulanceId, setSelectedAmbulanceId] = useState('');
  const [notes, setNotes] = useState('');

  // Convex queries
  const ambulances = useQuery(api.ambulances.listAmbulances, {});
  const availableAmbulances = useQuery(api.ambulances.getAvailableAmbulances, {});
  const activeDispatches = useQuery(api.ambulances.getActiveDispatches, {});
  const stats = useQuery(api.ambulances.getAmbulanceStats, {});
  const users = useQuery(api.admin.listUsers, { isActive: true });

  // Convex mutations
  const createAmbulance = useMutation(api.ambulances.createAmbulance);
  const createDispatch = useMutation(api.ambulances.createDispatch);
  const dispatchAmbulance = useMutation(api.ambulances.dispatchAmbulance);
  const completeDispatch = useMutation(api.ambulances.completeDispatch);
  const cancelDispatch = useMutation(api.ambulances.cancelDispatch);
  const updateAmbulance = useMutation(api.ambulances.updateAmbulance);

  // Get current user
  const currentUser = users?.find(u => u.role === 'admin') || users?.[0];

  const handleAddAmbulance = async (data) => {
    if (!currentUser) {
      toast({ variant: "destructive", title: "Error", description: "No user found." });
      return;
    }
    setIsSubmitting(true);
    try {
      await createAmbulance({
        ...data,
        createdBy: currentUser._id,
      });
      toast({ title: "Ambulance Added", description: `${data.vehicleId} has been added to the fleet.` });
      setIsAddModalOpen(false);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to add ambulance." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestAmbulance = async (e) => {
    e.preventDefault();
    if (!pickupLocation || !destination || !selectedAmbulanceId) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in pickup, destination, and select an ambulance.",
      });
      return;
    }

    if (!currentUser) {
      toast({ variant: "destructive", title: "Error", description: "No user found." });
      return;
    }

    setIsSubmitting(true);
    try {
      const dispatchId = await createDispatch({
        ambulanceId: selectedAmbulanceId,
        patientId: patientId || undefined,
        patientName: patientName || "Emergency Case",
        pickupLocation,
        destination,
        notes: notes || undefined,
        createdBy: currentUser._id,
      });

      // Automatically dispatch
      await dispatchAmbulance({ dispatchId });

      toast({
        title: "Ambulance Dispatched",
        description: `Ambulance has been dispatched to ${pickupLocation}.`,
        className: "bg-green-500 text-white",
      });

      // Reset form
      setPatientId('');
      setPatientName('');
      setPickupLocation('');
      setDestination('');
      setSelectedAmbulanceId('');
      setNotes('');
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to dispatch ambulance." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteDispatch = async (dispatchId) => {
    try {
      await completeDispatch({ dispatchId });
      toast({ title: "Dispatch Completed", description: "Ambulance is now available." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to complete dispatch." });
    }
  };

  const handleCancelDispatch = async (dispatchId) => {
    if (window.confirm("Are you sure you want to cancel this dispatch?")) {
      try {
        await cancelDispatch({ dispatchId });
        toast({ title: "Dispatch Cancelled", variant: "destructive" });
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: error.message || "Failed to cancel dispatch." });
      }
    }
  };

  const handleSetMaintenance = async (ambulanceId, currentStatus) => {
    try {
      await updateAmbulance({
        id: ambulanceId,
        status: currentStatus === 'Maintenance' ? 'Available' : 'Maintenance',
      });
      toast({ title: "Status Updated", description: `Ambulance status changed.` });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to update status." });
    }
  };

  const isLoading = ambulances === undefined || activeDispatches === undefined;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-800 border-green-200';
      case 'Dispatched': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Maintenance': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Off Duty': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDispatchStatusColor = (status) => {
    switch (status) {
      case 'Requested': return 'bg-yellow-100 text-yellow-700';
      case 'Dispatched': return 'bg-blue-100 text-blue-700';
      case 'In Transit': return 'bg-purple-100 text-purple-700';
      case 'Completed': return 'bg-green-100 text-green-700';
      case 'Cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 border-l-4 border-green-500">
            <div className="text-sm text-muted-foreground">Available</div>
            <div className="text-2xl font-bold text-green-600">{stats.fleet.available}</div>
          </Card>
          <Card className="p-4 border-l-4 border-blue-500">
            <div className="text-sm text-muted-foreground">Dispatched</div>
            <div className="text-2xl font-bold text-blue-600">{stats.fleet.dispatched}</div>
          </Card>
          <Card className="p-4 border-l-4 border-yellow-500">
            <div className="text-sm text-muted-foreground">Maintenance</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.fleet.maintenance}</div>
          </Card>
          <Card className="p-4 border-l-4 border-purple-500">
            <div className="text-sm text-muted-foreground">Today's Trips</div>
            <div className="text-2xl font-bold text-purple-600">{stats.dispatches.today}</div>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 shadow-lg border-t-4 border-accent">
          <CardHeader className="bg-gradient-to-r from-accent/10 to-amber-500/10">
            <CardTitle className="text-xl font-semibold text-accent flex items-center">
              <Send className="mr-2 h-6 w-6" /> Request Ambulance
            </CardTitle>
            <CardDescription>Dispatch an ambulance for a patient.</CardDescription>
          </CardHeader>
          <form onSubmit={handleRequestAmbulance}>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label htmlFor="patientId">Patient ID (Optional)</Label>
                <Input id="patientId" value={patientId} onChange={(e) => setPatientId(e.target.value)} placeholder="e.g., P001" />
              </div>
              <div>
                <Label htmlFor="patientName">Patient Name</Label>
                <Input id="patientName" value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder="Patient name" />
              </div>
              <div>
                <Label htmlFor="pickupLocation">Pickup Location *</Label>
                <Input id="pickupLocation" value={pickupLocation} onChange={(e) => setPickupLocation(e.target.value)} placeholder="e.g., Camp Alpha, Site Office" />
              </div>
              <div>
                <Label htmlFor="destination">Destination *</Label>
                <Input id="destination" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="e.g., City Hospital" />
              </div>
              <div>
                <Label htmlFor="ambulanceSelect">Select Ambulance *</Label>
                <Select value={selectedAmbulanceId} onValueChange={setSelectedAmbulanceId}>
                  <SelectTrigger id="ambulanceSelect">
                    <SelectValue placeholder="Select available ambulance" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAmbulances?.map(amb => (
                      <SelectItem key={amb._id} value={amb._id}>
                        {amb.vehicleId} - {amb.driver || 'No driver'}
                      </SelectItem>
                    ))}
                    {availableAmbulances?.length === 0 && (
                      <SelectItem value="" disabled>No ambulances available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g., Patient unconscious" />
              </div>
            </CardContent>
            <CardFooter className="p-6">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-accent to-amber-600 hover:from-accent/90 hover:to-amber-600/90 text-white"
                disabled={isSubmitting || !selectedAmbulanceId}
              >
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Ambulance className="mr-2 h-4 w-4" />}
                Dispatch Ambulance
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card className="lg:col-span-2 shadow-lg border-t-4 border-primary">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-blue-500/10">
            <CardTitle className="text-xl font-semibold text-primary flex items-center">
              <ListChecks className="mr-2 h-6 w-6" /> Active Dispatches
            </CardTitle>
            <CardDescription>Monitor ongoing ambulance activities.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4 max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : activeDispatches?.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Ambulance className="mx-auto h-12 w-12 mb-2 text-gray-400" />
                <p>No active dispatches at the moment.</p>
              </div>
            ) : (
              activeDispatches?.map(dispatch => (
                <motion.div
                  key={dispatch._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 border rounded-lg shadow-sm bg-slate-50 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
                    <h3 className="font-semibold text-primary text-lg">
                      {dispatch.patientName || 'Unknown Patient'}
                      {dispatch.patientId && <span className="text-sm text-muted-foreground ml-2">(ID: {dispatch.patientId})</span>}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${getDispatchStatusColor(dispatch.status)}`}>
                      {dispatch.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    <p className="flex items-center"><MapPin className="h-4 w-4 mr-2 text-muted-foreground" /><strong>From:</strong>&nbsp;{dispatch.pickupLocation}</p>
                    <p className="flex items-center"><MapPin className="h-4 w-4 mr-2 text-muted-foreground" /><strong>To:</strong>&nbsp;{dispatch.destination}</p>
                    <p className="flex items-center"><Ambulance className="h-4 w-4 mr-2 text-muted-foreground" /><strong>Ambulance:</strong>&nbsp;{dispatch.vehicleId}</p>
                    <p className="flex items-center"><UserCircle className="h-4 w-4 mr-2 text-muted-foreground" /><strong>Driver:</strong>&nbsp;{dispatch.driver || 'Unassigned'}</p>
                    <p className="flex items-center"><Clock className="h-4 w-4 mr-2 text-muted-foreground" /><strong>Requested:</strong>&nbsp;{new Date(dispatch.requestedAt).toLocaleTimeString()}</p>
                    {dispatch.notes && <p className="md:col-span-2 mt-1 text-xs text-gray-600"><strong>Notes:</strong> {dispatch.notes}</p>}
                  </div>
                  <div className="mt-3 flex justify-end space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleCompleteDispatch(dispatch._id)}>
                      Complete
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleCancelDispatch(dispatch._id)}>
                      Cancel
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center">
              <Ambulance className="mr-2 h-5 w-5 text-gray-600" /> Ambulance Fleet
            </CardTitle>
            <CardDescription>Overview of ambulance fleet status.</CardDescription>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)} disabled={!currentUser}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Ambulance
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ambulances?.map(amb => (
                <div key={amb._id} className={`p-4 rounded-lg border ${getStatusColor(amb.status)}`}>
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-gray-800">{amb.vehicleId}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(amb.status)}`}>
                      {amb.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Driver: {amb.driver || 'Unassigned'}</p>
                  <p className="text-sm text-gray-500">Location: {amb.currentLocation || 'Unknown'}</p>
                  <div className="mt-2 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetMaintenance(amb._id, amb.status)}
                      disabled={amb.status === 'Dispatched'}
                    >
                      <Wrench className="h-3 w-3 mr-1" />
                      {amb.status === 'Maintenance' ? 'Set Available' : 'Maintenance'}
                    </Button>
                  </div>
                </div>
              ))}
              {ambulances?.length === 0 && (
                <p className="text-muted-foreground col-span-full text-center py-4">No ambulances in fleet. Add one to get started.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Ambulance</DialogTitle>
          </DialogHeader>
          <AmbulanceForm
            onSubmit={handleAddAmbulance}
            onCancel={() => setIsAddModalOpen(false)}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default AmbulanceDispatch;
