import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { DatePicker } from '@/components/ui/date-picker.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter as DialogFooterCustom } from '@/components/ui/dialog.jsx';
import { Cable, PlusCircle, Trash2, Search, Filter, MapPin, Truck, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast.jsx';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { format } from 'date-fns';

const teamStatuses = ["Available", "Assigned", "On Leave", "Inactive"];

const FiberTeamForm = ({ onSubmit, initialData = {}, onCancel, projects, isSubmitting }) => {
  const [teamName, setTeamName] = useState(initialData.teamName || '');
  const [teamLead, setTeamLead] = useState(initialData.teamLead || '');
  const [members, setMembers] = useState(initialData.members || []);
  const [status, setStatus] = useState(initialData.status || teamStatuses[0]);
  const [currentAssignment, setCurrentAssignment] = useState(initialData.currentAssignment || {
    projectId: '',
    location: '',
    taskDescription: '',
    assignmentDate: null,
    expectedCompletionDate: null
  });
  const { toast } = useToast();

  const handleAssignmentChange = (field, value) => {
    setCurrentAssignment(prev => ({ ...prev, [field]: value }));
  };

  const handleAddMember = () => {
    const newMember = prompt("Enter new member name:");
    if (newMember) setMembers(prev => [...prev, newMember]);
  };

  const handleRemoveMember = (memberToRemove) => {
    setMembers(prev => prev.filter(m => m !== memberToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!teamName || !teamLead) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Team Name and Team Lead are required." });
      return;
    }
    onSubmit({
      id: initialData._id,
      teamName,
      teamLead,
      members,
      status,
      currentAssignment: {
        ...currentAssignment,
        projectId: currentAssignment.projectId || undefined,
        assignmentDate: currentAssignment.assignmentDate
          ? format(new Date(currentAssignment.assignmentDate), 'yyyy-MM-dd')
          : undefined,
        expectedCompletionDate: currentAssignment.expectedCompletionDate
          ? format(new Date(currentAssignment.expectedCompletionDate), 'yyyy-MM-dd')
          : undefined,
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="teamName-fiber">Team Name</Label>
          <Input id="teamName-fiber" value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="e.g., Splicing Crew Alpha" />
        </div>
        <div>
          <Label htmlFor="teamLead-fiber">Team Lead</Label>
          <Input id="teamLead-fiber" value={teamLead} onChange={e => setTeamLead(e.target.value)} placeholder="e.g., John Doe" />
        </div>
      </div>

      <div>
        <Label>Team Members</Label>
        <div className="p-2 border rounded-md space-y-1 bg-slate-50">
          {members.map((member, idx) => (
            <div key={idx} className="flex justify-between items-center text-sm p-1">
              <span>{member}</span>
              <Button type="button" variant="ghost" size="xs" onClick={() => handleRemoveMember(member)}>
                <Trash2 className="h-3 w-3 text-destructive" />
              </Button>
            </div>
          ))}
          {members.length === 0 && <p className="text-xs text-muted-foreground text-center py-1">No members added.</p>}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={handleAddMember} className="mt-2">
          <PlusCircle className="mr-2 h-4 w-4" />Add Member
        </Button>
      </div>

      <div>
        <Label htmlFor="status-fiber">Team Status</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger id="status-fiber"><SelectValue placeholder="Select Status" /></SelectTrigger>
          <SelectContent>{teamStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <Card className="p-4 bg-slate-50 border-dashed">
        <CardHeader className="p-0 pb-2">
          <CardTitle className="text-md flex items-center">
            <MapPin className="mr-2 h-5 w-5 text-green-600" />Current Assignment / Relocation
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 space-y-3">
          <div>
            <Label htmlFor="assignmentProject-fiber">Project</Label>
            <Select value={currentAssignment.projectId || ''} onValueChange={val => handleAssignmentChange('projectId', val)}>
              <SelectTrigger id="assignmentProject-fiber"><SelectValue placeholder="Select Project" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">No Project</SelectItem>
                {(projects || []).map(p => <SelectItem key={p._id} value={p._id}>{p.projectName}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="assignmentLocation-fiber">Location/Site Area</Label>
            <Input
              id="assignmentLocation-fiber"
              value={currentAssignment.location || ''}
              onChange={e => handleAssignmentChange('location', e.target.value)}
              placeholder="e.g., Manhole MH-201, Building C - IDF"
            />
          </div>
          <div>
            <Label htmlFor="assignmentTask-fiber">Task Description</Label>
            <Textarea
              id="assignmentTask-fiber"
              value={currentAssignment.taskDescription || ''}
              onChange={e => handleAssignmentChange('taskDescription', e.target.value)}
              placeholder="e.g., Splice 48F cable, OTDR testing..."
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="assignmentDate-fiber">Assignment Date</Label>
              <DatePicker
                id="assignmentDate-fiber"
                date={currentAssignment.assignmentDate ? new Date(currentAssignment.assignmentDate) : null}
                setDate={date => handleAssignmentChange('assignmentDate', date)}
              />
            </div>
            <div>
              <Label htmlFor="completionDate-fiber">Expected Completion</Label>
              <DatePicker
                id="completionDate-fiber"
                date={currentAssignment.expectedCompletionDate ? new Date(currentAssignment.expectedCompletionDate) : null}
                setDate={date => handleAssignmentChange('expectedCompletionDate', date)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <DialogFooterCustom className="pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData._id ? 'Update Team' : 'Add Team'}
        </Button>
      </DialogFooterCustom>
    </form>
  );
};

const FiberTeamManagement = () => {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All Statuses');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Convex queries
  const fiberTeams = useQuery(api.fiberTeams.listFiberTeams, {});
  const projects = useQuery(api.projects.listProjects, {});
  const users = useQuery(api.admin.listUsers, { isActive: true });

  // Convex mutations
  const createFiberTeam = useMutation(api.fiberTeams.createFiberTeam);
  const updateFiberTeam = useMutation(api.fiberTeams.updateFiberTeam);
  const deleteFiberTeam = useMutation(api.fiberTeams.deleteFiberTeam);

  // Get first admin user as createdBy
  const adminUser = users?.find(u => u.role === 'admin') || users?.[0];

  const handleSaveTeam = async (data) => {
    if (!adminUser) {
      toast({ variant: "destructive", title: "Error", description: "No admin user found." });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingTeam) {
        await updateFiberTeam({
          teamId: editingTeam._id,
          teamName: data.teamName,
          teamLead: data.teamLead,
          members: data.members,
          status: data.status,
          currentAssignment: data.currentAssignment.projectId || data.currentAssignment.location ? {
            projectId: data.currentAssignment.projectId || undefined,
            location: data.currentAssignment.location || undefined,
            taskDescription: data.currentAssignment.taskDescription || undefined,
            assignmentDate: data.currentAssignment.assignmentDate || undefined,
            expectedCompletionDate: data.currentAssignment.expectedCompletionDate || undefined,
          } : undefined,
        });
        toast({ title: "Fiber Team Updated" });
      } else {
        await createFiberTeam({
          teamName: data.teamName,
          teamLead: data.teamLead,
          members: data.members,
          status: data.status,
          currentAssignment: data.currentAssignment.projectId || data.currentAssignment.location ? {
            projectId: data.currentAssignment.projectId || undefined,
            location: data.currentAssignment.location || undefined,
            taskDescription: data.currentAssignment.taskDescription || undefined,
            assignmentDate: data.currentAssignment.assignmentDate || undefined,
            expectedCompletionDate: data.currentAssignment.expectedCompletionDate || undefined,
          } : undefined,
          createdBy: adminUser._id,
        });
        toast({ title: "Fiber Team Added" });
      }
      setIsModalOpen(false);
      setEditingTeam(null);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to save team." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (window.confirm("Delete this fiber team?")) {
      try {
        await deleteFiberTeam({ teamId });
        toast({ title: "Fiber Team Deleted", variant: "destructive" });
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: error.message || "Failed to delete team." });
      }
    }
  };

  const openEditModal = (team) => {
    setEditingTeam(team);
    setIsModalOpen(true);
  };

  const filteredTeams = useMemo(() => {
    if (!fiberTeams) return [];
    return fiberTeams.filter(team => {
      const matchesSearch = searchTerm === '' ||
        team.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.teamLead.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (team.currentAssignment?.location?.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = filterStatus === 'All Statuses' || team.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [fiberTeams, searchTerm, filterStatus]);

  const isLoading = fiberTeams === undefined || users === undefined;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-8">
      <Card className="shadow-xl border-t-4 border-indigo-600">
        <CardHeader className="bg-gradient-to-r from-indigo-600/10 to-purple-600/10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <CardTitle className="text-2xl font-bold text-indigo-700 flex items-center">
                <Cable className="mr-3 h-7 w-7" />Fiber Optic Team Management
              </CardTitle>
              <CardDescription>Manage splicing teams, assignments, and locations.</CardDescription>
            </div>
            <Button
              onClick={() => { setEditingTeam(null); setIsModalOpen(true); }}
              className="mt-4 md:mt-0 bg-indigo-600 hover:bg-indigo-700"
              disabled={!adminUser}
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Team
            </Button>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by team name, lead, location..."
                className="pl-10 w-full"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Filter by Status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {['All Statuses', ...teamStatuses].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
              <span className="ml-2 text-muted-foreground">Loading fiber teams...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team Name</TableHead>
                    <TableHead>Team Lead</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Current Project</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTeams.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No fiber teams found.
                      </TableCell>
                    </TableRow>
                  )}
                  {filteredTeams.map(team => (
                    <TableRow key={team._id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{team.teamName}</TableCell>
                      <TableCell>{team.teamLead}</TableCell>
                      <TableCell>{team.members.length > 0 ? team.members.join(', ') : 'N/A'}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          team.status === "Available" ? "bg-green-100 text-green-700" :
                          team.status === "Assigned" ? "bg-blue-100 text-blue-700" :
                          "bg-gray-100 text-gray-700"
                        }`}>
                          {team.status}
                        </span>
                      </TableCell>
                      <TableCell>{team.projectName || team.currentAssignment?.projectId || 'N/A'}</TableCell>
                      <TableCell>{team.currentAssignment?.location || 'N/A'}</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditModal(team)} title="Edit/Relocate Team">
                          <Truck className="h-4 w-4 text-orange-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteTeam(team._id)} title="Delete Team">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        {filteredTeams.length > 0 && (
          <CardFooter className="p-4 border-t text-sm text-muted-foreground">
            Showing {filteredTeams.length} of {fiberTeams?.length || 0} total teams.
          </CardFooter>
        )}
      </Card>

      <Dialog open={isModalOpen} onOpenChange={(open) => {
        if (!open) { setEditingTeam(null); setIsModalOpen(false); }
        else { setIsModalOpen(true); }
      }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
          <DialogHeader>
            <DialogTitle>{editingTeam ? 'Edit Fiber Team / Relocate' : 'Add New Fiber Team'}</DialogTitle>
            <DialogDescription>
              {editingTeam ? `Update details for ${editingTeam.teamName}.` : 'Define a new fiber splicing team and their initial assignment.'}
            </DialogDescription>
          </DialogHeader>
          <FiberTeamForm
            onSubmit={handleSaveTeam}
            initialData={editingTeam || {}}
            onCancel={() => { setIsModalOpen(false); setEditingTeam(null); }}
            projects={projects}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default FiberTeamManagement;
