import React from 'react';
    import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { Input } from '@/components/ui/input.jsx';
    import { Label } from '@/components/ui/label.jsx';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
    import { motion } from 'framer-motion';
    import { Settings, UserCircle, Bell, Palette, ShieldCheck as ShieldLock, Save } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast.jsx';
    import useLocalStorage from '@/hooks/useLocalStorage.jsx';

    const GeneralSettings = () => {
        const { toast } = useToast();
        const [settings, setSettings] = useLocalStorage('cmsGeneralSettings', {
            companyName: 'NTT Groups CMS',
            dateFormat: 'dd MMM yyyy',
            timeZone: 'UTC',
            notificationsEnabled: true,
            theme: 'system',
        });

        const handleInputChange = (e) => {
            const { name, value, type, checked } = e.target;
            setSettings(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        };
        
        const handleSelectChange = (name, value) => {
             setSettings(prev => ({ ...prev, [name]: value }));
        };

        const handleSaveSettings = () => {
            toast({ title: "Settings Saved", description: "Your general settings have been updated." });
        };

        return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-8 max-w-3xl mx-auto">
                <Card className="shadow-xl border-t-4 border-gray-500">
                    <CardHeader className="bg-gradient-to-r from-gray-500/10 to-slate-500/10">
                        <CardTitle className="text-2xl font-bold text-gray-700 flex items-center"><Settings className="mr-3 h-7 w-7" />General System Settings</CardTitle>
                        <CardDescription>Configure basic settings for the Construction Management System.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                        <Card>
                            <CardHeader><CardTitle className="text-lg flex items-center"><UserCircle className="mr-2 h-5 w-5 text-primary"/>Company Profile</CardTitle></CardHeader>
                            <CardContent className="space-y-3">
                                <div><Label htmlFor="companyName">Company Name</Label><Input id="companyName" name="companyName" value={settings.companyName} onChange={handleInputChange}/></div>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader><CardTitle className="text-lg flex items-center"><Palette className="mr-2 h-5 w-5 text-primary"/>Appearance & Localization</CardTitle></CardHeader>
                            <CardContent className="space-y-3">
                                <div><Label htmlFor="dateFormat">Date Format</Label>
                                    <Select name="dateFormat" value={settings.dateFormat} onValueChange={(val) => handleSelectChange('dateFormat', val)}>
                                        <SelectTrigger id="dateFormat"><SelectValue/></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="dd MMM yyyy">DD MMM YYYY (e.g., 14 May 2025)</SelectItem>
                                            <SelectItem value="MM/dd/yyyy">MM/DD/YYYY (e.g., 05/14/2025)</SelectItem>
                                            <SelectItem value="yyyy-MM-dd">YYYY-MM-DD (e.g., 2025-05-14)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div><Label htmlFor="timeZone">Time Zone</Label>
                                    <Select name="timeZone" value={settings.timeZone} onValueChange={(val) => handleSelectChange('timeZone', val)}>
                                        <SelectTrigger id="timeZone"><SelectValue/></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="UTC">UTC</SelectItem>
                                            <SelectItem value="America/New_York">America/New_York (EST/EDT)</SelectItem>
                                            <SelectItem value="Europe/London">Europe/London (GMT/BST)</SelectItem>
                                            <SelectItem value="Asia/Dubai">Asia/Dubai (GST)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                 <div><Label htmlFor="theme">Theme</Label>
                                    <Select name="theme" value={settings.theme} onValueChange={(val) => handleSelectChange('theme', val)}>
                                        <SelectTrigger id="theme"><SelectValue/></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="light">Light</SelectItem>
                                            <SelectItem value="dark">Dark (Coming Soon)</SelectItem>
                                            <SelectItem value="system">System Preference</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle className="text-lg flex items-center"><Bell className="mr-2 h-5 w-5 text-primary"/>Notifications</CardTitle></CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <Input type="checkbox" id="notificationsEnabled" name="notificationsEnabled" checked={settings.notificationsEnabled} onChange={handleInputChange} className="h-4 w-4"/>
                                    <Label htmlFor="notificationsEnabled">Enable System Notifications</Label>
                                </div>
                                <p className="text-xs text-muted-foreground">Control global notifications for alerts, task updates, etc.</p>
                            </CardContent>
                        </Card>
                        
                        <div className="flex justify-end pt-4">
                            <Button onClick={handleSaveSettings} className="bg-primary hover:bg-primary/90"><Save className="mr-2 h-4 w-4"/>Save Settings</Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        );
    };

    export default GeneralSettings;