import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { DatePicker } from '@/components/ui/date-picker.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { LogIn, LogOut, UserCheck, CalendarDays, Download, Loader2, MapPin, Clock, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast.jsx';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { format, parseISO } from 'date-fns';

const Attendance = () => {
  const { toast } = useToast();
  const [filterDate, setFilterDate] = useState(new Date());
  const [filterStaff, setFilterStaff] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);

  // Convex queries
  const users = useQuery(api.admin.listUsers, { isActive: true });
  const dateStr = filterDate ? format(filterDate, 'yyyy-MM-dd') : undefined;
  const attendanceRecords = useQuery(api.attendance.listAttendanceRecords, {
    startDate: dateStr,
    endDate: dateStr,
  });

  // Timesheet queries
  const timesheets = useQuery(api.timesheets.listTimesheets, {});
  const timesheetStats = useQuery(api.timesheets.getTimesheetStats, {});

  // Convex mutations
  const createAttendanceRecord = useMutation(api.attendance.createAttendanceRecord);
  const updateAttendanceRecord = useMutation(api.attendance.updateAttendance);
  const approveTimesheet = useMutation(api.timesheets.approveTimesheet);
  const rejectTimesheet = useMutation(api.timesheets.rejectTimesheet);

  // Get first admin user for approvals
  const adminUser = users?.find(u => u.role === 'admin') || users?.[0];

  const handleApproveTimesheet = async (id) => {
    if (!adminUser) return;
    try {
      await approveTimesheet({ id, approvedBy: adminUser._id });
      toast({ title: "Timesheet Approved", description: "Timesheet has been approved." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to approve." });
    }
  };

  const handleRejectTimesheet = async (id) => {
    if (!adminUser) return;
    const reason = window.prompt("Enter rejection reason:");
    if (reason) {
      try {
        await rejectTimesheet({ id, approvedBy: adminUser._id, notes: reason });
        toast({ title: "Timesheet Rejected", description: "Timesheet has been rejected." });
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: error.message || "Failed to reject." });
      }
    }
  };

  // Get GPS location
  const getLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`;
          setCurrentLocation(location);
          resolve(location);
        },
        (error) => {
          console.error('Geolocation error:', error);
          resolve('Location unavailable');
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    });
  };

  const handlePunchIn = async () => {
    if (!selectedUserId) {
      toast({ variant: "destructive", title: "Error", description: "Please select a staff member." });
      return;
    }

    const staffMember = users?.find(u => u._id === selectedUserId);
    if (!staffMember) {
      toast({ variant: "destructive", title: "Error", description: "Invalid staff selected." });
      return;
    }

    // Check if already punched in today
    const today = format(new Date(), 'yyyy-MM-dd');
    const existingEntry = attendanceRecords?.find(r =>
      r.userId === selectedUserId &&
      r.date === today &&
      r.checkIn &&
      !r.checkOut
    );

    if (existingEntry) {
      toast({ variant: "destructive", title: "Already Punched In", description: `${staffMember.fullName} is already punched in today.` });
      return;
    }

    setIsSubmitting(true);
    try {
      const location = await getLocation();

      await createAttendanceRecord({
        userId: selectedUserId,
        date: today,
        checkIn: new Date().toISOString(),
        status: "Present",
        location: location || "Location unavailable",
      });

      toast({
        title: "Punched In",
        description: `${staffMember.fullName} punched in at ${format(new Date(), 'p')}.`,
        className: "bg-green-500 text-white"
      });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to punch in." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePunchOut = async () => {
    if (!selectedUserId) {
      toast({ variant: "destructive", title: "Error", description: "Please select a staff member." });
      return;
    }

    const staffMember = users?.find(u => u._id === selectedUserId);
    if (!staffMember) {
      toast({ variant: "destructive", title: "Error", description: "Invalid staff selected." });
      return;
    }

    const today = format(new Date(), 'yyyy-MM-dd');
    const recordToUpdate = attendanceRecords?.find(r =>
      r.userId === selectedUserId &&
      r.date === today &&
      r.checkIn &&
      !r.checkOut
    );

    if (!recordToUpdate) {
      toast({ variant: "destructive", title: "Punch In Not Found", description: `${staffMember.fullName} has not punched in today or already punched out.` });
      return;
    }

    setIsSubmitting(true);
    try {
      await updateAttendanceRecord({
        attendanceId: recordToUpdate._id,
        checkOut: new Date().toISOString(),
      });
      toast({
        title: "Punched Out",
        description: `${staffMember.fullName} punched out at ${format(new Date(), 'p')}.`,
        className: "bg-orange-500 text-white"
      });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to punch out." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadReport = () => {
    if (!attendanceRecords || attendanceRecords.length === 0) {
      toast({ variant: "destructive", title: "No Data", description: "No attendance records to export." });
      return;
    }

    const headers = ['Staff Name', 'Date', 'Punch In', 'Punch Out', 'Duration', 'Location', 'Status'];
    const rows = filteredRecords.map(record => {
      const punchInTime = record.checkIn ? parseISO(record.checkIn) : null;
      const punchOutTime = record.checkOut ? parseISO(record.checkOut) : null;
      let duration = 'N/A';
      if (punchInTime && punchOutTime) {
        const diffMs = punchOutTime - punchInTime;
        const hours = Math.floor(diffMs / 3600000);
        const minutes = Math.floor((diffMs % 3600000) / 60000);
        duration = `${hours}h ${minutes}m`;
      }
      return [
        record.userName || 'Unknown',
        record.date,
        punchInTime ? format(punchInTime, 'HH:mm') : 'N/A',
        punchOutTime ? format(punchOutTime, 'HH:mm') : 'N/A',
        duration,
        record.location || 'N/A',
        record.status
      ].join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${format(filterDate || new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({ title: "Report Downloaded", description: "Attendance report has been downloaded." });
  };

  const filteredRecords = useMemo(() => {
    if (!attendanceRecords) return [];
    return attendanceRecords
      .filter(record => {
        const staffMatch = filterStaff
          ? (record.userName || '').toLowerCase().includes(filterStaff.toLowerCase())
          : true;
        return staffMatch;
      })
      .sort((a, b) => {
        const dateCompare = new Date(b.date) - new Date(a.date);
        if (dateCompare !== 0) return dateCompare;
        return new Date(b.checkIn || 0) - new Date(a.checkIn || 0);
      });
  }, [attendanceRecords, filterStaff]);

  const isLoading = users === undefined || attendanceRecords === undefined;

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
          <CardDescription>Record attendance for staff members with GPS location tracking.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div>
              <Label htmlFor="staffSelect">Select Staff</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger id="staffSelect" className="mt-1">
                  <SelectValue placeholder="Select a staff member" />
                </SelectTrigger>
                <SelectContent>
                  {users?.map(user => (
                    <SelectItem key={user._id} value={user._id}>
                      {user.fullName} ({user.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={handlePunchIn}
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={isSubmitting || !selectedUserId}
              >
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                Punch In
              </Button>
              <Button
                onClick={handlePunchOut}
                className="flex-1 bg-orange-500 hover:bg-orange-600"
                disabled={isSubmitting || !selectedUserId}
              >
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
                Punch Out
              </Button>
            </div>
          </div>
          {currentLocation && (
            <p className="text-xs text-muted-foreground text-center flex items-center justify-center">
              <MapPin className="h-3 w-3 mr-1" /> Current Location: {currentLocation}
            </p>
          )}
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
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
              <span className="ml-2 text-muted-foreground">Loading attendance records...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Name</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Punch In</TableHead>
                    <TableHead>Punch Out</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.length > 0 ? filteredRecords.map(record => {
                    const punchInTime = record.checkIn ? parseISO(record.checkIn) : null;
                    const punchOutTime = record.checkOut ? parseISO(record.checkOut) : null;
                    let duration = "N/A";
                    if (punchInTime && punchOutTime) {
                      const diffMs = punchOutTime - punchInTime;
                      const hours = Math.floor(diffMs / 3600000);
                      const minutes = Math.floor((diffMs % 3600000) / 60000);
                      duration = `${hours}h ${minutes}m`;
                    } else if (punchInTime && !punchOutTime) {
                      duration = "Active";
                    }

                    const getStatusBadge = (status) => {
                      const colors = {
                        Present: 'bg-green-100 text-green-800',
                        Absent: 'bg-red-100 text-red-800',
                        Late: 'bg-yellow-100 text-yellow-800',
                        Leave: 'bg-blue-100 text-blue-800',
                      };
                      return colors[status] || 'bg-gray-100 text-gray-800';
                    };

                    return (
                      <TableRow key={record._id}>
                        <TableCell className="font-medium">{record.userName || 'Unknown'}</TableCell>
                        <TableCell>{format(parseISO(record.date), 'dd MMM yyyy')}</TableCell>
                        <TableCell>{punchInTime ? format(punchInTime, 'p') : 'N/A'}</TableCell>
                        <TableCell>{punchOutTime ? format(punchOutTime, 'p') : (punchInTime ? '-' : 'N/A')}</TableCell>
                        <TableCell>{duration}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(record.status)}`}>
                            {record.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs">{record.location}</TableCell>
                      </TableRow>
                    );
                  }) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        <CalendarDays className="mx-auto h-12 w-12 mb-2 text-gray-400" />
                        No attendance records found for the selected filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter className="p-6 flex justify-end">
          <Button
            variant="outline"
            onClick={handleDownloadReport}
            disabled={!attendanceRecords || attendanceRecords.length === 0}
          >
            <Download className="mr-2 h-4 w-4" /> Download Report
          </Button>
        </CardFooter>
      </Card>

      {/* Timesheets Section */}
      <Card className="shadow-lg border-t-4 border-purple-500">
        <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10">
          <CardTitle className="text-xl font-semibold text-purple-600 flex items-center">
            <Clock className="mr-2 h-6 w-6" /> Weekly Timesheets
          </CardTitle>
          <CardDescription>Review and approve submitted timesheets.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {timesheetStats && (
            <div className="grid grid-cols-4 gap-3 mb-4">
              <div className="p-2 bg-gray-50 rounded text-center">
                <p className="text-lg font-bold text-gray-600">{timesheetStats.draft}</p>
                <p className="text-xs text-muted-foreground">Draft</p>
              </div>
              <div className="p-2 bg-yellow-50 rounded text-center">
                <p className="text-lg font-bold text-yellow-600">{timesheetStats.submitted}</p>
                <p className="text-xs text-muted-foreground">Submitted</p>
              </div>
              <div className="p-2 bg-green-50 rounded text-center">
                <p className="text-lg font-bold text-green-600">{timesheetStats.approved}</p>
                <p className="text-xs text-muted-foreground">Approved</p>
              </div>
              <div className="p-2 bg-red-50 rounded text-center">
                <p className="text-lg font-bold text-red-600">{timesheetStats.rejected}</p>
                <p className="text-xs text-muted-foreground">Rejected</p>
              </div>
            </div>
          )}
          {timesheets?.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No timesheets submitted.</p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {timesheets?.map(ts => (
                <div key={ts._id} className="p-3 rounded-lg border bg-white shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{ts.employeeName}</p>
                      <p className="text-sm text-muted-foreground">
                        Week: {ts.weekStartDate} to {ts.weekEndDate}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Regular: {ts.totalRegularHours}h | Overtime: {ts.totalOvertimeHours}h
                      </p>
                      {ts.projectName && (
                        <p className="text-xs text-muted-foreground">Project: {ts.projectName}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        ts.status === 'Approved' ? 'bg-green-100 text-green-800' :
                        ts.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                        ts.status === 'Submitted' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {ts.status}
                      </span>
                      {ts.status === 'Submitted' && (
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => handleApproveTimesheet(ts._id)}>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleRejectTimesheet(ts._id)}>
                            <XCircle className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Attendance;
