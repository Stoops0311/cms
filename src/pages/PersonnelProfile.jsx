import React, { useEffect, useState } from 'react';
    import { useParams, Link, useNavigate } from 'react-router-dom';
    import { motion } from 'framer-motion';
    import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.jsx';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.jsx";
    import { User, Briefcase, FileText, ShieldCheck, QrCode, Edit, ArrowLeft, AlertTriangle, CheckCircle } from 'lucide-react';
    import useLocalStorage from '@/hooks/useLocalStorage.jsx';
    import { format, parseISO, differenceInDays, isValid } from 'date-fns';

    const DetailItem = ({ label, value, icon: Icon }) => (
      <div className="flex items-start space-x-3 py-2">
        {Icon && <Icon className="h-5 w-5 text-primary mt-1 flex-shrink-0" />}
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="font-medium text-gray-800">{value || 'N/A'}</p>
        </div>
      </div>
    );
    
    const DocumentStatus = ({ expiryDateStr }) => {
        if (!expiryDateStr) return <span className="text-xs text-gray-500">N/A</span>;
        const expiryDate = parseISO(expiryDateStr);
        if (!isValid(expiryDate)) return <span className="text-xs text-gray-500">Invalid Date</span>;
        
        const daysLeft = differenceInDays(expiryDate, new Date());

        if (daysLeft < 0) return <span className="text-xs text-red-600 font-semibold flex items-center"><AlertTriangle className="h-3 w-3 mr-1"/>Expired</span>;
        if (daysLeft <= 30) return <span className="text-xs text-orange-500 flex items-center"><AlertTriangle className="h-3 w-3 mr-1"/>Expires in {daysLeft}d</span>;
        return <span className="text-xs text-green-600 flex items-center"><CheckCircle className="h-3 w-3 mr-1"/>Valid</span>;
    };


    const PersonnelProfile = () => {
      const { staffId } = useParams();
      const navigate = useNavigate();
      const [personnelList] = useLocalStorage('personnelList', []);
      const [staff, setStaff] = useState(null);

      useEffect(() => {
        const foundStaff = personnelList.find(p => p.id === staffId);
        if (foundStaff) {
          setStaff(foundStaff);
        } else {
          // Handle staff not found, maybe redirect or show error
          navigate('/personnel-dashboard'); 
        }
      }, [staffId, personnelList, navigate]);

      if (!staff) {
        return <div className="flex justify-center items-center h-screen"><p>Loading staff profile...</p></div>;
      }

      const getInitials = (name) => {
        if (!name) return '??';
        const names = name.split(' ');
        if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
      };
      
      const dobFormatted = staff.dob ? format(parseISO(staff.dob), 'dd MMMM yyyy') : 'N/A';

      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <Card className="shadow-xl border-t-4 border-primary overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-blue-600/10 p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20 border-2 border-primary shadow-md">
                    <AvatarImage src={staff.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(staff.fullName)}&background=random&size=128`} alt={staff.fullName} />
                    <AvatarFallback className="text-2xl bg-primary/20 text-primary font-semibold">{getInitials(staff.fullName)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-3xl font-bold text-primary">{staff.fullName}</CardTitle>
                    <CardDescription className="text-md text-gray-600">{staff.role} - {staff.department}</CardDescription>
                    <p className="text-sm text-muted-foreground mt-1">Staff ID: {staff.id}</p>
                  </div>
                </div>
                <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                    <Link to={`/personnel-registration/${staff.id}`}>
                        <Button variant="outline" className="w-full sm:w-auto"><Edit className="mr-2 h-4 w-4" /> Edit Profile</Button>
                    </Link>
                    <Button variant="outline" onClick={() => navigate('/personnel-dashboard')} className="w-full sm:w-auto"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 rounded-none border-b">
                  <TabsTrigger value="overview" className="py-3"><User className="mr-2 h-4 w-4" />Overview</TabsTrigger>
                  <TabsTrigger value="employment" className="py-3"><Briefcase className="mr-2 h-4 w-4" />Employment</TabsTrigger>
                  <TabsTrigger value="documents" className="py-3"><FileText className="mr-2 h-4 w-4" />Documents</TabsTrigger>
                  <TabsTrigger value="system" className="py-3"><ShieldCheck className="mr-2 h-4 w-4" />System Access</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="p-6 space-y-4">
                  <Card>
                    <CardHeader><CardTitle className="text-xl">Personal Information</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1">
                      <DetailItem label="Full Name" value={staff.fullName} />
                      <DetailItem label="Date of Birth" value={dobFormatted} />
                      <DetailItem label="Gender" value={staff.gender} />
                      <DetailItem label="Nationality" value={staff.nationality} />
                      <DetailItem label="Mobile Number" value={staff.mobileNumber} />
                      <DetailItem label="Email Address" value={staff.email} />
                      <DetailItem label="Address" value={staff.address} className="md:col-span-2 lg:col-span-3" />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="employment" className="p-6 space-y-4">
                  <Card>
                    <CardHeader><CardTitle className="text-xl">Employment Details</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                      <DetailItem label="Role/Designation" value={staff.role} />
                      <DetailItem label="Department/Unit" value={staff.department} />
                      <DetailItem label="Assigned Location" value={staff.assignedLocation} />
                      <DetailItem label="Onboarding Status" value={staff.onboardingStatus} />
                      <DetailItem label="Account Status" value={staff.status} />
                       {staff.status === "Archived" && <DetailItem label="Archive Reason" value={staff.archiveReason || 'N/A'} />}
                       {staff.status === "Archived" && staff.archiveDate && <DetailItem label="Archive Date" value={format(parseISO(staff.archiveDate), 'dd MMM yyyy')} />}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="documents" className="p-6 space-y-4">
                  <Card>
                    <CardHeader><CardTitle className="text-xl">Uploaded Documents</CardTitle></CardHeader>
                    <CardContent>
                      {staff.documents && staff.documents.length > 0 ? (
                        <ul className="space-y-3">
                          {staff.documents.map(doc => (
                            <li key={doc.id || doc.number} className="p-3 border rounded-md flex justify-between items-center hover:bg-slate-50 transition-colors">
                              <div>
                                <p className="font-semibold">{doc.type}: <span className="font-normal">{doc.number}</span></p>
                                <p className="text-sm text-gray-600">
                                  Expiry: {doc.expiryDate ? format(parseISO(doc.expiryDate), 'dd MMM yyyy') : 'N/A'}
                                  {doc.fileName && <span className="ml-2 text-blue-600 italic">(File: {doc.fileName})</span>}
                                </p>
                              </div>
                              <DocumentStatus expiryDateStr={doc.expiryDate} />
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted-foreground">No documents uploaded for this staff member.</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="system" className="p-6 space-y-4">
                  <Card>
                    <CardHeader><CardTitle className="text-xl">System & Access</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                      <DetailItem label="System Staff ID" value={staff.id} />
                      <DetailItem label="Role-Based Access" value={`${staff.role} Permissions (Simulated)`} />
                       <div className="md:col-span-2">
                         <p className="text-sm text-muted-foreground mb-1">QR Code (for Attendance/ID)</p>
                         <div className="p-4 border rounded-md bg-white inline-flex flex-col items-center shadow">
                            <img  class="h-32 w-32" alt={`QR Code for ${staff.fullName}`} src="https://images.unsplash.com/photo-1559137781-875af01c14bc" />
                            <p className="text-xs mt-2 text-gray-600">{staff.qrCode}</p>
                         </div>
                       </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="p-6 border-t">
                <p className="text-xs text-muted-foreground">Profile last updated: {staff.lastUpdated ? format(parseISO(staff.lastUpdated), 'dd MMM yyyy, p') : 'N/A'}</p>
            </CardFooter>
          </Card>
        </motion.div>
      );
    };

    export default PersonnelProfile;