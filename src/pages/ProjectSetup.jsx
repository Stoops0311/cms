import React, { useState, useEffect } from 'react';
    import { useNavigate, useLocation } from 'react-router-dom';
    import useLocalStorage from '@/hooks/useLocalStorage.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card.jsx';
    import { useToast } from '@/components/ui/use-toast.jsx';
    import { Save, ArrowLeft, Briefcase } from 'lucide-react';
    import { motion } from 'framer-motion';

    import ProjectFormFields from '@/components/projectSetup/ProjectFormFields.jsx';
    import ProjectFileUploads from '@/components/projectSetup/ProjectFileUploads.jsx';
    import ProjectAssignments from '@/components/projectSetup/ProjectAssignments.jsx';
    import ProjectMilestones from '@/components/projectSetup/ProjectMilestones.jsx';

    const ProjectSetup = () => {
      const navigate = useNavigate();
      const location = useLocation();
      const { toast } = useToast();
      const [projects, setProjects] = useLocalStorage('projects', []);
      const [isEditing, setIsEditing] = useState(false);
      const [projectIdToEdit, setProjectIdToEdit] = useState(null);

      const initialMilestone = { title: '', dueDate: null, description: '', status: 'Pending' };
      const initialAssignment = { role: 'Project Manager', name: '', contact: '' };
      
      const getInitialFormData = () => ({
        id: `PROJ-${Date.now().toString(36).substr(2, 9).toUpperCase()}`,
        projectName: '',
        clientInfo: { name: '', contactPerson: '', email: '', phone: '' },
        projectIDString: '', 
        location: '',
        startDate: null,
        endDate: null,
        budgetAllocation: '',
        currency: 'USD',
        taxationInfo: '',
        drawings: [],
        boq: [],
        legalDocs: [],
        safetyCerts: [],
        assignments: [initialAssignment],
        milestones: [initialMilestone],
        projectStatus: 'Planning',
        creationDate: new Date().toISOString(),
        lastModified: new Date().toISOString()
      });

      const [formData, setFormData] = useState(getInitialFormData());

      useEffect(() => {
        const params = new URLSearchParams(location.search);
        const editId = params.get('edit');
        if (editId) {
          const projectToEdit = projects.find(p => p.id === editId);
          if (projectToEdit) {
            setFormData({
              ...projectToEdit,
              startDate: projectToEdit.startDate ? new Date(projectToEdit.startDate) : null,
              endDate: projectToEdit.endDate ? new Date(projectToEdit.endDate) : null,
              clientInfo: projectToEdit.clientInfo || { name: '', contactPerson: '', email: '', phone: '' },
              drawings: projectToEdit.drawings || [],
              boq: projectToEdit.boq || [],
              legalDocs: projectToEdit.legalDocs || [],
              safetyCerts: projectToEdit.safetyCerts || [],
              assignments: projectToEdit.assignments && projectToEdit.assignments.length > 0 ? projectToEdit.assignments : [initialAssignment],
              milestones: projectToEdit.milestones && projectToEdit.milestones.length > 0 ? projectToEdit.milestones.map(m => ({...m, dueDate: m.dueDate ? new Date(m.dueDate) : null})) : [initialMilestone],
            });
            setIsEditing(true);
            setProjectIdToEdit(editId);
          } else {
            toast({ variant: "destructive", title: "Error", description: "Project to edit not found." });
            navigate('/projects');
          }
        } else {
          setFormData(getInitialFormData());
          setIsEditing(false);
          setProjectIdToEdit(null);
        }
      }, [location.search, projects, navigate, toast]);
      

      const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
      };

      const handleClientInfoChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, clientInfo: { ...prev.clientInfo, [name]: value } }));
      };

      const handleDateChange = (name, date) => {
        setFormData(prev => ({ ...prev, [name]: date }));
      };

      const handleFileChange = (e, docType) => {
        const files = Array.from(e.target.files);
        const newDocs = files.map(file => ({
            name: file.name,
            file: file, 
            type: docType,
            uploadDate: new Date().toISOString(),
            id: `DOC-${Date.now().toString(36).substr(2,9)}-${Math.random().toString(36).substr(2,5)}`
        }));
        setFormData(prev => ({ ...prev, [docType.toLowerCase().replace(/\s+/g, '')]: [...(prev[docType.toLowerCase().replace(/\s+/g, '')] || []), ...newDocs] }));
        e.target.value = null; 
      };
      
      const removeFile = (docType, fileId) => {
        setFormData(prev => ({
            ...prev,
            [docType.toLowerCase().replace(/\s+/g, '')]: prev[docType.toLowerCase().replace(/\s+/g, '')].filter(doc => doc.id !== fileId)
        }));
      };

      const handleAssignmentChange = (index, e) => {
        const { name, value } = e.target;
        const updatedAssignments = [...formData.assignments];
        updatedAssignments[index] = { ...updatedAssignments[index], [name]: value };
        setFormData(prev => ({ ...prev, assignments: updatedAssignments }));
      };

      const addAssignment = () => {
        setFormData(prev => ({ ...prev, assignments: [...prev.assignments, {...initialAssignment}] }));
      };
      
      const removeAssignment = (index) => {
        setFormData(prev => ({ ...prev, assignments: prev.assignments.filter((_, i) => i !== index) }));
      };

      const handleMilestoneChange = (index, field, value) => {
        const updatedMilestones = [...formData.milestones];
        updatedMilestones[index] = { ...updatedMilestones[index], [field]: value };
        setFormData(prev => ({ ...prev, milestones: updatedMilestones }));
      };
      
      const addMilestone = () => {
        setFormData(prev => ({ ...prev, milestones: [...prev.milestones, {...initialMilestone}] }));
      };

      const removeMilestone = (index) => {
        setFormData(prev => ({ ...prev, milestones: prev.milestones.filter((_, i) => i !== index) }));
      };

      const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.projectName || !formData.clientInfo.name || !formData.startDate || !formData.endDate) {
            toast({ variant: "destructive", title: "Missing Fields", description: "Project Name, Client Name, Start Date, and End Date are required." });
            return;
        }
        if (new Date(formData.endDate) < new Date(formData.startDate)) {
            toast({ variant: "destructive", title: "Invalid Dates", description: "End Date cannot be before Start Date." });
            return;
        }

        const finalData = {
            ...formData,
            lastModified: new Date().toISOString(),
            drawings: formData.drawings.map(f => ({ name: f.name, type: f.type, uploadDate: f.uploadDate, id: f.id })),
            boq: formData.boq.map(f => ({ name: f.name, type: f.type, uploadDate: f.uploadDate, id: f.id })),
            legalDocs: formData.legalDocs.map(f => ({ name: f.name, type: f.type, uploadDate: f.uploadDate, id: f.id })),
            safetyCerts: formData.safetyCerts.map(f => ({ name: f.name, type: f.type, uploadDate: f.uploadDate, id: f.id })),
        };

        if (isEditing) {
          const updatedProjects = projects.map(p => p.id === projectIdToEdit ? finalData : p);
          setProjects(updatedProjects);
          toast({ title: "Project Updated", description: `Project "${finalData.projectName}" has been successfully updated.` });
        } else {
          const newProjectWithUniqueId = {...finalData, id: `PROJ-${Date.now().toString(36).substr(2, 9).toUpperCase()}`};
          setProjects([...projects, newProjectWithUniqueId]);
          toast({ title: "Project Created", description: `Project "${newProjectWithUniqueId.projectName}" has been successfully created.` });
        }
        navigate('/projects');
      };
      
      return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
          <Card className="shadow-xl border-t-4 border-primary">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl font-bold tracking-tight text-primary flex items-center">
                    <Briefcase className="mr-2 h-6 w-6"/>{isEditing ? 'Edit Project Details' : 'Create New Project'}
                  </CardTitle>
                  <CardDescription>Fill in the details to {isEditing ? 'update' : 'set up'} your construction project.</CardDescription>
                </div>
                <Button variant="outline" onClick={() => navigate('/projects')}><ArrowLeft className="mr-2 h-4 w-4"/>Back to Projects</Button>
              </div>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-8">
                <ProjectFormFields 
                    formData={formData} 
                    handleInputChange={handleInputChange} 
                    handleClientInfoChange={handleClientInfoChange} 
                    handleDateChange={handleDateChange}
                    setFormData={setFormData}
                />
                <ProjectFileUploads 
                    formData={formData} 
                    handleFileChange={handleFileChange} 
                    removeFile={removeFile} 
                />
                <ProjectAssignments 
                    formData={formData} 
                    handleAssignmentChange={handleAssignmentChange} 
                    addAssignment={addAssignment} 
                    removeAssignment={removeAssignment} 
                />
                <ProjectMilestones 
                    formData={formData} 
                    handleMilestoneChange={handleMilestoneChange} 
                    addMilestone={addMilestone} 
                    removeMilestone={removeMilestone} 
                />
              </CardContent>
              <CardFooter className="flex justify-end space-x-3 py-6 border-t">
                <Button type="button" variant="outline" onClick={() => navigate('/projects')}>Cancel</Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white"><Save className="mr-2 h-4 w-4"/>{isEditing ? 'Save Changes' : 'Create Project'}</Button>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      );
    };

    export default ProjectSetup;