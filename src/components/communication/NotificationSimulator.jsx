import React from 'react';
    import { Button } from '@/components/ui/button.jsx';
    import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card.jsx';
    import { Bell, AlertTriangle, FileText, Settings } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast.jsx';

    const NotificationSimulator = () => {
        const { toast } = useToast();

        const simulatedNotification = (type) => {
            let title = "New Notification";
            let description = "You have a new system message.";
            let toastOptions = { variant: "default", duration: 7000 };

            if (type === "emergency") {
                title = "Emergency Alert!";
                description = "CODE RED: Emergency reported at Site Gamma. All available medical staff to standby.";
                toastOptions.variant = "destructive";
            } else if (type === "policy") {
                title = "Policy Update";
                description = "New HR policy regarding leave has been updated. Please review on the portal.";
                toastOptions.className = "bg-blue-500 text-white"; 
            } else if (type === "system") {
                title = "System Alert";
                description = "Scheduled maintenance tomorrow at 2 AM.";
                toastOptions.className = "bg-yellow-500 text-black";
            }
            toast({ title, description, ...toastOptions });
        };

        return (
            <Card className="shadow-lg border-t-4 border-purple-500">
                 <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                    <CardTitle className="text-xl font-semibold text-purple-600 flex items-center">
                        <Bell className="mr-2 h-6 w-6"/> System Notifications
                    </CardTitle>
                    <CardDescription>Simulate sending system-wide notifications.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Button onClick={() => simulatedNotification('emergency')} variant="destructive" className="w-full">
                        <AlertTriangle className="mr-2 h-4 w-4"/> Send Emergency Alert
                    </Button>
                     <Button onClick={() => simulatedNotification('policy')} className="w-full bg-blue-600 hover:bg-blue-700">
                        <FileText className="mr-2 h-4 w-4"/> Send Policy Update
                    </Button>
                     <Button onClick={() => simulatedNotification('system')} variant="outline" className="w-full">
                        <Settings className="mr-2 h-4 w-4"/> Send System Alert
                    </Button>
                </CardContent>
            </Card>
        );
    };

    export default NotificationSimulator;