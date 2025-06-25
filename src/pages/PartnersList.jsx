import React, { useState, useMemo } from 'react';
    import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { Input } from '@/components/ui/input.jsx';
    import { Label } from '@/components/ui/label.jsx';
    import { Textarea } from '@/components/ui/textarea.jsx';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog.jsx';
    import { HeartHandshake as Handshake, PlusCircle, Edit2, Trash2, Search, Filter, Eye, TrendingUp } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast.jsx';
    import useLocalStorage from '@/hooks/useLocalStorage.jsx';
    import { motion } from 'framer-motion';
    import { Link } from 'react-router-dom';

    const partnerTypes = ["Investor", "Joint Venture Partner", "Strategic Ally", "Sponsor"];
    const investmentStages = ["Seed", "Series A", "Growth Equity", "Acquisition", "Project Finance"];

    const PartnerForm = ({ onSubmit, initialData = {}, onCancel }) => {
      const [name, setName] = useState(initialData.name || '');
      const [type, setType] = useState(initialData.type || partnerTypes[0]);
      const [contactPerson, setContactPerson] = useState(initialData.contactPerson || '');
      const [email, setEmail] = useState(initialData.email || '');
      const [phone, setPhone] = useState(initialData.phone || '');
      const [totalInvestment, setTotalInvestment] = useState(initialData.totalInvestment?.toString() || '');
      const [notes, setNotes] = useState(initialData.notes || '');
      const { toast } = useToast();

      const handleSubmit = (e) => {
        e.preventDefault();
        if (!name || !type || !contactPerson || !email) {
          toast({ variant: "destructive", title: "Missing Information", description: "Name, type, contact person, and email are required." });
          return;
        }
        onSubmit({
          id: initialData.id || `PARTNER-${Date.now().toString().slice(-5)}`,
          name, type, contactPerson, email, phone, 
          totalInvestment: totalInvestment ? parseFloat(totalInvestment) : 0,
          notes,
          investments: initialData.investments || [], // Array of {projectId, amount, date, stage}
        });
      };

      return (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label htmlFor="partnerName">Partner/Investor Name</Label><Input id="partnerName" value={name} onChange={e => setName(e.target.value)} /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="partnerType">Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="partnerType"><SelectValue placeholder="Select Type" /></SelectTrigger>
                <SelectContent>{partnerTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
             <div><Label htmlFor="totalInvestment">Total Investment (USD)</Label><Input id="totalInvestment" type="number" value={totalInvestment} onChange={e => setTotalInvestment(e.target.value)} placeholder="e.g., 500000" /></div>
          </div>
          <div><Label htmlFor="partnerContactPerson">Contact Person</Label><Input id="partnerContactPerson" value={contactPerson} onChange={e => setContactPerson(e.target.value)} /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label htmlFor="partnerEmail">Email</Label><Input id="partnerEmail" type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
            <div><Label htmlFor="partnerPhone">Phone</Label><Input id="partnerPhone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} /></div>
          </div>
          <div><Label htmlFor="partnerNotes">Notes</Label><Textarea id="partnerNotes" value={notes} onChange={e => setNotes(e.target.value)} /></div>
          <div className="flex justify-end space-x-2 pt-2">
            {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
            <Button type="submit">{initialData.id ? 'Update Partner' : 'Add Partner'}</Button>
          </div>
        </form>
      );
    };

    const PartnersList = () => {
      const [partners, setPartners] = useLocalStorage('cmsPartners', []);
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [editingPartner, setEditingPartner] = useState(null);
      const [searchTerm, setSearchTerm] = useState('');
      const [filterPartnerType, setFilterPartnerType] = useState('All Types');
      const { toast } = useToast();

      const handleSavePartner = (data) => {
        if (editingPartner) {
          setPartners(prev => prev.map(p => p.id === data.id ? data : p));
          toast({ title: "Partner Updated" });
        } else {
          setPartners(prev => [...prev, data]);
          toast({ title: "Partner Added" });
        }
        setIsModalOpen(false);
        setEditingPartner(null);
      };

      const handleDeletePartner = (id) => {
        if (window.confirm("Delete this partner? This will also remove associated investment records.")) {
          setPartners(prev => prev.filter(p => p.id !== id));
          toast({ title: "Partner Deleted", variant: "destructive" });
        }
      };

      const openEditModal = (partner) => {
        setEditingPartner(partner);
        setIsModalOpen(true);
      };

      const filteredPartners = useMemo(() => {
        return partners.filter(p => 
          (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())) &&
          (filterPartnerType === 'All Types' || p.type === filterPartnerType)
        );
      }, [partners, searchTerm, filterPartnerType]);

      return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-8">
          <Card className="shadow-xl border-t-4 border-amber-500">
            <CardHeader className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <CardTitle className="text-2xl font-bold text-amber-700 flex items-center"><Handshake className="mr-3 h-7 w-7" />Partnerships & Investors</CardTitle>
                  <CardDescription>Manage joint ventures, investors, and strategic partners.</CardDescription>
                </div>
                <Button onClick={() => { setEditingPartner(null); setIsModalOpen(true); }} className="mt-4 md:mt-0 bg-amber-600 hover:bg-amber-700">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Partner/Investor
                </Button>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input placeholder="Search by name or contact..." className="pl-10 w-full" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <Select value={filterPartnerType} onValueChange={setFilterPartnerType}>
                  <SelectTrigger><div className="flex items-center"><Filter className="mr-2 h-4 w-4 text-muted-foreground" /> <SelectValue placeholder="Filter by Type" /></div></SelectTrigger>
                  <SelectContent>{['All Types', ...partnerTypes].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>Contact Person</TableHead>
                      <TableHead>Email</TableHead><TableHead>Total Investment (USD)</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPartners.length === 0 && (
                        <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No partners or investors found.</TableCell></TableRow>
                    )}
                    {filteredPartners.map(p => (
                      <TableRow key={p.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell>
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${p.type === "Investor" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                                {p.type === "Investor" ? <TrendingUp className="inline h-3 w-3 mr-1"/> : <Handshake className="inline h-3 w-3 mr-1"/>}
                                {p.type}
                            </span>
                        </TableCell>
                        <TableCell>{p.contactPerson}</TableCell><TableCell>{p.email}</TableCell>
                        <TableCell>${(p.totalInvestment || 0).toLocaleString()}</TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button variant="ghost" size="icon" asChild title="View Details">
                            <Link to={`/partners/${p.id}`}><Eye className="h-4 w-4 text-blue-600" /></Link>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openEditModal(p)} title="Edit"><Edit2 className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeletePartner(p.id)} title="Delete"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Dialog open={isModalOpen} onOpenChange={(open) => { if(!open) { setEditingPartner(null); setIsModalOpen(false); } else { setIsModalOpen(true); }}}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingPartner ? 'Edit Partner/Investor' : 'Add New Partner/Investor'}</DialogTitle>
              </DialogHeader>
              <PartnerForm onSubmit={handleSavePartner} initialData={editingPartner || {}} onCancel={() => { setIsModalOpen(false); setEditingPartner(null); }} />
            </DialogContent>
          </Dialog>
        </motion.div>
      );
    };

    export default PartnersList;