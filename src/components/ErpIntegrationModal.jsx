import React, { useState } from 'react';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { Input } from '@/components/ui/input.jsx';
    import { Label } from '@/components/ui/label.jsx';
    import { Textarea } from '@/components/ui/textarea.jsx';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
    import { useToast } from '@/components/ui/use-toast.jsx';
    import { Link2, Save, Settings } from 'lucide-react';

    const ErpIntegrationModal = ({ isOpen, onClose }) => {
      const { toast } = useToast();
      const [erpSystemName, setErpSystemName] = useState('SAP S/4HANA');
      const [apiEndpoint, setApiEndpoint] = useState('');
      const [apiKey, setApiKey] = useState('');
      const [syncFrequency, setSyncFrequency] = useState('daily');
      const [dataToSync, setDataToSync] = useState(['patients', 'inventory']);
      const [customConfig, setCustomConfig] = useState('');

      const handleSubmit = (e) => {
        e.preventDefault();
        if (!apiEndpoint || !apiKey) {
          toast({
            variant: "destructive",
            title: "Missing Information",
            description: "API Endpoint and API Key are required.",
          });
          return;
        }
        
        const integrationSettings = {
          erpSystemName,
          apiEndpoint,
          apiKey,
          syncFrequency,
          dataToSync,
          customConfig,
          lastUpdated: new Date().toISOString(),
        };

        console.log("ERP Integration Settings:", integrationSettings);
        toast({
          title: "Settings Saved (Simulated)",
          description: `ERP integration settings for ${erpSystemName} have been saved.`,
          className: "bg-green-500 text-white"
        });
        onClose();
      };

      const handleDataSyncChange = (value) => {
        if (dataToSync.includes(value)) {
          setDataToSync(dataToSync.filter(item => item !== value));
        } else {
          setDataToSync([...dataToSync, value]);
        }
      };

      return (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Link2 className="mr-2 h-5 w-5" /> ERP Integration Settings
              </DialogTitle>
              <DialogDescription>
                Configure settings to connect PAMS with your Enterprise Resource Planning system.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div>
                <Label htmlFor="erpSystemName">ERP System Name</Label>
                <Select value={erpSystemName} onValueChange={setErpSystemName}>
                  <SelectTrigger id="erpSystemName">
                    <SelectValue placeholder="Select ERP System" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SAP S/4HANA">SAP S/4HANA</SelectItem>
                    <SelectItem value="Oracle NetSuite">Oracle NetSuite</SelectItem>
                    <SelectItem value="Microsoft Dynamics 365">Microsoft Dynamics 365</SelectItem>
                    <SelectItem value="Odoo">Odoo</SelectItem>
                    <SelectItem value="Custom">Custom ERP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="apiEndpoint">API Endpoint URL</Label>
                <Input 
                  id="apiEndpoint" 
                  placeholder="https://your-erp-api.com/v1/pams" 
                  value={apiEndpoint}
                  onChange={(e) => setApiEndpoint(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="apiKey">API Key / Token</Label>
                <Input 
                  id="apiKey" 
                  type="password" 
                  placeholder="Enter your secure API key" 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="syncFrequency">Synchronization Frequency</Label>
                <Select value={syncFrequency} onValueChange={setSyncFrequency}>
                  <SelectTrigger id="syncFrequency">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realtime">Real-time (if supported)</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="manual">Manual Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Data to Synchronize</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {['patients', 'inventory', 'personnel', 'financials'].map(item => (
                    <div key={item} className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id={`sync-${item}`} 
                        value={item} 
                        checked={dataToSync.includes(item)} 
                        onChange={(e) => handleDataSyncChange(e.target.value)}
                        className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                      <Label htmlFor={`sync-${item}`} className="font-normal capitalize">{item}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="customConfig">Custom Configuration (JSON)</Label>
                <Textarea 
                  id="customConfig" 
                  placeholder='e.g., { "timeout": 5000, "retryAttempts": 3 }'
                  value={customConfig}
                  onChange={(e) => setCustomConfig(e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">Enter any ERP-specific configuration in JSON format.</p>
              </div>
              <DialogFooter className="pt-4">
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" /> Save Configuration
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      );
    };

    export default ErpIntegrationModal;