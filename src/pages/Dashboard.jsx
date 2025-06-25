import React, { useState } from 'react';
    import { Link, useNavigate } from 'react-router-dom';
    import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog.jsx';
    import { Input } from '@/components/ui/input.jsx';
    import { Textarea } from '@/components/ui/textarea.jsx';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
    import { Label } from '@/components/ui/label.jsx';
    import { useToast } from '@/components/ui/use-toast.jsx';
    import useLocalStorage from '@/hooks/useLocalStorage.jsx';
    import {
      LayoutDashboard, Briefcase, Users, Package, CalendarCheck, Clock4, ShieldCheck, MessageCircle, Settings, BarChart3,
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
                id: `ALERT-${Date.now()}`,
                title, message, severity, target,
                timestamp: new Date().toISOString(),
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
      const [alerts, setAlerts] = useLocalStorage('cmsUrgentAlerts', []);
      const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

      const handleSaveAlert = (alertData) => {
        setAlerts(prevAlerts => [alertData, ...prevAlerts].sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)));
        toast({ title: "Urgent Alert Sent!", description: `"${alertData.title}" has been broadcasted.`, variant: alertData.severity === "Critical" ? "destructive" : "default"});
        setIsAlertModalOpen(false);
      };
      
      const getSeverityColor = (severity) => {
        switch(severity?.toLowerCase()) {
            case 'critical': return 'border-red-500 bg-red-500 text-red-50';
            case 'high': return 'border-orange-500 bg-orange-500 text-orange-50';
            case 'medium': return 'border-yellow-500 bg-yellow-500 text-yellow-900';
            default: return 'border-blue-500 bg-blue-500 text-blue-50';
        }
      };

      const mainDashboardCards = [
        { title: "Projects List", description: "Manage all projects.", link: "/projects", icon: GanttChartSquare, color: "bg-gradient-to-br from-blue-500 to-blue-700", textColor: "text-white" },
        { title: "Setup New Project", description: "Initiate and configure new projects.", link: "/project-setup", icon: Briefcase, color: "bg-gradient-to-br from-green-500 to-green-700", textColor: "text-white" },
        { title: "Forms Hub", description: "Access all system forms.", link: "/forms-documents", icon: FileText, color: "bg-gradient-to-br from-indigo-500 to-indigo-700", textColor: "text-white" },
        { title: "Daily Logs", description: "Record daily site activities.", link: "/daily-logs", icon: Clock4, color: "bg-gradient-to-br from-teal-500 to-teal-700", textColor: "text-white" },
      ];

      const moduleCards = [
        { title: "Site Manager DB", link: "/dashboard-sitemanager", icon: HardHat, group: "Dashboards", color: "from-sky-400 to-sky-600" },
        { title: "Live Map", link: "/live-map-dashboard", icon: Map, group: "Site & Project", color: "from-emerald-400 to-emerald-600" },
        { title: "Schedules & Tasks", link: "/schedules-tasks", icon: CalendarCheck, group: "Site & Project", color: "from-rose-400 to-rose-600" },
        { title: "Reports", link: "/reports", icon: BarChart3, group: "Documents", color: "from-slate-400 to-slate-600" },
        { title: "Personnel Mgmt", link: "/hr-dashboard", icon: Users, group: "HR & Safety", color: "from-violet-400 to-violet-600" },
        { title: "Staff Registration", link: "/hr-staff-registration", icon: UserCog, group: "HR & Safety", color: "from-purple-400 to-purple-600" },
        { title: "Attendance App", link: "/hr-attendance", icon: ClipboardCheck, group: "HR & Safety", color: "from-fuchsia-400 to-fuchsia-600" },
        { title: "Shift Management", link: "/hr-shifts", icon: Users2, group: "HR & Safety", color: "from-pink-400 to-pink-600" },
        { title: "Safety & Compliance", link: "/hr-safety", icon: ShieldCheck, group: "HR & Safety", color: "from-yellow-400 to-yellow-600" },
        { title: "Materials Inventory", link: "/inventory-dashboard", icon: Package, group: "Inventory", color: "from-lime-400 to-lime-600" },
        { title: "Equipment Dispatch", link: "/equipment-dispatch", icon: Construction, group: "Inventory", color: "from-orange-400 to-orange-600" },
        { title: "Procurement Log", link: "/inventory-procurement-log", icon: Truck, group: "Inventory", color: "from-amber-400 to-amber-600" },
        { title: "Stakeholders Hub", link: "/stakeholder-dashboard", icon: Coins, group: "Stakeholders", color: "from-cyan-400 to-cyan-600" },
        { title: "Contractor Mgt.", link: "/stakeholder-contractor-registration", icon: UserCheckIcon, group: "Stakeholders", color: "from-sky-400 to-sky-600" },
        { title: "Supplier Portal", link: "/stakeholder-supplier-portal", icon: Building, group: "Stakeholders", color: "from-blue-400 to-blue-600" },
        { title: "MOU/NCNDA/Agreements", link: "/legal-agreements", icon: FileSignature, group: "Stakeholders", color: "from-indigo-400 to-indigo-600" },
        { title: "Fiber Handon Training", link: "/fiber-handon-training", icon: Award, group: "Training", color: "from-purple-500 to-purple-700" },
        { title: "Quality Control", link: "/quality-control", icon: CheckSquare, group: "Quality & Comm.", color: "from-green-400 to-green-600" },
        { title: "Communication", link: "/communication", icon: MessageCircle, group: "Quality & Comm.", color: "from-teal-400 to-teal-600" },
        { title: "AI Tools", link: "/ai-tools", icon: Brain, group: "AI & System", color: "from-red-400 to-red-600" },
        { title: "ERP Integration", link: "/security-settings", icon: GitPullRequestClosed, group: "AI & System", color: "from-gray-400 to-gray-600" },
        { title: "Security & Access", link: "/security-settings", icon: Settings, group: "AI & System", color: "from-slate-400 to-slate-600" },
        { title: "Cloud Drive Links", link: "/projects?tab=drive_links", icon: LinkIcon, group: "Documents", color: "from-sky-400 to-sky-600" },
      ];

      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="p-4 md:p-6 lg:p-8 bg-slate-100 min-h-screen">
          <div className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-600">
              Construction Management Dashboard
            </h1>
            <p className="text-muted-foreground text-lg">Welcome! Central hub for your construction operations.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            {mainDashboardCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.08, type: "spring", stiffness: 120 }}
              >
                <Card className={`shadow-xl hover:shadow-2xl transition-all duration-300 ${card.color} ${card.textColor} overflow-hidden group hover:scale-105`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <card.icon className="h-10 w-10 opacity-80 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <CardTitle className="text-2xl font-semibold pt-3">{card.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-4 min-h-[50px]">
                    <CardDescription className={`${card.textColor} opacity-90 text-sm`}>{card.description}</CardDescription>
                  </CardContent>
                  <CardFooter className="bg-black/10 p-4">
                    <Button asChild variant="ghost" className={`w-full ${card.textColor} hover:bg-white/20 justify-start`}>
                      <Link to={card.link}>
                        Access {card.title.replace('Hub', '').replace('Dashboard', '').trim()}
                        <span className="ml-auto text-xl">&rarr;</span>
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
          
          <Card className="mb-8 shadow-xl border-t-4 border-red-600 bg-gradient-to-br from-red-50 via-red-100 to-rose-50">
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle className="text-2xl font-bold text-red-700 flex items-center">
                    <Siren className="mr-3 h-7 w-7 animate-pulse"/>Urgent Alerts & Notifications
                </CardTitle>
                <CardDescription className="text-red-600">Critical updates and immediate action items.</CardDescription>
              </div>
              <Button onClick={() => setIsAlertModalOpen(true)} className="bg-red-600 hover:bg-red-700 text-white">
                <PlusCircle className="mr-2 h-4 w-4" /> Create Alert
              </Button>
            </CardHeader>
            <CardContent>
                {alerts.length === 0 ? (
                    <p className="text-muted-foreground">No urgent alerts at this time. System is operating normally.</p>
                ) : (
                    <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                        {alerts.slice(0,5).map(alert => (
                            <div key={alert.id} className={`p-3 rounded-lg border-l-4 ${getSeverityColor(alert.severity)} shadow-md`}>
                                <div className="flex justify-between items-start">
                                    <h4 className="font-semibold">{alert.title} <span className="text-xs opacity-80">({alert.severity})</span></h4>
                                    <span className="text-xs opacity-70">{new Date(alert.timestamp).toLocaleString()}</span>
                                </div>
                                <p className="text-sm mt-1">{alert.message}</p>
                                <p className="text-xs opacity-70 mt-1">Target: {alert.target}</p>
                            </div>
                        ))}
                    </div>
                )}
                {alerts.length > 5 && <Link to="/urgent-alerts" className="text-sm text-primary hover:underline mt-3 block text-right">View All Alerts &rarr;</Link>}
            </CardContent>
          </Card>

          <h2 className="text-2xl font-semibold tracking-tight text-gray-700 mb-4 mt-10">All Modules</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {moduleCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <Card 
                    className="shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer hover:scale-105 bg-white hover:bg-slate-50"
                    onClick={() => navigate(card.link)}
                >
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <div className={`p-3 rounded-full bg-gradient-to-tr ${card.color || 'from-slate-400 to-slate-600'} text-white mb-3 shadow-md group-hover:shadow-lg transition-shadow`}>
                        <card.icon className="h-7 w-7" />
                    </div>
                    <p className="text-sm font-medium text-gray-700 group-hover:text-primary transition-colors">{card.title}</p>
                    <p className="text-xs text-muted-foreground">{card.group}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <Dialog open={isAlertModalOpen} onOpenChange={setIsAlertModalOpen}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Create Urgent Alert</DialogTitle>
                    <DialogDescription>Compose and broadcast an urgent notification. Use responsibly.</DialogDescription>
                </DialogHeader>
                <UrgentAlertForm onSubmit={handleSaveAlert} onCancel={() => setIsAlertModalOpen(false)} />
            </DialogContent>
          </Dialog>

        </motion.div>
      );
    };

    export default Dashboard;