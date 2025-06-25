import React, { useState } from 'react';
    import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { Input } from '@/components/ui/input.jsx';
    import { Label } from '@/components/ui/label.jsx';
    import { Textarea } from '@/components/ui/textarea.jsx';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.jsx";
    import { Bus as Ambulance, UserCircle, MapPin, AlertTriangle, ListChecks, Send, Clock } from 'lucide-react';
    import { motion } from 'framer-motion';
    import { useToast } from '@/components/ui/use-toast.jsx';
    import useLocalStorage from '@/hooks/useLocalStorage.jsx';

    const mockAmbulances = [
      { id: "AMB001", driver: "Ahmed Ali", status: "Available", location: "Camp A" },
      { id: "AMB002", driver: "Fatima Khan", status: "On-Route", location: "Near Site B" },
      { id: "AMB003", driver: "Yusuf Ibrahim", status: "Unavailable", location: "Maintenance" },
    ];

    const mockActiveDispatches = [
      { id: "DISP701", patientId: "P001", patientName: "John Doe", pickup: "Camp Alpha", destination: "City Hospital", ambulanceId: "AMB002", status: "En Route", driver: "Fatima Khan", requestedAt: "10:30 AM" },
      { id: "DISP702", patientId: "P002", patientName: "Jane Smith", pickup: "Site Gamma", destination: "Central Clinic", ambulanceId: "AMB004", status: "Pending Assignment", driver: "N/A", requestedAt: "10:45 AM" },
    ];

    const AmbulanceDispatch = () => {
      const { toast } = useToast();
      const [patients] = useLocalStorage('patients', []);
      const [activeDispatches, setActiveDispatches] = useLocalStorage('activeDispatches', mockActiveDispatches);
      
      const [patientId, setPatientId] = useState('');
      const [pickupLocation, setPickupLocation] = useState('');
      const [destination, setDestination] = useState('');
      const [caseSeverity, setCaseSeverity] = useState('');
      const [notes, setNotes] = useState('');

      const handleRequestAmbulance = (e) => {
        e.preventDefault();
        if (!patientId || !pickupLocation || !destination || !caseSeverity) {
          toast({
            variant: "destructive",
            title: "Missing Information",
            description: "Please fill in all required fields for ambulance request.",
          });
          return;
        }

        const patientExists = patients.some(p => p.id === patientId);
        if (!patientExists && !patientId.startsWith("TEMP-")) { // Allow temporary IDs for non-registered emergencies
             toast({
                variant: "destructive",
                title: "Invalid Patient ID",
                description: `Patient ID ${patientId} not found. For unregistered emergencies, use a temporary ID like TEMP-Emergency.`,
            });
            return;
        }

        const newDispatch = {
            id: `DISP${Math.floor(Math.random() * 1000) + 700}`,
            patientId,
            patientName: patients.find(p => p.id === patientId)?.fullName || "Emergency Case",
            pickup: pickupLocation,
            destination,
            ambulanceId: "Pending",
            status: "Pending Assignment",
            driver: "N/A",
            requestedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            notes,
            caseSeverity
        };
        setActiveDispatches(prev => [newDispatch, ...prev]);

        toast({
          title: "Ambulance Requested",
          description: `Request for patient ${patientId} has been submitted.`,
          className: "bg-green-500 text-white",
        });
        setPatientId('');
        setPickupLocation('');
        setDestination('');
        setCaseSeverity('');
        setNotes('');
      };

      return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
        >
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
                    <Label htmlFor="patientId">Patient ID / Temp ID</Label>
                    <Input id="patientId" value={patientId} onChange={(e) => setPatientId(e.target.value)} placeholder="e.g., P001 or TEMP-Emergency" />
                  </div>
                  <div>
                    <Label htmlFor="pickupLocation">Pickup Location</Label>
                    <Input id="pickupLocation" value={pickupLocation} onChange={(e) => setPickupLocation(e.target.value)} placeholder="e.g., Camp Alpha, Site Office" />
                  </div>
                  <div>
                    <Label htmlFor="destination">Destination Facility</Label>
                    <Input id="destination" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="e.g., City Hospital, Central Clinic" />
                  </div>
                  <div>
                    <Label htmlFor="caseSeverity">Case Severity</Label>
                     <Select value={caseSeverity} onValueChange={setCaseSeverity}>
                        <SelectTrigger id="caseSeverity">
                            <SelectValue placeholder="Select severity" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="critical">Critical</SelectItem>
                            <SelectItem value="serious">Serious</SelectItem>
                            <SelectItem value="moderate">Moderate</SelectItem>
                            <SelectItem value="minor">Minor</SelectItem>
                        </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="notes">Additional Notes (Optional)</Label>
                    <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g., Patient unconscious, suspected fracture" />
                  </div>
                </CardContent>
                <CardFooter className="p-6">
                  <Button type="submit" className="w-full bg-gradient-to-r from-accent to-amber-600 hover:from-accent/90 hover:to-amber-600/90 text-white">
                    <Ambulance className="mr-2 h-4 w-4" /> Submit Request
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
              <CardContent className="p-6 space-y-4">
                {activeDispatches.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                        <Ambulance className="mx-auto h-12 w-12 mb-2 text-gray-400" />
                        <p>No active dispatches at the moment.</p>
                    </div>
                ) : (
                    activeDispatches.map(dispatch => (
                    <motion.div
                        key={dispatch.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="p-4 border rounded-lg shadow-sm bg-slate-50 hover:shadow-md transition-shadow"
                    >
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
                        <h3 className="font-semibold text-primary text-lg">{dispatch.patientName} <span className="text-sm text-muted-foreground">(ID: {dispatch.patientId})</span></h3>
                        <span className={`px-2 py-1 text-xs rounded-full font-medium
                            ${dispatch.status === "En Route" ? "bg-blue-100 text-blue-700" : 
                            dispatch.status === "Pending Assignment" ? "bg-yellow-100 text-yellow-700" :
                            dispatch.status === "Completed" ? "bg-green-100 text-green-700" :
                            "bg-gray-100 text-gray-700"}`}>
                            {dispatch.status}
                        </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-sm">
                        <p className="flex items-center"><MapPin className="h-4 w-4 mr-2 text-muted-foreground" /> <strong>From:</strong> {dispatch.pickup}</p>
                        <p className="flex items-center"><MapPin className="h-4 w-4 mr-2 text-muted-foreground" /> <strong>To:</strong> {dispatch.destination}</p>
                        <p className="flex items-center"><Ambulance className="h-4 w-4 mr-2 text-muted-foreground" /> <strong>Ambulance:</strong> {dispatch.ambulanceId}</p>
                        <p className="flex items-center"><UserCircle className="h-4 w-4 mr-2 text-muted-foreground" /> <strong>Driver:</strong> {dispatch.driver}</p>
                        <p className="flex items-center"><Clock className="h-4 w-4 mr-2 text-muted-foreground" /> <strong>Requested:</strong> {dispatch.requestedAt}</p>
                        {dispatch.notes && <p className="md:col-span-2 mt-1 text-xs text-gray-600"><strong>Notes:</strong> {dispatch.notes}</p>}
                        </div>
                        <div className="mt-3 flex justify-end space-x-2">
                            <Button variant="outline" size="sm">Track</Button>
                            <Button variant="ghost" size="sm" className="text-amber-600 hover:text-amber-700 hover:bg-amber-100">Update Status</Button>
                        </div>
                    </motion.div>
                    ))
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center"><Ambulance className="mr-2 h-5 w-5 text-gray-600"/> Available Ambulances</CardTitle>
              <CardDescription>Overview of ambulance fleet status.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mockAmbulances.map(amb => (
                        <div key={amb.id} className={`p-4 rounded-lg border ${amb.status === "Available" ? "bg-green-50 border-green-200" : amb.status === "On-Route" ? "bg-blue-50 border-blue-200" : "bg-red-50 border-red-200"}`}>
                            <div className="flex justify-between items-center">
                                <p className="font-semibold text-gray-800">{amb.id}</p>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                    amb.status === "Available" ? "bg-green-200 text-green-800" : 
                                    amb.status === "On-Route" ? "bg-blue-200 text-blue-800" : 
                                    "bg-red-200 text-red-800"
                                }`}>{amb.status}</span>
                            </div>
                            <p className="text-sm text-gray-600">Driver: {amb.driver}</p>
                            <p className="text-sm text-gray-500">Location: {amb.location}</p>
                        </div>
                    ))}
                </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center"><MapPin className="mr-2 h-5 w-5 text-gray-600"/> Live Map Tracking (Placeholder)</CardTitle>
              <CardDescription>Real-time GPS tracking of active ambulances.</CardDescription>
            </CardHeader>
            <CardContent className="h-64 bg-slate-200 flex items-center justify-center rounded-md">
              <p className="text-muted-foreground">Map integration will be here (OpenStreetMap).</p>
            </CardContent>
          </Card>

        </motion.div>
      );
    };

    export default AmbulanceDispatch;