import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card.jsx';
import { useToast } from '@/components/ui/use-toast.jsx';
import { Save, ArrowLeft, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';

import ProjectFormFields from '@/components/projectSetup/ProjectFormFields.jsx';
import ProjectFileUploads from '@/components/projectSetup/ProjectFileUploads.jsx';
import ProjectAssignments from '@/components/projectSetup/ProjectAssignments.jsx';
import ProjectMilestones from '@/components/projectSetup/ProjectMilestones.jsx';

const ProjectSetupConvex = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, userId } = useAuth();
  
  // Convex mutations
  const createProject = useMutation(api.projects.createProject);
  const updateProject = useMutation(api.projects.updateProject);
  const createProjectAssignment = useMutation(api.projects.createProjectAssignment);
  const createProjectMilestone = useMutation(api.projects.createProjectMilestone);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const storeFile = useMutation(api.storage.storeFile);
  const addProjectDocument = useMutation(api.storage.addProjectDocument);
  
  const [isEditing, setIsEditing] = useState(false);
  const [projectIdToEdit, setProjectIdToEdit] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Query for existing project if editing
  const params = new URLSearchParams(location.search);
  const editId = params.get('edit');
  const projectToEdit = useQuery(
    api.projects.getProjectById,
    editId ? { projectId: editId } : "skip"
  );

  useEffect(() => {
    if (projectToEdit) {
      setFormData({
        ...projectToEdit,
        startDate: projectToEdit.startDate ? new Date(projectToEdit.startDate) : null,
        endDate: projectToEdit.endDate ? new Date(projectToEdit.endDate) : null,
        assignments: projectToEdit.assignments && projectToEdit.assignments.length > 0 
          ? projectToEdit.assignments 
          : [initialAssignment],
        milestones: projectToEdit.milestones && projectToEdit.milestones.length > 0 
          ? projectToEdit.milestones.map(m => ({...m, dueDate: m.dueDate ? new Date(m.dueDate) : null})) 
          : [initialMilestone],
      });
      setIsEditing(true);
      setProjectIdToEdit(editId);
    } else if (editId && projectToEdit === null) {
      toast({ variant: "destructive", title: "Error", description: "Project to edit not found." });
      navigate('/projects');
    }
  }, [projectToEdit, editId, navigate, toast]);

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

  const handleFileChange = async (e, docType) => {
    const files = Array.from(e.target.files);
    
    for (const file of files) {
      try {
        // Get upload URL from Convex
        const uploadUrl = await generateUploadUrl();
        
        // Upload file to Convex storage
        const response = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        
        if (!response.ok) {
          throw new Error("Failed to upload file");
        }
        
        const { storageId } = await response.json();
        
        // Store file metadata
        const fileData = await storeFile({
          storageId,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          uploadedBy: userId,
          category: docType,
        });
        
        // Add to form data temporarily (will be added to project on submit)
        const newDoc = {
          storageId,
          name: file.name,
          type: docType,
          uploadDate: new Date().toISOString(),
          id: `DOC-${Date.now().toString(36).substr(2,9)}-${Math.random().toString(36).substr(2,5)}`
        };
        
        setFormData(prev => ({ 
          ...prev, 
          [docType.toLowerCase().replace(/\s+/g, '')]: [...(prev[docType.toLowerCase().replace(/\s+/g, '')] || []), newDoc] 
        }));
        
        toast({ title: "File Uploaded", description: `${file.name} uploaded successfully.` });
      } catch (error) {
        console.error("Upload error:", error);
        toast({ variant: "destructive", title: "Upload Failed", description: error.message });
      }
    }
    
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.projectName || !formData.clientInfo.name || !formData.startDate || !formData.endDate) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Project Name, Client Name, Start Date, and End Date are required." });
      return;
    }
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      toast({ variant: "destructive", title: "Invalid Dates", description: "End Date cannot be before Start Date." });
      return;
    }

    setIsSubmitting(true);

    try {
      let projectId;
      
      if (isEditing) {
        // Update existing project
        await updateProject({
          projectId: projectIdToEdit,
          projectName: formData.projectName,
          projectIDString: formData.projectIDString,
          clientInfo: formData.clientInfo,
          location: formData.location,
          startDate: formData.startDate.toISOString(),
          endDate: formData.endDate.toISOString(),
          budgetAllocation: formData.budgetAllocation,
          currency: formData.currency,
          taxationInfo: formData.taxationInfo,
          projectStatus: formData.projectStatus,
        });
        projectId = projectIdToEdit;
        toast({ title: "Project Updated", description: `Project "${formData.projectName}" has been successfully updated.` });
      } else {
        // Create new project
        projectId = await createProject({
          projectName: formData.projectName,
          projectIDString: formData.projectIDString,
          clientInfo: formData.clientInfo,
          location: formData.location,
          startDate: formData.startDate.toISOString(),
          endDate: formData.endDate.toISOString(),
          budgetAllocation: formData.budgetAllocation,
          currency: formData.currency,
          taxationInfo: formData.taxationInfo,
          projectStatus: formData.projectStatus,
          createdBy: userId,
        });
        toast({ title: "Project Created", description: `Project "${formData.projectName}" has been successfully created.` });
      }

      // Add assignments
      if (!isEditing) {
        for (const assignment of formData.assignments) {
          if (assignment.name && assignment.role) {
            await createProjectAssignment({
              projectId,
              role: assignment.role,
              name: assignment.name,
              contact: assignment.contact,
              assignedBy: userId,
            });
          }
        }

        // Add milestones
        for (const milestone of formData.milestones) {
          if (milestone.title && milestone.dueDate) {
            await createProjectMilestone({
              projectId,
              title: milestone.title,
              dueDate: milestone.dueDate.toISOString(),
              description: milestone.description,
              status: milestone.status,
              createdBy: userId,
            });
          }
        }

        // Add documents
        const docTypes = ['drawings', 'boq', 'legalDocs', 'safetyCerts'];
        for (const docType of docTypes) {
          const docs = formData[docType] || [];
          for (const doc of docs) {
            if (doc.storageId) {
              await addProjectDocument({
                projectId,
                storageId: doc.storageId,
                documentType: docType,
              });
            }
          }
        }
      }

      navigate('/projects');
    } catch (error) {
      console.error("Submit error:", error);
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setIsSubmitting(false);
    }
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
            <Button type="button" variant="outline" onClick={() => navigate('/projects')} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white" disabled={isSubmitting}>
              <Save className="mr-2 h-4 w-4"/>
              {isSubmitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Project')}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );
};

export default ProjectSetupConvex;