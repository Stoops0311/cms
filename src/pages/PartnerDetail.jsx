import React, { useState } from 'react';
    import { useParams, Link, useNavigate } from 'react-router-dom';
    import useLocalStorage from '@/hooks/useLocalStorage.jsx';
    import { Card, CardContent, CardTitle, CardDescription, CardHeader, CardFooter } from '@/components/ui/card.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { ArrowLeft, HeartHandshake as Handshake, User, Mail, Phone, DollarSign, PlusCircle, Edit2, Trash2, TrendingUp, CalendarDays } from 'lucide-react';
    import { motion } from 'framer-motion';
    import { useToast } from '@/components/ui/use-toast.jsx';
    import DetailItem from '@/components/projectDetail/DetailItem.jsx';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter as DialogFooterCustom } from '@/components/ui/dialog.jsx';
    import { Input } from '@/components/ui/input.jsx';
    import { DatePicker } from '@/components/ui/date-picker.jsx';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
    import { format } from 'date-fns';

    const investmentStages = ["Seed", "Series A", "Growth Equity", "Acquisition", "Project Finance"];

    const InvestmentForm = ({ onSubmit, initialData = {}, onCancel, projects }) => {
        const [projectId, setProjectId] = useState(initialData.projectId || '');
        const [amount, setAmount] = useState(initialData.amount?.toString() || '');
        const [date, setDate] = useState(initialData.date ? new Date(initialData.date) : new Date());
        const [stage, setStage] = useState(initialData.stage || investmentStages[0]);
        const { toast } = useToast();

        const handleSubmit = (e) => {
            e.preventDefault();
            if (!projectId || !amount || !date) {
                toast({ variant: "destructive", title: "Missing Information", description: "Project, amount, and date are required." });
                return;
            }
            onSubmit({
                id: initialData.id || `INV-${Date.now().toString().slice(-5)}`,
                projectId,
                amount: parseFloat(amount),
                date: date.toISOString(),
                stage,
            });
        };
        
        return (
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label htmlFor="invProject">Project</Label>
                    <Select value={projectId} onValueChange={setProjectId}>
                        <SelectTrigger id="invProject"><SelectValue placeholder="Select Project" /></SelectTrigger>
                        <SelectContent>{projects.map(p => <SelectItem key={p.id} value={p.id}>{p.projectName} ({p.projectCode})</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div><Label htmlFor="invAmount">Amount (USD)</Label><Input id="invAmount" type="number" value={amount} onChange={e => setAmount(e.target.value)} /></div>
                <div><Label htmlFor="invDate">Investment Date</Label><DatePicker date={date} setDate={setDate} /></div>
                <div>
                    <Label htmlFor="invStage">Investment Stage</Label>
                    <Select value={stage} onValueChange={setStage}>
                        <SelectTrigger id="invStage"><SelectValue placeholder="Select Stage" /></SelectTrigger>
                        <SelectContent>{investmentStages.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                    {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
                    <Button type="submit">{initialData.id ? 'Update Investment' : 'Add Investment'}</Button>
                </div>
            </form>
        );
    };


    const PartnerDetail = () => {
      const { partnerId } = useParams();
      const [partners, setPartners] = useLocalStorage('cmsPartners', []);
      const [projects] = useLocalStorage('projects', []);
      const partner = partners.find(p => p.id === partnerId);
      const navigate = useNavigate();
      const { toast } = useToast();
      const [isInvestmentModalOpen, setIsInvestmentModalOpen] = useState(false);
      const [editingInvestment, setEditingInvestment] = useState(null);


      if (!partner) {
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <Card className="w-full max-w-md text-center shadow-xl"><CardHeader><Handshake className="mx-auto h-12 w-12 text-destructive" /><CardTitle>Partner/Investor Not Found</CardTitle></CardHeader><CardContent><Link to="/partners"><Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Partners List</Button></Link></CardContent></Card>
          </div>
        );
      }
      
      const handleSaveInvestment = (investmentData) => {
        let updatedInvestments;
        if (editingInvestment) {
            updatedInvestments = partner.investments.map(inv => inv.id === investmentData.id ? investmentData : inv);
        } else {
            updatedInvestments = [...(partner.investments || []), investmentData];
        }
        
        const newTotalInvestment = updatedInvestments.reduce((sum, inv) => sum + inv.amount, 0);

        const updatedPartner = { ...partner, investments: updatedInvestments, totalInvestment: newTotalInvestment };
        setPartners(prev => prev.map(p => p.id === partnerId ? updatedPartner : p));
        toast({ title: editingInvestment ? "Investment Updated" : "Investment Added" });
        setIsInvestmentModalOpen(false);
        setEditingInvestment(null);
      };
      
      const handleDeleteInvestment = (investmentId) => {
        if (window.confirm("Delete this investment record?")) {
            const updatedInvestments = partner.investments.filter(inv => inv.id !== investmentId);
            const newTotalInvestment = updatedInvestments.reduce((sum, inv) => sum + inv.amount, 0);
            const updatedPartner = { ...partner, investments: updatedInvestments, totalInvestment: newTotalInvestment };
            setPartners(prev => prev.map(p => p.id === partnerId ? updatedPartner : p));
            toast({ title: "Investment Deleted", variant: "destructive" });
        }
      };
      
      const openEditInvestmentModal = (investment) => {
        setEditingInvestment(investment);
        setIsInvestmentModalOpen(true);
      };


      return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Button variant="outline" onClick={() => navigate(-1)} className="mb-6"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
          <Card className="shadow-2xl border-t-4 border-amber-500">
            <CardHeader className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 p-6">
              <div className="flex flex-col md:flex-row justify-between items-start">
                <div>
                  <CardTitle className="text-3xl font-bold text-amber-700 flex items-center"><Handshake className="mr-3 h-8 w-8" />{partner.name}</CardTitle>
                  <CardDescription>{partner.type}</CardDescription>
                </div>
                {/* <Button onClick={() => navigate(`/partner-setup/${partnerId}`)}><Edit2 className="mr-2 h-4 w-4" /> Edit Partner</Button> */}
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DetailItem icon={User} label="Contact Person" value={partner.contactPerson} />
                <DetailItem icon={Mail} label="Email" value={partner.email} />
                <DetailItem icon={Phone} label="Phone" value={partner.phone || 'N/A'} />
                <DetailItem icon={DollarSign} label="Total Investment" value={`$${(partner.totalInvestment || 0).toLocaleString()}`} />
                <DetailItem icon={TrendingUp} label="Number of Investments" value={(partner.investments || []).length.toString()} />
              </div>
              {partner.notes && <DetailItem icon={User} label="Notes" value={partner.notes} className="md:col-span-2 lg:col-span-3" />}
              
              <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-xl text-amber-700 flex items-center"><TrendingUp className="mr-2 h-5 w-5"/>Investment Portfolio</CardTitle>
                        <Button size="sm" onClick={() => { setEditingInvestment(null); setIsInvestmentModalOpen(true);}}><PlusCircle className="mr-2 h-4 w-4"/>Add Investment</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {(partner.investments || []).length === 0 ? (
                        <p className="text-muted-foreground">No investments recorded for this partner.</p>
                    ) : (
                        <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Project</TableHead><TableHead>Amount (USD)</TableHead>
                                    <TableHead>Date</TableHead><TableHead>Stage</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {partner.investments.map(inv => (
                                    <TableRow key={inv.id}>
                                        <TableCell>
                                            <Link to={`/projects/${inv.projectId}`} className="font-medium text-primary hover:underline">
                                                {projects.find(p=>p.id === inv.projectId)?.projectName || inv.projectId}
                                            </Link>
                                        </TableCell>
                                        <TableCell>${inv.amount.toLocaleString()}</TableCell>
                                        <TableCell>{format(new Date(inv.date), 'dd MMM yyyy')}</TableCell>
                                        <TableCell>{inv.stage}</TableCell>
                                        <TableCell className="text-right space-x-1">
                                            <Button variant="ghost" size="icon" onClick={() => openEditInvestmentModal(inv)} title="Edit Investment"><Edit2 className="h-4 w-4"/></Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteInvestment(inv.id)} title="Delete Investment"><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        </div>
                    )}
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          <Dialog open={isInvestmentModalOpen} onOpenChange={setIsInvestmentModalOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{editingInvestment ? 'Edit Investment' : 'Add New Investment'}</DialogTitle>
                <DialogDescription>Record an investment made by {partner.name}.</DialogDescription>
              </DialogHeader>
              <InvestmentForm onSubmit={handleSaveInvestment} initialData={editingInvestment || {}} onCancel={() => { setIsInvestmentModalOpen(false); setEditingInvestment(null);}} projects={projects} />
            </DialogContent>
          </Dialog>
        </motion.div>
      );
    };

    export default PartnerDetail;