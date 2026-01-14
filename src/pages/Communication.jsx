import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { MessageSquare, Send, Bell, Users, FileText, Mail, PhoneCall, Loader2, CheckCircle, Clock, AlertCircle, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.jsx";
import { Input } from '@/components/ui/input.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog.jsx';
import { useToast } from '@/components/ui/use-toast.jsx';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

const ComingSoonCard = ({ title, description, icon: Icon }) => (
  <Card className="shadow-md bg-gray-50">
    <CardHeader className="flex flex-row items-center space-x-3 pb-2">
      <Icon className="h-6 w-6 text-gray-400" />
      <CardTitle className="text-lg text-gray-500">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground mb-3">{description}</p>
      <div className="bg-gray-200 text-gray-600 text-center py-2 rounded text-sm font-medium">
        Coming Soon
      </div>
    </CardContent>
  </Card>
);

const Communication = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("notices");
  const [isNoticeDialogOpen, setIsNoticeDialogOpen] = useState(false);
  const [isBroadcastDialogOpen, setIsBroadcastDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticePriority, setNoticePriority] = useState('medium');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastContent, setBroadcastContent] = useState('');
  const [broadcastPriority, setBroadcastPriority] = useState('high');

  // Convex queries
  const users = useQuery(api.admin.listUsers, { isActive: true });
  const allNotices = useQuery(api.communications.listNotices, { limit: 20 });
  const currentUser = users?.[0]; // In real app, this would be logged-in user
  const userMessages = useQuery(
    api.communications.getUserMessages,
    currentUser ? { userId: currentUser._id } : "skip"
  );

  // Convex mutations
  const sendNotice = useMutation(api.communications.sendNotice);
  const broadcastAnnouncement = useMutation(api.communications.broadcastAnnouncement);
  const markAsRead = useMutation(api.communications.markAsRead);

  const handleSendNotice = async () => {
    if (!noticeTitle || !noticeContent || !currentUser) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Please fill in all required fields." });
      return;
    }

    setIsSubmitting(true);
    try {
      const allUserIds = users?.map(u => u._id) || [];
      await sendNotice({
        type: "notice",
        title: noticeTitle,
        content: noticeContent,
        priority: noticePriority,
        fromUserId: currentUser._id,
        toUserIds: allUserIds,
      });
      toast({ title: "Notice Sent", description: "Your notice has been sent to all users." });
      setIsNoticeDialogOpen(false);
      setNoticeTitle('');
      setNoticeContent('');
      setNoticePriority('medium');
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to send notice." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBroadcast = async () => {
    if (!broadcastTitle || !broadcastContent || !currentUser) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Please fill in all required fields." });
      return;
    }

    setIsSubmitting(true);
    try {
      await broadcastAnnouncement({
        title: broadcastTitle,
        content: broadcastContent,
        priority: broadcastPriority,
        fromUserId: currentUser._id,
      });
      toast({ title: "Broadcast Sent", description: "Emergency broadcast has been sent to all users." });
      setIsBroadcastDialogOpen(false);
      setBroadcastTitle('');
      setBroadcastContent('');
      setBroadcastPriority('high');
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to send broadcast." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkAsRead = async (communicationId) => {
    if (!currentUser) return;
    try {
      await markAsRead({ communicationId, userId: currentUser._id });
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const unreadCount = userMessages?.filter(m => !m.isRead).length || 0;
  const isLoading = users === undefined || allNotices === undefined;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'medium': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return null;
    }
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
            Centralized communication for project collaboration, official notices, RFIs, and alerts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-3 border-l-4 border-blue-500">
              <div className="text-sm text-muted-foreground">Total Notices</div>
              <div className="text-2xl font-bold text-blue-600">{allNotices?.length || 0}</div>
            </Card>
            <Card className="p-3 border-l-4 border-orange-500">
              <div className="text-sm text-muted-foreground">Unread Messages</div>
              <div className="text-2xl font-bold text-orange-600">{unreadCount}</div>
            </Card>
            <Card className="p-3 border-l-4 border-red-500">
              <div className="text-sm text-muted-foreground">High Priority</div>
              <div className="text-2xl font-bold text-red-600">
                {allNotices?.filter(n => n.priority === 'high').length || 0}
              </div>
            </Card>
            <Card className="p-3 border-l-4 border-green-500">
              <div className="text-sm text-muted-foreground">Active Users</div>
              <div className="text-2xl font-bold text-green-600">{users?.length || 0}</div>
            </Card>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          <span className="ml-2 text-muted-foreground">Loading communications...</span>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-5 mb-6">
            <TabsTrigger value="notices" className="text-xs sm:text-sm">
              <FileText className="mr-1.5 h-4 w-4"/>Notices
            </TabsTrigger>
            <TabsTrigger value="inbox" className="text-xs sm:text-sm">
              <MessageSquare className="mr-1.5 h-4 w-4"/>
              Inbox {unreadCount > 0 && <span className="ml-1 bg-red-500 text-white text-xs px-1.5 rounded-full">{unreadCount}</span>}
            </TabsTrigger>
            <TabsTrigger value="alerts" className="text-xs sm:text-sm">
              <Bell className="mr-1.5 h-4 w-4"/>Broadcasts
            </TabsTrigger>
            <TabsTrigger value="voice" className="text-xs sm:text-sm text-gray-400">
              <PhoneCall className="mr-1.5 h-4 w-4"/>Voice
            </TabsTrigger>
            <TabsTrigger value="email" className="text-xs sm:text-sm text-gray-400">
              <Mail className="mr-1.5 h-4 w-4"/>Email
            </TabsTrigger>
          </TabsList>

          {/* Notices Tab */}
          <TabsContent value="notices">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Official Notices & RFIs</CardTitle>
                  <CardDescription>View and create official notices for all team members.</CardDescription>
                </div>
                <Button onClick={() => setIsNoticeDialogOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="h-4 w-4 mr-1" /> New Notice
                </Button>
              </CardHeader>
              <CardContent>
                {allNotices?.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No notices yet. Create the first one!</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {allNotices?.map(notice => (
                      <div key={notice._id} className={`p-4 rounded-lg border ${getPriorityColor(notice.priority)}`}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {getPriorityIcon(notice.priority)}
                              <h4 className="font-semibold">{notice.title || 'Untitled Notice'}</h4>
                              <span className="text-xs px-2 py-0.5 rounded bg-white/50">{notice.type}</span>
                            </div>
                            <p className="text-sm mb-2">{notice.content}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>From: {notice.fromUserName}</span>
                              <span>Read: {notice.readCount}/{notice.totalRecipients}</span>
                              <span>{new Date(notice._creationTime).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inbox Tab */}
          <TabsContent value="inbox">
            <Card>
              <CardHeader>
                <CardTitle>Your Inbox</CardTitle>
                <CardDescription>Messages and notices directed to you.</CardDescription>
              </CardHeader>
              <CardContent>
                {!userMessages || userMessages.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No messages in your inbox.</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {userMessages.map(msg => (
                      <div
                        key={msg._id}
                        className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                          msg.isRead ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'
                        }`}
                        onClick={() => !msg.isRead && handleMarkAsRead(msg._id)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {!msg.isRead && <span className="w-2 h-2 bg-blue-500 rounded-full"></span>}
                              <h4 className="font-semibold">{msg.title || 'Untitled'}</h4>
                              <span className={`text-xs px-2 py-0.5 rounded ${getPriorityColor(msg.priority)}`}>
                                {msg.priority}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{msg.content}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>From: {msg.fromUserName}</span>
                              <span>{new Date(msg._creationTime).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Broadcasts Tab */}
          <TabsContent value="alerts">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Emergency Broadcasts</CardTitle>
                  <CardDescription>Send urgent announcements to all team members.</CardDescription>
                </div>
                <Button onClick={() => setIsBroadcastDialogOpen(true)} className="bg-red-600 hover:bg-red-700">
                  <Bell className="h-4 w-4 mr-1" /> New Broadcast
                </Button>
              </CardHeader>
              <CardContent>
                {allNotices?.filter(n => n.type === 'announcement').length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No broadcasts sent yet.</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {allNotices?.filter(n => n.type === 'announcement').map(broadcast => (
                      <div key={broadcast._id} className="p-4 rounded-lg border border-red-200 bg-red-50">
                        <div className="flex items-center gap-2 mb-1">
                          <Bell className="h-4 w-4 text-red-500" />
                          <h4 className="font-semibold text-red-800">{broadcast.title}</h4>
                        </div>
                        <p className="text-sm text-red-700 mb-2">{broadcast.content}</p>
                        <div className="flex items-center gap-4 text-xs text-red-600">
                          <span>From: {broadcast.fromUserName}</span>
                          <span>Read: {broadcast.readCount}/{broadcast.totalRecipients}</span>
                          <span>{new Date(broadcast._creationTime).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Coming Soon Tabs */}
          <TabsContent value="voice">
            <ComingSoonCard
              title="Voice Memo Support"
              description="Record and share voice memos for quick updates or instructions. This feature requires microphone integration."
              icon={PhoneCall}
            />
          </TabsContent>
          <TabsContent value="email">
            <ComingSoonCard
              title="Email Gateway"
              description="Integrate with email for formal communication logging and distribution. Requires SMTP configuration."
              icon={Mail}
            />
          </TabsContent>
        </Tabs>
      )}

      {/* New Notice Dialog */}
      <Dialog open={isNoticeDialogOpen} onOpenChange={setIsNoticeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Notice</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="noticeTitle">Title *</Label>
              <Input
                id="noticeTitle"
                value={noticeTitle}
                onChange={e => setNoticeTitle(e.target.value)}
                placeholder="Notice title..."
              />
            </div>
            <div>
              <Label htmlFor="noticePriority">Priority</Label>
              <Select value={noticePriority} onValueChange={setNoticePriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="noticeContent">Content *</Label>
              <Textarea
                id="noticeContent"
                value={noticeContent}
                onChange={e => setNoticeContent(e.target.value)}
                placeholder="Notice content..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNoticeDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSendNotice} disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              Send Notice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Broadcast Dialog */}
      <Dialog open={isBroadcastDialogOpen} onOpenChange={setIsBroadcastDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center">
              <Bell className="h-5 w-5 mr-2" /> Emergency Broadcast
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              This will send an urgent notification to ALL active users immediately.
            </div>
            <div>
              <Label htmlFor="broadcastTitle">Title *</Label>
              <Input
                id="broadcastTitle"
                value={broadcastTitle}
                onChange={e => setBroadcastTitle(e.target.value)}
                placeholder="Emergency title..."
              />
            </div>
            <div>
              <Label htmlFor="broadcastPriority">Priority</Label>
              <Select value={broadcastPriority} onValueChange={setBroadcastPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High (Urgent)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="broadcastContent">Message *</Label>
              <Textarea
                id="broadcastContent"
                value={broadcastContent}
                onChange={e => setBroadcastContent(e.target.value)}
                placeholder="Emergency message content..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBroadcastDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleBroadcast} disabled={isSubmitting} className="bg-red-600 hover:bg-red-700">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Bell className="h-4 w-4 mr-2" />}
              Send Broadcast
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default Communication;
