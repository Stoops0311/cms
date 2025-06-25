import React, { useState, useMemo } from 'react';
    import { motion } from 'framer-motion';
    import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { CalendarDays, ListChecks, AlertTriangle, PackageSearch, DollarSign, ClipboardEdit, PlusCircle, HardHat, Users, Truck, Link as LinkIcon } from 'lucide-react';
    import useLocalStorage from '@/hooks/useLocalStorage.jsx';
    import { format, differenceInDays } from 'date-fns';
    import DailyReportModal from '@/components/siteManager/DailyReportModal.jsx';
    import MaterialRequestModal from '@/components/siteManager/MaterialRequestModal.jsx';
    import BudgetRequestModal from '@/components/siteManager/BudgetRequestModal.jsx';
    import ProjectAssignmentModal from '@/components/siteManager/ProjectAssignmentModal.jsx';
    import { Link } from 'react-router-dom';

    const DashboardMetricCard = ({ title, value, icon: Icon, bgColor = 'bg-slate-100', iconColor = 'text-slate-600', linkTo, description }) => (
      <Card className={`shadow-lg hover:shadow-xl transition-shadow ${bgColor}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
          {linkTo && (
            <Link to={linkTo} className="text-xs text-primary hover:underline mt-1 block">
              View details
            </Link>
          )}
        </CardContent>
      </Card>
    );

    const AssignedProjectItem = ({ project }) => (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="p-4 border rounded-lg hover:bg-slate-50 transition-colors"
        >
            <Link to={`/projects/${project.id}`} className="block">
                <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-primary">{project.projectName}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                        project.projectStatus === 'Completed' ? 'bg-green-100 text-green-700' :
                        project.projectStatus === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                        project.projectStatus === 'On Hold' ? 'bg-yellow-100 text-yellow-700' :
                        project.projectStatus === 'Cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                    }`}>{project.projectStatus}</span>
                </div>
                <p className="text-xs text-muted-foreground">ID: {project.projectCode} | Due: {project.expectedEndDate ? format(new Date(project.expectedEndDate), 'dd MMM yyyy') : 'N/A'}</p>
                {project.currentCost && project.projectBudget && (
                    <p className="text-xs text-muted-foreground mt-1">Budget: ${parseFloat(project.currentCost).toLocaleString()} / ${parseFloat(project.projectBudget).toLocaleString()}</p>
                )}
            </Link>
        </motion.div>
    );
    
    const DailyTaskItem = ({ task, projectName }) => {
        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Completed';
        return (
            <motion.li 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`p-3 border-l-4 rounded-r-md mb-2 ${
                isOverdue ? 'border-red-500 bg-red-50' : 
                task.priority === 'High' || task.priority === 'Urgent' ? 'border-orange-500 bg-orange-50' : 
                'border-blue-500 bg-blue-50'
            }`}>
                <div className="flex justify-between items-center">
                    <span className="font-medium text-sm">{task.name}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isOverdue ? 'text-red-700 bg-red-200' : 'text-gray-700 bg-gray-200'}`}>{task.status}</span>
                </div>
                <p className="text-xs text-muted-foreground">Project: {projectName || 'N/A'} | Due: {task.dueDate ? format(new Date(task.dueDate), 'dd MMM') : 'N/A'}</p>
            </motion.li>
        );
    };


    const SiteManagerDashboard = () => {
      const [projects] = useLocalStorage('projects', []);
      const [tasks] = useLocalStorage('cmsTasks', []); 
      const [safetyDocs] = useLocalStorage('cmsSafetyDocs', []);
      const [dailyLogs, setDailyLogs] = useLocalStorage('cmsDailyLogs', []);
      const [materialRequests, setMaterialRequests] = useLocalStorage('cmsMaterialRequests', []);
      const [budgetRequests, setBudgetRequests] = useLocalStorage('cmsBudgetRequests', []);

      const [isDailyReportModalOpen, setIsDailyReportModalOpen] = useState(false);
      const [isMaterialRequestModalOpen, setIsMaterialRequestModalOpen] = useState(false);
      const [isBudgetRequestModalOpen, setIsBudgetRequestModalOpen] = useState(false);
      const [isProjectAssignmentModalOpen, setIsProjectAssignmentModalOpen] = useState(false);

      const MOCK_SITE_MANAGER_ID = "SM001"; 
      const MOCK_SITE_MANAGER_NAME = "Default Site Manager"; 

      const assignedProjects = useMemo(() => {
        return projects.filter(p => p.siteManagerId === MOCK_SITE_MANAGER_ID || (MOCK_SITE_MANAGER_ID === "SM001" && (p.siteManager === MOCK_SITE_MANAGER_NAME || !p.siteManagerId))); 
      }, [projects]);

      const activeProjectsCount = assignedProjects.filter(p => p.projectStatus === "In Progress").length;

      const pendingTasks = useMemo(() => {
        return tasks.filter(task => 
          assignedProjects.some(p => p.id === task.projectId) && 
          task.status !== "Completed"
        ).sort((a,b) => (a.dueDate && b.dueDate) ? new Date(a.dueDate) - new Date(b.dueDate) : (a.dueDate ? -1 : 1) )
         .slice(0, 5); 
      }, [tasks, assignedProjects]);
      
      const pendingTasksCount = tasks.filter(task => assignedProjects.some(p => p.id === task.projectId) && task.status !== "Completed").length;


      const safetyAlertsCount = useMemo(() => {
         return safetyDocs.filter(doc => {
            if (!doc.expiryDate) return false;
            const daysLeft = differenceInDays(new Date(doc.expiryDate), new Date());
            return daysLeft <= 7 && daysLeft >= 0; 
        }).length;
      }, [safetyDocs]);


      const handleSaveDailyReport = (report) => {
        setDailyLogs(prev => [{id: `DR-${Date.now()}`, ...report}, ...prev]);
        setIsDailyReportModalOpen(false);
      };
      const handleSaveMaterialRequest = (request) => {
        setMaterialRequests(prev => [{id: `MR-${Date.now()}`, ...request, status: 'Pending', requestDate: new Date().toISOString()}, ...prev]);
        setIsMaterialRequestModalOpen(false);
      };
      const handleSaveBudgetRequest = (request) => {
        setBudgetRequests(prev => [{id: `BR-${Date.now()}`, ...request, status: 'Pending'}, ...prev]);
        setIsBudgetRequestModalOpen(false);
      };
      
      const quickActionButtons = [
        { label: "New Daily Log", icon: ClipboardEdit, action: () => setIsDailyReportModalOpen(true), color: "bg-blue-500 hover:bg-blue-600" },
        { label: "Request Material", icon: PackageSearch, action: () => setIsMaterialRequestModalOpen(true), color: "bg-green-500 hover:bg-green-600" },
        { label: "Request Budget", icon: DollarSign, action: () => setIsBudgetRequestModalOpen(true), color: "bg-yellow-500 hover:bg-yellow-600 text-black" },
        { label: "View Assignments", icon: HardHat, action: () => setIsProjectAssignmentModalOpen(true), color: "bg-purple-500 hover:bg-purple-600" },
      ];


      return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
          <Card className="bg-gradient-to-r from-primary to-blue-700 text-primary-foreground shadow-xl">
            <CardHeader>
              <CardTitle className="text-3xl font-bold">Site Manager Dashboard</CardTitle>
              <CardDescription className="text-blue-100">Welcome, {MOCK_SITE_MANAGER_NAME}. Overview of your responsibilities.</CardDescription>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardMetricCard title="Active Projects" value={activeProjectsCount} icon={HardHat} bgColor="bg-sky-50" iconColor="text-sky-600" linkTo="/projects?status=In+Progress" description="Currently ongoing projects." />
            <DashboardMetricCard title="Pending Tasks" value={pendingTasksCount} icon={ListChecks} bgColor="bg-indigo-50" iconColor="text-indigo-600" linkTo="/schedules?status=Pending" description="Tasks needing attention." />
            <DashboardMetricCard title="Safety Alerts" value={safetyAlertsCount} icon={AlertTriangle} bgColor="bg-red-50" iconColor="text-red-600" linkTo="/safety-compliance?status=Expiring+Soon" description="Certifications/permits expiring soon." />
            <DashboardMetricCard title="Pending Material Requests" value={materialRequests.filter(r => r.status === 'Pending').length} icon={PackageSearch} bgColor="bg-teal-50" iconColor="text-teal-600" description="Awaiting approval/delivery." />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold text-primary">My Assigned Projects</CardTitle>
                </CardHeader>
                <CardContent className="max-h-96 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                    {assignedProjects.length > 0 ? (
                        assignedProjects.map(project => <AssignedProjectItem key={project.id} project={project} />)
                    ) : (
                        <p className="text-muted-foreground text-center py-4">No projects currently assigned.</p>
                    )}
                </CardContent>
                 <CardFooter>
                    <Button variant="outline" asChild className="w-full">
                        <Link to="/projects"><ListChecks className="mr-2 h-4 w-4" />View All Projects</Link>
                    </Button>
                </CardFooter>
             </Card>
             <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold text-primary">Upcoming / Overdue Tasks</CardTitle>
                </CardHeader>
                <CardContent className="max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                     {pendingTasks.length > 0 ? (
                        <ul className="space-y-2">
                            {pendingTasks.map(task => <DailyTaskItem key={task.id} task={task} projectName={projects.find(p=>p.id === task.projectId)?.projectName} />)}
                        </ul>
                    ) : (
                        <p className="text-muted-foreground text-center py-4">No urgent tasks for your projects.</p>
                    )}
                </CardContent>
                 <CardFooter>
                    <Button variant="outline" asChild className="w-full">
                       <Link to="/schedules"><CalendarDays className="mr-2 h-4 w-4" />Go to Full Schedule</Link>
                    </Button>
                </CardFooter>
             </Card>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-primary">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActionButtons.map(action => (
                 <Button key={action.label} onClick={action.action} className={`flex flex-col items-center justify-center h-24 text-sm ${action.color} text-white shadow-md hover:shadow-lg transition-shadow`}>
                    <action.icon className="h-6 w-6 mb-1.5" />
                    {action.label}
                 </Button>
              ))}
            </CardContent>
          </Card>
          
          <DailyReportModal isOpen={isDailyReportModalOpen} onClose={() => setIsDailyReportModalOpen(false)} onSubmit={handleSaveDailyReport} projects={assignedProjects} />
          <MaterialRequestModal isOpen={isMaterialRequestModalOpen} onClose={() => setIsMaterialRequestModalOpen(false)} onSubmit={handleSaveMaterialRequest} projects={assignedProjects} />
          <BudgetRequestModal isOpen={isBudgetRequestModalOpen} onClose={() => setIsBudgetRequestModalOpen(false)} onSubmit={handleSaveBudgetRequest} projects={assignedProjects} />
          <ProjectAssignmentModal isOpen={isProjectAssignmentModalOpen} onClose={() => setIsProjectAssignmentModalOpen(false)} projects={assignedProjects} siteManagerId={MOCK_SITE_MANAGER_ID} />

        </motion.div>
      );
    };

    export default SiteManagerDashboard;