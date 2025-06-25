import React, { useState } from 'react';
    import { useParams, Link, useNavigate } from 'react-router-dom';
    import useLocalStorage from '@/hooks/useLocalStorage.jsx';
    import { Card, CardContent, CardTitle, CardDescription, CardHeader, CardFooter } from '@/components/ui/card.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { ArrowLeft, Briefcase, User, Mail, Phone, MapPin, Edit2, PlusCircle, Trash2, FolderKanban } from 'lucide-react';
    import { motion } from 'framer-motion';
    import { useToast } from '@/components/ui/use-toast.jsx';
    import DetailItem from '@/components/projectDetail/DetailItem.jsx'; // Reusing this component
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter as DialogFooterCustom } from '@/components/ui/dialog.jsx'; // Renamed to avoid conflict

    const ContractorDetail = () => {
      const { contractorId } = useParams();
      const [contractors, setContractors] = useLocalStorage('cmsContractors', []);
      const [projects] = useLocalStorage('projects', []); // For assigning projects
      const contractor = contractors.find(c => c.id === contractorId);
      const navigate = useNavigate();
      const { toast } = useToast();
      const [isAssignProjectModalOpen, setIsAssignProjectModalOpen] = useState(false);
      const [selectedProjectId, setSelectedProjectId] = useState('');

      if (!contractor) {
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <Card className="w-full max-w-md text-center shadow-xl"><CardHeader><Briefcase className="mx-auto h-12 w-12 text-destructive" /><CardTitle>Contractor Not Found</CardTitle></CardHeader><CardContent><Link to="/contractors"><Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Contractors</Button></Link></CardContent></Card>
          </div>
        );
      }

      const handleAssignProject = () => {
        if (!selectedProjectId) {
          toast({ variant: "destructive", title: "No Project Selected" });
          return;
        }
        if (contractor.projectsAssigned?.includes(selectedProjectId)) {
          toast({ variant: "destructive", title: "Project Already Assigned" });
          return;
        }
        const updatedContractor = {
          ...contractor,
          projectsAssigned: [...(contractor.projectsAssigned || []), selectedProjectId]
        };
        setContractors(prev => prev.map(c => c.id === contractorId ? updatedContractor : c));
        toast({ title: "Project Assigned", description: `${projects.find(p=>p.id === selectedProjectId)?.projectName} assigned to ${contractor.name}.` });
        setIsAssignProjectModalOpen(false);
        setSelectedProjectId('');
      };
      
      const handleUnassignProject = (projectIdToUnassign) => {
         const updatedContractor = {
          ...contractor,
          projectsAssigned: contractor.projectsAssigned.filter(pId => pId !== projectIdToUnassign)
        };
        setContractors(prev => prev.map(c => c.id === contractorId ? updatedContractor : c));
        toast({ title: "Project Unassigned", description: `${projects.find(p=>p.id === projectIdToUnassign)?.projectName} unassigned from ${contractor.name}.`, variant: "destructive" });
      };

      const assignedProjectDetails = contractor.projectsAssigned?.map(pId => projects.find(p => p.id === pId)).filter(Boolean) || [];

      return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Button variant="outline" onClick={() => navigate(-1)} className="mb-6"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
          <Card className="shadow-2xl border-t-4 border-cyan-600">
            <CardHeader className="bg-gradient-to-r from-cyan-600/10 to-sky-600/10 p-6">
              <div className="flex flex-col md:flex-row justify-between items-start">
                <div>
                  <CardTitle className="text-3xl font-bold text-cyan-700 flex items-center"><Briefcase className="mr-3 h-8 w-8" />{contractor.name}</CardTitle>
                  <CardDescription>{contractor.type} - {contractor.specialty}</CardDescription>
                </div>
                {/* <Button onClick={() => navigate(`/contractor-setup/${contractorId}`)}><Edit2 className="mr-2 h-4 w-4" /> Edit Contractor</Button> */}
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DetailItem icon={User} label="Contact Person" value={contractor.contactPerson} />
                <DetailItem icon={Mail} label="Email" value={contractor.email} />
                <DetailItem icon={Phone} label="Phone" value={contractor.phone} />
                <DetailItem icon={MapPin} label="Address" value={contractor.address || 'N/A'} className="md:col-span-2 lg:col-span-3" />
              </div>
              
              <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-xl text-cyan-700 flex items-center"><FolderKanban className="mr-2 h-5 w-5"/>Assigned Projects</CardTitle>
                        <Button size="sm" onClick={() => setIsAssignProjectModalOpen(true)}><PlusCircle className="mr-2 h-4 w-4"/>Assign Project</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {assignedProjectDetails.length === 0 ? (
                        <p className="text-muted-foreground">No projects assigned yet.</p>
                    ) : (
                        <ul className="space-y-2">
                            {assignedProjectDetails.map(proj => (
                                <li key={proj.id} className="flex justify-between items-center p-2 border rounded-md hover:bg-slate-50">
                                    <div>
                                        <Link to={`/projects/${proj.id}`} className="font-medium text-primary hover:underline">{proj.projectName}</Link>
                                        <p className="text-xs text-muted-foreground">{proj.projectCode} - Status: {proj.projectStatus}</p>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => handleUnassignProject(proj.id)} title="Unassign Project">
                                        <Trash2 className="h-4 w-4 text-destructive"/>
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          <Dialog open={isAssignProjectModalOpen} onOpenChange={setIsAssignProjectModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Project to {contractor.name}</DialogTitle>
                <DialogDescription>Select a project to assign to this contractor.</DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-2">
                <Label htmlFor="projectToAssign">Project</Label>
                <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                  <SelectTrigger id="projectToAssign"><SelectValue placeholder="Select Project" /></SelectTrigger>
                  <SelectContent>
                    {projects.filter(p => !contractor.projectsAssigned?.includes(p.id)).map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.projectName} ({p.projectCode})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooterCustom> {/* Renamed import */}
                <Button variant="outline" onClick={() => setIsAssignProjectModalOpen(false)}>Cancel</Button>
                <Button onClick={handleAssignProject}>Assign Project</Button>
              </DialogFooterCustom>
            </DialogContent>
          </Dialog>
        </motion.div>
      );
    };

    export default ContractorDetail;