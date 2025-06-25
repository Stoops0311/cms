import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Label } from '@/components/ui/label.jsx';
import { useToast } from '@/components/ui/use-toast.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import {
  LayoutDashboard, Briefcase, Users, Package, FolderPlus, CalendarCheck, Clock4, ShieldCheck, MessageCircle, Settings, BarChart3,
  Construction, CheckSquare, GitPullRequestClosed, HardHat, DollarSign, FileText, Brain, ListChecks, AlertTriangle,
  Map, UserCog, Truck, Coins, UserCheck as UserCheckIcon, Building, FileSignature, GanttChartSquare, Link as LinkIcon, Users2,
  Megaphone, Siren, PlusCircle, ClipboardCheck, Award
} from 'lucide-react';
import { motion } from 'framer-motion';

const UrgentAlertForm = ({ onSubmit, onCancel }) => {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState('Medium');
    const [target, setTarget] = useState('All Sites');
    const { toast } = useToast();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title || !message) {
            toast({ variant: "destructive", title: "Missing Fields", description: "Title and Message are required for an alert." });
            return;
        }
        onSubmit({
            title, 
            message, 
            severity, 
            target,
            status: "Active"
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label htmlFor="alert-title">Alert Title</Label><Input id="alert-title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Critical Weather Warning" /></div>
            <div><Label htmlFor="alert-message">Message</Label><Textarea id="alert-message" value={message} onChange={e => setMessage(e.target.value)} placeholder="Detailed alert message..." rows={4} /></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="alert-severity">Severity</Label>
                    <Select value={severity} onValueChange={setSeverity}>
                        <SelectTrigger id="alert-severity"><SelectValue placeholder="Select Severity" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Critical"><Siren className="inline h-4 w-4 mr-2 text-red-600"/>Critical</SelectItem>
                            <SelectItem value="High"><AlertTriangle className="inline h-4 w-4 mr-2 text-orange-500"/>High</SelectItem>
                            <SelectItem value="Medium"><Megaphone className="inline h-4 w-4 mr-2 text-yellow-500"/>Medium</SelectItem>
                            <SelectItem value="Low">Low</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div><Label htmlFor="alert-target">Target Audience/Sites</Label><Input id="alert-target" value={target} onChange={e => setTarget(e.target.value)} placeholder="e.g., All Sites, Sector B, MEP Team" /></div>
            </div>
            <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="submit" className="bg-red-600 hover:bg-red-700">Send Alert</Button>
            </DialogFooter>
        </form>
    );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Convex queries and mutations
  const alerts = useQuery(api.communications.listNotices) || [];
  const projects = useQuery(api.projects.listProjects) || [];
  const equipment = useQuery(api.equipment.listEquipment) || [];
  const attendance = useQuery(api.attendance.listAttendanceRecords) || [];
  
  const createNotice = useMutation(api.communications.createNotice);
  
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  const handleSaveAlert = async (alertData) => {
    try {
      await createNotice({
        title: alertData.title,
        content: alertData.message,
        noticeType: "Alert",
        priority: alertData.severity,
        targetAudience: alertData.target,
        isActive: true,
        createdBy: user?.userId || "anonymous"
      });
      
      toast({ 
        title: "Urgent Alert Sent!", 
        description: `"${alertData.title}" has been broadcasted.`, 
        variant: alertData.severity === "Critical" ? "destructive" : "default"
      });
      setIsAlertModalOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to Send Alert",
        description: "Could not broadcast alert. Please try again."
      });
    }
  };

  // Calculate dashboard statistics
  const dashboardStats = {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.projectStatus === "In Progress").length,
    completedProjects: projects.filter(p => p.projectStatus === "Completed").length,
    totalEquipment: equipment.length,
    availableEquipment: equipment.filter(e => e.status === "Available").length,
    inUseEquipment: equipment.filter(e => e.status === "In Use").length,
    todayAttendance: attendance.filter(a => {
      const today = new Date().toDateString();
      const recordDate = new Date(a.timestamp).toDateString();
      return recordDate === today;
    }).length,
    activeAlerts: alerts.filter(a => a.isActive).length
  };

  const quickActions = [
    {
      title: "Site & Project Management",
      items: [
        { name: "Setup New Project", icon: Briefcase, path: "/project-setup", color: "bg-blue-500" },
        { name: "View All Projects", icon: FolderPlus, path: "/projects", color: "bg-blue-600" },
        { name: "Live Map Dashboard", icon: Map, path: "/live-map-dashboard", color: "bg-green-500" },
        { name: "Schedules & Tasks", icon: CalendarCheck, path: "/schedules-tasks", color: "bg-purple-500" },
        { name: "Daily Logs", icon: Clock4, path: "/daily-logs", color: "bg-orange-500" }
      ]
    },
    {
      title: "HR, Attendance & Safety",
      items: [
        { name: "HR Dashboard", icon: Users, path: "/hr-dashboard", color: "bg-cyan-500" },
        { name: "Staff Registration", icon: UserCog, path: "/hr-staff-registration", color: "bg-cyan-600" },
        { name: "Attendance Tracking", icon: Clock4, path: "/hr-attendance", color: "bg-green-600" },
        { name: "Shift Management", icon: CalendarCheck, path: "/hr-shifts", color: "bg-blue-700" },
        { name: "Health & Safety", icon: ShieldCheck, path: "/hr-safety", color: "bg-red-500" }
      ]
    },
    {
      title: "Inventory & Equipment",
      items: [
        { name: "Inventory Dashboard", icon: Package, path: "/inventory-dashboard", color: "bg-amber-500" },
        { name: "Equipment Dispatch", icon: Truck, path: "/equipment-dispatch", color: "bg-amber-600" },
        { name: "Procurement Log", icon: Coins, path: "/inventory-procurement-log", color: "bg-yellow-500" }
      ]
    },
    {
      title: "Stakeholders & Legal",
      items: [
        { name: "Stakeholder Dashboard", icon: Users2, path: "/stakeholder-dashboard", color: "bg-indigo-500" },
        { name: "Contractor Registration", icon: Construction, path: "/stakeholder-contractor-registration", color: "bg-indigo-600" },
        { name: "Supplier Portal", icon: Building, path: "/stakeholder-supplier-portal", color: "bg-purple-600" },
        { name: "Legal Agreements", icon: FileSignature, path: "/legal-agreements", color: "bg-gray-600" }
      ]
    },
    {
      title: "Forms & Documents",
      items: [
        { name: "Forms Hub", icon: FileText, path: "/forms-documents", color: "bg-teal-500" },
        { name: "Purchase Requests", icon: DollarSign, path: "/forms/purchase-request", color: "bg-green-700" },
        { name: "Site Inspection", icon: CheckSquare, path: "/forms/site-inspection-checklist", color: "bg-blue-800" },
        { name: "Work Completion", icon: Award, path: "/forms/work-completion-report", color: "bg-emerald-600" }
      ]
    },
    {
      title: "System Dashboards",
      items: [
        { name: "Site Manager", icon: HardHat, path: "/dashboard-sitemanager", color: "bg-orange-600" },
        { name: "Contractor Portal", icon: Construction, path: "/dashboard-contractor", color: "bg-gray-700" },
        { name: "Finance Dashboard", icon: DollarSign, path: "/dashboard-finance", color: "bg-green-800" },
        { name: "Admin Dashboard", icon: Settings, path: "/dashboard-admin", color: "bg-red-600" }
      ]
    },
    {
      title: "Communication & AI",
      items: [
        { name: "Communication Hub", icon: MessageCircle, path: "/communication", color: "bg-pink-500" },
        { name: "AI Tools", icon: Brain, path: "/ai-tools", color: "bg-violet-500" },
        { name: "Quality Control", icon: ListChecks, path: "/quality-control", color: "bg-slate-500" },
        { name: "Reports", icon: BarChart3, path: "/reports", color: "bg-stone-500" }
      ]
    }
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-primary">Construction Management Dashboard</h1>
          <p className="text-muted-foreground mt-1">Streamlined project management and operational oversight</p>
        </div>
        <Button onClick={() => setIsAlertModalOpen(true)} className="bg-red-600 hover:bg-red-700 text-white">
          <Siren className="mr-2 h-4 w-4" />Send Urgent Alert
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.activeProjects}</div>
            <p className="text-xs text-muted-foreground">of {dashboardStats.totalProjects} total</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Equipment</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.availableEquipment}</div>
            <p className="text-xs text-muted-foreground">of {dashboardStats.totalEquipment} total</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Attendance</CardTitle>
            <UserCheckIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.todayAttendance}</div>
            <p className="text-xs text-muted-foreground">clock-ins recorded</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.activeAlerts}</div>
            <p className="text-xs text-muted-foreground">requiring attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {quickActions.map((section, sectionIndex) => (
          <Card key={sectionIndex} className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {section.items.map((item, itemIndex) => (
                <Button
                  key={itemIndex}
                  variant="ghost"
                  className="w-full justify-start h-auto p-3 hover:bg-muted"
                  asChild
                >
                  <Link to={item.path} className="flex items-center space-x-3">
                    <div className={`p-2 rounded-md ${item.color} text-white`}>
                      <item.icon className="h-4 w-4" />
                    </div>
                    <span className="font-medium">{item.name}</span>
                  </Link>
                </Button>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity or Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Recent Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.slice(0, 5).map((alert) => (
                <div key={alert._id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <h4 className="font-medium">{alert.title}</h4>
                    <p className="text-sm text-muted-foreground">{alert.content}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(alert._creationTime).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alert Modal */}
      <Dialog open={isAlertModalOpen} onOpenChange={setIsAlertModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <Siren className="mr-2 h-5 w-5" />Send Urgent Alert
            </DialogTitle>
            <DialogDescription>
              Broadcast an important message to staff and stakeholders across all project sites.
            </DialogDescription>
          </DialogHeader>
          <UrgentAlertForm 
            onSubmit={handleSaveAlert} 
            onCancel={() => setIsAlertModalOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default Dashboard;