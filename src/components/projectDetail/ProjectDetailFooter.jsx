import React from 'react';
    import { CardFooter } from '@/components/ui/card.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { Edit, CheckSquare, FileArchive } from 'lucide-react';

    const ProjectDetailFooter = ({ projectId, onNavigateToEdit, onManageTasks }) => {
      return (
        <CardFooter className="border-t p-6 bg-slate-50 rounded-b-lg flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
          <Button variant="outline" onClick={() => onNavigateToEdit(projectId)} className="w-full sm:w-auto">
            <Edit className="mr-2 h-4 w-4" /> Edit Project Details
          </Button>
          <Button onClick={onManageTasks} className="w-full sm:w-auto bg-accent hover:bg-accent/90">
            <CheckSquare className="mr-2 h-4 w-4" /> Manage Tasks
          </Button>
          <Button variant="secondary" className="w-full sm:w-auto" disabled>
            <FileArchive className="mr-2 h-4 w-4" /> Archive Project
          </Button>
        </CardFooter>
      );
    };

    export default ProjectDetailFooter;