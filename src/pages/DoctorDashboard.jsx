import React, { useState } from 'react';
    import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card.jsx';
    import { Input } from '@/components/ui/input.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { Search, User, ListChecks, CalendarClock, AlertTriangle, Pill, QrCode } from 'lucide-react';
    import useLocalStorage from '@/hooks/useLocalStorage.jsx';
    import { Link, useNavigate } from 'react-router-dom';
    import { motion } from 'framer-motion';
    import { format, parseISO } from 'date-fns';
    import { useToast } from '@/components/ui/use-toast.jsx';

    const DoctorDashboard = () => {
      const [patients] = useLocalStorage('patients', []);
      const [searchTerm, setSearchTerm] = useState('');
      const [searchedPatient, setSearchedPatient] = useState(null);
      const [searchError, setSearchError] = useState('');
      const navigate = useNavigate();
      const { toast } = useToast();

      const handleSearch = () => {
        setSearchError('');
        setSearchedPatient(null);
        if (!searchTerm.trim()) {
          setSearchError('Please enter a Patient ID, National ID, Passport No. or scan QR.');
          return;
        }
        const foundPatient = patients.find(
          (p) =>
            p.id.toLowerCase() === searchTerm.toLowerCase() ||
            (p.nationalId && p.nationalId.toLowerCase() === searchTerm.toLowerCase()) ||
            (p.passportNumber && p.passportNumber.toLowerCase() === searchTerm.toLowerCase()) ||
            p.qrCodeValue === searchTerm 
        );

        if (foundPatient) {
          setSearchedPatient(foundPatient);
        } else {
          setSearchError('No patient found with the provided details.');
        }
      };
      
      const dailyAppointments = [
        { id: "APP001", time: "2025-05-12T09:00:00Z", patientName: "Ali Ahmed", patientId: "P001", reason: "Routine Checkup", status: "Upcoming" },
        { id: "APP002", time: "2025-05-12T10:30:00Z", patientName: "Fatima Khan", patientId: "P002", reason: "Fever and Cough", status: "Upcoming" },
        { id: "APP003", time: "2025-05-12T14:00:00Z", patientName: "Omar Hassan", patientId: "P003", reason: "Follow-up", status: "Completed" },
        { id: "APP004", time: "2025-05-12T15:30:00Z", patientName: "Layla Ibrahim", patientId: "P004", reason: "Prescription Refill", status: "Upcoming" },
      ].sort((a, b) => new Date(a.time) - new Date(b.time));

      const handleScanQrCode = () => {
        toast({
            title: "Scan QR Code",
            description: "QR code scanning functionality is a placeholder. Please enter ID manually.",
        });
      };

      return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
        >
          <Card className="shadow-lg border-t-4 border-primary">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
              <CardTitle className="text-xl font-semibold text-primary flex items-center">
                <User className="mr-2 h-6 w-6" /> Doctor's Dashboard
              </CardTitle>
              <CardDescription>Access patient data and manage daily tasks.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row gap-2 items-center">
                <Input
                  type="text"
                  placeholder="Search by Patient ID, National ID, Passport No."
                  className="flex-grow"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleScanQrCode} variant="outline" className="w-full sm:w-auto">
                    <QrCode className="mr-2 h-4 w-4" /> Scan QR
                </Button>
                <Button onClick={handleSearch} className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white w-full sm:w-auto">
                  <Search className="mr-2 h-4 w-4" /> Search Patient
                </Button>
              </div>

              {searchError && <p className="text-sm text-destructive">{searchError}</p>}

              {searchedPatient && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ duration: 0.3 }}>
                  <Card className="mt-4 bg-slate-50 shadow-md border-l-4 border-blue-500">
                    <CardHeader>
                      <CardTitle className="text-lg text-primary">{searchedPatient.fullName}</CardTitle>
                      <CardDescription>Patient ID: {searchedPatient.id}</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <p><strong>National ID:</strong> {searchedPatient.nationalId || 'N/A'}</p>
                      <p><strong>Passport No:</strong> {searchedPatient.passportNumber || 'N/A'}</p>
                      <p><strong>Mobile:</strong> {searchedPatient.mobileNumber}</p>
                      <p><strong>Camp:</strong> {searchedPatient.campLocation}</p>
                      <p><strong>Insurance:</strong> {searchedPatient.insuranceProvider} ({searchedPatient.insurancePolicyNumber})</p>
                      {searchedPatient.insuranceExpiryDate && 
                        <p className={new Date(searchedPatient.insuranceExpiryDate) < new Date() ? "text-destructive font-semibold flex items-center" : "flex items-center"}>
                          <strong>Insurance Expiry:</strong> {format(new Date(searchedPatient.insuranceExpiryDate), 'PPP')}
                          {new Date(searchedPatient.insuranceExpiryDate) < new Date() && <AlertTriangle className="inline ml-1 h-4 w-4" />}
                        </p>
                      }
                    </CardContent>
                    <div className="p-4 border-t flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                       <Link to={`/patients/${searchedPatient.id}`}>
                        <Button variant="outline" size="sm" className="w-full sm:w-auto">View Full Profile</Button>
                      </Link>
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                        onClick={() => navigate(`/patients/${searchedPatient.id}?tab=prescriptions`)}
                      >
                        <Pill className="mr-2 h-4 w-4" /> Add Prescription/Note
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg border-t-4 border-accent">
            <CardHeader className="bg-gradient-to-r from-accent/10 to-blue-500/5">
              <CardTitle className="text-lg font-semibold flex items-center"><ListChecks className="mr-2 h-5 w-5 text-accent"/> Daily Patient List</CardTitle>
              <CardDescription>Overview of today's appointments and consultations for {format(new Date(), 'PPP')}.</CardDescription>
            </CardHeader>
            <CardContent className="max-h-[400px] overflow-y-auto">
                {dailyAppointments.length > 0 ? (
                    <ul className="space-y-3 pr-2">
                        {dailyAppointments.map((appt) => (
                            <motion.li 
                                key={appt.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3 }}
                                className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-slate-50 rounded-md shadow-sm hover:bg-slate-100 transition-colors border-l-4 border-slate-300 hover:border-primary"
                            >
                                <div className="flex items-center mb-2 sm:mb-0">
                                    <CalendarClock className="h-5 w-5 mr-3 text-primary flex-shrink-0"/>
                                    <div>
                                        <Link to={`/patients/${appt.patientId}`} className="font-semibold text-primary hover:underline">{appt.patientName}</Link>
                                        <p className="text-xs text-muted-foreground">{appt.reason}</p>
                                    </div>
                                </div>
                                <div className="text-left sm:text-right w-full sm:w-auto">
                                    <p className="text-sm font-medium">{format(parseISO(appt.time), 'p')}</p>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${appt.status === "Upcoming" ? "bg-yellow-200 text-yellow-800" : "bg-green-200 text-green-800"}`}>
                                        {appt.status}
                                    </span>
                                </div>
                            </motion.li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-muted-foreground text-center py-4">No appointments scheduled for today.</p>
                )}
            </CardContent>
          </Card>
        </motion.div>
      );
    };

    export default DoctorDashboard;