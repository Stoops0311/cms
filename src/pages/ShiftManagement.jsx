import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { Calendar, Edit, PlusCircle, Trash2, Loader2, Clock, CheckCircle, XCircle } from 'lucide-react';
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
import { useToast } from '@/components/ui/use-toast.jsx';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { format } from 'date-fns';

const shiftTypes = ["Morning (8AM-4PM)", "Evening (4PM-12AM)", "Night (12AM-8AM)", "General (9AM-5PM)"];

const ShiftForm = ({ onSubmit, initialData = {}, onCancel, users, projects, isSubmitting }) => {
  const [userId, setUserId] = useState(initialData.userId || '');
  const [projectId, setProjectId] = useState(initialData.projectId || '');
  const [shiftDate, setShiftDate] = useState(initialData.date ? new Date(initialData.date) : new Date());
  const [shiftType, setShiftType] = useState(initialData.shiftType || shiftTypes[0]);
  const [startTime, setStartTime] = useState(initialData.startTime || '08:00');
  const [endTime, setEndTime] = useState(initialData.endTime || '16:00');
  const [notes, setNotes] = useState(initialData.notes || '');
  const { toast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userId || !shiftDate || !shiftType) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Please select staff, date, and shift type." });
      return;
    }
    onSubmit({
      userId,
      projectId: projectId || undefined,
      date: format(shiftDate, 'yyyy-MM-dd'),
      shiftType,
      startTime,
      endTime,
      notes: notes || undefined,
      status: "Scheduled",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="userId">Staff Member</Label>
        <Select value={userId} onValueChange={setUserId}>
          <SelectTrigger id="userId"><SelectValue placeholder="Select Staff"/></SelectTrigger>
          <SelectContent>
            {users?.map(u => (
              <SelectItem key={u._id} value={u._id}>{u.fullName} ({u.role})</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="projectId">Project/Site (Optional)</Label>
        <Select value={projectId} onValueChange={setProjectId}>
          <SelectTrigger id="projectId"><SelectValue placeholder="Select Project"/></SelectTrigger>
          <SelectContent>
            <SelectItem value="">No Project</SelectItem>
            {projects?.map(p => (
              <SelectItem key={p._id} value={p._id}>{p.projectName}</SelectItem>
            ))}
          </SelectContent>
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
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startTime">Start Time</Label>
          <Input id="startTime" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="endTime">End Time</Label>
          <Input id="endTime" type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
        </div>
      </div>
      <div>
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Input id="notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any specific instructions or notes"/>
      </div>
      <DialogFooter className="pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData._id ? 'Update Shift' : 'Assign Shift'}
        </Button>
      </DialogFooter>
    </form>
  );
};

const ShiftManagement = () => {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Convex queries
  const shifts = useQuery(api.shifts.listShifts, {});
  const users = useQuery(api.admin.listUsers, { isActive: true });
  const projects = useQuery(api.projects.listProjects, {});
  const leaveRequests = useQuery(api.leaveRequests.listLeaveRequests, {});
  const leaveStats = useQuery(api.leaveRequests.getLeaveStats, {});

  // Convex mutations
  const createShift = useMutation(api.shifts.createShift);
  const updateShift = useMutation(api.shifts.updateShift);
  const deleteShift = useMutation(api.shifts.deleteShift);
  const approveLeave = useMutation(api.leaveRequests.approveLeaveRequest);
  const rejectLeave = useMutation(api.leaveRequests.rejectLeaveRequest);

  // Get first admin user as createdBy (in real app, this would come from auth)
  const adminUser = users?.find(u => u.role === 'admin') || users?.[0];

  const handleSaveShift = async (shiftData) => {
    if (!adminUser) {
      toast({ variant: "destructive", title: "Error", description: "No admin user found to create shift." });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingShift) {
        await updateShift({
          id: editingShift._id,
          ...shiftData,
        });
        toast({ title: "Shift Updated", description: "Shift has been updated successfully." });
      } else {
        await createShift({
          ...shiftData,
          createdBy: adminUser._id,
        });
        toast({ title: "Shift Assigned", description: "New shift has been assigned successfully." });
      }
      setIsModalOpen(false);
      setEditingShift(null);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to save shift." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (shift) => {
    setEditingShift(shift);
    setIsModalOpen(true);
  };

  const handleDeleteShift = async (shiftId) => {
    if (window.confirm("Are you sure you want to delete this shift?")) {
      try {
        await deleteShift({ id: shiftId });
        toast({ title: "Shift Deleted", variant: "destructive" });
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: error.message || "Failed to delete shift." });
      }
    }
  };

  const handleApproveLeave = async (id) => {
    if (!adminUser) return;
    try {
      await approveLeave({ id, approvedBy: adminUser._id });
      toast({ title: "Leave Approved", description: "Leave request has been approved." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to approve." });
    }
  };

  const handleRejectLeave = async (id) => {
    if (!adminUser) return;
    try {
      await rejectLeave({ id, approvedBy: adminUser._id });
      toast({ title: "Leave Rejected", description: "Leave request has been rejected." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to reject." });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Scheduled': return 'text-blue-600 bg-blue-100';
      case 'In Progress': return 'text-green-600 bg-green-100';
      case 'Completed': return 'text-gray-600 bg-gray-100';
      case 'Cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const isLoading = shifts === undefined || users === undefined;

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
              Assign and manage staff shifts across projects and sites.
            </CardDescription>
          </div>
          <Button
            onClick={() => {setEditingShift(null); setIsModalOpen(true);}}
            className="mt-4 md:mt-0 bg-orange-500 hover:bg-orange-600 text-white"
            disabled={!adminUser}
          >
            <PlusCircle className="mr-2 h-4 w-4"/>Assign New Shift
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              <span className="ml-2 text-muted-foreground">Loading shifts...</span>
            </div>
          ) : shifts?.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-muted-foreground">No shifts assigned yet. Click "Assign New Shift" to start.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {shifts?.sort((a,b) => new Date(a.date) - new Date(b.date)).map(shift => (
                <Card
                  key={shift._id}
                  className="p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">{shift.userName}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(shift.status)}`}>
                          {shift.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(shift.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      <p className="text-sm text-muted-foreground">{shift.shiftType}</p>
                      <p className="text-xs text-gray-500">
                        Time: {shift.startTime} - {shift.endTime}
                      </p>
                      {shift.projectName && (
                        <p className="text-xs text-gray-500">Project: {shift.projectName}</p>
                      )}
                      {shift.notes && (
                        <p className="text-xs italic text-gray-500 mt-1">Notes: {shift.notes}</p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEditModal(shift)} title="Edit Shift">
                        <Edit className="h-4 w-4"/>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteShift(shift._id)} title="Delete Shift">
                        <Trash2 className="h-4 w-4 text-destructive"/>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Leave Requests Section */}
      <Card className="shadow-xl border-t-4 border-blue-500 mt-6">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-blue-600 flex items-center">
            <Clock className="mr-2 h-6 w-6" />Leave & Shift Change Requests
          </CardTitle>
          <CardDescription>Review and manage leave requests and shift changes.</CardDescription>
        </CardHeader>
        <CardContent>
          {leaveStats && (
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="p-2 bg-yellow-50 rounded text-center">
                <p className="text-lg font-bold text-yellow-600">{leaveStats.pending}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
              <div className="p-2 bg-green-50 rounded text-center">
                <p className="text-lg font-bold text-green-600">{leaveStats.approved}</p>
                <p className="text-xs text-muted-foreground">Approved</p>
              </div>
              <div className="p-2 bg-red-50 rounded text-center">
                <p className="text-lg font-bold text-red-600">{leaveStats.rejected}</p>
                <p className="text-xs text-muted-foreground">Rejected</p>
              </div>
            </div>
          )}
          {leaveRequests?.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No leave requests submitted.</p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {leaveRequests?.map(req => (
                <div key={req._id} className="p-3 rounded-lg border bg-white shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{req.requestedByName}</p>
                      <p className="text-sm text-muted-foreground">{req.requestType}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}
                      </p>
                      <p className="text-xs mt-1">{req.reason}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        req.status === 'Approved' ? 'bg-green-100 text-green-800' :
                        req.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {req.status}
                      </span>
                      {req.status === 'Pending' && (
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => handleApproveLeave(req._id)}>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleRejectLeave(req._id)}>
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

      <Dialog open={isModalOpen} onOpenChange={(open) => { if(!open) { setEditingShift(null); } setIsModalOpen(open); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingShift ? 'Edit Shift' : 'Assign New Shift'}</DialogTitle>
            <DialogDescription>Fill in the details for the staff shift.</DialogDescription>
          </DialogHeader>
          <ShiftForm
            onSubmit={handleSaveShift}
            initialData={editingShift || {}}
            onCancel={() => {setIsModalOpen(false); setEditingShift(null);}}
            users={users}
            projects={projects}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default ShiftManagement;
