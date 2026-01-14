import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { DatePicker } from '@/components/ui/date-picker.jsx';
import { UserMinus, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast.jsx';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { format } from 'date-fns';

const exitTypes = [
  "Resignation",
  "Termination",
  "Contract End",
  "Retirement",
  "Transfer",
  "Other",
];

const departments = ["Engineering", "Operations", "HR", "Finance", "IT", "Safety", "Quality", "Procurement", "Administration"];

const StaffExitClearanceFormPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const users = useQuery(api.admin.listUsers, {});
  const createExitClearance = useMutation(api.staffExitClearances.createStaffExitClearance);

  const [employeeId, setEmployeeId] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [department, setDepartment] = useState('');
  const [lastWorkingDate, setLastWorkingDate] = useState(null);
  const [exitType, setExitType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get first user as default processor (in real app, this would be HR/Admin user)
  const currentUser = users?.[0];

  // Auto-fill employee name when selected
  const selectedEmployee = users?.find(u => u._id === employeeId);

  const handleEmployeeSelect = (id) => {
    setEmployeeId(id);
    const employee = users?.find(u => u._id === id);
    if (employee) {
      setEmployeeName(employee.fullName);
      setDepartment(employee.department || '');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!employeeId || !employeeName || !department || !lastWorkingDate || !exitType) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Please fill in all required fields." });
      return;
    }

    if (!currentUser) {
      toast({ variant: "destructive", title: "Error", description: "No user found. Please ensure users exist in the system." });
      return;
    }

    setIsSubmitting(true);
    try {
      await createExitClearance({
        userId: employeeId,
        employeeName,
        department,
        lastWorkingDate: format(lastWorkingDate, 'yyyy-MM-dd'),
        exitType,
        processedBy: currentUser._id,
      });

      toast({ title: "Exit Clearance Initiated", description: `Clearance process started for ${employeeName}.` });
      navigate('/forms-documents');
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to initiate clearance. Please try again." });
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
      <Card className="shadow-xl border-t-4 border-slate-600">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-slate-700 flex items-center">
            <UserMinus className="mr-3 h-7 w-7"/>Staff Exit/Clearance Form
          </CardTitle>
          <CardDescription>Initiate the exit clearance process for departing staff.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="employeeId">Select Employee *</Label>
              <Select value={employeeId} onValueChange={handleEmployeeSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {users?.filter(u => u.isActive).map(user => (
                    <SelectItem key={user._id} value={user._id}>{user.fullName} ({user.email})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employeeName">Employee Name *</Label>
                <Input id="employeeName" value={employeeName} onChange={e => setEmployeeName(e.target.value)} placeholder="Full name" />
              </div>
              <div>
                <Label htmlFor="department">Department *</Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="exitType">Exit Type *</Label>
                <Select value={exitType} onValueChange={setExitType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select exit type" />
                  </SelectTrigger>
                  <SelectContent>
                    {exitTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Last Working Date *</Label>
                <DatePicker date={lastWorkingDate} setDate={setLastWorkingDate} className="w-full" />
              </div>
            </div>

            {selectedEmployee && (
              <div className="p-4 bg-slate-50 rounded-lg">
                <h4 className="font-medium text-slate-800 mb-2">Employee Details</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p><strong>Email:</strong> {selectedEmployee.email}</p>
                  <p><strong>Role:</strong> {selectedEmployee.role}</p>
                  <p><strong>Position:</strong> {selectedEmployee.position || 'N/A'}</p>
                  <p><strong>Joining Date:</strong> {selectedEmployee.joiningDate || 'N/A'}</p>
                </div>
              </div>
            )}

            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <h4 className="font-medium text-amber-800 mb-2">Clearance Items (Auto-Generated)</h4>
              <p className="text-sm text-amber-700">The following items will be tracked for clearance:</p>
              <ul className="text-sm text-amber-600 mt-2 grid grid-cols-2 gap-1">
                <li>• ID Card / Access Badge</li>
                <li>• Laptop / Computer</li>
                <li>• Mobile Phone / SIM</li>
                <li>• Office Keys</li>
                <li>• Company Documents</li>
                <li>• Uniform / PPE</li>
                <li>• Vehicle / Parking Pass</li>
                <li>• Tools / Equipment</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2 border-t pt-6">
            <Button type="button" variant="outline" onClick={() => navigate('/forms-documents')}>Cancel</Button>
            <Button type="submit" className="bg-slate-600 hover:bg-slate-700" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing...</> : 'Initiate Clearance'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );
};

export default StaffExitClearanceFormPage;
