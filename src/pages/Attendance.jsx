import React, { useState, useMemo } from 'react';
    import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { Input } from '@/components/ui/input.jsx';
    import { Label } from '@/components/ui/label.jsx';
    import { DatePicker } from '@/components/ui/date-picker.jsx';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
    import { LogIn, LogOut, UserCheck, Filter, CalendarDays, Download } from 'lucide-react';
    import { motion } from 'framer-motion';
    import { useToast } from '@/components/ui/use-toast.jsx';
    import useLocalStorage from '@/hooks/useLocalStorage.jsx';
    import { format, parseISO } from 'date-fns';

    const initialAttendanceRecords = [
      { id: "ATT001", staffName: "Dr. Alice Smith", staffId: "EMP001", date: "2025-05-10", punchIn: "2025-05-10T08:55:00", punchOut: "2025-05-10T17:05:00", location: "Camp Alpha Clinic" },
      { id: "ATT002", staffName: "Nurse Bob Johnson", staffId: "EMP002", date: "2025-05-10", punchIn: "2025-05-10T07:50:00", punchOut: "2025-05-10T16:10:00", location: "Camp Beta Clinic" },
      { id: "ATT003", staffName: "Driver Carol White", staffId: "EMP003", date: "2025-05-10", punchIn: "2025-05-10T13:00:00", punchOut: "2025-05-10T21:00:00", location: "Mobile Unit 1" },
      { id: "ATT004", staffName: "Dr. Alice Smith", staffId: "EMP001", date: "2025-05-09", punchIn: "2025-05-09T09:02:00", punchOut: "2025-05-09T17:15:00", location: "Camp Alpha Clinic" },
      { id: "ATT005", staffName: "Nurse Bob Johnson", staffId: "EMP002", date: "2025-05-09", punchIn: null, punchOut: null, location: "On Leave" },
    ];
    
    const mockStaff = [
        { id: "EMP001", name: "Dr. Alice Smith" },
        { id: "EMP002", name: "Nurse Bob Johnson" },
        { id: "EMP003", name: "Driver Carol White" },
        { id: "EMP004", name: "Admin Eve Green" },
    ];

    const Attendance = () => {
      const { toast } = useToast();
      const [attendanceRecords, setAttendanceRecords] = useLocalStorage('attendanceRecords', initialAttendanceRecords);
      const [filterDate, setFilterDate] = useState(new Date());
      const [filterStaff, setFilterStaff] = useState('');
      const [selectedStaffId, setSelectedStaffId] = useState(mockStaff[0]?.id || ''); 

      const handlePunchIn = () => {
        const now = new Date();
        const today = format(now, 'yyyy-MM-dd');
        const staffMember = mockStaff.find(s => s.id === selectedStaffId);

        if (!staffMember) {
            toast({ variant: "destructive", title: "Error", description: "Invalid staff selected." });
            return;
        }
        
        const existingEntry = attendanceRecords.find(r => r.staffId === selectedStaffId && r.date === today && r.punchIn && !r.punchOut);
        if (existingEntry) {
            toast({ variant: "destructive", title: "Already Punched In", description: `${staffMember.name} is already punched in today.` });
            return;
        }

        const newRecord = {
          id: `ATT${Date.now()}`,
          staffName: staffMember.name,
          staffId: selectedStaffId,
          date: today,
          punchIn: now.toISOString(),
          punchOut: null,
          location: "Main Clinic (GPS Placeholder)", 
        };
        setAttendanceRecords(prev => [newRecord, ...prev]);
        toast({ title: "Punched In", description: `${staffMember.name} punched in at ${format(now, 'p')}.`, className: "bg-green-500 text-white" });
      };

      const handlePunchOut = () => {
        const now = new Date();
        const today = format(now, 'yyyy-MM-dd');
        const staffMember = mockStaff.find(s => s.id === selectedStaffId);

        if (!staffMember) {
            toast({ variant: "destructive", title: "Error", description: "Invalid staff selected." });
            return;
        }

        const recordToUpdate = attendanceRecords.find(r => r.staffId === selectedStaffId && r.date === today && r.punchIn && !r.punchOut);

        if (recordToUpdate) {
          setAttendanceRecords(prev => prev.map(r => r.id === recordToUpdate.id ? { ...r, punchOut: now.toISOString() } : r));
          toast({ title: "Punched Out", description: `${staffMember.name} punched out at ${format(now, 'p')}.`, className: "bg-orange-500 text-white" });
        } else {
          toast({ variant: "destructive", title: "Punch In Not Found", description: `${staffMember.name} has not punched in today or already punched out.` });
        }
      };

      const filteredRecords = useMemo(() => {
        return attendanceRecords.filter(record => {
          const recordDate = format(parseISO(record.date), 'yyyy-MM-dd');
          const selectedFilterDate = filterDate ? format(filterDate, 'yyyy-MM-dd') : null;
          
          const dateMatch = selectedFilterDate ? recordDate === selectedFilterDate : true;
          const staffMatch = filterStaff ? record.staffName.toLowerCase().includes(filterStaff.toLowerCase()) : true;
          return dateMatch && staffMatch;
        }).sort((a,b) => parseISO(b.date) - parseISO(a.date) || parseISO(b.punchIn || "0") - parseISO(a.punchIn || "0")  );
      }, [attendanceRecords, filterDate, filterStaff]);

      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <Card className="shadow-lg border-t-4 border-teal-500">
            <CardHeader className="bg-gradient-to-r from-teal-500/10 to-cyan-500/10">
              <CardTitle className="text-xl font-semibold text-teal-600 flex items-center">
                <UserCheck className="mr-2 h-6 w-6" /> Staff Punch In / Out
              </CardTitle>
              <CardDescription>Record attendance for staff members. GPS geofencing will be validated (simulated).</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                    <div>
                        <Label htmlFor="staffSelect">Select Staff</Label>
                        <select 
                            id="staffSelect" 
                            value={selectedStaffId} 
                            onChange={(e) => setSelectedStaffId(e.target.value)}
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                        >
                            {mockStaff.map(staff => (
                                <option key={staff.id} value={staff.id}>{staff.name} ({staff.id})</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex space-x-2">
                        <Button onClick={handlePunchIn} className="flex-1 bg-green-600 hover:bg-green-700">
                            <LogIn className="mr-2 h-4 w-4" /> Punch In
                        </Button>
                        <Button onClick={handlePunchOut} className="flex-1 bg-orange-500 hover:bg-orange-600">
                            <LogOut className="mr-2 h-4 w-4" /> Punch Out
                        </Button>
                    </div>
                </div>
                <p className="text-xs text-muted-foreground text-center">Simulated Geofence: Main Clinic Campus. Device ID: (Placeholder)</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-t-4 border-indigo-500">
            <CardHeader className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
              <CardTitle className="text-xl font-semibold text-indigo-600 flex items-center">
                <CalendarDays className="mr-2 h-6 w-6" /> Attendance Log
              </CardTitle>
              <CardDescription>View daily and historical attendance records.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <Label htmlFor="filterDate">Filter by Date</Label>
                    <DatePicker date={filterDate} setDate={setFilterDate} className="w-full mt-1" />
                </div>
                <div className="flex-1">
                    <Label htmlFor="filterStaff">Filter by Staff Name</Label>
                    <Input 
                        id="filterStaff"
                        placeholder="Enter staff name..."
                        value={filterStaff}
                        onChange={(e) => setFilterStaff(e.target.value)}
                        className="mt-1"
                    />
                </div>
                <Button variant="outline" className="self-end">
                  <Filter className="mr-2 h-4 w-4"/> Apply Filters
                </Button>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff Name</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Punch In</TableHead>
                      <TableHead>Punch Out</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Location/Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.length > 0 ? filteredRecords.map(record => {
                      const punchInTime = record.punchIn ? parseISO(record.punchIn) : null;
                      const punchOutTime = record.punchOut ? parseISO(record.punchOut) : null;
                      let duration = "N/A";
                      if (punchInTime && punchOutTime) {
                        const diffMs = punchOutTime - punchInTime;
                        const hours = Math.floor(diffMs / 3600000);
                        const minutes = Math.floor((diffMs % 3600000) / 60000);
                        duration = `${hours}h ${minutes}m`;
                      } else if (punchInTime && !punchOutTime) {
                        duration = "Active";
                      }

                      return (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">{record.staffName}</TableCell>
                          <TableCell>{format(parseISO(record.date), 'dd MMM yyyy')}</TableCell>
                          <TableCell>{punchInTime ? format(punchInTime, 'p') : 'N/A'}</TableCell>
                          <TableCell>{punchOutTime ? format(punchOutTime, 'p') : (punchInTime ? '-' : 'N/A')}</TableCell>
                          <TableCell>{duration}</TableCell>
                          <TableCell>{record.location}</TableCell>
                        </TableRow>
                      );
                    }) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          <CalendarDays className="mx-auto h-12 w-12 mb-2 text-gray-400" />
                          No attendance records found for the selected filters.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="p-6 flex justify-end">
                <Button variant="outline" onClick={() => toast({title: "Report Download", description: "Feature coming soon!"})}>
                    <Download className="mr-2 h-4 w-4" /> Download Report (Placeholder)
                </Button>
            </CardFooter>
          </Card>
        </motion.div>
      );
    };

    export default Attendance;