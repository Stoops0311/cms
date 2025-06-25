import React, { useState, useMemo } from 'react';
    import useLocalStorage from '@/hooks/useLocalStorage.jsx';
    import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card.jsx';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { Eye, Edit, Trash2, Search, Users, Filter } from 'lucide-react';
    import { Input } from '@/components/ui/input.jsx';
    import { Label } from '@/components/ui/label.jsx';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
    import { motion } from 'framer-motion';
    import { Link } from 'react-router-dom';
    import { useToast } from '@/components/ui/use-toast.jsx';

    const campLocations = ["All Camps", "Camp Alpha Clinic", "Camp Beta Clinic", "Central Medical Facility", "Remote Site Gamma", "Unassigned"];

    const PatientsList = () => {
      const [patients, setPatients] = useLocalStorage('patients', []);
      const [searchTerm, setSearchTerm] = useState('');
      const [selectedCamp, setSelectedCamp] = useState('All Camps');
      const { toast } = useToast();

      const filteredPatients = useMemo(() => {
        return patients.filter(patient => {
          const matchesSearchTerm = (
            patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.nationalId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (patient.passportNumber && patient.passportNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
            patient.mobileNumber.includes(searchTerm) ||
            patient.id.toLowerCase().includes(searchTerm.toLowerCase())
          );
          const matchesCamp = selectedCamp === 'All Camps' || patient.campLocation === selectedCamp || (selectedCamp === 'Unassigned' && !patient.campLocation);
          return matchesSearchTerm && matchesCamp;
        });
      }, [patients, searchTerm, selectedCamp]);

      const handleDelete = (patientId) => {
        if (window.confirm("Are you sure you want to delete this patient record? This action cannot be undone.")) {
          const patientToDelete = patients.find(p => p.id === patientId);
          setPatients(prevPatients => prevPatients.filter(p => p.id !== patientId));
          toast({
            title: "Patient Deleted",
            description: `Patient ${patientToDelete?.fullName || patientId} has been removed.`,
            variant: "destructive",
          });
        }
      };
      
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <Card className="shadow-xl border-t-4 border-primary">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 rounded-t-lg">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <CardTitle className="text-2xl font-bold text-primary">Patient Records</CardTitle>
                  <CardDescription>Manage and view all registered patient information.</CardDescription>
                </div>
                <Button asChild className="mt-4 md:mt-0 bg-primary hover:bg-primary/90">
                  <Link to="/patient-registration">
                    <Users className="mr-2 h-4 w-4" /> Register New Patient
                  </Link>
                </Button>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input 
                    placeholder="Search by name, ID, passport, or mobile..."
                    className="pl-10 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="campFilter" className="sr-only">Filter by Camp</Label>
                  <Select value={selectedCamp} onValueChange={setSelectedCamp}>
                    <SelectTrigger id="campFilter" className="w-full">
                      <div className="flex items-center">
                        <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                        <SelectValue placeholder="Filter by Camp/Unit" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {campLocations.map(camp => (
                        <SelectItem key={camp} value={camp}>{camp}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {filteredPatients.length === 0 ? (
                <div className="text-center p-10 text-muted-foreground">
                  <Users className="mx-auto h-12 w-12 mb-4" />
                  <p className="text-lg font-semibold">No patient records found.</p>
                  <p>{searchTerm || selectedCamp !== 'All Camps' ? "Try adjusting your search or filter criteria." : "Register a new patient to get started."}</p>
                </div>
              ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient ID</TableHead>
                      <TableHead>Full Name</TableHead>
                      <TableHead>National ID</TableHead>
                      <TableHead>Mobile</TableHead>
                      <TableHead>Camp/Unit</TableHead>
                      <TableHead>Insurance</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients.map((patient) => (
                      <motion.tr 
                        key={patient.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="hover:bg-primary/5"
                      >
                        <TableCell className="font-medium text-xs">{patient.id}</TableCell>
                        <TableCell>{patient.fullName}</TableCell>
                        <TableCell>{patient.nationalId || 'N/A'}</TableCell>
                        <TableCell>{patient.mobileNumber}</TableCell>
                        <TableCell>{patient.campLocation || <span className="italic text-muted-foreground">Unassigned</span>}</TableCell>
                        <TableCell>{patient.insuranceProvider || 'N/A'}</TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button variant="ghost" size="icon" className="hover:text-primary" asChild title="View Details">
                            <Link to={`/patients/${patient.id}`}><Eye className="h-4 w-4" /></Link>
                          </Button>
                          <Button variant="ghost" size="icon" className="hover:text-accent-foreground" asChild title="Edit Patient">
                            <Link to={`/patient-registration?edit=${patient.id}`}><Edit className="h-4 w-4" /></Link>
                          </Button>
                          <Button variant="ghost" size="icon" className="hover:text-destructive" onClick={() => handleDelete(patient.id)} title="Delete Patient">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
              )}
            </CardContent>
             {filteredPatients.length > 0 && (
                <div className="p-4 border-t text-sm text-muted-foreground">
                    Showing {filteredPatients.length} of {patients.length} patients.
                </div>
            )}
          </Card>
        </motion.div>
      );
    };
    export default PatientsList;