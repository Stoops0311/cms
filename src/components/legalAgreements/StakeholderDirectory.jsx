import React, { useState, useMemo } from 'react';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
    import { Input } from '@/components/ui/input.jsx';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
    import { Search, Filter, Users, Briefcase, Mail, Phone, Info, FileText as FileTextIcon, Globe, Star, FileArchive } from 'lucide-react';
    import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card.jsx';

    const stakeholderTypesList = ["All Types", "Partner", "Investor", "Contractor", "Master Contractor", "Master Subcontractor", "Subcontractor", "Government Entity", "Supplier", "Consultant", "Client"];

    const StakeholderDirectory = ({ allStakeholders, agreements }) => {
        const [searchTerm, setSearchTerm] = useState('');
        const [filterType, setFilterType] = useState(stakeholderTypesList[0]);

        const getLinkedAgreementsCount = (stakeholderId) => {
            return agreements.filter(agr => 
                agr.parties && agr.parties.some(p => p.stakeholderId === stakeholderId)
            ).length;
        };

        const filteredStakeholders = useMemo(() => {
            return allStakeholders.filter(s => 
                (s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                 s.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 s.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 s.crNumber?.toLowerCase().includes(searchTerm.toLowerCase())
                ) &&
                (filterType === stakeholderTypesList[0] || s.type === filterType)
            ).sort((a,b) => a.name.localeCompare(b.name));
        }, [allStakeholders, searchTerm, filterType]);

        return (
            <Card className="shadow-lg border-t-4 border-indigo-600">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold text-indigo-700 flex items-center"><Users className="mr-2 h-6 w-6"/>Stakeholder Directory</CardTitle>
                    <CardDescription>Master database of all stakeholders. Manage individual profiles in their respective modules (e.g., Contractor Registration).</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 border rounded-lg bg-slate-50/70">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search Name, ID, Contact..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 bg-white" />
                        </div>
                        <Select value={filterType} onValueChange={setFilterType}>
                            <SelectTrigger className="bg-white"><div className="flex items-center"><Filter className="mr-2 h-4 w-4 text-muted-foreground" /> <SelectValue /></div></SelectTrigger>
                            <SelectContent>{stakeholderTypesList.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                    <div className="overflow-x-auto custom-scrollbar">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-100">
                                    <TableHead><Users className="inline h-4 w-4 mr-1"/>Name (Company/Person)</TableHead>
                                    <TableHead><Briefcase className="inline h-4 w-4 mr-1"/>Role/Category</TableHead>
                                    <TableHead><Globe className="inline h-4 w-4 mr-1"/>Nationality/Country</TableHead>
                                    <TableHead><Mail className="inline h-4 w-4 mr-1"/>Contact Person</TableHead>
                                    <TableHead><Phone className="inline h-4 w-4 mr-1"/>Email & Mobile</TableHead>
                                    <TableHead><Info className="inline h-4 w-4 mr-1"/>ID/CR Number</TableHead>
                                    <TableHead><FileArchive className="inline h-4 w-4 mr-1"/>Docs (CR, Certs)</TableHead>
                                    <TableHead><FileTextIcon className="inline h-4 w-4 mr-1"/>Linked Agreements</TableHead>
                                    <TableHead><Star className="inline h-4 w-4 mr-1"/>Notes/Ratings</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredStakeholders.length === 0 && (
                                    <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-10">No stakeholders match your criteria.</TableCell></TableRow>
                                )}
                                {filteredStakeholders.map(s => (
                                    <TableRow key={s.id} className="hover:bg-slate-50 transition-colors">
                                        <TableCell className="font-medium">{s.name || 'N/A'}</TableCell>
                                        <TableCell>{s.type || 'N/A'}</TableCell>
                                        <TableCell>{s.nationality || 'N/A (from source)'}</TableCell>
                                        <TableCell>{s.contactPerson || 'N/A'}</TableCell>
                                        <TableCell>
                                            {s.email && <div className="truncate" title={s.email}>{s.email}</div>}
                                            {s.phone && <div>{s.phone}</div>}
                                            {(!s.email && !s.phone) && 'N/A'}
                                        </TableCell>
                                        <TableCell>{s.crNumber || s.idNumber || 'N/A'}</TableCell>
                                        <TableCell className="text-xs text-muted-foreground">View in Source</TableCell>
                                        <TableCell className="text-center">{getLinkedAgreementsCount(s.id)}</TableCell>
                                        <TableCell className="text-xs text-muted-foreground">View in Source</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
                <CardFooter className="text-xs text-muted-foreground pt-4 border-t">
                    Displaying {filteredStakeholders.length} of {allStakeholders.length} stakeholders. Full details like uploaded documents, nationality, and internal ratings are managed within individual stakeholder modules (e.g., Contractor Registration, Partner Management).
                </CardFooter>
            </Card>
        );
    };

    export default StakeholderDirectory;