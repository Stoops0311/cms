import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { CheckSquare, AlertTriangle, Microscope, Signal, ClipboardList, Plus, Loader2, XCircle, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { useToast } from '@/components/ui/use-toast.jsx';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

const QualityControl = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('ncrs');
  const [isNCRModalOpen, setIsNCRModalOpen] = useState(false);
  const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);

  // Queries
  const stats = useQuery(api.qualityControl.getQCStats, {});
  const ncrs = useQuery(api.qualityControl.listNCRs, {});
  const inspections = useQuery(api.qualityControl.listMaterialInspections, {});
  const testResults = useQuery(api.qualityControl.listTestResults, {});
  const projects = useQuery(api.projects.listProjects, {});
  const users = useQuery(api.admin.listUsers, {});

  // Mutations
  const createNCR = useMutation(api.qualityControl.createNCR);
  const updateNCR = useMutation(api.qualityControl.updateNCR);
  const createInspection = useMutation(api.qualityControl.createMaterialInspection);
  const createTest = useMutation(api.qualityControl.createTestResult);

  const currentUser = users?.[0];
  const isLoading = stats === undefined || ncrs === undefined;

  // NCR Form State
  const [ncrForm, setNCRForm] = useState({
    title: '', category: '', severity: '', description: '', location: '', projectId: ''
  });

  // Inspection Form State
  const [inspectionForm, setInspectionForm] = useState({
    materialType: '', supplier: '', batchNumber: '', quantity: '', unit: '',
    inspectionCriteria: '', result: '', defectsFound: '', remarks: '', projectId: ''
  });

  // Test Form State
  const [testForm, setTestForm] = useState({
    testType: '', location: '', sampleId: '', testParameters: '',
    resultValue: '', requiredValue: '', result: '', remarks: '', projectId: ''
  });

  const handleCreateNCR = async () => {
    if (!ncrForm.title || !ncrForm.category || !ncrForm.severity || !ncrForm.description) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Please fill in all required fields." });
      return;
    }
    try {
      await createNCR({
        title: ncrForm.title,
        category: ncrForm.category,
        severity: ncrForm.severity,
        description: ncrForm.description,
        location: ncrForm.location || undefined,
        projectId: ncrForm.projectId || undefined,
        detectedBy: currentUser._id,
        detectedDate: new Date().toISOString().split('T')[0],
      });
      toast({ title: "NCR Created", description: "Non-conformance report has been logged." });
      setIsNCRModalOpen(false);
      setNCRForm({ title: '', category: '', severity: '', description: '', location: '', projectId: '' });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const handleCreateInspection = async () => {
    if (!inspectionForm.materialType || !inspectionForm.inspectionCriteria || !inspectionForm.result) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Please fill in all required fields." });
      return;
    }
    try {
      await createInspection({
        materialType: inspectionForm.materialType,
        supplier: inspectionForm.supplier || undefined,
        batchNumber: inspectionForm.batchNumber || undefined,
        quantity: inspectionForm.quantity ? parseFloat(inspectionForm.quantity) : undefined,
        unit: inspectionForm.unit || undefined,
        inspectionDate: new Date().toISOString().split('T')[0],
        inspectedBy: currentUser._id,
        inspectionCriteria: inspectionForm.inspectionCriteria,
        result: inspectionForm.result,
        defectsFound: inspectionForm.defectsFound || undefined,
        remarks: inspectionForm.remarks || undefined,
        projectId: inspectionForm.projectId || undefined,
      });
      toast({ title: "Inspection Recorded", description: "Material inspection has been logged." });
      setIsInspectionModalOpen(false);
      setInspectionForm({ materialType: '', supplier: '', batchNumber: '', quantity: '', unit: '', inspectionCriteria: '', result: '', defectsFound: '', remarks: '', projectId: '' });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const handleCreateTest = async () => {
    if (!testForm.testType || !testForm.testParameters || !testForm.result) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Please fill in all required fields." });
      return;
    }
    try {
      await createTest({
        testType: testForm.testType,
        location: testForm.location || undefined,
        sampleId: testForm.sampleId || undefined,
        testDate: new Date().toISOString().split('T')[0],
        testedBy: currentUser._id,
        testParameters: testForm.testParameters,
        resultValue: testForm.resultValue || undefined,
        requiredValue: testForm.requiredValue || undefined,
        result: testForm.result,
        remarks: testForm.remarks || undefined,
        projectId: testForm.projectId || undefined,
      });
      toast({ title: "Test Recorded", description: "Test result has been logged." });
      setIsTestModalOpen(false);
      setTestForm({ testType: '', location: '', sampleId: '', testParameters: '', resultValue: '', requiredValue: '', result: '', remarks: '', projectId: '' });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const handleCloseNCR = async (ncrId) => {
    try {
      await updateNCR({ ncrId, status: "Closed", closedBy: currentUser._id, closedDate: new Date().toISOString().split('T')[0] });
      toast({ title: "NCR Closed", description: "Non-conformance report has been closed." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const getSeverityBadge = (severity) => {
    const colors = {
      Minor: 'bg-yellow-100 text-yellow-800',
      Major: 'bg-orange-100 text-orange-800',
      Critical: 'bg-red-100 text-red-800'
    };
    return <Badge className={colors[severity] || 'bg-gray-100'}>{severity}</Badge>;
  };

  const getStatusBadge = (status) => {
    const colors = {
      Open: 'bg-red-100 text-red-800',
      'Under Investigation': 'bg-yellow-100 text-yellow-800',
      'Corrective Action': 'bg-blue-100 text-blue-800',
      Verification: 'bg-purple-100 text-purple-800',
      Closed: 'bg-green-100 text-green-800'
    };
    return <Badge className={colors[status] || 'bg-gray-100'}>{status}</Badge>;
  };

  const getResultBadge = (result) => {
    const colors = {
      Pass: 'bg-green-100 text-green-800',
      Fail: 'bg-red-100 text-red-800',
      'Conditional Pass': 'bg-yellow-100 text-yellow-800'
    };
    return <Badge className={colors[result] || 'bg-gray-100'}>{result}</Badge>;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 md:p-6 lg:p-8 space-y-6"
    >
      {/* Header */}
      <Card className="shadow-xl border-t-4 border-green-500">
        <CardHeader>
          <CardTitle className="text-2xl font-bold tracking-tight text-green-600 flex items-center">
            <CheckSquare className="mr-2 h-6 w-6" />Quality Control (Civil & Telecom)
          </CardTitle>
          <CardDescription>
            Manage NCRs, material inspections, and test results for construction and telecom projects.
          </CardDescription>
        </CardHeader>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-green-500" />
          <span className="ml-2 text-muted-foreground">Loading quality control data...</span>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Card className="bg-red-50 border-red-200">
              <CardContent className="pt-4 text-center">
                <AlertTriangle className="h-6 w-6 mx-auto text-red-600 mb-1" />
                <p className="text-2xl font-bold text-red-700">{stats?.openNCRs || 0}</p>
                <p className="text-xs text-red-600">Open NCRs</p>
              </CardContent>
            </Card>
            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="pt-4 text-center">
                <XCircle className="h-6 w-6 mx-auto text-orange-600 mb-1" />
                <p className="text-2xl font-bold text-orange-700">{stats?.criticalNCRs || 0}</p>
                <p className="text-xs text-orange-600">Critical NCRs</p>
              </CardContent>
            </Card>
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-4 text-center">
                <Microscope className="h-6 w-6 mx-auto text-blue-600 mb-1" />
                <p className="text-2xl font-bold text-blue-700">{stats?.totalInspections || 0}</p>
                <p className="text-xs text-blue-600">Inspections</p>
              </CardContent>
            </Card>
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-4 text-center">
                <CheckCircle className="h-6 w-6 mx-auto text-green-600 mb-1" />
                <p className="text-2xl font-bold text-green-700">{stats?.passedInspections || 0}</p>
                <p className="text-xs text-green-600">Passed</p>
              </CardContent>
            </Card>
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="pt-4 text-center">
                <Signal className="h-6 w-6 mx-auto text-purple-600 mb-1" />
                <p className="text-2xl font-bold text-purple-700">{stats?.totalTests || 0}</p>
                <p className="text-xs text-purple-600">Tests</p>
              </CardContent>
            </Card>
            <Card className="bg-teal-50 border-teal-200">
              <CardContent className="pt-4 text-center">
                <ClipboardList className="h-6 w-6 mx-auto text-teal-600 mb-1" />
                <p className="text-2xl font-bold text-teal-700">{stats?.passedTests || 0}</p>
                <p className="text-xs text-teal-600">Tests Passed</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="ncrs" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />NCRs
              </TabsTrigger>
              <TabsTrigger value="inspections" className="flex items-center gap-2">
                <Microscope className="h-4 w-4" />Material Inspections
              </TabsTrigger>
              <TabsTrigger value="tests" className="flex items-center gap-2">
                <Signal className="h-4 w-4" />Test Results
              </TabsTrigger>
            </TabsList>

            {/* NCRs Tab */}
            <TabsContent value="ncrs">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Non-Conformance Reports</CardTitle>
                  <Button onClick={() => setIsNCRModalOpen(true)} className="bg-red-600 hover:bg-red-700">
                    <Plus className="mr-2 h-4 w-4" />New NCR
                  </Button>
                </CardHeader>
                <CardContent>
                  {ncrs?.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No NCRs recorded yet.</p>
                  ) : (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                      {ncrs?.map(ncr => (
                        <div key={ncr._id} className="p-4 border rounded-lg bg-white shadow-sm">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono text-sm text-muted-foreground">{ncr.ncrNumber}</span>
                                {getSeverityBadge(ncr.severity)}
                                {getStatusBadge(ncr.status)}
                              </div>
                              <h4 className="font-semibold">{ncr.title}</h4>
                              <p className="text-sm text-muted-foreground line-clamp-2">{ncr.description}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {ncr.category} | Detected: {ncr.detectedDate} by {ncr.detectedByName}
                                {ncr.projectName && ` | Project: ${ncr.projectName}`}
                              </p>
                            </div>
                            {ncr.status !== 'Closed' && (
                              <Button size="sm" variant="outline" onClick={() => handleCloseNCR(ncr._id)}>Close</Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Inspections Tab */}
            <TabsContent value="inspections">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Material Inspections</CardTitle>
                  <Button onClick={() => setIsInspectionModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" />New Inspection
                  </Button>
                </CardHeader>
                <CardContent>
                  {inspections?.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No inspections recorded yet.</p>
                  ) : (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                      {inspections?.map(inspection => (
                        <div key={inspection._id} className="p-4 border rounded-lg bg-white shadow-sm">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono text-sm text-muted-foreground">{inspection.inspectionNumber}</span>
                                {getResultBadge(inspection.result)}
                              </div>
                              <h4 className="font-semibold">{inspection.materialType}</h4>
                              <p className="text-sm text-muted-foreground">{inspection.inspectionCriteria}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {inspection.supplier && `Supplier: ${inspection.supplier} | `}
                                {inspection.batchNumber && `Batch: ${inspection.batchNumber} | `}
                                Inspected: {inspection.inspectionDate} by {inspection.inspectedByName}
                              </p>
                              {inspection.defectsFound && (
                                <p className="text-xs text-red-600 mt-1">Defects: {inspection.defectsFound}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tests Tab */}
            <TabsContent value="tests">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Test Results</CardTitle>
                  <Button onClick={() => setIsTestModalOpen(true)} className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="mr-2 h-4 w-4" />New Test
                  </Button>
                </CardHeader>
                <CardContent>
                  {testResults?.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No test results recorded yet.</p>
                  ) : (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                      {testResults?.map(test => (
                        <div key={test._id} className="p-4 border rounded-lg bg-white shadow-sm">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono text-sm text-muted-foreground">{test.testNumber}</span>
                                <Badge variant="outline">{test.testType}</Badge>
                                {getResultBadge(test.result)}
                              </div>
                              <p className="text-sm">{test.testParameters}</p>
                              {(test.resultValue || test.requiredValue) && (
                                <p className="text-sm text-muted-foreground">
                                  Result: {test.resultValue || 'N/A'} {test.requiredValue && `(Required: ${test.requiredValue})`}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground mt-1">
                                {test.sampleId && `Sample: ${test.sampleId} | `}
                                {test.location && `Location: ${test.location} | `}
                                Tested: {test.testDate} by {test.testedByName}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* NCR Modal */}
      <Dialog open={isNCRModalOpen} onOpenChange={setIsNCRModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Non-Conformance Report</DialogTitle>
            <DialogDescription>Log a new quality issue or non-conformance.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Title *</Label>
              <Input value={ncrForm.title} onChange={e => setNCRForm({...ncrForm, title: e.target.value})} placeholder="Brief description of the issue" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category *</Label>
                <Select value={ncrForm.category} onValueChange={v => setNCRForm({...ncrForm, category: v})}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Civil">Civil</SelectItem>
                    <SelectItem value="Telecom">Telecom</SelectItem>
                    <SelectItem value="Material">Material</SelectItem>
                    <SelectItem value="Process">Process</SelectItem>
                    <SelectItem value="Safety">Safety</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Severity *</Label>
                <Select value={ncrForm.severity} onValueChange={v => setNCRForm({...ncrForm, severity: v})}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Minor">Minor</SelectItem>
                    <SelectItem value="Major">Major</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Description *</Label>
              <Textarea value={ncrForm.description} onChange={e => setNCRForm({...ncrForm, description: e.target.value})} placeholder="Detailed description..." rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Location</Label>
                <Input value={ncrForm.location} onChange={e => setNCRForm({...ncrForm, location: e.target.value})} placeholder="Where found" />
              </div>
              <div>
                <Label>Project</Label>
                <Select value={ncrForm.projectId} onValueChange={v => setNCRForm({...ncrForm, projectId: v})}>
                  <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                  <SelectContent>
                    {projects?.map(p => <SelectItem key={p._id} value={p._id}>{p.projectName}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNCRModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateNCR} className="bg-red-600 hover:bg-red-700">Create NCR</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Inspection Modal */}
      <Dialog open={isInspectionModalOpen} onOpenChange={setIsInspectionModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Record Material Inspection</DialogTitle>
            <DialogDescription>Log incoming material quality check.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Material Type *</Label>
                <Input value={inspectionForm.materialType} onChange={e => setInspectionForm({...inspectionForm, materialType: e.target.value})} placeholder="e.g., Concrete, Cable" />
              </div>
              <div>
                <Label>Supplier</Label>
                <Input value={inspectionForm.supplier} onChange={e => setInspectionForm({...inspectionForm, supplier: e.target.value})} placeholder="Supplier name" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Batch Number</Label>
                <Input value={inspectionForm.batchNumber} onChange={e => setInspectionForm({...inspectionForm, batchNumber: e.target.value})} />
              </div>
              <div>
                <Label>Quantity</Label>
                <Input type="number" value={inspectionForm.quantity} onChange={e => setInspectionForm({...inspectionForm, quantity: e.target.value})} />
              </div>
              <div>
                <Label>Unit</Label>
                <Input value={inspectionForm.unit} onChange={e => setInspectionForm({...inspectionForm, unit: e.target.value})} placeholder="kg, m, pcs" />
              </div>
            </div>
            <div>
              <Label>Inspection Criteria *</Label>
              <Textarea value={inspectionForm.inspectionCriteria} onChange={e => setInspectionForm({...inspectionForm, inspectionCriteria: e.target.value})} placeholder="What was checked..." rows={2} />
            </div>
            <div>
              <Label>Result *</Label>
              <Select value={inspectionForm.result} onValueChange={v => setInspectionForm({...inspectionForm, result: v})}>
                <SelectTrigger><SelectValue placeholder="Select result" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pass">Pass</SelectItem>
                  <SelectItem value="Fail">Fail</SelectItem>
                  <SelectItem value="Conditional Pass">Conditional Pass</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Defects Found</Label>
              <Input value={inspectionForm.defectsFound} onChange={e => setInspectionForm({...inspectionForm, defectsFound: e.target.value})} placeholder="Any issues found" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInspectionModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateInspection} className="bg-blue-600 hover:bg-blue-700">Record Inspection</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Test Modal */}
      <Dialog open={isTestModalOpen} onOpenChange={setIsTestModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Record Test Result</DialogTitle>
            <DialogDescription>Log concrete cube, OTDR, or other test results.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Test Type *</Label>
                <Select value={testForm.testType} onValueChange={v => setTestForm({...testForm, testType: v})}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Concrete Cube">Concrete Cube</SelectItem>
                    <SelectItem value="Soil Compaction">Soil Compaction</SelectItem>
                    <SelectItem value="OTDR Fiber">OTDR Fiber</SelectItem>
                    <SelectItem value="Power Level">Power Level</SelectItem>
                    <SelectItem value="Splice Loss">Splice Loss</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Sample ID</Label>
                <Input value={testForm.sampleId} onChange={e => setTestForm({...testForm, sampleId: e.target.value})} placeholder="Sample identifier" />
              </div>
            </div>
            <div>
              <Label>Test Parameters *</Label>
              <Textarea value={testForm.testParameters} onChange={e => setTestForm({...testForm, testParameters: e.target.value})} placeholder="What was tested and how..." rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Result Value</Label>
                <Input value={testForm.resultValue} onChange={e => setTestForm({...testForm, resultValue: e.target.value})} placeholder="e.g., 28 MPa" />
              </div>
              <div>
                <Label>Required Value</Label>
                <Input value={testForm.requiredValue} onChange={e => setTestForm({...testForm, requiredValue: e.target.value})} placeholder="e.g., 25 MPa min" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Result *</Label>
                <Select value={testForm.result} onValueChange={v => setTestForm({...testForm, result: v})}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pass">Pass</SelectItem>
                    <SelectItem value="Fail">Fail</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Location</Label>
                <Input value={testForm.location} onChange={e => setTestForm({...testForm, location: e.target.value})} placeholder="Test location" />
              </div>
            </div>
            <div>
              <Label>Remarks</Label>
              <Textarea value={testForm.remarks} onChange={e => setTestForm({...testForm, remarks: e.target.value})} placeholder="Additional notes..." rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTestModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateTest} className="bg-purple-600 hover:bg-purple-700">Record Test</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default QualityControl;
