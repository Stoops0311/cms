import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { Users, FileCheck, Settings, Server, Loader2, Shield, Activity, Download, Search, UserMinus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog.jsx';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useToast } from '@/components/ui/use-toast.jsx';
import { format } from 'date-fns';

const AdminDashboard = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [accessLogFilter, setAccessLogFilter] = useState('');

  // Convex queries
  const systemStats = useQuery(api.admin.getSystemStats, {});
  const users = useQuery(api.admin.listUsers, {});
  const accessLogs = useQuery(api.admin.listAccessLogs, { limit: 50 });
  const expiringDocs = useQuery(api.hrDocuments.getExpiringDocuments, { daysUntilExpiry: 30 });
  const exitClearances = useQuery(api.staffExitClearances.listStaffExitClearances, {});

  // Convex mutations
  const updateUserRole = useMutation(api.admin.updateUserRole);
  const deactivateUser = useMutation(api.admin.deactivateUser);
  const activateUser = useMutation(api.admin.activateUser);

  const handleUpdateRole = async () => {
    if (!selectedUser || !newRole) return;
    try {
      await updateUserRole({ userId: selectedUser._id, role: newRole });
      toast({ title: "Role Updated", description: `${selectedUser.fullName}'s role changed to ${newRole}.` });
      setIsUserModalOpen(false);
      setSelectedUser(null);
      setNewRole('');
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to update role." });
    }
  };

  const handleToggleUserStatus = async (user) => {
    try {
      if (user.isActive) {
        await deactivateUser({ userId: user._id });
        toast({ title: "User Deactivated", description: `${user.fullName} has been deactivated.` });
      } else {
        await activateUser({ userId: user._id });
        toast({ title: "User Activated", description: `${user.fullName} has been activated.` });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to update user status." });
    }
  };

  const openUserModal = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setIsUserModalOpen(true);
  };

  const handleDownloadAccessLogs = () => {
    if (!accessLogs || accessLogs.length === 0) {
      toast({ variant: "destructive", title: "No Data", description: "No access logs to export." });
      return;
    }

    const headers = ['User', 'Action', 'Resource', 'Timestamp', 'IP Address'];
    const rows = accessLogs.map(log => [
      log.userName,
      log.action,
      log.resource,
      format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss'),
      log.ipAddress || 'N/A',
    ].join(','));

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `access-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({ title: "Logs Exported", description: "Access logs downloaded successfully." });
  };

  const filteredAccessLogs = accessLogs?.filter(log =>
    !accessLogFilter ||
    log.userName?.toLowerCase().includes(accessLogFilter.toLowerCase()) ||
    log.action?.toLowerCase().includes(accessLogFilter.toLowerCase()) ||
    log.resource?.toLowerCase().includes(accessLogFilter.toLowerCase())
  );

  const isLoading = systemStats === undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 md:p-6 lg:p-8"
    >
      <Card className="shadow-xl border-t-4 border-purple-500 mb-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold tracking-tight text-purple-600 flex items-center">
            <Server className="mr-2 h-6 w-6" />Admin Dashboard
          </CardTitle>
          <CardDescription>
            System statistics, user management, access logs, and expiry notifications.
          </CardDescription>
        </CardHeader>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          <span className="ml-2 text-muted-foreground">Loading system data...</span>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card className="border-l-4 border-blue-500">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Active Projects</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-bold text-blue-600">{systemStats?.activeProjects || 0}</p></CardContent>
            </Card>
            <Card className="border-l-4 border-green-500">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-bold text-green-600">{systemStats?.totalUsers || 0}</p></CardContent>
            </Card>
            <Card className="border-l-4 border-purple-500">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-bold text-purple-600">{systemStats?.activeUsers || 0}</p></CardContent>
            </Card>
            <Card className="border-l-4 border-orange-500">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Pending Requests</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-bold text-orange-600">{systemStats?.pendingPurchaseRequests || 0}</p></CardContent>
            </Card>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mb-6 flex-wrap">
            <Button
              variant={activeTab === 'overview' ? 'default' : 'outline'}
              onClick={() => setActiveTab('overview')}
            >
              <Activity className="mr-2 h-4 w-4" /> Overview
            </Button>
            <Button
              variant={activeTab === 'users' ? 'default' : 'outline'}
              onClick={() => setActiveTab('users')}
            >
              <Users className="mr-2 h-4 w-4" /> User Management
            </Button>
            <Button
              variant={activeTab === 'logs' ? 'default' : 'outline'}
              onClick={() => setActiveTab('logs')}
            >
              <Shield className="mr-2 h-4 w-4" /> Access Logs
            </Button>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileCheck className="mr-2 h-5 w-5 text-orange-500" />Expiring Documents ({expiringDocs?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {expiringDocs && expiringDocs.length > 0 ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {expiringDocs.map(doc => (
                        <div key={doc._id} className="p-2 border rounded-md bg-orange-50">
                          <p className="text-sm font-medium">{doc.documentType}: {doc.staffName}</p>
                          <p className="text-xs text-muted-foreground">Expires: {doc.expiryDate} ({doc.daysUntilExpiry} days)</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No documents expiring within 30 days.</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="mr-2 h-5 w-5" />System Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Equipment</span>
                    <span className="font-medium">{systemStats?.totalEquipment || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Contractors</span>
                    <span className="font-medium">{systemStats?.totalContractors || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Inventory Items</span>
                    <span className="font-medium">{systemStats?.totalInventoryItems || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Active Shifts Today</span>
                    <span className="font-medium">{systemStats?.activeShiftsToday || 0}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Exit Clearances Section (always visible) */}
          {exitClearances && exitClearances.filter(c => c.overallStatus === 'In Progress').length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserMinus className="mr-2 h-5 w-5 text-slate-600" />Staff Exit Clearances In Progress
                </CardTitle>
                <CardDescription>Monitor staff exit and clearance processes.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {exitClearances.filter(c => c.overallStatus === 'In Progress').map(clearance => {
                    const itemsCleared = clearance.clearanceItems?.filter(i => i.status === 'Cleared').length || 0;
                    const totalItems = clearance.clearanceItems?.length || 0;
                    const progress = totalItems > 0 ? Math.round((itemsCleared / totalItems) * 100) : 0;

                    return (
                      <div key={clearance._id} className="p-3 rounded-lg border bg-white shadow-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{clearance.employeeName}</p>
                            <p className="text-sm text-muted-foreground">{clearance.department} - {clearance.exitType}</p>
                            <p className="text-xs text-gray-500">Last Working Day: {clearance.lastWorkingDate}</p>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            clearance.finalSettlementStatus === 'Completed' ? 'bg-green-100 text-green-800' :
                            clearance.finalSettlementStatus === 'Processed' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {clearance.finalSettlementStatus}
                          </span>
                        </div>
                        <div className="mt-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Clearance Progress</span>
                            <span>{itemsCleared}/{totalItems} items ({progress}%)</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div className="bg-slate-600 h-1.5 rounded-full" style={{ width: `${progress}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />User Management
                </CardTitle>
                <CardDescription>Manage user roles and account status.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users?.map(user => (
                        <TableRow key={user._id}>
                          <TableCell className="font-medium">{user.fullName}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                              user.role === 'manager' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {user.role}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline" onClick={() => openUserModal(user)}>
                                Edit Role
                              </Button>
                              <Button
                                size="sm"
                                variant={user.isActive ? 'destructive' : 'default'}
                                onClick={() => handleToggleUserStatus(user)}
                              >
                                {user.isActive ? 'Deactivate' : 'Activate'}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Access Logs Tab */}
          {activeTab === 'logs' && (
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle className="flex items-center">
                      <Shield className="mr-2 h-5 w-5" />Access Logs
                    </CardTitle>
                    <CardDescription>View system access and activity logs.</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Filter logs..."
                        className="pl-8 w-48"
                        value={accessLogFilter}
                        onChange={(e) => setAccessLogFilter(e.target.value)}
                      />
                    </div>
                    <Button variant="outline" onClick={handleDownloadAccessLogs}>
                      <Download className="mr-2 h-4 w-4" /> Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Resource</TableHead>
                        <TableHead>Timestamp</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAccessLogs && filteredAccessLogs.length > 0 ? (
                        filteredAccessLogs.map(log => (
                          <TableRow key={log._id}>
                            <TableCell className="font-medium">{log.userName}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                log.action === 'login' ? 'bg-green-100 text-green-700' :
                                log.action === 'logout' ? 'bg-gray-100 text-gray-700' :
                                log.action === 'create' ? 'bg-blue-100 text-blue-700' :
                                log.action === 'update' ? 'bg-yellow-100 text-yellow-700' :
                                log.action === 'delete' ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {log.action}
                              </span>
                            </TableCell>
                            <TableCell>{log.resource}</TableCell>
                            <TableCell>{format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm')}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                            No access logs found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* User Role Edit Modal */}
      <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
            <DialogDescription>
              Change the role for {selectedUser?.fullName}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="role">Select New Role</Label>
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUserModalOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateRole}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default AdminDashboard;
