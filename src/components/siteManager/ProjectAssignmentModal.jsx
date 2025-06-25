import React from 'react';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
    import { CheckCircle, HardHat } from 'lucide-react';
    import { Link } from 'react-router-dom';
    import { format } from 'date-fns';


    const ProjectAssignmentModal = ({ isOpen, onClose, projects, siteManagerId }) => {
      
      const assignedProjects = projects || [];

      return (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center"><HardHat className="mr-2 h-5 w-5 text-primary" />Your Project Assignments</DialogTitle>
              <DialogDescription>Overview of projects currently assigned to you.</DialogDescription>
            </DialogHeader>
            <div className="py-4 max-h-96 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
              {assignedProjects.length === 0 ? (
                <p className="text-muted-foreground text-center">No projects are currently assigned to you.</p>
              ) : (
                assignedProjects.map(project => (
                  <Card key={project.id} className="bg-slate-50 hover:shadow-md transition-shadow">
                    <CardHeader className="p-4">
                      <CardTitle className="text-base font-semibold text-primary">{project.projectName}</CardTitle>
                      <p className="text-xs text-muted-foreground">ID: {project.projectCode}</p>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 text-sm">
                      <p>Status: <span className={`font-medium ${project.projectStatus === 'In Progress' ? 'text-blue-600' : 'text-gray-600'}`}>{project.projectStatus}</span></p>
                      <p>Client: {project.clientName}</p>
                      <p>Expected End: {project.expectedEndDate ? format(new Date(project.expectedEndDate), 'dd MMM yyyy') : 'N/A'}</p>
                      <Button size="sm" variant="link" asChild className="p-0 h-auto mt-1">
                        <Link to={`/projects/${project.id}`}>View Details</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
            <DialogFooter>
              <Button onClick={onClose}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    };

    export default ProjectAssignmentModal;