import React from 'react';
    import { motion } from 'framer-motion';
    import { CardTitle, CardDescription } from '@/components/ui/card.jsx';
    import DetailItem from '@/components/projectDetail/DetailItem.jsx';
    import { User, MapPin, Phone, CalendarDays, DollarSign, FileText, Briefcase, AlertCircle, CheckCircle, Info } from 'lucide-react';
    import { format } from 'date-fns';

    const ProjectOverviewTab = ({ project, updateProjectData }) => {

      const getStatusColor = (status) => {
        switch (status) {
          case 'Completed': return 'text-green-600';
          case 'In Progress': return 'text-blue-600';
          case 'On Hold': return 'text-yellow-600';
          case 'Cancelled': return 'text-red-600';
          default: return 'text-gray-600';
        }
      };
      
      const getStatusIcon = (status) => {
         switch (status) {
          case 'Completed': return CheckCircle;
          case 'In Progress': return Info;
          case 'On Hold': return AlertCircle;
          case 'Cancelled': return AlertCircle;
          default: return Info;
        }
      }

      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <div className="mb-8 p-4 bg-primary/5 rounded-lg">
            <CardTitle className="text-xl mb-1 font-semibold text-primary">Project Summary</CardTitle>
            <CardDescription className="text-sm text-gray-600">{project.projectScope || "No detailed scope provided."}</CardDescription>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-6">
            <DetailItem icon={Briefcase} label="Project Code" value={project.projectCode} />
            <DetailItem icon={User} label="Client Name" value={project.clientName} />
            <DetailItem icon={User} label="Site Manager" value={project.siteManager} />
            <DetailItem icon={MapPin} label="Site Location" value={project.siteLocation} />
            <DetailItem 
              icon={getStatusIcon(project.projectStatus)} 
              label="Project Status" 
              value={project.projectStatus} 
              isStatus={true}
              statusColor={getStatusColor(project.projectStatus)}
            />
            <DetailItem icon={CalendarDays} label="Start Date" value={project.startDate ? format(new Date(project.startDate), 'PPP') : 'N/A'} />
            <DetailItem icon={CalendarDays} label="Expected End Date" value={project.expectedEndDate ? format(new Date(project.expectedEndDate), 'PPP') : 'N/A'} />
            <DetailItem icon={DollarSign} label="Project Budget" value={project.projectBudget ? `$${parseFloat(project.projectBudget).toLocaleString()}` : 'N/A'} />
            <DetailItem icon={DollarSign} label="Contract Value" value={project.contractValue ? `$${parseFloat(project.contractValue).toLocaleString()}` : 'N/A'} />
            <DetailItem icon={CalendarDays} label="Contract Sign Date" value={project.contractSignDate ? format(new Date(project.contractSignDate), 'PPP') : 'N/A'} />
            <DetailItem icon={FileText} label="Project Type" value={project.projectType} />
          </div>
        </motion.div>
      );
    };

    export default ProjectOverviewTab;