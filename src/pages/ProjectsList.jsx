import React, { useState, useMemo } from 'react';
    import useLocalStorage from '@/hooks/useLocalStorage.jsx';
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
      const [projects, setProjects] = useLocalStorage('projects', []);
      const [searchTerm, setSearchTerm] = useState('');
      const [selectedSite, setSelectedSite] = useState('All Sites');
      const [selectedStatus, setSelectedStatus] = useState('All Statuses');
      const { toast } = useToast();

      const filteredProjects = useMemo(() => {
        return projects.filter(project => {
          const matchesSearchTerm = (
            project.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.projectCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (project.clientName && project.clientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (project.siteManager && project.siteManager.toLowerCase().includes(searchTerm.toLowerCase())) ||
            project.id.toLowerCase().includes(searchTerm.toLowerCase())
          );
          const matchesSite = selectedSite === 'All Sites' || project.siteLocation === selectedSite || (selectedSite === 'Unassigned' && !project.siteLocation);
          const matchesStatus = selectedStatus === 'All Statuses' || project.projectStatus === selectedStatus;
          
          return matchesSearchTerm && matchesSite && matchesStatus;
        });
      }, [projects, searchTerm, selectedSite, selectedStatus]);

      const handleDelete = (projectId) => {
        if (window.confirm("Are you sure you want to delete this project record? This action cannot be undone.")) {
          const projectToDelete = projects.find(p => p.id === projectId);
          setProjects(prevProjects => prevProjects.filter(p => p.id !== projectId));
          toast({
            title: "Project Deleted",
            description: `Project ${projectToDelete?.projectName || projectId} has been removed.`,
            variant: "destructive",
          });
        }
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
                <div className="text-center p-10 text-muted-foreground">
                  <FolderKanban className="mx-auto h-12 w-12 mb-4" />
                  <p className="text-lg font-semibold">No project records found.</p>
                  <p>{searchTerm || selectedSite !== 'All Sites' || selectedStatus !== 'All Statuses' ? "Try adjusting your search or filter criteria." : "Setup a new project to get started."}</p>
                </div>
              ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project ID</TableHead>
                      <TableHead>Project Name</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Site Location</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProjects.map((project) => (
                      <motion.tr 
                        key={project.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="hover:bg-primary/5"
                      >
                        <TableCell className="font-medium text-xs">{project.id}</TableCell>
                        <TableCell>{project.projectName}</TableCell>
                        <TableCell>{project.clientName || 'N/A'}</TableCell>
                        <TableCell>{project.siteLocation || <span className="italic text-muted-foreground">Unassigned</span>}</TableCell>
                        <TableCell>{project.startDate ? format(new Date(project.startDate), 'dd MMM yyyy') : 'N/A'}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            project.projectStatus === 'Completed' ? 'bg-green-100 text-green-700' :
                            project.projectStatus === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                            project.projectStatus === 'On Hold' ? 'bg-yellow-100 text-yellow-700' :
                            project.projectStatus === 'Cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {project.projectStatus || 'N/A'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button variant="ghost" size="icon" className="hover:text-primary" asChild title="View Details">
                            <Link to={`/projects/${project.id}`}><Eye className="h-4 w-4" /></Link>
                          </Button>
                          <Button variant="ghost" size="icon" className="hover:text-accent-foreground" asChild title="Edit Project">
                            <Link to={`/project-setup?edit=${project.id}`}><Edit className="h-4 w-4" /></Link>
                          </Button>
                          <Button variant="ghost" size="icon" className="hover:text-destructive" onClick={() => handleDelete(project.id)} title="Delete Project">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
              )}
            </CardContent>
             {filteredProjects.length > 0 && (
                <div className="p-4 border-t text-sm text-muted-foreground">
                    Showing {filteredProjects.length} of {projects.length} projects.
                </div>
            )}
          </Card>
        </motion.div>
      );
    };
    export default ProjectsList;