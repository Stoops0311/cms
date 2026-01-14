import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { DatePicker } from '@/components/ui/date-picker.jsx';
import { Calendar, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast.jsx';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { format } from 'date-fns';

const requestTypes = [
  "Annual Leave",
  "Sick Leave",
  "Shift Change",
  "Emergency Leave",
  "Unpaid Leave",
  "Maternity/Paternity Leave",
  "Bereavement Leave",
];

const LeaveRequestFormPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const users = useQuery(api.admin.listUsers, {});
  const projects = useQuery(api.projects.listProjects, {});
  const createLeaveRequest = useMutation(api.leaveRequests.createLeaveRequest);

  const [employeeName, setEmployeeName] = useState('');
  const [requestType, setRequestType] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [reason, setReason] = useState('');
  const [shiftSwapWith, setShiftSwapWith] = useState('');
  const [projectId, setProjectId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get first user as default requester (in real app, this would be the logged-in user)
  const currentUser = users?.[0];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!employeeName || !requestType || !startDate || !endDate || !reason) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Please fill in all required fields." });
      return;
    }

    if (!currentUser) {
      toast({ variant: "destructive", title: "Error", description: "No user found. Please ensure users exist in the system." });
      return;
    }

    if (endDate < startDate) {
      toast({ variant: "destructive", title: "Invalid Dates", description: "End date cannot be before start date." });
      return;
    }

    setIsSubmitting(true);
    try {
      await createLeaveRequest({
        requestedBy: currentUser._id,
        employeeName,
        requestType,
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        reason,
        shiftSwapWith: shiftSwapWith ? shiftSwapWith : undefined,
        projectId: projectId ? projectId : undefined,
      });

      toast({ title: "Leave Request Submitted", description: `Your ${requestType} request has been submitted for approval.` });
      navigate('/forms-documents');
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to submit leave request. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!users) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto">
      <Card className="shadow-xl border-t-4 border-blue-600">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-blue-700 flex items-center">
            <Calendar className="mr-3 h-7 w-7"/>Leave & Shift Change Request
          </CardTitle>
          <CardDescription>Submit a request for leave or shift change.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employeeName">Employee Name *</Label>
                <Input id="employeeName" value={employeeName} onChange={e => setEmployeeName(e.target.value)} placeholder="Your full name" />
              </div>
              <div>
                <Label htmlFor="requestType">Request Type *</Label>
                <Select value={requestType} onValueChange={setRequestType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select request type" />
                  </SelectTrigger>
                  <SelectContent>
                    {requestTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Start Date *</Label>
                <DatePicker date={startDate} setDate={setStartDate} className="w-full" />
              </div>
              <div>
                <Label>End Date *</Label>
                <DatePicker date={endDate} setDate={setEndDate} className="w-full" />
              </div>
            </div>

            {requestType === 'Shift Change' && (
              <div>
                <Label htmlFor="shiftSwapWith">Swap Shift With (Employee)</Label>
                <Select value={shiftSwapWith} onValueChange={setShiftSwapWith}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee to swap with" />
                  </SelectTrigger>
                  <SelectContent>
                    {users?.filter(u => u._id !== currentUser?._id).map(user => (
                      <SelectItem key={user._id} value={user._id}>{user.fullName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="projectId">Related Project (Optional)</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project if applicable" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {projects?.map(project => (
                    <SelectItem key={project._id} value={project._id}>{project.projectName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="reason">Reason for Request *</Label>
              <Textarea id="reason" value={reason} onChange={e => setReason(e.target.value)} placeholder="Please provide the reason for your leave/shift change request..." rows={4} />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2 border-t pt-6">
            <Button type="button" variant="outline" onClick={() => navigate('/forms-documents')}>Cancel</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</> : 'Submit Request'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );
};

export default LeaveRequestFormPage;
