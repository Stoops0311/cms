import React, { useState } from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
    import { Briefcase, PlusCircle, Edit, Trash2, AlertTriangle } from 'lucide-react';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button.jsx';
    import { Dialog, DialogContent, DialogHeader, DialogTitle as DTitle, DialogDescription as DDesc } from '@/components/ui/dialog.jsx';
    import useLocalStorage from '@/hooks/useLocalStorage.jsx';
    import { useToast } from '@/components/ui/use-toast.jsx';
    import { useNavigate } from 'react-router-dom';
    import ContractorForm from '@/components/contractorRegistration/ContractorForm.jsx';
    import ContractorList from '@/components/contractorRegistration/ContractorList.jsx';

    const ContractorRegistration = () => {
        const [contractors, setContractors] = useLocalStorage('contractors', []);
        const [isModalOpen, setIsModalOpen] = useState(false);
        const [editingContractor, setEditingContractor] = useState(null);
        const { toast } = useToast();
        const navigate = useNavigate();

        const handleSaveContractor = (contractorData) => {
            let updatedContractors;
            if (editingContractor) {
                updatedContractors = contractors.map(c => c.id === editingContractor.id ? { ...c, ...contractorData } : c);
                toast({ title: "Contractor Updated", description: `${contractorData.companyName} details updated.` });
            } else {
                updatedContractors = [...contractors, contractorData];
                toast({ title: "Contractor Registered", description: `${contractorData.companyName} has been registered.` });
            }
            setContractors(updatedContractors);
            setIsModalOpen(false);
            setEditingContractor(null);
        };

        const openEditModal = (contractor) => {
            setEditingContractor(contractor);
            setIsModalOpen(true);
        };

        const handleDeleteContractor = (contractorId) => {
            if (window.confirm("Are you sure you want to delete this contractor? This action cannot be undone.")) {
                setContractors(prev => prev.filter(c => c.id !== contractorId));
                toast({ title: "Contractor Deleted", variant: "destructive" });
            }
        };

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="p-4 md:p-6 lg:p-8"
            >
                <Card className="shadow-xl border-t-4 border-sky-500 mb-8">
                    <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div>
                            <CardTitle className="text-2xl font-bold tracking-tight text-sky-600 flex items-center">
                                <Briefcase className="mr-2 h-6 w-6" />Contractor & Consultant Management
                            </CardTitle>
                            <CardDescription>
                                Register new contractors/consultants or manage existing ones.
                            </CardDescription>
                        </div>
                        <Button onClick={() => { setEditingContractor(null); setIsModalOpen(true); }} className="mt-4 md:mt-0 bg-sky-500 hover:bg-sky-600 text-white">
                            <PlusCircle className="mr-2 h-4 w-4" />Register New Contractor
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="mt-2 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded-md flex items-start">
                            <AlertTriangle className="h-5 w-5 mr-3 mt-1 flex-shrink-0" />
                            <div>
                                <p className="font-semibold">Document Handling:</p>
                                <p className="text-sm">File uploads are simulated. In a production environment, files would be uploaded to secure cloud storage.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <ContractorList
                    contractors={contractors}
                    onEdit={openEditModal}
                    onDelete={handleDeleteContractor}
                />

                <Dialog open={isModalOpen} onOpenChange={(open) => { if (!open) { setEditingContractor(null); } setIsModalOpen(open); }}>
                    <DialogContent className="sm:max-w-2xl">
                        <DialogHeader>
                            <DTitle>{editingContractor ? 'Edit Contractor/Consultant' : 'Register New Contractor/Consultant'}</DTitle>
                            <DDesc>Fill in the details below. All fields marked with * are required.</DDesc>
                        </DialogHeader>
                        <ContractorForm
                            onSubmit={handleSaveContractor}
                            initialData={editingContractor || {}}
                            onCancel={() => { setIsModalOpen(false); setEditingContractor(null); }}
                        />
                    </DialogContent>
                </Dialog>
            </motion.div>
        );
    };

    export default ContractorRegistration;