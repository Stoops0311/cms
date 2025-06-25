import React, { useState, useMemo } from 'react';
    import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { Input } from '@/components/ui/input.jsx';
    import { Label } from '@/components/ui/label.jsx';
    import { DatePicker } from '@/components/ui/date-picker.jsx';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter as DialogFooterCustom } from '@/components/ui/dialog.jsx';
    import { DollarSign as DollarSignCircle, PlusCircle, Edit2, Trash2, Search, Filter, TrendingUp, TrendingDown, FileSpreadsheet, Percent, Briefcase } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast.jsx';
    import useLocalStorage from '@/hooks/useLocalStorage.jsx';
    import { motion } from 'framer-motion';
    import { format } from 'date-fns';
    import { Link } from 'react-router-dom';

    const PnLForm = ({ onSubmit, initialData = {}, onCancel, projects, isGlobalForm = false }) => {
        const [projectId, setProjectId] = useState(initialData.projectId || '');
        const [reportingDate, setReportingDate] = useState(initialData.reportingDate ? new Date(initialData.reportingDate) : new Date());
        
        const [initialBudgetField, setInitialBudgetField] = useState(initialData.initialBudget?.toString() || '');
        const [approvedChangeOrders, setApprovedChangeOrders] = useState(initialData.approvedChangeOrders?.toString() || '');
        
        const [contractValue, setContractValue] = useState(initialData.contractValue?.toString() || '');
        const [committedCosts, setCommittedCosts] = useState(initialData.committedCosts?.toString() || '');
        const [actualCosts, setActualCosts] = useState(initialData.actualCosts?.toString() || '');
        
        const [revenue, setRevenue] = useState(initialData.revenue?.toString() || '');
        const [cogs, setCogs] = useState(initialData.cogs?.toString() || '');
        const [operatingExpenses, setOperatingExpenses] = useState(initialData.operatingExpenses?.toString() || '');
        const [notes, setNotes] = useState(initialData.notes || '');
        
        const { toast } = useToast();

        const handleSubmit = (e) => {
            e.preventDefault();
            if (!projectId) {
                toast({ variant: "destructive", title: "Missing Project", description: "Please select a project." });
                return;
            }
            onSubmit({
                id: initialData.id || `PNL-${projectId}-${Date.now().toString().slice(-4)}`,
                projectId,
                reportingDate: reportingDate.toISOString(),
                initialBudget: parseFloat(initialBudgetField) || 0,
                approvedChangeOrders: parseFloat(approvedChangeOrders) || 0,
                contractValue: parseFloat(contractValue) || 0,
                committedCosts: parseFloat(committedCosts) || 0,
                actualCosts: parseFloat(actualCosts) || 0,
                revenue: parseFloat(revenue) || 0,
                cogs: parseFloat(cogs) || 0,
                operatingExpenses: parseFloat(operatingExpenses) || 0,
                notes,
            });
        };
        
        // Auto-fill initial budget from project setup if creating new global record
        React.useEffect(() => {
            if (isGlobalForm && projectId && !initialData.id) {
                const selectedProject = projects.find(p => p.id === projectId);
                if (selectedProject && selectedProject.projectBudget) {
                    setInitialBudgetField(selectedProject.projectBudget.toString());
                } else {
                    setInitialBudgetField(''); // Reset if project changes or has no budget
                }
            }
        }, [projectId, projects, isGlobalForm, initialData.id]);


        return (
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><Label htmlFor="pnlProject">Project</Label>
                        <Select value={projectId} onValueChange={setProjectId} disabled={!isGlobalForm && !!initialData.projectId}>
                            <SelectTrigger id="pnlProject"><SelectValue placeholder="Select Project"/></SelectTrigger>
                            <SelectContent>{(projects || []).map(p => <SelectItem key={p.id} value={p.id}>{p.projectName} ({p.projectCode})</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                    <div><Label htmlFor="pnlReportingDate">Reporting Period End Date</Label><DatePicker id="pnlReportingDate" date={reportingDate} setDate={setReportingDate}/></div>
                </div>

                <Card className="p-3 bg-slate-50"><CardHeader className="p-0 pb-1"><CardTitle className="text-sm">Budget Information (USD)</CardTitle></CardHeader><CardContent className="p-0 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div><Label htmlFor="pnlInitBudget" className="text-xs">Initial Budget</Label><Input id="pnlInitBudget" type="number" value={initialBudgetField} onChange={e => setInitialBudgetField(e.target.value)} placeholder="e.g. 100000"/></div>
                    <div><Label htmlFor="pnlChangeOrders" className="text-xs">Approved Change Orders</Label><Input id="pnlChangeOrders" type="number" value={approvedChangeOrders} onChange={e => setApprovedChangeOrders(e.target.value)} placeholder="e.g. 10000"/></div>
                    <div><Label htmlFor="pnlCommittedCosts" className="text-xs">Committed Costs</Label><Input id="pnlCommittedCosts" type="number" value={committedCosts} onChange={e => setCommittedCosts(e.target.value)} placeholder="e.g. 75000"/></div>
                    <div><Label htmlFor="pnlActualCosts" className="text-xs">Actual Costs to Date</Label><Input id="pnlActualCosts" type="number" value={actualCosts} onChange={e => setActualCosts(e.target.value)} placeholder="e.g. 95000"/></div>
                </CardContent></Card>
                
                <Card className="p-3 bg-slate-50"><CardHeader className="p-0 pb-1"><CardTitle className="text-sm">P&L Information (USD)</CardTitle></CardHeader><CardContent className="p-0 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div><Label htmlFor="pnlContractValue" className="text-xs">Contract Value</Label><Input id="pnlContractValue" type="number" value={contractValue} onChange={e => setContractValue(e.target.value)} placeholder="e.g. 150000"/></div>
                    <div><Label htmlFor="pnlRevenue" className="text-xs">Revenue Recognized</Label><Input id="pnlRevenue" type="number" value={revenue} onChange={e => setRevenue(e.target.value)} placeholder="e.g. 120000"/></div>
                    <div><Label htmlFor="pnlCogs" className="text-xs">COGS / Direct Costs</Label><Input id="pnlCogs" type="number" value={cogs} onChange={e => setCogs(e.target.value)} placeholder="e.g. 80000"/></div>
                    <div><Label htmlFor="pnlOpEx" className="text-xs">Operating Expenses / Indirect</Label><Input id="pnlOpEx" type="number" value={operatingExpenses} onChange={e => setOperatingExpenses(e.target.value)} placeholder="e.g. 15000"/></div>
                </CardContent></Card>
                
                <div><Label htmlFor="pnlNotes">Notes / Remarks</Label><Input id="pnlNotes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g., Reporting for Q1, major material cost increase noted."/></div>

                <DialogFooterCustom className="pt-3">
                    <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                    <Button type="submit">{initialData.id ? 'Update Financial Record' : 'Add Financial Record'}</Button>
                </DialogFooterCustom>
            </form>
        );
    };


    const ProjectFinancialsDashboard = () => {
      const [financialRecords, setFinancialRecords] = useLocalStorage('cmsProjectFinancials', []);
      const [projects] = useLocalStorage('projects', []);
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [editingRecord, setEditingRecord] = useState(null);
      const [searchTerm, setSearchTerm] = useState('');
      const { toast } = useToast();

      const handleSaveRecord = (data) => {
        let updatedRecord = {...data};
        // Ensure projectBudget in the main projects list gets updated if this is the latest financial record for a project
        const projectToUpdate = projects.find(p => p.id === data.projectId);
        if (projectToUpdate) {
            const revisedBudgetForRecord = (data.initialBudget || 0) + (data.approvedChangeOrders || 0);
            // Logic to determine if this is the latest record - could be by date or if it's a new one
            const existingRecordsForProject = financialRecords.filter(r => r.projectId === data.projectId && r.id !== data.id);
            const isLatest = existingRecordsForProject.length === 0 || new Date(data.reportingDate) >= Math.max(...existingRecordsForProject.map(r => new Date(r.reportingDate)));
            
            if(isLatest) {
                const updatedProjects = projects.map(p => 
                    p.id === data.projectId 
                    ? { ...p, projectBudget: revisedBudgetForRecord, contractValue: data.contractValue, currentCost: data.actualCosts } 
                    : p
                );
                // This assumes you have setProjects available or handle it upstream
                // For now, we'll just log this. Actual update to 'projects' state needs careful handling.
                console.log("Need to update projects list with new budget/cost for", data.projectId);
            }
        }


        if (editingRecord) {
          setFinancialRecords(prev => prev.map(rec => rec.id === data.id ? updatedRecord : rec));
          toast({ title: "Financial Record Updated" });
        } else {
          setFinancialRecords(prev => [updatedRecord, ...prev]);
          toast({ title: "Financial Record Added" });
        }
        setIsModalOpen(false);
        setEditingRecord(null);
      };

      const handleDeleteRecord = (id) => {
        if (window.confirm("Delete this financial record?")) {
          setFinancialRecords(prev => prev.filter(rec => rec.id !== id));
          toast({ title: "Financial Record Deleted", variant: "destructive" });
        }
      };
      
      const openEditModal = (record) => {
        setEditingRecord(record);
        setIsModalOpen(true);
      };

      const filteredRecords = useMemo(() => {
        return financialRecords.filter(rec => {
          const projectDetails = projects.find(p => p.id === rec.projectId);
          return searchTerm === '' || 
                 (projectDetails?.projectName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                 (rec.projectId.toLowerCase().includes(searchTerm.toLowerCase()));
        }).sort((a,b) => new Date(b.reportingDate) - new Date(a.reportingDate));
      }, [financialRecords, projects, searchTerm]);
      
      const calculateMetrics = (record) => {
        const initialBudget = record.initialBudget || 0;
        const approvedChangeOrders = record.approvedChangeOrders || 0;
        const revisedBudget = initialBudget + approvedChangeOrders;
        
        const actualCosts = record.actualCosts || 0;
        const remainingBudget = revisedBudget - actualCosts;
        const budgetVariance = revisedBudget - actualCosts; // Positive if under budget, negative if over
        const percentageSpent = revisedBudget > 0 ? (actualCosts / revisedBudget * 100) : 0;

        const revenue = record.revenue || 0;
        const cogs = record.cogs || 0; // Should be part of actualCosts if direct
        const operatingExpenses = record.operatingExpenses || 0; // Should be part of actualCosts if indirect
        
        const grossProfit = revenue - cogs;
        const netProfit = grossProfit - operatingExpenses;
        const grossProfitMargin = revenue > 0 ? (grossProfit / revenue * 100) : 0;
        const netProfitMargin = revenue > 0 ? (netProfit / revenue * 100) : 0;

        return { revisedBudget, remainingBudget, budgetVariance, percentageSpent, grossProfit, netProfit, grossProfitMargin, netProfitMargin };
      };

      return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-8">
          <Card className="shadow-xl border-t-4 border-green-700">
            <CardHeader className="bg-gradient-to-r from-green-700/10 to-emerald-700/10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <CardTitle className="text-2xl font-bold text-green-800 flex items-center"><DollarSignCircle className="mr-3 h-7 w-7" />Project P&L & Budget Dashboard</CardTitle>
                  <CardDescription>Track financial performance and budget status for all projects.</CardDescription>
                </div>
                <Button onClick={() => { setEditingRecord(null); setIsModalOpen(true); }} className="mt-4 md:mt-0 bg-green-700 hover:bg-green-800">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add New Financial Record
                </Button>
              </div>
              <div className="mt-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input placeholder="Search by Project Name or ID..." className="pl-10 w-full md:w-1/3" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project</TableHead><TableHead>Report Date</TableHead>
                      <TableHead>Revised Budget</TableHead><TableHead>Actual Costs</TableHead><TableHead>% Spent</TableHead>
                      <TableHead>Revenue</TableHead><TableHead>Net Profit</TableHead><TableHead>Net Margin</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.length === 0 && (
                        <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">No financial records found.</TableCell></TableRow>
                    )}
                    {filteredRecords.map(rec => {
                      const projectDetails = projects.find(p => p.id === rec.projectId);
                      const metrics = calculateMetrics(rec);
                      return (
                        <TableRow key={rec.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">
                            <Link to={`/projects/${rec.projectId}`} className="hover:underline text-primary flex items-center">
                                <Briefcase className="h-4 w-4 mr-1.5 opacity-70"/> {projectDetails?.projectName || rec.projectId}
                            </Link>
                          </TableCell>
                          <TableCell>{format(new Date(rec.reportingDate), 'dd MMM yyyy')}</TableCell>
                          <TableCell>${(metrics.revisedBudget || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                          <TableCell>${(rec.actualCosts || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                          <TableCell className={metrics.percentageSpent > 100 ? 'text-red-600 font-semibold' : (metrics.percentageSpent > 85 ? 'text-orange-500' : 'text-green-600')}>{metrics.percentageSpent.toFixed(1)}%</TableCell>
                          <TableCell>${(rec.revenue || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                          <TableCell className={metrics.netProfit < 0 ? 'text-red-600 font-semibold' : 'text-green-600'}>
                            ${metrics.netProfit.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                          </TableCell>
                          <TableCell className={metrics.netProfitMargin < 0 ? 'text-red-600' : 'text-green-600'}>
                            {metrics.netProfitMargin.toFixed(1)}%
                          </TableCell>
                          <TableCell className="text-right space-x-1">
                            <Button variant="ghost" size="icon" onClick={() => openEditModal(rec)} title="Edit Record"><Edit2 className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteRecord(rec.id)} title="Delete Record"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
             {filteredRecords.length > 0 && (
                <CardFooter className="p-4 border-t text-sm text-muted-foreground">
                    Showing {filteredRecords.length} of {financialRecords.length} total records.
                </CardFooter>
            )}
          </Card>

          <Dialog open={isModalOpen} onOpenChange={(open) => { if(!open) { setEditingRecord(null); setIsModalOpen(false); } else { setIsModalOpen(true); }}}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
              <DialogHeader>
                <DialogTitle>{editingRecord ? 'Edit Financial Record' : 'Add New Financial Record'}</DialogTitle>
                <DialogDescription>{editingRecord ? `Updating financial data for ${projects.find(p=>p.id===editingRecord.projectId)?.projectName}.` : 'Enter P&L and budget information for a project.'}</DialogDescription>
              </DialogHeader>
              <PnLForm onSubmit={handleSaveRecord} initialData={editingRecord || {}} onCancel={() => { setIsModalOpen(false); setEditingRecord(null); }} projects={projects} isGlobalForm={true} />
            </DialogContent>
          </Dialog>
        </motion.div>
      );
    };

    export default ProjectFinancialsDashboard;