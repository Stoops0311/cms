import React from 'react';
    import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { FolderKanban, AlertTriangle, QrCode as QrCodeIcon, CheckCircle, XCircle, PauseCircle, PlayCircle, DollarSign } from 'lucide-react';
    import { format } from 'date-fns';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';


    const ProjectDetailHeader = ({ project, hasOverdueTasks, isBudgetExceeded, onUpdateStatus }) => {
      const projectStatuses = ["Planning", "In Progress", "On Hold", "Completed", "Cancelled"];
      
      const getStatusIcon = (status) => {
        switch (status) {
          case 'Planning': return <PlayCircle className="h-5 w-5 mr-2 flex-shrink-0 text-gray-500" />;
          case 'In Progress': return <PlayCircle className="h-5 w-5 mr-2 flex-shrink-0 text-blue-500" />;
          case 'On Hold': return <PauseCircle className="h-5 w-5 mr-2 flex-shrink-0 text-yellow-500" />;
          case 'Completed': return <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 text-green-500" />;
          case 'Cancelled': return <XCircle className="h-5 w-5 mr-2 flex-shrink-0 text-red-500" />;
          default: return <FolderKanban className="h-5 w-5 mr-2 flex-shrink-0 text-gray-500" />;
        }
      };

      return (
        <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 rounded-t-lg flex flex-col md:flex-row justify-between items-start">
          <div>
            <div className="flex items-center space-x-3">
              {getStatusIcon(project.projectStatus)}
              <div>
                <CardTitle className="text-3xl font-bold text-primary">{project.projectName}</CardTitle>
                <CardDescription>Project ID: {project.id} | Client: {project.clientName || 'N/A'}</CardDescription>
              </div>
            </div>
            {(hasOverdueTasks || isBudgetExceeded) && (
                <div className="mt-3 space-y-1">
                    {hasOverdueTasks && (
                        <div className="flex items-center text-sm text-orange-600 bg-orange-500/10 p-2 rounded-md">
                            <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
                            <span>One or more tasks are overdue. Check Tasks tab.</span>
                        </div>
                    )}
                    {isBudgetExceeded && (
                         <div className="flex items-center text-sm text-red-600 bg-red-500/10 p-2 rounded-md">
                            <DollarSign className="h-5 w-5 mr-2 flex-shrink-0" />
                            <span>Project budget has been exceeded. Current Cost: ${project.currentCost?.toLocaleString()} vs Budget: ${project.projectBudget?.toLocaleString()}</span>
                        </div>
                    )}
                </div>
            )}
          </div>
          <div className="mt-4 md:mt-0 flex flex-col items-center space-y-2">
            {project.qrCodeValue ? ( // Assuming QR code might be used for site access or equipment tracking
                <img alt={`QR Code for ${project.projectName}`} className="w-24 h-24 border p-1 rounded-md bg-white shadow-sm" src="https://images.unsplash.com/photo-1626682561113-d1db402cc866" />
            ) : (
                <div className="w-24 h-24 border p-1 rounded-md bg-white shadow-sm flex flex-col items-center justify-center text-center">
                    <QrCodeIcon className="h-8 w-8 text-gray-400 mb-1" />
                    <p className="text-xs text-gray-500">No Project QR</p>
                </div>
            )}
            <div className="w-full">
                <Select value={project.projectStatus} onValueChange={onUpdateStatus}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Update Status" />
                    </SelectTrigger>
                    <SelectContent>
                        {projectStatuses.map(status => (
                            <SelectItem key={status} value={status}>
                                <div className="flex items-center">
                                    {getStatusIcon(status)} {status}
                                
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
          </div>
        </CardHeader>
      );
    };

    export default ProjectDetailHeader;