import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Eye, Edit, Trash2, Search, FolderKanban, Filter, FolderPlus } from 'lucide-react';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast.jsx';
import { format } from 'date-fns';

const siteLocations = ["All Sites", "North Sector", "South Sector", "East Sector", "West Sector", "Central Hub", "Remote Site A", "Unassigned"];
const projectStatuses = ["All Statuses", "Planning", "In Progress", "On Hold", "Completed", "Cancelled"];

const ProjectsList = () => {
  // Convex queries and mutations
  const projects = useQuery(api.projects.listProjects) || [];
  const deleteProject = useMutation(api.projects.deleteProject);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSite, setSelectedSite] = useState('All Sites');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const { toast } = useToast();

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearchTerm = (
        project.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.projectIDString && project.projectIDString.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (project.clientInfo?.name && project.clientInfo.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (project.location && project.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
        project._id.toLowerCase().includes(searchTerm.toLowerCase())
      );
      const matchesSite = selectedSite === 'All Sites' || project.location === selectedSite || (selectedSite === 'Unassigned' && !project.location);
      const matchesStatus = selectedStatus === 'All Statuses' || project.projectStatus === selectedStatus;
      
      return matchesSearchTerm && matchesSite && matchesStatus;
    });
  }, [projects, searchTerm, selectedSite, selectedStatus]);

  const handleDelete = async (projectId) => {
    if (window.confirm("Are you sure you want to delete this project record? This action cannot be undone.")) {
      try {
        const projectToDelete = projects.find(p => p._id === projectId);
        await deleteProject({ projectId });
        toast({
          title: "Project Deleted",
          description: `Project ${projectToDelete?.projectName || projectId} has been removed.`,
          variant: "destructive",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Delete Failed",
          description: "Could not delete project. Please try again."
        });
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'Planning': 'bg-blue-100 text-blue-800',
      'In Progress': 'bg-green-100 text-green-800',
      'On Hold': 'bg-yellow-100 text-yellow-800',
      'Completed': 'bg-gray-100 text-gray-800',
      'Cancelled': 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };
  
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <Card className="shadow-xl border-t-4 border-primary">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 rounded-t-lg">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <CardTitle className="text-2xl font-bold text-primary">Project Records</CardTitle>
              <CardDescription>Manage and view all registered project information.</CardDescription>
            </div>
            <Button asChild className="mt-4 md:mt-0 bg-primary hover:bg-primary/90">
              <Link to="/project-setup">
                <FolderPlus className="mr-2 h-4 w-4" /> Setup New Project
              </Link>
            </Button>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="relative md:col-span-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Search by name, code, client..."
                className="pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="siteFilter" className="sr-only">Filter by Site</Label>
              <Select value={selectedSite} onValueChange={setSelectedSite}>
                <SelectTrigger id="siteFilter" className="w-full">
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Filter by Site Location" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {siteLocations.map(site => (
                    <SelectItem key={site} value={site}>{site}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="statusFilter" className="sr-only">Filter by Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger id="statusFilter" className="w-full">
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Filter by Project Status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {projectStatuses.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <FolderKanban className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                {projects.length === 0 ? 'No Projects Found' : 'No Matching Projects'}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {projects.length === 0 ? 'Get started by setting up your first construction project.' : 'Try adjusting your search or filter criteria.'}
              </p>
              {projects.length === 0 && (
                <Button asChild>
                  <Link to="/project-setup">
                    <FolderPlus className="mr-2 h-4 w-4" /> Setup First Project
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-2">
                    <TableHead className="font-semibold">Project Name</TableHead>
                    <TableHead className="font-semibold">Project ID</TableHead>
                    <TableHead className="font-semibold">Client</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Start Date</TableHead>
                    <TableHead className="font-semibold">End Date</TableHead>
                    <TableHead className="font-semibold">Location</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.map((project) => (
                    <TableRow key={project._id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium">{project.projectName}</TableCell>
                      <TableCell>{project.projectIDString || 'N/A'}</TableCell>
                      <TableCell>{project.clientInfo?.name || 'No client'}</TableCell>
                      <TableCell>{getStatusBadge(project.projectStatus)}</TableCell>
                      <TableCell>{formatDate(project.startDate)}</TableCell>
                      <TableCell>{formatDate(project.endDate)}</TableCell>
                      <TableCell>{project.location || 'Not specified'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/projects/${project._id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/project-setup?edit=${project._id}`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDelete(project._id)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProjectsList;