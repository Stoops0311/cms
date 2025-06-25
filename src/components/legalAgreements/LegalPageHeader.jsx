import React from 'react';
    import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { FileSignature, PlusCircle, Brain } from 'lucide-react';

    const LegalPageHeader = ({ activeTab, onAddNew, onAiGenerate }) => {
        return (
            <Card className="shadow-xl border-t-4 border-slate-700 mb-8 bg-white/80 backdrop-blur-sm">
                <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                        <CardTitle className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-800 flex items-center">
                            <FileSignature className="mr-3 h-7 w-7 lg:h-8 lg:w-8 text-indigo-600" />Legal Agreements & Stakeholder Management
                        </CardTitle>
                        <CardDescription className="text-sm lg:text-base text-slate-600">Manage MOUs, NCNDAs, other agreements, and view stakeholder lists. AI tools available.</CardDescription>
                    </div>
                    {activeTab === "agreements" && (
                        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                            <Button onClick={onAiGenerate} variant="outline" className="text-indigo-600 border-indigo-600 hover:bg-indigo-50 shadow-md transition-all duration-300 ease-in-out transform hover:scale-105">
                                <Brain className="mr-2 h-4 w-4"/>AI Generate Agreement
                            </Button>
                            <Button onClick={onAddNew} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all duration-300 ease-in-out transform hover:scale-105">
                                <PlusCircle className="mr-2 h-4 w-4" />Add New Agreement
                            </Button>
                        </div>
                    )}
                </CardHeader>
            </Card>
        );
    };

    export default LegalPageHeader;