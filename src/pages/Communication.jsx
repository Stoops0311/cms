import React, { useState } from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
    import { MessageSquare, Send, Bell, Users, AlertTriangle, FileText, Mail, PhoneCall } from 'lucide-react';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button.jsx';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.jsx";
    import { Input } from '@/components/ui/input.jsx';
    import { Textarea } from '@/components/ui/textarea.jsx';

    const CommunicationChannelCard = ({ title, description, icon: Icon, actionText, onAction }) => (
      <Card className="shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center space-x-3 pb-2">
          <Icon className="h-6 w-6 text-indigo-500" />
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">{description}</p>
          {onAction && <Button variant="outline" size="sm" onClick={onAction} className="w-full">{actionText || "Access Channel"}</Button>}
        </CardContent>
      </Card>
    );
    
    const ChatPlaceholder = () => (
      <div className="border rounded-lg p-4 h-96 flex flex-col">
        <div className="flex-grow space-y-2 overflow-y-auto p-2 bg-slate-50 rounded">
          <div className="flex justify-start"><div className="bg-muted p-2 rounded-lg max-w-xs">Hello Team! Any updates on Sector B?</div></div>
          <div className="flex justify-end"><div className="bg-primary text-primary-foreground p-2 rounded-lg max-w-xs">Working on it, trenching is 50% complete.</div></div>
          <div className="flex justify-start"><div className="bg-muted p-2 rounded-lg max-w-xs">Great, send photos when possible.</div></div>
        </div>
        <div className="mt-4 flex">
          <Input placeholder="Type your message..." className="flex-grow mr-2" disabled/>
          <Button disabled><Send className="h-4 w-4 mr-1"/>Send</Button>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">Chat interface is a placeholder.</p>
      </div>
    );

    const Communication = () => {
      const [activeTab, setActiveTab] = useState("chat");

      const channels = [
        { id: "chat", title: "Project Chat", description: "Real-time chat for project teams, site-wise groups, and private messages.", icon: MessageSquare, actionText: "Open Chat (Placeholder)" },
        { id: "notices", title: "Official Notices & RFIs", description: "Distribute official notices, site instructions, and manage Requests for Information (RFIs).", icon: FileText, actionText: "View Notices (Placeholder)" },
        { id: "alerts", title: "Emergency Broadcasts", description: "Send urgent alerts via multiple channels (SMS, Email, Push Notifications).", icon: Bell, actionText: "Send Alert (Placeholder)" },
        { id: "voice", title: "Voice Memo Support", description: "Record and share voice memos for quick updates or instructions.", icon: PhoneCall, actionText: "Record Memo (Placeholder)" },
        { id: "email", title: "Email Gateway", description: "Integrate with email for formal communication logging.", icon: Mail, actionText: "Access Email Log (Placeholder)" },
      ];

      const handleChannelAction = (channelTitle) => {
        alert(`Accessing ${channelTitle}. This feature is a placeholder.`);
      };

      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-4 md:p-6 lg:p-8"
        >
          <Card className="shadow-xl border-t-4 border-indigo-500 mb-8">
            <CardHeader>
              <CardTitle className="text-2xl font-bold tracking-tight text-indigo-600 flex items-center">
                <Users className="mr-2 h-6 w-6" />Communication & Notices Hub
              </CardTitle>
              <CardDescription>
                Centralized communication for project collaboration, official notices, RFIs, and alerts for Civil & Telecom projects.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mt-2 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded-md flex items-start">
                <AlertTriangle className="h-5 w-5 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Under Development:</p>
                  <p className="text-sm">This module is currently a placeholder. Full communication features will be implemented with backend integration.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-5 mb-6">
              {channels.map(channel => (
                <TabsTrigger key={channel.id} value={channel.id} className="text-xs sm:text-sm">
                  <channel.icon className="mr-1.5 h-4 w-4"/>{channel.title}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="chat">
              <Card>
                <CardHeader><CardTitle>Project Chat (Placeholder)</CardTitle></CardHeader>
                <CardContent><ChatPlaceholder /></CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="notices">
              <CommunicationChannelCard 
                title="Official Notices & RFIs" 
                description="Distribute official notices, site instructions, and manage Requests for Information (RFIs)." 
                icon={FileText} 
                actionText="Manage Notices & RFIs (Placeholder)"
                onAction={() => handleChannelAction("Notices & RFIs")}
              />
            </TabsContent>
            <TabsContent value="alerts">
              <CommunicationChannelCard 
                title="Emergency Broadcasts" 
                description="Send urgent alerts via multiple channels (SMS, Email, Push Notifications)." 
                icon={Bell} 
                actionText="Compose Emergency Alert (Placeholder)"
                onAction={() => handleChannelAction("Emergency Broadcasts")}
              />
            </TabsContent>
             <TabsContent value="voice">
              <CommunicationChannelCard 
                title="Voice Memo Support" 
                description="Record and share voice memos for quick updates or instructions." 
                icon={PhoneCall} 
                actionText="Record/Listen to Memos (Placeholder)"
                onAction={() => handleChannelAction("Voice Memos")}
              />
            </TabsContent>
             <TabsContent value="email">
              <CommunicationChannelCard 
                title="Email Gateway" 
                description="Integrate with email for formal communication logging and distribution." 
                icon={Mail} 
                actionText="View Email Logs (Placeholder)"
                onAction={() => handleChannelAction("Email Gateway")}
              />
            </TabsContent>
          </Tabs>
        </motion.div>
      );
    };

    export default Communication;