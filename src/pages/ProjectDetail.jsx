import React, { useState, useEffect } from 'react';
    import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
    import useLocalStorage from '@/hooks/useLocalStorage.jsx';
    import { Card, CardContent, CardTitle, CardDescription, CardHeader } from '@/components/ui/card.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { ArrowLeft, AlertTriangle } from 'lucide-react';
    import { motion } from 'framer-motion';
    import { useToast } from '@/components/ui/use-toast.jsx';

    import ProjectDetailHeader from '@/components/projectDetail/ProjectDetailHeader.jsx';
    import ProjectDetailTabs from '@/components/projectDetail/ProjectDetailTabs.jsx';
    import ProjectDetailFooter from '@/components/projectDetail/ProjectDetailFooter.jsx';

    const ProjectDetail = () => {
      const { projectId } = useParams();
      const [projects, setProjects] = useLocalStorage('projects', []);
      const project = projects.find(p => p.id === projectId);
      const location = useLocation();
      const navigate = useNavigate();
      const { toast } = useToast();
      
      const [activeTab, setActiveTab] = useState("overview");

      useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab) {
          setActiveTab(tab);
        } else {
          setActiveTab("overview"); 
        }
      }, [location.search, projectId]);

      if (!project) {
        return (
          <div className="flex flex-col items-center justify-center h-full p-4">
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
              <Card className="w-full max-w-md text-center shadow-xl border-t-4 border-destructive">
                <CardHeader>
                  <AlertTriangle className="mx-auto h-16 w-16 text-destructive mb-4" />
                  <CardTitle className="text-2xl font-bold text-destructive">Project Not Found</CardTitle>
                  <CardDescription>The project record (ID: {projectId}) you are looking for does not exist or could not be loaded.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to="/projects">
                    <Button variant="outline">
                      <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects List
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        );
      }

      const hasOverdueTasks = project.tasks ? project.tasks.some(task => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Completed') : false;
      const isBudgetExceeded = project.currentCost && project.projectBudget && parseFloat(project.currentCost) > parseFloat(project.projectBudget);
      
      const updateProjectData = (updatedData) => {
        const updatedProjects = projects.map(p => 
          p.id === projectId 
          ? { ...p, ...updatedData, lastModified: new Date().toISOString() } 
          : p
        );
        setProjects(updatedProjects);
        toast({
            title: "Project Updated",
            description: `Project "${project.projectName}" has been successfully updated.`,
        });
      };

      const handleUpdateStatus = (newStatus) => {
        updateProjectData({ projectStatus: newStatus });
        toast({
            title: `Project Status Updated`,
            description: `Project ${project.projectName} status changed to ${newStatus}.`,
            className: "bg-blue-500 text-white",
        });
      };

      const navigateToEdit = (id) => {
        navigate(`/project-setup?edit=${id}`);
      };

      const manageTasks = () => {
        setActiveTab("tasks");
        navigate(`/projects/${projectId}?tab=tasks`, { replace: true });
      };

      const handleTabChange = (newTab) => {
        setActiveTab(newTab);
        navigate(`/projects/${projectId}?tab=${newTab}`, { replace: true });
      };


      return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="pb-8">
           <Button variant="outline" onClick={() => navigate('/projects')} className="mb-6">
             <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects List
           </Button>
          <Card className="shadow-2xl border-t-4 border-primary">
            <ProjectDetailHeader 
              project={project} 
              hasOverdueTasks={hasOverdueTasks} 
              isBudgetExceeded={isBudgetExceeded} 
              onUpdateStatus={handleUpdateStatus} 
            />
            <CardContent className="p-4 md:p-6">
              <ProjectDetailTabs 
                project={project}
                activeTab={activeTab}
                setActiveTab={handleTabChange}
                updateProjectData={updateProjectData}
              />
            </CardContent>
            <ProjectDetailFooter 
              projectId={project.id}
              onNavigateToEdit={navigateToEdit}
              onManageTasks={manageTasks}
            />
          </Card>
        </motion.div>
      );
    };

    export default ProjectDetail;