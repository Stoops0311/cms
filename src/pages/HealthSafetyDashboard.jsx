import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { ShieldCheck, AlertTriangle, HardHat, PlusCircle, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button.jsx';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Switch } from '@/components/ui/switch.jsx';
import { useToast } from '@/components/ui/use-toast.jsx';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

const ppeTypes = ["Hard Hat", "Safety Vest", "Gloves", "Safety Glasses", "Steel-toed Boots", "Harness"];
const hazardTypes = ["Fall Hazard", "Electrical Hazard", "Struck-by Hazard", "Caught-in/between Hazard", "Chemical Exposure", "Fire Hazard"];
const severityLevels = ["Low", "Medium", "High", "Critical"];

const PPEReportForm = ({ onSubmit, onCancel, projects, isSubmitting }) => {
  const [siteLocation, setSiteLocation] = useState('');
  const [ppeType, setPpeType] = useState(ppeTypes[0]);
  const [isCompliant, setIsCompliant] = useState(true);
  const [notes, setNotes] = useState('');
  const [projectId, setProjectId] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!siteLocation) {
      toast({ variant: "destructive", title: "Missing fields", description: "Site location is required." });
      return;
    }
    onSubmit({
      siteLocation,
      ppeType,
      isCompliant,
      notes: notes || undefined,
      projectId: projectId || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="projectId">Project (Optional)</Label>
        <Select value={projectId} onValueChange={setProjectId}>
          <SelectTrigger id="projectId"><SelectValue placeholder="Select Project" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">No Project</SelectItem>
            {projects?.map(p => <SelectItem key={p._id} value={p._id}>{p.projectName}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="siteLocation">Site Location</Label>
        <Textarea id="siteLocation" value={siteLocation} onChange={e => setSiteLocation(e.target.value)} placeholder="e.g., Sector B, Level 3" />
      </div>
      <div>
        <Label htmlFor="ppeType">PPE Type</Label>
        <Select value={ppeType} onValueChange={setPpeType}>
          <SelectTrigger id="ppeType"><SelectValue placeholder="Select PPE Type" /></SelectTrigger>
          <SelectContent>{ppeTypes.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="flex items-center space-x-2">
        <Switch id="isCompliant" checked={isCompliant} onCheckedChange={setIsCompliant} />
        <Label htmlFor="isCompliant">Compliant</Label>
        <span className={`text-sm ${isCompliant ? 'text-green-600' : 'text-red-600'}`}>
          {isCompliant ? '(PPE properly used)' : '(Non-compliance issue)'}
        </span>
      </div>
      <div>
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Additional details..." />
      </div>
      <DialogFooter className="pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit Report
        </Button>
      </DialogFooter>
    </form>
  );
};

const HazardReportForm = ({ onSubmit, onCancel, projects, isSubmitting }) => {
  const [siteLocation, setSiteLocation] = useState('');
  const [hazardType, setHazardType] = useState(hazardTypes[0]);
  const [severity, setSeverity] = useState('Medium');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!siteLocation || !description) {
      toast({ variant: "destructive", title: "Missing fields", description: "Site location and description are required." });
      return;
    }
    onSubmit({
      siteLocation,
      hazardType,
      severity,
      description,
      status: "Open",
      projectId: projectId || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="projectId">Project (Optional)</Label>
        <Select value={projectId} onValueChange={setProjectId}>
          <SelectTrigger id="projectId"><SelectValue placeholder="Select Project" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">No Project</SelectItem>
            {projects?.map(p => <SelectItem key={p._id} value={p._id}>{p.projectName}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="siteLocation">Site Location</Label>
        <Textarea id="siteLocation" value={siteLocation} onChange={e => setSiteLocation(e.target.value)} placeholder="e.g., Sector B, Level 3" />
      </div>
      <div>
        <Label htmlFor="hazardType">Hazard Type</Label>
        <Select value={hazardType} onValueChange={setHazardType}>
          <SelectTrigger id="hazardType"><SelectValue placeholder="Select Hazard Type" /></SelectTrigger>
          <SelectContent>{hazardTypes.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="severity">Severity</Label>
        <Select value={severity} onValueChange={setSeverity}>
          <SelectTrigger id="severity"><SelectValue placeholder="Select Severity" /></SelectTrigger>
          <SelectContent>{severityLevels.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Detailed description of the hazard..." />
      </div>
      <DialogFooter className="pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit Report
        </Button>
      </DialogFooter>
    </form>
  );
};

const HealthSafetyDashboard = () => {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reportType, setReportType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Convex queries
  const ppeReports = useQuery(api.safety.listPPEReports, {});
  const hazardReports = useQuery(api.safety.listHazardReports, {});
  const safetyStats = useQuery(api.safety.getSafetyStats, {});
  const projects = useQuery(api.projects.listProjects, {});
  const users = useQuery(api.admin.listUsers, { isActive: true });
  const incidentReports = useQuery(api.incidentReports.listIncidentReports, {});
  const incidentStats = useQuery(api.incidentReports.getIncidentStats, {});

  // Convex mutations
  const createPPEReport = useMutation(api.safety.createPPEReport);
  const createHazardReport = useMutation(api.safety.createHazardReport);
  const resolveHazard = useMutation(api.safety.resolveHazard);

  // Get first admin user as reporter
  const currentUser = users?.find(u => u.role === 'admin') || users?.[0];

  const handleOpenModal = (type) => {
    setReportType(type);
    setIsModalOpen(true);
  };

  const handleSavePPEReport = async (reportData) => {
    if (!currentUser) {
      toast({ variant: "destructive", title: "Error", description: "No user found to submit report." });
      return;
    }
    setIsSubmitting(true);
    try {
      await createPPEReport({
        ...reportData,
        reportedBy: currentUser._id,
      });
      toast({ title: "PPE Report Submitted", description: "PPE compliance report saved successfully." });
      setIsModalOpen(false);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to save report." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveHazardReport = async (reportData) => {
    if (!currentUser) {
      toast({ variant: "destructive", title: "Error", description: "No user found to submit report." });
      return;
    }
    setIsSubmitting(true);
    try {
      await createHazardReport({
        ...reportData,
        reportedBy: currentUser._id,
      });
      toast({ title: "Hazard Report Submitted", description: "Site hazard report saved successfully." });
      setIsModalOpen(false);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to save report." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolveHazard = async (hazardId) => {
    const notes = window.prompt("Enter resolution notes:");
    if (notes) {
      try {
        await resolveHazard({ id: hazardId, resolutionNotes: notes });
        toast({ title: "Hazard Resolved", description: "Hazard has been marked as resolved." });
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: error.message || "Failed to resolve hazard." });
      }
    }
  };

  const isLoading = ppeReports === undefined || hazardReports === undefined;

  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'Low': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'High': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 md:p-6 lg:p-8 space-y-6"
    >
      {/* Stats Cards */}
      {safetyStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 border-l-4 border-blue-500">
            <div className="text-sm text-muted-foreground">PPE Compliance Rate</div>
            <div className="text-2xl font-bold text-blue-600">{safetyStats.ppe.complianceRate}%</div>
            <div className="text-xs text-muted-foreground">{safetyStats.ppe.compliant} compliant / {safetyStats.ppe.total} reports</div>
          </Card>
          <Card className="p-4 border-l-4 border-orange-500">
            <div className="text-sm text-muted-foreground">Open Hazards</div>
            <div className="text-2xl font-bold text-orange-600">{safetyStats.hazards.open}</div>
            <div className="text-xs text-muted-foreground">{safetyStats.hazards.inProgress} in progress</div>
          </Card>
          <Card className="p-4 border-l-4 border-green-500">
            <div className="text-sm text-muted-foreground">Resolved Hazards</div>
            <div className="text-2xl font-bold text-green-600">{safetyStats.hazards.resolved}</div>
          </Card>
          <Card className={`p-4 border-l-4 ${safetyStats.overallRiskLevel === 'High' ? 'border-red-500' : safetyStats.overallRiskLevel === 'Medium' ? 'border-yellow-500' : 'border-green-500'}`}>
            <div className="text-sm text-muted-foreground">Overall Risk Level</div>
            <div className={`text-2xl font-bold ${getRiskLevelColor(safetyStats.overallRiskLevel).split(' ')[0]}`}>
              {safetyStats.overallRiskLevel}
            </div>
          </Card>
        </div>
      )}

      <Card className="shadow-xl border-t-4 border-red-500">
        <CardHeader>
          <CardTitle className="text-2xl font-bold tracking-tight text-red-600 flex items-center">
            <ShieldCheck className="mr-2 h-6 w-6" />Health & Safety Dashboard
          </CardTitle>
          <CardDescription>
            Track PPE compliance, site hazards, and safety metrics.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Button
          size="lg"
          className="py-8 bg-blue-500 hover:bg-blue-600 text-lg font-semibold"
          onClick={() => handleOpenModal('ppe')}
          disabled={!currentUser}
        >
          <HardHat className="mr-2 h-5 w-5" />Log PPE Compliance/Issue
        </Button>
        <Button
          size="lg"
          className="py-8 bg-orange-500 hover:bg-orange-600 text-lg font-semibold"
          onClick={() => handleOpenModal('hazard')}
          disabled={!currentUser}
        >
          <AlertTriangle className="mr-2 h-5 w-5" />Report Site Hazard
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-red-500" />
          <span className="ml-2 text-muted-foreground">Loading safety data...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <HardHat className="mr-2 h-5 w-5 text-blue-600" />PPE Compliance Reports
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto">
              {ppeReports?.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">No PPE reports logged.</p>
              ) : (
                <div className="space-y-3">
                  {ppeReports?.slice(0, 10).map(r => (
                    <div key={r._id} className={`p-3 rounded-lg border ${r.isCompliant ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{r.ppeType}</span>
                        {r.isCompliant ? (
                          <span className="flex items-center text-green-600 text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />Compliant
                          </span>
                        ) : (
                          <span className="flex items-center text-red-600 text-xs">
                            <XCircle className="h-3 w-3 mr-1" />Non-Compliant
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{r.siteLocation}</p>
                      <p className="text-xs text-gray-500">Reported by: {r.reporterName}</p>
                      {r.notes && <p className="text-xs text-gray-500 mt-1">{r.notes}</p>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5 text-orange-600" />Site Hazard Reports
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto">
              {hazardReports?.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">No hazard reports logged.</p>
              ) : (
                <div className="space-y-3">
                  {hazardReports?.slice(0, 10).map(r => (
                    <div key={r._id} className="p-3 rounded-lg border bg-white shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{r.hazardType}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getSeverityColor(r.severity)}`}>
                            {r.severity}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${r.status === 'Resolved' ? 'bg-green-100 text-green-800' : r.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {r.status}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{r.siteLocation}</p>
                      <p className="text-xs text-gray-700 mt-1">{r.description}</p>
                      <p className="text-xs text-gray-500">Reported by: {r.reporterName}</p>
                      {r.status !== 'Resolved' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => handleResolveHazard(r._id)}
                        >
                          Mark Resolved
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Incident Reports Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-red-600" />Incident Reports
          </CardTitle>
          <CardDescription>Track and manage reported workplace incidents.</CardDescription>
        </CardHeader>
        <CardContent>
          {incidentStats && (
            <div className="grid grid-cols-4 gap-3 mb-4">
              <div className="p-2 bg-red-50 rounded text-center">
                <p className="text-lg font-bold text-red-600">{incidentStats.open}</p>
                <p className="text-xs text-muted-foreground">Open</p>
              </div>
              <div className="p-2 bg-yellow-50 rounded text-center">
                <p className="text-lg font-bold text-yellow-600">{incidentStats.underInvestigation}</p>
                <p className="text-xs text-muted-foreground">Investigating</p>
              </div>
              <div className="p-2 bg-green-50 rounded text-center">
                <p className="text-lg font-bold text-green-600">{incidentStats.resolved}</p>
                <p className="text-xs text-muted-foreground">Resolved</p>
              </div>
              <div className="p-2 bg-gray-50 rounded text-center">
                <p className="text-lg font-bold text-gray-600">{incidentStats.closed}</p>
                <p className="text-xs text-muted-foreground">Closed</p>
              </div>
            </div>
          )}
          {incidentReports?.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">No incident reports filed.</p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {incidentReports?.slice(0, 10).map(incident => (
                <div key={incident._id} className="p-3 rounded-lg border bg-white shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{incident.incidentType}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          incident.severity === 'Critical' ? 'bg-red-100 text-red-800' :
                          incident.severity === 'Serious' ? 'bg-orange-100 text-orange-800' :
                          incident.severity === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {incident.severity}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{incident.location}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(incident.incidentDate).toLocaleDateString()} at {incident.incidentTime}
                      </p>
                      <p className="text-xs text-gray-700 mt-1 line-clamp-2">{incident.description}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      incident.status === 'Closed' ? 'bg-gray-100 text-gray-800' :
                      incident.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                      incident.status === 'Under Investigation' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {incident.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {reportType === 'ppe' ? 'Log PPE Compliance/Issue' : 'Report Site Hazard'}
            </DialogTitle>
          </DialogHeader>
          {reportType === 'ppe' ? (
            <PPEReportForm
              onSubmit={handleSavePPEReport}
              onCancel={() => setIsModalOpen(false)}
              projects={projects}
              isSubmitting={isSubmitting}
            />
          ) : (
            <HazardReportForm
              onSubmit={handleSaveHazardReport}
              onCancel={() => setIsModalOpen(false)}
              projects={projects}
              isSubmitting={isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default HealthSafetyDashboard;
