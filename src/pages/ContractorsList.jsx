import React, { useState, useMemo } from 'react';
    import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { Input } from '@/components/ui/input.jsx';
    import { Label } from '@/components/ui/label.jsx';
    import { Textarea } from '@/components/ui/textarea.jsx';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog.jsx';
    import { Briefcase, PlusCircle, Edit2, Trash2, Search, Filter, Eye, UserCheck, UserCog } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast.jsx';
    import useLocalStorage from '@/hooks/useLocalStorage.jsx';
    import { motion } from 'framer-motion';
    import { Link } from 'react-router-dom';

    const contractorTypes = ["Master Contractor", "Subcontractor", "Supplier", "Consultant"];
    const contractorSpecialties = ["General Construction", "Electrical", "Plumbing", "HVAC", "Civil Engineering", "Structural", "Finishing", "Landscaping"];

    const ContractorForm = ({ onSubmit, initialData = {}, onCancel }) => {
      const [name, setName] = useState(initialData.name || '');
      const [type, setType] = useState(initialData.type || contractorTypes[0]);
      const [specialty, setSpecialty] = useState(initialData.specialty || contractorSpecialties[0]);
      const [contactPerson, setContactPerson] = useState(initialData.contactPerson || '');
      const [email, setEmail] = useState(initialData.email || '');
      const [phone, setPhone] = useState(initialData.phone || '');
      const [address, setAddress] = useState(initialData.address || '');
      const { toast } = useToast();

      const handleSubmit = (e) => {
        e.preventDefault();
        if (!name || !type || !contactPerson || !email || !phone) {
          toast({ variant: "destructive", title: "Missing Information", description: "Name, type, contact person, email, and phone are required." });
          return;
        }
        onSubmit({
          id: initialData.id || `CON-${Date.now().toString().slice(-5)}`,
          name, type, specialty, contactPerson, email, phone, address,
          projectsAssigned: initialData.projectsAssigned || [],
        });
      };

      return (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label htmlFor="name">Contractor/Company Name</Label><Input id="name" value={name} onChange={e => setName(e.target.value)} /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="type"><SelectValue placeholder="Select Type" /></SelectTrigger>
                <SelectContent>{contractorTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="specialty">Specialty</Label>
              <Select value={specialty} onValueChange={setSpecialty}>
                <SelectTrigger id="specialty"><SelectValue placeholder="Select Specialty" /></SelectTrigger>
                <SelectContent>{contractorSpecialties.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div><Label htmlFor="contactPerson">Contact Person</Label><Input id="contactPerson" value={contactPerson} onChange={e => setContactPerson(e.target.value)} /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label htmlFor="email">Email</Label><Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
            <div><Label htmlFor="phone">Phone</Label><Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} /></div>
          </div>
          <div><Label htmlFor="address">Address</Label><Textarea id="address" value={address} onChange={e => setAddress(e.target.value)} /></div>
          <div className="flex justify-end space-x-2 pt-2">
            {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
            <Button type="submit">{initialData.id ? 'Update Contractor' : 'Add Contractor'}</Button>
          </div>
        </form>
      );
    };

    const ContractorsList = () => {
      const [contractors, setContractors] = useLocalStorage('cmsContractors', []);
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [editingContractor, setEditingContractor] = useState(null);
      const [searchTerm, setSearchTerm] = useState('');
      const [filterType, setFilterType] = useState('All Types');
      const [filterSpecialty, setFilterSpecialty] = useState('All Specialties');
      const { toast } = useToast();

      const handleSaveContractor = (data) => {
        if (editingContractor) {
          setContractors(prev => prev.map(c => c.id === data.id ? data : c));
          toast({ title: "Contractor Updated" });
        } else {
          setContractors(prev => [...prev, data]);
          toast({ title: "Contractor Added" });
        }
        setIsModalOpen(false);
        setEditingContractor(null);
      };

      const handleDeleteContractor = (id) => {
        if (window.confirm("Delete this contractor? This may affect project assignments.")) {
          setContractors(prev => prev.filter(c => c.id !== id));
          toast({ title: "Contractor Deleted", variant: "destructive" });
        }
      };

      const openEditModal = (contractor) => {
        setEditingContractor(contractor);
        setIsModalOpen(true);
      };

      const filteredContractors = useMemo(() => {
        return contractors.filter(c => 
          (c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())) &&
          (filterType === 'All Types' || c.type === filterType) &&
          (filterSpecialty === 'All Specialties' || c.specialty === filterSpecialty)
        );
      }, [contractors, searchTerm, filterType, filterSpecialty]);

      return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-8">
          <Card className="shadow-xl border-t-4 border-cyan-600">
            <CardHeader className="bg-gradient-to-r from-cyan-600/10 to-sky-600/10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <CardTitle className="text-2xl font-bold text-cyan-700 flex items-center"><Briefcase className="mr-3 h-7 w-7" />Contractors Management</CardTitle>
                  <CardDescription>Manage master contractors, subcontractors, suppliers, and consultants.</CardDescription>
                </div>
                <Button onClick={() => { setEditingContractor(null); setIsModalOpen(true); }} className="mt-4 md:mt-0 bg-cyan-600 hover:bg-cyan-700">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Contractor
                </Button>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input placeholder="Search by name or contact..." className="pl-10 w-full" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger><div className="flex items-center"><Filter className="mr-2 h-4 w-4 text-muted-foreground" /> <SelectValue placeholder="Filter by Type" /></div></SelectTrigger>
                  <SelectContent>{['All Types', ...contractorTypes].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={filterSpecialty} onValueChange={setFilterSpecialty}>
                  <SelectTrigger><div className="flex items-center"><Filter className="mr-2 h-4 w-4 text-muted-foreground" /> <SelectValue placeholder="Filter by Specialty" /></div></SelectTrigger>
                  <SelectContent>{['All Specialties', ...contractorSpecialties].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>Specialty</TableHead>
                      <TableHead>Contact Person</TableHead><TableHead>Email</TableHead><TableHead>Phone</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContractors.length === 0 && (
                        <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No contractors found.</TableCell></TableRow>
                    )}
                    {filteredContractors.map(con => (
                      <TableRow key={con.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{con.name}</TableCell>
                        <TableCell>
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${con.type === "Master Contractor" ? "bg-indigo-100 text-indigo-700" : (con.type === "Subcontractor" ? "bg-sky-100 text-sky-700" : "bg-slate-100 text-slate-700")}`}>
                                {con.type === "Master Contractor" ? <UserCheck className="inline h-3 w-3 mr-1"/> : <UserCog className="inline h-3 w-3 mr-1"/>}
                                {con.type}
                            </span>
                        </TableCell>
                        <TableCell>{con.specialty}</TableCell>
                        <TableCell>{con.contactPerson}</TableCell><TableCell>{con.email}</TableCell><TableCell>{con.phone}</TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button variant="ghost" size="icon" asChild title="View Details">
                            <Link to={`/contractors/${con.id}`}><Eye className="h-4 w-4 text-blue-600" /></Link>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openEditModal(con)} title="Edit"><Edit2 className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteContractor(con.id)} title="Delete"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Dialog open={isModalOpen} onOpenChange={(open) => { if(!open) { setEditingContractor(null); setIsModalOpen(false); } else { setIsModalOpen(true); }}}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingContractor ? 'Edit Contractor' : 'Add New Contractor'}</DialogTitle>
              </DialogHeader>
              <ContractorForm onSubmit={handleSaveContractor} initialData={editingContractor || {}} onCancel={() => { setIsModalOpen(false); setEditingContractor(null); }} />
            </DialogContent>
          </Dialog>
        </motion.div>
      );
    };

    export default ContractorsList;