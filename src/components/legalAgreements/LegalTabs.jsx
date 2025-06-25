import React from 'react';
    import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs.jsx";
    import { Users, ListChecks } from 'lucide-react';

    const LegalTabs = ({ activeTab, onTabChange, children }) => {
        return (
            <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
                <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 mb-6 bg-slate-200/70 p-1 rounded-lg shadow">
                    <TabsTrigger value="agreements" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md transition-all duration-300 ease-in-out py-2.5">
                        <ListChecks className="mr-2 h-5 w-5" />Manage Agreements
                    </TabsTrigger>
                    <TabsTrigger value="stakeholders" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md transition-all duration-300 ease-in-out py-2.5">
                        <Users className="mr-2 h-5 w-5" />Stakeholder Directory
                    </TabsTrigger>
                </TabsList>
                {children}
            </Tabs>
        );
    };

    export default LegalTabs;