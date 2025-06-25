import React, {useState} from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
    import { ShieldCheck, AlertTriangle, ClipboardList, HardHat, PlusCircle } from 'lucide-react';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button.jsx';
    import {
      Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
    } from '@/components/ui/dialog.jsx';
    import { Input } from '@/components/ui/input.jsx';
    import { Label } from '@/components/ui/label.jsx';
    import { Textarea } from '@/components/ui/textarea.jsx';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
    import { DatePicker } from '@/components/ui/date-picker.jsx';
    import useLocalStorage from '@/hooks/useLocalStorage.jsx';
    import { useToast } from '@/components/ui/use-toast.jsx';

    const ppeTypes = ["Hard Hat", "Safety Vest", "Gloves", "Safety Glasses", "Steel-toed Boots", "Harness"];
    const hazardTypes = ["Fall Hazard", "Electrical Hazard", "Struck-by Hazard", "Caught-in/between Hazard", "Chemical Exposure", "Fire Hazard"];
    const mockSites = [ { id: "siteA", name: "Downtown Tower Site" }, { id: "siteB", name: "West Bridge Project" }]; // From ShiftManagement

    const ReportForm = ({ reportType, onSubmit, onCancel }) => {
        const [formData, setFormData] = useState({
            date: new Date(),
            siteId: mockSites[0].id,
            description: '',
            reportedBy: '', // Would be auto-filled in a real app
            ppeType: reportType === 'ppe' ? ppeTypes[0] : '',
            hazardType: reportType === 'hazard' ? hazardTypes[0] : '',
            correctiveAction: '',
        });
        const { toast } = useToast();

        const handleChange = (name, value) => {
            setFormData(prev => ({ ...prev, [name]: value }));
        };

        const handleSubmit = (e) => {
            e.preventDefault();
            if(!formData.description || !formData.siteId) {
                toast({variant: "destructive", title: "Missing fields", description: "Site and description are required."});
                return;
            }
            onSubmit({ ...formData, id: `${reportType}-${Date.now()}`, reportedBy: "Mock User" });
        };
        
        return (
            <form onSubmit={handleSubmit} className="space-y-4">
                <div><Label htmlFor="date">Date</Label><DatePicker date={formData.date} setDate={(d) => handleChange('date', d)}/></div>
                <div>
                    <Label htmlFor="siteId">Site/Location</Label>
                    <Select value={formData.siteId} onValueChange={(val) => handleChange('siteId', val)}>
                        <SelectTrigger id="siteId"><SelectValue placeholder="Select Site"/></SelectTrigger>
                        <SelectContent>{mockSites.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                {reportType === 'ppe' && (
                    <div>
                        <Label htmlFor="ppeType">PPE Type</Label>
                        <Select value={formData.ppeType} onValueChange={(val) => handleChange('ppeType', val)}>
                            <SelectTrigger id="ppeType"><SelectValue placeholder="Select PPE Type"/></SelectTrigger>
                            <SelectContent>{ppeTypes.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                )}
                {reportType === 'hazard' && (
                     <div>
                        <Label htmlFor="hazardType">Hazard Type</Label>
                        <Select value={formData.hazardType} onValueChange={(val) => handleChange('hazardType', val)}>
                            <SelectTrigger id="hazardType"><SelectValue placeholder="Select Hazard Type"/></SelectTrigger>
                            <SelectContent>{hazardTypes.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                )}
                <div><Label htmlFor="description">Description of Observation/Issue</Label><Textarea id="description" value={formData.description} onChange={e => handleChange('description', e.target.value)} placeholder="Detailed description..."/></div>
                <div><Label htmlFor="correctiveAction">Corrective Action Taken/Suggested (Optional)</Label><Textarea id="correctiveAction" value={formData.correctiveAction} onChange={e => handleChange('correctiveAction', e.target.value)} /></div>
                <DialogFooter className="pt-2">
                    <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                    <Button type="submit">Submit Report</Button>
                </DialogFooter>
            </form>
        );
    };


    const HealthSafetyDashboard = () => {
      const [reports, setReports] = useLocalStorage('safetyReports', []);
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [reportType, setReportType] = useState(''); // 'ppe' or 'hazard'
      const { toast } = useToast();

      const handleOpenModal = (type) => {
        setReportType(type);
        setIsModalOpen(true);
      };
      
      const handleSaveReport = (reportData) => {
          setReports(prev => [...prev, reportData]);
          toast({title: "Report Submitted", description: `${reportType === 'ppe' ? 'PPE' : 'Hazard'} report saved successfully.`});
          setIsModalOpen(false);
      };

      const ppeComplianceReports = reports.filter(r => r.ppeType);
      const hazardReports = reports.filter(r => r.hazardType);
      // AI prediction placeholder
      const aiPredictedRisk = "Moderate risk of fall hazards on Site A due to recent weather and reported scaffolding issues. (AI Placeholder)";

      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-4 md:p-6 lg:p-8"
        >
          <Card className="shadow-xl border-t-4 border-red-500 mb-8">
            <CardHeader>
              <CardTitle className="text-2xl font-bold tracking-tight text-red-600 flex items-center">
                <ShieldCheck className="mr-2 h-6 w-6"/>Health & Safety Dashboard
              </CardTitle>
              <CardDescription>
                Track PPE compliance, site hazards, and AI-predicted risks.
              </CardDescription>
            </CardHeader>
             <CardContent>
                <div className="mt-2 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded-md flex items-start">
                  <AlertTriangle className="h-5 w-5 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">AI Features Placeholder:</p>
                    <p className="text-sm">AI hazard parsing and risk prediction are conceptual and will be developed later.</p>
                  </div>
                </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Button size="lg" className="py-8 bg-blue-500 hover:bg-blue-600 text-lg font-semibold" onClick={() => handleOpenModal('ppe')}>
                <HardHat className="mr-2 h-5 w-5"/>Log PPE Compliance/Issue
            </Button>
             <Button size="lg" className="py-8 bg-orange-500 hover:bg-orange-600 text-lg font-semibold" onClick={() => handleOpenModal('hazard')}>
                <AlertTriangle className="mr-2 h-5 w-5"/>Report Site Hazard
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center"><HardHat className="mr-2 h-5 w-5 text-blue-600"/>PPE Compliance Tracker</CardTitle></CardHeader>
              <CardContent>
                {ppeComplianceReports.length === 0 ? <p className="text-muted-foreground text-sm">No PPE reports logged.</p> : 
                    ppeComplianceReports.map(r => <p key={r.id} className="text-sm border-b pb-1 mb-1">{new Date(r.date).toLocaleDateString()}: {r.ppeType} issue at {mockSites.find(s=>s.id === r.siteId)?.name} - {r.description.substring(0,30)}...</p>)}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center"><AlertTriangle className="mr-2 h-5 w-5 text-orange-600"/>Site Hazard Reports</CardTitle></CardHeader>
              <CardContent>
                {hazardReports.length === 0 ? <p className="text-muted-foreground text-sm">No hazard reports logged.</p> :
                 hazardReports.map(r => <p key={r.id} className="text-sm border-b pb-1 mb-1">{new Date(r.date).toLocaleDateString()}: {r.hazardType} at {mockSites.find(s=>s.id === r.siteId)?.name} - {r.description.substring(0,30)}...</p>)}
              </CardContent>
            </Card>
            <Card className="bg-red-50 border-red-200">
              <CardHeader><CardTitle className="flex items-center text-red-700"><ShieldCheck className="mr-2 h-5 w-5"/>AI Predicted High-Risk Operations</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-red-600">{aiPredictedRisk}</p>
              </CardContent>
            </Card>
          </div>
          
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{reportType === 'ppe' ? 'Log PPE Compliance/Issue' : 'Report Site Hazard'}</DialogTitle>
                    </DialogHeader>
                    <ReportForm reportType={reportType} onSubmit={handleSaveReport} onCancel={() => setIsModalOpen(false)} />
                </DialogContent>
            </Dialog>
        </motion.div>
      );
    };

    export default HealthSafetyDashboard;