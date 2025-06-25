import React, { useState } from 'react';
    import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { Input } from '@/components/ui/input.jsx';
    import { Label } from '@/components/ui/label.jsx';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
    import { UserCircle, Bell, Shield, Palette, Link as LinkIcon, LogOut, Settings as SettingsIcon } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast.jsx';
    import { motion } from 'framer-motion';
    import useLocalStorage from '@/hooks/useLocalStorage.jsx';

    const ProfileSettings = ({ user, onUpdateUser }) => {
        const [name, setName] = useState(user.name);
        const [email, setEmail] = useState(user.email);
        const { toast } = useToast();

        const handleSubmit = (e) => {
            e.preventDefault();
            onUpdateUser({ ...user, name, email });
            toast({ title: "Profile Updated", description: "Your profile information has been saved." });
        };

        return (
            <form onSubmit={handleSubmit} className="space-y-4">
                <div><Label htmlFor="name">Full Name</Label><Input id="name" value={name} onChange={e => setName(e.target.value)} /></div>
                <div><Label htmlFor="email">Email Address</Label><Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
                <Button type="submit">Save Profile</Button>
            </form>
        );
    };

    const NotificationSettings = ({ settings, onUpdateSettings }) => {
        const [emailNotifications, setEmailNotifications] = useState(settings.emailNotifications);
        const [smsNotifications, setSmsNotifications] = useState(settings.smsNotifications);
        const { toast } = useToast();

        const handleSubmit = (e) => {
            e.preventDefault();
            onUpdateSettings({ ...settings, emailNotifications, smsNotifications });
            toast({ title: "Notifications Updated", description: "Your notification preferences have been saved." });
        };
        return (
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center space-x-2">
                    <input type="checkbox" id="emailNotif" checked={emailNotifications} onChange={e => setEmailNotifications(e.target.checked)} className="form-checkbox h-5 w-5 text-primary rounded focus:ring-primary" />
                    <Label htmlFor="emailNotif">Enable Email Notifications</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <input type="checkbox" id="smsNotif" checked={smsNotifications} onChange={e => setSmsNotifications(e.target.checked)} className="form-checkbox h-5 w-5 text-primary rounded focus:ring-primary" />
                    <Label htmlFor="smsNotif">Enable SMS Notifications (Conceptual)</Label>
                </div>
                <Button type="submit">Save Notification Settings</Button>
            </form>
        );
    };
    
    const SecuritySettingsTab = () => {
        const { toast } = useToast();
        const handleChangePassword = () => {
            toast({ title: "Change Password (Conceptual)", description: "Password change functionality would be here." });
        };
        const handleEnable2FA = () => {
            toast({ title: "Enable 2FA (Conceptual)", description: "Two-Factor Authentication setup would be here." });
        };
        return (
            <div className="space-y-4">
                <Button onClick={handleChangePassword}>Change Password</Button>
                <Button onClick={handleEnable2FA} variant="outline">Enable Two-Factor Authentication</Button>
            </div>
        );
    };

    const AppearanceSettings = ({ settings, onUpdateSettings }) => {
        const [theme, setTheme] = useState(settings.theme || 'light');
        const { toast } = useToast();
        
        const handleThemeChange = (newTheme) => {
            setTheme(newTheme);
            onUpdateSettings({ ...settings, theme: newTheme });
            toast({ title: "Theme Updated", description: `Theme set to ${newTheme}. (Full theme switching is conceptual)` });
        };

        return (
            <div className="space-y-4">
                <Label>Select Theme:</Label>
                <div className="flex space-x-2">
                    <Button variant={theme === 'light' ? 'default' : 'outline'} onClick={() => handleThemeChange('light')}>Light</Button>
                    <Button variant={theme === 'dark' ? 'default' : 'outline'} onClick={() => handleThemeChange('dark')}>Dark (Conceptual)</Button>
                    <Button variant={theme === 'system' ? 'default' : 'outline'} onClick={() => handleThemeChange('system')}>System (Conceptual)</Button>
                </div>
            </div>
        );
    };
    
    const ErpIntegrationSettings = ({ erpSettings, onUpdateErpSettings }) => {
        const [apiUrl, setApiUrl] = useState(erpSettings.apiUrl || '');
        const [apiKey, setApiKey] = useState(erpSettings.apiKey || '');
        const { toast } = useToast();

        const handleSubmit = (e) => {
            e.preventDefault();
            onUpdateErpSettings({ apiUrl, apiKey });
            toast({ title: "ERP Settings Saved", description: "ERP integration details have been updated. (This is conceptual)" });
        };

        return (
            <form onSubmit={handleSubmit} className="space-y-4">
                <div><Label htmlFor="erpApiUrl">ERP API URL</Label><Input id="erpApiUrl" value={apiUrl} onChange={e => setApiUrl(e.target.value)} placeholder="https://your-erp-api.com/"/></div>
                <div><Label htmlFor="erpApiKey">ERP API Key</Label><Input id="erpApiKey" type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="Enter your ERP API Key"/></div>
                <Button type="submit">Save ERP Settings</Button>
                <p className="text-xs text-muted-foreground">Note: Actual integration requires backend logic. These settings are for demonstration.</p>
            </form>
        );
    };


    const SettingsPage = () => {
      const { toast } = useToast();
      const [user, setUser] = useLocalStorage('cmsUserSettings_User', { name: 'Site Manager', email: 'manager@cms.ntt' });
      const [notificationSettings, setNotificationSettings] = useLocalStorage('cmsUserSettings_Notifications', { emailNotifications: true, smsNotifications: false });
      const [appearanceSettings, setAppearanceSettings] = useLocalStorage('cmsUserSettings_Appearance', { theme: 'light' });
      const [erpSettings, setErpSettings] = useLocalStorage('cmsUserSettings_Erp', { apiUrl: '', apiKey: '' });


      const handleLogout = () => {
        toast({ title: "Logged Out", description: "You have been successfully logged out. (Conceptual)" });
      };

      return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="p-4 md:p-6 lg:p-8">
          <Card className="shadow-xl border-t-4 border-primary mb-8">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-primary flex items-center"><SettingsIcon className="mr-3 h-7 w-7"/>General Settings</CardTitle>
              <CardDescription>Manage your account, notifications, appearance, and system integrations.</CardDescription>
            </CardHeader>
          </Card>

          <Tabs defaultValue="profile" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              <TabsTrigger value="profile"><UserCircle className="mr-2 h-4 w-4"/>Profile</TabsTrigger>
              <TabsTrigger value="notifications"><Bell className="mr-2 h-4 w-4"/>Notifications</TabsTrigger>
              <TabsTrigger value="security"><Shield className="mr-2 h-4 w-4"/>Security</TabsTrigger>
              <TabsTrigger value="appearance"><Palette className="mr-2 h-4 w-4"/>Appearance</TabsTrigger>
              <TabsTrigger value="integrations"><LinkIcon className="mr-2 h-4 w-4"/>ERP Integration</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card><CardHeader><CardTitle>Profile Information</CardTitle></CardHeader><CardContent><ProfileSettings user={user} onUpdateUser={setUser} /></CardContent></Card>
            </TabsContent>
            <TabsContent value="notifications">
              <Card><CardHeader><CardTitle>Notification Preferences</CardTitle></CardHeader><CardContent><NotificationSettings settings={notificationSettings} onUpdateSettings={setNotificationSettings} /></CardContent></Card>
            </TabsContent>
            <TabsContent value="security">
              <Card><CardHeader><CardTitle>Security Settings</CardTitle></CardHeader><CardContent><SecuritySettingsTab /></CardContent></Card>
            </TabsContent>
            <TabsContent value="appearance">
              <Card><CardHeader><CardTitle>Appearance & Theme</CardTitle></CardHeader><CardContent><AppearanceSettings settings={appearanceSettings} onUpdateSettings={setAppearanceSettings} /></CardContent></Card>
            </TabsContent>
            <TabsContent value="integrations">
              <Card><CardHeader><CardTitle>ERP Integration Settings</CardTitle><CardDescription>Configure connection to your Enterprise Resource Planning system.</CardDescription></CardHeader><CardContent><ErpIntegrationSettings erpSettings={erpSettings} onUpdateErpSettings={setErpSettings} /></CardContent></Card>
            </TabsContent>
          </Tabs>
          
          <Card className="mt-8">
            <CardHeader><CardTitle>Account Actions</CardTitle></CardHeader>
            <CardContent>
                <Button variant="destructive" onClick={handleLogout}><LogOut className="mr-2 h-4 w-4"/>Log Out</Button>
            </CardContent>
          </Card>
        </motion.div>
      );
    };
    
    export default SettingsPage;