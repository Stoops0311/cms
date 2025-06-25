import React, { useState, useMemo } from 'react';
    import { motion } from 'framer-motion';
    import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { Input } from '@/components/ui/input.jsx';
    import { Label } from '@/components/ui/label.jsx';
    import { Users, UserPlus, Filter, Grid, List } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast.jsx';
    import useLocalStorage from '@/hooks/useLocalStorage.jsx';
    import { Link } from 'react-router-dom';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog.jsx';
    import HRFilterControls from '@/components/hr/HRFilterControls.jsx';
    import PersonnelCard from '@/components/personnel/PersonnelCard.jsx';
    import PersonnelTable from '@/components/personnel/PersonnelTable.jsx';

    const MOCK_INITIAL_STAFF = [
      { id: "STAFF001", fullName: "Dr. Evelyn Reed", role: "Doctor", department: "Cardiology", mobileNumber: "0501234567", email: "e.reed@example.com", nationalId: "1098765432", passportNumber: "PA1234567", nationality: "American", dob: "1980-05-15", gender: "Female", address: "123 Health St, Riyadh", assignedLocation: "King Fahd Medical City", documents: [{ type: "Medical License", expiry: "2026-12-31", status: "valid" }, { type: "Passport", expiry: "2028-05-10", status: "valid" }], status: "Active", onboardingStatus: "Completed" },
      { id: "STAFF002", fullName: "Nurse Kenji Tanaka", role: "Nurse", department: "Pediatrics", mobileNumber: "0502345678", email: "k.tanaka@example.com", nationalId: "2087654321", passportNumber: "PB2345678", nationality: "Japanese", dob: "1992-11-20", gender: "Male", address: "456 Care Ave, Riyadh", assignedLocation: "Childrens Hospital", documents: [{ type: "Medical License", expiry: "2025-08-20", status: "valid" }, { type: "Iqama", expiry: "2025-07-15", status: "expiring_soon" }], status: "Active", onboardingStatus: "Pending Document Verification" },
      { id: "STAFF003", fullName: "Ambulance Driver Fatima Al-Salem", role: "Driver", department: "Emergency Services", mobileNumber: "0503456789", email: "", nationalId: "3076543210", passportNumber: "PC3456789", nationality: "Saudi Arabian", dob: "1988-02-10", gender: "Female", address: "789 Rescue Rd, Riyadh", assignedLocation: "Central Dispatch", documents: [{ type: "Driving License", expiry: "2025-01-05", status: "expiring_soon" }, { type: "Iqama", expiry: "2024-11-30", status: "expired" }], status: "Active", onboardingStatus: "Completed" },
    ];

    const PersonnelManagementDashboard = () => {
      const { toast } = useToast();
      const [staffList, setStaffList] = useLocalStorage('personnelList', MOCK_INITIAL_STAFF);
      const [filters, setFilters] = useState({ role: 'all', status: 'all', searchTerm: '' });
      const [archiveReason, setArchiveReason] = useState('');
      const [staffToArchive, setStaffToArchive] = useState(null);
      const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
      const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

      const roles = ["Doctor", "Nurse", "Driver", "Pharmacist", "Admin", "Paramedic", "Facility Manager"];
      const statuses = ["Active", "Archived", "Onboarding"];
      
      const filteredStaff = useMemo(() => {
        return staffList.filter(staff => {
          const roleMatch = filters.role === 'all' || staff.role === filters.role;
          const statusMatch = filters.status === 'all' || staff.status === filters.status;
          
          let searchMatch = true;
          if (filters.searchTerm) {
            const term = filters.searchTerm.toLowerCase();
            searchMatch = 
              staff.fullName.toLowerCase().includes(term) ||
              staff.id.toLowerCase().includes(term) ||
              staff.role.toLowerCase().includes(term) ||
              staff.department.toLowerCase().includes(term) ||
              staff.nationalId.toLowerCase().includes(term) ||
              (staff.passportNumber && staff.passportNumber.toLowerCase().includes(term));
          }
          return roleMatch && statusMatch && searchMatch;
        }).sort((a,b) => a.fullName.localeCompare(b.fullName));
      }, [staffList, filters]);

      const handleArchiveStaff = () => {
        if (!staffToArchive || !archiveReason) {
            toast({ variant: "destructive", title: "Error", description: "Reason for archiving is required." });
            return;
        }
        setStaffList(prevList => prevList.map(staff => 
            staff.id === staffToArchive.id ? { ...staff, status: "Archived", archiveReason, archiveDate: new Date().toISOString() } : staff
        ));
        toast({ title: "Staff Archived", description: `${staffToArchive.fullName} has been archived. Reason: ${archiveReason}`, className: "bg-orange-500 text-white" });
        setStaffToArchive(null);
        setArchiveReason('');
        setIsArchiveDialogOpen(false);
      };

      const openArchiveDialog = (staff) => {
        setStaffToArchive(staff);
        setIsArchiveDialogOpen(true);
      };
      
      const closeArchiveDialog = () => {
        setStaffToArchive(null);
        setArchiveReason('');
        setIsArchiveDialogOpen(false);
      }

      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6 p-4 md:p-6 lg:p-8"
        >
          <Card className="shadow-xl border-t-4 border-primary">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-blue-600/10 flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <CardTitle className="text-2xl font-bold text-primary flex items-center">
                  <Users className="mr-3 h-7 w-7" /> Personnel Management
                </CardTitle>
                <CardDescription className="mt-1">Manage healthcare personnel, track compliance, and oversee onboarding.</CardDescription>
              </div>
               <div className="flex items-center space-x-2 mt-3 sm:mt-0">
                 <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('grid')} title="Grid View"> <Grid className="h-5 w-5"/> </Button>
                 <Button variant={viewMode === 'table' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('table')} title="Table View"> <List className="h-5 w-5"/> </Button>
                <Link to="/hr-staff-registration">
                  <Button className="bg-primary hover:bg-primary/90 text-white">
                    <UserPlus className="mr-2 h-5 w-5" /> Register New Personnel
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <HRFilterControls filters={filters} setFilters={setFilters} roles={roles} statuses={statuses} />

              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredStaff.length > 0 ? filteredStaff.map(staff => (
                    <PersonnelCard key={staff.id} staff={staff} onArchive={openArchiveDialog} />
                  )) : (
                    <div className="col-span-full text-center text-muted-foreground py-10">
                      <Users className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                      No personnel found matching your criteria.
                    </div>
                  )}
                </div>
              ) : (
                <PersonnelTable staffList={filteredStaff} onArchive={openArchiveDialog} />
              )}
            </CardContent>
            <CardFooter className="p-6 border-t">
              <p className="text-sm text-muted-foreground">Total Personnel: {staffList.length} | Displaying: {filteredStaff.length}</p>
            </CardFooter>
          </Card>

          <Dialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Archive Personnel: {staffToArchive?.fullName}</DialogTitle>
                    <DialogDescription>
                        Please provide a reason for archiving this staff member. This action can be reversed if needed.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Label htmlFor="archiveReason">Reason for Archiving</Label>
                    <Input 
                        id="archiveReason" 
                        value={archiveReason} 
                        onChange={(e) => setArchiveReason(e.target.value)}
                        placeholder="e.g., Resigned, Contract Ended, Transferred"
                        className="mt-1"
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={closeArchiveDialog}>Cancel</Button>
                    <Button onClick={handleArchiveStaff} variant="destructive">Confirm Archive</Button>
                </DialogFooter>
            </DialogContent>
          </Dialog>
        </motion.div>
      );
    };

    export default PersonnelManagementDashboard;