import React from 'react';
    import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs.jsx";
    import ProjectOverviewTab from '@/components/projectDetail/ProjectOverviewTab.jsx';
    import ProjectTasksTab from '@/components/projectDetail/ProjectTasksTab.jsx';
    import ProjectDocumentsTab from '@/components/projectDetail/ProjectDocumentsTab.jsx';
    import ProjectFinancialsTab from '@/components/projectDetail/ProjectFinancialsTab.jsx';
    import ProjectCommunicationTab from '@/components/projectDetail/ProjectCommunicationTab.jsx';
    import ProjectCloudDriveLinksTab from '@/components/projectDetail/ProjectCloudDriveLinksTab.jsx'; 
    import { LayoutDashboard, ListChecks, FolderArchive, DollarSign, MessageSquare, Link as LinkIconLucide } from 'lucide-react'; // Renamed Link to LinkIconLucide to avoid conflict

    const ProjectDetailTabs = ({ project, activeTab, setActiveTab, updateProjectData }) => {
        const tabsConfig = [
            { value: "overview", label: "Overview", icon: LayoutDashboard, component: <ProjectOverviewTab project={project} updateProjectData={updateProjectData} /> },
            { value: "tasks", label: "Tasks & Milestones", icon: ListChecks, component: <ProjectTasksTab project={project} updateProjectData={updateProjectData} /> },
            { value: "documents", label: "System Documents", icon: FolderArchive, component: <ProjectDocumentsTab project={project} updateProjectData={updateProjectData} /> },
            { value: "drive_links", label: "Cloud Drive Links", icon: LinkIconLucide, component: <ProjectCloudDriveLinksTab project={project} updateProjectData={updateProjectData} /> },
            { value: "financials", label: "Financials", icon: DollarSign, component: <ProjectFinancialsTab project={project} updateProjectData={updateProjectData} /> },
            { value: "communication", label: "Communication Log", icon: MessageSquare, component: <ProjectCommunicationTab project={project} updateProjectData={updateProjectData} /> },
        ];

        return (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mb-6">
                    {tabsConfig.map(tab => (
                        <TabsTrigger key={tab.value} value={tab.value} className="flex-col sm:flex-row h-auto py-2 sm:py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                            <tab.icon className="h-4 w-4 mb-1 sm:mb-0 sm:mr-2" />
                            <span className="text-xs sm:text-sm">{tab.label}</span>
                        </TabsTrigger>
                    ))}
                </TabsList>
                {tabsConfig.map(tab => (
                    <TabsContent key={tab.value} value={tab.value}>
                        {tab.component}
                    </TabsContent>
                ))}
            </Tabs>
        );
    };

    export default ProjectDetailTabs;