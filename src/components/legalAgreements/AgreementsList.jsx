import React, { useState, useMemo } from 'react';
    import { Button } from '@/components/ui/button.jsx';
    import { Input } from '@/components/ui/input.jsx';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
    import { DatePicker } from '@/components/ui/date-picker.jsx';
    import { Download, Edit2, Trash2, Search, Filter, CalendarDays, AlertCircle, CheckCircle, Clock, FileText, Printer, Link as LinkIcon, Brain, Bell, FileDown } from 'lucide-react';
    import { format, parseISO, differenceInDays, isValid } from 'date-fns';
    import { useToast } from '@/components/ui/use-toast.jsx';

    const agreementTypes = ["All Types", "MOU", "NCNDA", "General Agreement", "JV Agreement", "NDA", "Supply Contract", "Service Agreement", "Partnership Agreement", "Subcontractor Agreement", "Master Subcontractor Agreement", "Other"];
    const stakeholderCategoriesList = ["All Categories", "Partner", "Investor", "Contractor", "Master Contractor", "Master Subcontractor", "Subcontractor", "Government Entity", "Supplier", "Consultant", "Client", "Multiple"];
    const agreementStatusesList = ["All Statuses", "Draft", "Signed", "Under Review", "Active", "Expired", "Terminated"];

    const AgreementsList = ({ agreements, onEdit, onDelete, onDownloadDocument, allStakeholders }) => {
        const [searchTerm, setSearchTerm] = useState('');
        const [filterType, setFilterType] = useState(agreementTypes[0]);
        const [filterCategory, setFilterCategory] = useState(stakeholderCategoriesList[0]);
        const [filterStatus, setFilterStatus] = useState(agreementStatusesList[0]);
        const [filterDateAfter, setFilterDateAfter] = useState(null);
        const [filterDateBefore, setFilterDateBefore] = useState(null);
        const { toast } = useToast();

        const getPartyDisplayNames = (partiesArray) => {
            if (!partiesArray || partiesArray.length === 0) return 'N/A';
            return partiesArray.map(party => {
                if (party.stakeholderId && party.stakeholderId !== "__manual__") {
                    const stakeholder = allStakeholders.find(s => s.id === party.stakeholderId);
                    return stakeholder ? stakeholder.name : `ID: ${party.stakeholderId}`;
                }
                return party.manualName || 'Unnamed Party';
            }).join(', ');
        };
        
        const getStatusBadge = (status, expiryDateStr) => {
            const expiry = expiryDateStr ? parseISO(expiryDateStr) : null;
            const today = new Date();
            let effectiveStatus = status;
            let daysToExpire;

            if (expiry && isValid(expiry)) {
                daysToExpire = differenceInDays(expiry, today);
                if (status === "Active" && daysToExpire < 0) {
                    effectiveStatus = "Expired";
                }
            }
            
            let Icon = FileText;
            let color = "text-slate-500";
            let bgColor = "bg-slate-100";
            let text = effectiveStatus;

            switch(effectiveStatus) {
                case "Draft": Icon = Edit2; color="text-gray-600"; bgColor="bg-gray-100"; break;
                case "Signed": 
                case "Active": 
                    Icon = CheckCircle; color="text-green-600"; bgColor="bg-green-100"; 
                    if (daysToExpire !== undefined) {
                        if (daysToExpire <= 30 && daysToExpire >= 0) {
                            Icon = AlertCircle; color="text-orange-600"; bgColor="bg-orange-100";
                            text = `Active (Expires in ${daysToExpire}d)`;
                        } else if (daysToExpire < 0) {
                             Icon = CalendarDays; color="text-red-600"; bgColor="bg-red-100"; text = "Expired";
                        } else {
                            text = `Active (Expires in ${daysToExpire}d)`;
                        }
                    }
                    break;
                case "Under Review": Icon = Clock; color="text-blue-600"; bgColor="bg-blue-100"; break;
                case "Expired": Icon = CalendarDays; color="text-red-600"; bgColor="bg-red-100"; break;
                case "Terminated": Icon = FileText; color="text-neutral-600"; bgColor="bg-neutral-200"; break;
                default: break;
            }
            return <span className={`px-2 py-1 text-xs font-medium rounded-full ${bgColor} ${color} inline-flex items-center`}><Icon className="h-3.5 w-3.5 mr-1.5"/>{text}</span>;
        };

        const handlePrintSummary = (agreement) => {
            toast({
                title: "Print Summary (Conceptual)",
                description: `This would generate a printable summary for "${agreement.agreementTitle}". True PDF generation is complex.`
            });
        };
        
        const handleDownloadPdf = (agreement) => {
            toast({
                title: "Download PDF (Conceptual)",
                description: `Simulating PDF download for "${agreement.agreementTitle}". A full PDF generation feature would be implemented here.`,
                className: "bg-green-500 text-white"
            });
            // Actual PDF generation logic would go here (e.g., using jsPDF or a server-side service)
            // For now, we can simulate a text download
            const textContent = `
Agreement Title: ${agreement.agreementTitle}
Type: ${agreement.agreementType}
Status: ${agreement.status}
Effective Date: ${agreement.effectiveDate ? format(parseISO(agreement.effectiveDate), 'PPP') : 'N/A'}
Expiry Date: ${agreement.expiryDate ? format(parseISO(agreement.expiryDate), 'PPP') : 'N/A'}

Parties:
${agreement.parties.map(p => `  - ${p.manualName || allStakeholders.find(s => s.id === p.stakeholderId)?.name || 'N/A'} (${p.role})`).join('\n')}

Summary:
${agreement.summary || 'N/A'}

Preamble:
${agreement.preamble || 'N/A'}

Obligations & Breach:
${agreement.obligationsBreachRemedies || 'N/A'}
            `;
            const blob = new Blob([textContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${agreement.agreementTitle.replace(/ /g, '_')}_summary.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        };


        const filteredAgreements = useMemo(() => {
            return agreements.filter(agr => {
                const effectiveDate = agr.effectiveDate ? parseISO(agr.effectiveDate) : null;
                const partiesMatch = agr.parties?.some(p => {
                    const stakeholder = allStakeholders.find(s => s.id === p.stakeholderId);
                    return (stakeholder?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (p.manualName?.toLowerCase().includes(searchTerm.toLowerCase()));
                });

                return (
                    (agr.agreementTitle?.toLowerCase().includes(searchTerm.toLowerCase()) || partiesMatch) &&
                    (filterType === agreementTypes[0] || agr.agreementType === filterType) &&
                    (filterCategory === stakeholderCategoriesList[0] || agr.stakeholderCategoryAggr === filterCategory) &&
                    (filterStatus === agreementStatusesList[0] || agr.status === filterStatus) &&
                    (!filterDateAfter || (effectiveDate && effectiveDate >= filterDateAfter)) &&
                    (!filterDateBefore || (effectiveDate && effectiveDate <= filterDateBefore))
                );
            }).sort((a,b) => new Date(b.lastModified) - new Date(a.lastModified));
        }, [agreements, searchTerm, filterType, filterCategory, filterStatus, filterDateAfter, filterDateBefore, allStakeholders]);

        return (
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 p-4 border rounded-lg bg-slate-50/70">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search Title or Parties..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 bg-white" />
                    </div>
                    <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="bg-white"><div className="flex items-center"><Filter className="mr-2 h-4 w-4 text-muted-foreground" /> <SelectValue /></div></SelectTrigger>
                        <SelectContent>{agreementTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                        <SelectTrigger className="bg-white"><div className="flex items-center"><Filter className="mr-2 h-4 w-4 text-muted-foreground" /> <SelectValue /></div></SelectTrigger>
                        <SelectContent>{stakeholderCategoriesList.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="bg-white"><div className="flex items-center"><Filter className="mr-2 h-4 w-4 text-muted-foreground" /> <SelectValue /></div></SelectTrigger>
                        <SelectContent>{agreementStatusesList.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                    <DatePicker date={filterDateAfter} setDate={setFilterDateAfter} placeholder="Effective Date After..." className="w-full bg-white"/>
                    <DatePicker date={filterDateBefore} setDate={setFilterDateBefore} placeholder="Effective Date Before..." className="w-full bg-white"/>
                </div>

                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-700">
                    <p className="flex items-center"><Bell className="h-4 w-4 mr-2"/><strong>Notifications & AI (Conceptual):</strong> Real-time alerts, AI summaries, and cloud integrations would require backend services. Current display is based on available data.</p>
                </div>

                <div className="overflow-x-auto custom-scrollbar">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-100">
                                <TableHead>Title</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Parties</TableHead>
                                <TableHead>Effective</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAgreements.length === 0 && (
                                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-10">No agreements match your criteria.</TableCell></TableRow>
                            )}
                            {filteredAgreements.map(agr => (
                                <TableRow key={agr.id} className="hover:bg-slate-50 transition-colors">
                                    <TableCell className="font-medium max-w-xs truncate" title={agr.agreementTitle}>{agr.agreementTitle}</TableCell>
                                    <TableCell>{agr.agreementType}</TableCell>
                                    <TableCell className="max-w-[200px] truncate" title={getPartyDisplayNames(agr.parties)}>{getPartyDisplayNames(agr.parties)}</TableCell>
                                    <TableCell>{agr.effectiveDate ? format(parseISO(agr.effectiveDate), 'dd MMM yyyy') : 'N/A'}</TableCell>
                                    <TableCell>{getStatusBadge(agr.status, agr.expiryDate)}</TableCell>
                                    <TableCell className="text-right space-x-1">
                                        {agr.documentFileName && <Button variant="ghost" size="icon" title={`Download ${agr.documentFileName}`} onClick={() => onDownloadDocument(agr.documentFileName)}><Download className="h-4 w-4 text-green-600"/></Button>}
                                        <Button variant="ghost" size="icon" onClick={() => handleDownloadPdf(agr)} title="Download as PDF (Conceptual)"><FileDown className="h-4 w-4 text-purple-600"/></Button>
                                        <Button variant="ghost" size="icon" onClick={() => handlePrintSummary(agr)} title="Print Summary"><Printer className="h-4 w-4 text-blue-600"/></Button>
                                        <Button variant="ghost" size="icon" onClick={() => onEdit(agr)} title="Edit Agreement"><Edit2 className="h-4 w-4 text-yellow-600"/></Button>
                                        <Button variant="ghost" size="icon" onClick={() => onDelete(agr.id)} title="Delete Agreement"><Trash2 className="h-4 w-4 text-red-600"/></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                 <div className="mt-4 text-xs text-muted-foreground">
                    <p className="flex items-center mb-1"><LinkIcon className="h-3 w-3 mr-1"/> Link additional stakeholders via the 'Edit' action.</p>
                    <p className="flex items-center"><Brain className="h-3 w-3 mr-1"/> AI features for content generation are available when creating/editing agreements. Summary, clause detection, and risk flagging are conceptual.</p>
                </div>
            </div>
        );
    };

    export default AgreementsList;