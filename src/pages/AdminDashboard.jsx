import React from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
    import { BarChart3, AlertTriangle, Users, FileCheck, Settings, Server } from 'lucide-react';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button.jsx';

    const AdminDashboard = () => {
      // Mock data - replace with actual system-wide data
      const globalStats = {
        activeProjects: 25,
        totalUsers: 150,
        storageUsed: "75 GB / 200 GB",
        pendingTasks: 42,
      };
      const systemAlerts = [
        { id: "alert1", message: "High CPU usage on main server.", severity: "Critical", time: "5m ago" },
        { id: "alert2", message: "Backup failed for Project Alpha DB.", severity: "High", time: "1h ago" },
      ];
      const upcomingExpiries = [
        { type: "Staff Insurance", name: "John Doe", expires: "2025-06-01" },
        { type: "Business License", name: "Contractor XYZ", expires: "2025-07-15" },
      ];

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
                <Server className="mr-2 h-6 w-6"/>Admin Dashboard
              </CardTitle>
              <CardDescription>
                Global system statistics, alerts, access logs, and upcoming expiry notifications.
              </CardDescription>
            </CardHeader>
             <CardContent>
                <div className="mt-2 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded-md flex items-start">
                  <AlertTriangle className="h-5 w-5 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">System Overview (Mock Data):</p>
                    <p className="text-sm">This dashboard provides a high-level view of the system. Data is illustrative.</p>
                  </div>
                </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Active Projects</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-bold">{globalStats.activeProjects}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-bold">{globalStats.totalUsers}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Storage Used</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-bold">{globalStats.storageUsed}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Pending Tasks (System)</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-bold">{globalStats.pendingTasks}</p></CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader><CardTitle className="flex items-center"><AlertTriangle className="mr-2 h-5 w-5 text-red-500"/>System Alerts & Warnings</CardTitle></CardHeader>
              <CardContent>
                {systemAlerts.length > 0 ? (
                  systemAlerts.map(alert => (
                    <div key={alert.id} className={`mb-2 p-2 rounded-md border-l-4 ${alert.severity === 'Critical' ? 'border-red-500 bg-red-50' : 'border-yellow-500 bg-yellow-50'}`}>
                      <p className="font-semibold text-sm">{alert.message}</p>
                      <p className="text-xs text-muted-foreground">Severity: {alert.severity} | Time: {alert.time}</p>
                    </div>
                  ))
                ) : <p className="text-sm text-muted-foreground">No active system alerts.</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center"><FileCheck className="mr-2 h-5 w-5 text-orange-500"/>Upcoming Expiries</CardTitle></CardHeader>
              <CardContent>
                 {upcomingExpiries.length > 0 ? (
                  upcomingExpiries.map(exp => (
                    <div key={exp.name + exp.type} className="mb-1">
                      <p className="text-sm font-medium">{exp.type}: {exp.name}</p>
                      <p className="text-xs text-muted-foreground">Expires: {exp.expires}</p>
                    </div>
                  ))
                ) : <p className="text-sm text-muted-foreground">No upcoming expiries.</p>}
              </CardContent>
            </Card>
          </div>
          
          <Card className="mt-6">
            <CardHeader><CardTitle className="flex items-center"><Settings className="mr-2 h-5 w-5"/>System Management</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
                <Button variant="outline">User Management (Placeholder)</Button>
                <Button variant="outline">View Access Logs (Placeholder)</Button>
                <Button variant="outline">System Configuration (Placeholder)</Button>
                <Button variant="outline">Backup & Restore (Placeholder)</Button>
            </CardContent>
          </Card>
        </motion.div>
      );
    };

    export default AdminDashboard;