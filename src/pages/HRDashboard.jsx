import React from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
    import { Users, UserCheck, Briefcase, CalendarDays, AlertTriangle } from 'lucide-react';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button.jsx';
    import { Link } from 'react-router-dom';

    const HRDashboard = () => {
      const stats = [
        { title: "Total Staff", value: "0", icon: Users, color: "text-blue-500", link: "/hr-staff-registration", linkText: "Manage Staff" },
        { title: "Active Shifts", value: "0", icon: CalendarDays, color: "text-green-500", link: "/hr-shifts", linkText: "Manage Shifts" },
        { title: "Attendance Today", value: "0%", icon: UserCheck, color: "text-indigo-500", link: "/hr-attendance", linkText: "View Attendance" },
        { title: "Safety Compliance", value: "N/A", icon: Briefcase, color: "text-red-500", link: "/hr-safety", linkText: "Check Safety" },
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
                <Users className="mr-2 h-6 w-6"/>HR, Attendance & Safety Dashboard
              </CardTitle>
              <CardDescription>
                Overview of human resources, staff attendance, shift management, and safety compliance.
              </CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="mt-2 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded-md flex items-start">
                  <AlertTriangle className="h-5 w-5 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Placeholder Data:</p>
                    <p className="text-sm">Statistics and detailed views will be populated as functionality is built.</p>
                  </div>
                </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                     <Link to={stat.link}>
                        <Button variant="link" className="text-xs text-muted-foreground p-0 h-auto mt-1 hover:text-primary">
                            {stat.linkText} &rarr;
                        </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Button asChild className="w-full justify-start" variant="outline"><Link to="/hr-staff-registration"><UserCheck className="mr-2 h-4 w-4"/>Register New Staff</Link></Button>
                    <Button asChild className="w-full justify-start" variant="outline"><Link to="/hr-shifts"><CalendarDays className="mr-2 h-4 w-4"/>Manage Shifts</Link></Button>
                    <Button asChild className="w-full justify-start" variant="outline"><Link to="/hr-attendance"><Users className="mr-2 h-4 w-4"/>View Attendance Records</Link></Button>
                    <Button asChild className="w-full justify-start" variant="outline"><Link to="/hr-safety"><Briefcase className="mr-2 h-4 w-4"/>Access Safety Protocols</Link></Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Recent Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">No HR alerts at this time. (Placeholder)</p>
                </CardContent>
            </Card>
          </div>

        </motion.div>
      );
    };

    export default HRDashboard;