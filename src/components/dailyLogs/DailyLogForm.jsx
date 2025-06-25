import React, { useState } from 'react';
    import { Button } from '@/components/ui/button.jsx';
    import { Input } from '@/components/ui/input.jsx';
    import { Label } from '@/components/ui/label.jsx';
    import { Textarea } from '@/components/ui/textarea.jsx';
    import { DatePicker } from '@/components/ui/date-picker.jsx';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
    import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card.jsx';
    import { DialogFooter as DialogFooterCustom } from '@/components/ui/dialog.jsx';
    import { PlusCircle, Trash2, UploadCloud, Paperclip, Sun, Users, Wrench as Tool, AlertTriangle, CheckSquare, Package } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast.jsx';

    const weatherConditions = ["Sunny", "Partly Cloudy", "Cloudy", "Overcast", "Light Rain", "Heavy Rain", "Windy", "Foggy", "Snow", "Hail"];
    const mockEquipment = [
        {id: "EQ001", name: "Excavator"}, {id: "EQ002", name: "Splicing Machine"}, {id: "EQ003", name: "OTDR"},
        {id: "EQ004", name: "Crane"}, {id: "EQ005", name: "Concrete Mixer"}, {id: "EQ006", name: "Compactor"},
        {id: "EQ007", name: "Dump Truck"}, {id: "EQ008", name: "Cable Puller"}
    ];
    const mockMaterials = [
        {id: "MAT001", name: "Fiber Optic Cable (meters)"}, {id: "MAT002", name: "Splice Closures (units)"},
        {id: "MAT003", name: "Concrete Bags (units)"}, {id: "MAT004", name: "Conduit Pipes (meters)"},
        {id: "MAT005", name: "Gravel (cu.m)"}, {id: "MAT006", name: "Rebar (kg)"}
    ];

    const DailyLogFormField = ({ id, label, children }) => (
      <div>
        <Label htmlFor={id}>{label}</Label>
        {children}
      </div>
    );

    const DailyLogSectionCard = ({ title, icon: Icon, children, iconColor = "text-gray-600" }) => (
      <Card className="p-4 bg-slate-50">
        <CardHeader className="p-0 pb-2">
          <CardTitle className="text-md flex items-center">
            <Icon className={`mr-2 h-5 w-5 ${iconColor}`} />{title}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 space-y-3">
          {children}
        </CardContent>
      </Card>
    );

    const DailyLogForm = ({ onSubmit, initialData = {}, onCancel, projects }) => {
      const [logDate, setLogDate] = useState(initialData.logDate ? new Date(initialData.logDate) : new Date());
      const [projectId, setProjectId] = useState(initialData.projectId || '');
      const [siteLocation, setSiteLocation] = useState(initialData.siteLocation || '');
      const [weather, setWeather] = useState(initialData.weather || '');
      const [temperature, setTemperature] = useState(initialData.temperature || '');
      const [windSpeed, setWindSpeed] = useState(initialData.windSpeed || '');
      const [manpowerCount, setManpowerCount] = useState(initialData.manpowerCount?.toString() || '');
      const [teamsOnSite, setTeamsOnSite] = useState(initialData.teamsOnSite || '');
      const [equipmentUsed, setEquipmentUsed] = useState(initialData.equipmentUsed || [{ equipmentId: '', hours: '', notes: '' }]);
      const [workAccomplished, setWorkAccomplished] = useState(initialData.workAccomplished || '');
      const [materialsConsumed, setMaterialsConsumed] = useState(initialData.materialsConsumed || [{ materialId: '', quantity: '', unit: '' }]);
      const [safetyObservations, setSafetyObservations] = useState(initialData.safetyObservations || '');
      const [delaysOrIssues, setDelaysOrIssues] = useState(initialData.delaysOrIssues || '');
      const [attachments, setAttachments] = useState(initialData.attachments || []);
      const { toast } = useToast();

      const handleDynamicListChange = (list, setList, index, field, value) => {
        const updatedList = [...list];
        updatedList[index][field] = value;
        if (field === 'materialId' && list === materialsConsumed) {
            const selectedMat = mockMaterials.find(m => m.id === value);
            updatedList[index].unit = selectedMat ? selectedMat.name.split('(')[1]?.replace(')','') || '' : '';
        }
        setList(updatedList);
      };
      const addDynamicListItem = (list, setList, newItem) => setList([...list, newItem]);
      const removeDynamicListItem = (list, setList, index) => setList(list.filter((_, i) => i !== index));
      
      const handleFileChange = (event) => {
        if (event.target.files) {
          const newFiles = Array.from(event.target.files).map(file => ({
            name: file.name, type: file.type, size: file.size,
            id: `FILE-${Date.now()}-${Math.random().toString(36).substr(2,5)}`
          }));
          setAttachments(prev => [...prev, ...newFiles].slice(0, 5)); 
          if (attachments.length + newFiles.length > 5) {
            toast({variant: "warning", title: "File Limit", description: "Maximum 5 attachments allowed."})
          }
        }
      };
      const removeAttachment = (id) => setAttachments(attachments.filter(file => file.id !== id));

      const handleSubmit = (e) => {
        e.preventDefault();
        if (!projectId || !workAccomplished) {
          toast({ variant: "destructive", title: "Missing Fields", description: "Project and Work Accomplished are required." });
          return;
        }
        onSubmit({
          id: initialData.id || `LOG-${Date.now().toString().slice(-5)}`,
          logDate: logDate.toISOString(), projectId, siteLocation, weather, temperature, windSpeed,
          manpowerCount: parseInt(manpowerCount) || 0, teamsOnSite,
          equipmentUsed: equipmentUsed.filter(eq => eq.equipmentId && eq.hours), 
          workAccomplished, 
          materialsConsumed: materialsConsumed.filter(m => m.materialId && m.quantity),
          safetyObservations, delaysOrIssues, attachments
        });
      };

      return (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DailyLogFormField id="logDate-dlform" label="Log Date"><DatePicker id="logDate-dlform" date={logDate} setDate={setLogDate} /></DailyLogFormField>
            <DailyLogFormField id="projectId-dlform" label="Project">
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger id="projectId-dlform"><SelectValue placeholder="Select Project" /></SelectTrigger>
                <SelectContent>{(projects || []).map(p => <SelectItem key={p.id} value={p.id}>{p.projectName} ({p.projectCode || p.id})</SelectItem>)}</SelectContent>
              </Select>
            </DailyLogFormField>
          </div>
          <DailyLogFormField id="siteLocation-dlform" label="Site Location/Area">
            <Input id="siteLocation-dlform" value={siteLocation} onChange={e => setSiteLocation(e.target.value)} placeholder="e.g., Sector C, Manhole MH-105, Fiber Route KM 5.5" />
          </DailyLogFormField>
          
          <DailyLogSectionCard title="Weather Conditions" icon={Sun} iconColor="text-orange-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <DailyLogFormField id="weather-dlform" label="General Condition">
                <Select value={weather} onValueChange={setWeather}><SelectTrigger id="weather-dlform"><SelectValue placeholder="Select Condition"/></SelectTrigger><SelectContent>{weatherConditions.map(w=><SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent></Select>
              </DailyLogFormField>
              <DailyLogFormField id="temperature-dlform" label="Temperature (°C)"><Input id="temperature-dlform" value={temperature} onChange={e => setTemperature(e.target.value)} placeholder="e.g., 28" /></DailyLogFormField>
              <DailyLogFormField id="windSpeed-dlform" label="Wind Speed (km/h)"><Input id="windSpeed-dlform" value={windSpeed} onChange={e => setWindSpeed(e.target.value)} placeholder="e.g., 15" /></DailyLogFormField>
            </div>
          </DailyLogSectionCard>

          <DailyLogSectionCard title="Manpower" icon={Users} iconColor="text-blue-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DailyLogFormField id="manpowerCount-dlform" label="Total on Site"><Input id="manpowerCount-dlform" type="number" value={manpowerCount} onChange={e => setManpowerCount(e.target.value)} placeholder="e.g., 15" /></DailyLogFormField>
              <DailyLogFormField id="teamsOnSite-dlform" label="Teams Present (e.g., Civil, Splicing)"><Input id="teamsOnSite-dlform" value={teamsOnSite} onChange={e => setTeamsOnSite(e.target.value)} placeholder="Civil Team A, Splicing Team B, QA/QC" /></DailyLogFormField>
            </div>
          </DailyLogSectionCard>
          
          <DailyLogSectionCard title="Equipment Usage" icon={Tool} iconColor="text-gray-600">
            {equipmentUsed.map((entry, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
                <div className="col-span-12 md:col-span-4"><Label className="text-xs">Equipment</Label><Select value={entry.equipmentId} onValueChange={val => handleDynamicListChange(equipmentUsed, setEquipmentUsed, index, 'equipmentId', val)}><SelectTrigger><SelectValue placeholder="Select Equipment"/></SelectTrigger><SelectContent>{mockEquipment.map(eq=><SelectItem key={eq.id} value={eq.id}>{eq.name}</SelectItem>)}</SelectContent></Select></div>
                <div className="col-span-6 md:col-span-2"><Label className="text-xs">Hours Used</Label><Input type="number" value={entry.hours} onChange={e => handleDynamicListChange(equipmentUsed, setEquipmentUsed, index, 'hours', e.target.value)} placeholder="e.g., 8"/></div>
                <div className="col-span-6 md:col-span-4"><Label className="text-xs">Notes</Label><Input value={entry.notes} onChange={e => handleDynamicListChange(equipmentUsed, setEquipmentUsed, index, 'notes', e.target.value)} placeholder="e.g. Standby, Minor issue"/></div>
                <div className="col-span-12 md:col-span-2"><Button type="button" variant="destructive" size="sm" onClick={() => removeDynamicListItem(equipmentUsed, setEquipmentUsed, index)} className="w-full"><Trash2 className="h-4 w-4"/></Button></div>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => addDynamicListItem(equipmentUsed, setEquipmentUsed, { equipmentId: '', hours: '', notes: '' })}><PlusCircle className="mr-2 h-4 w-4"/>Add Equipment</Button>
          </DailyLogSectionCard>

          <DailyLogSectionCard title="Work Accomplished" icon={CheckSquare} iconColor="text-green-600">
            <Textarea value={workAccomplished} onChange={e => setWorkAccomplished(e.target.value)} placeholder="Detail tasks like: Trenching 100m (Location X to Y), Cable Pulling 500m (MH-1 to MH-2), Spliced 24 fibers (Closure Z), Concrete poured for Foundation A..." rows={4}/>
          </DailyLogSectionCard>

          <DailyLogSectionCard title="Materials Consumed" icon={Package} iconColor="text-indigo-500">
            {materialsConsumed.map((entry, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-12 md:col-span-5"><Label className="text-xs">Material</Label><Select value={entry.materialId} onValueChange={val => handleDynamicListChange(materialsConsumed, setMaterialsConsumed, index, 'materialId', val)}><SelectTrigger><SelectValue placeholder="Select Material"/></SelectTrigger><SelectContent>{mockMaterials.map(mat=><SelectItem key={mat.id} value={mat.id}>{mat.name}</SelectItem>)}</SelectContent></Select></div>
                <div className="col-span-4 md:col-span-3"><Label className="text-xs">Quantity</Label><Input type="number" value={entry.quantity} onChange={e => handleDynamicListChange(materialsConsumed, setMaterialsConsumed, index, 'quantity', e.target.value)} placeholder="e.g., 100"/></div>
                <div className="col-span-4 md:col-span-2"><Label className="text-xs">Unit</Label><Input value={entry.unit} disabled placeholder="Unit"/></div>
                <div className="col-span-4 md:col-span-2"><Button type="button" variant="destructive" size="sm" onClick={() => removeDynamicListItem(materialsConsumed, setMaterialsConsumed, index)} className="w-full"><Trash2 className="h-4 w-4"/></Button></div>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => addDynamicListItem(materialsConsumed, setMaterialsConsumed, { materialId: '', quantity: '', unit: '' })}><PlusCircle className="mr-2 h-4 w-4"/>Add Material</Button>
          </DailyLogSectionCard>

          <DailyLogSectionCard title="Safety & Issues" icon={AlertTriangle} iconColor="text-red-500">
            <DailyLogFormField id="safetyObservations-dlform" label="Safety Observations/Incidents"><Textarea id="safetyObservations-dlform" value={safetyObservations} onChange={e => setSafetyObservations(e.target.value)} placeholder="Toolbox talks, PPE compliance, near misses, incidents, good practices..." /></DailyLogFormField>
            <DailyLogFormField id="delaysOrIssues-dlform" label="Delays or Issues Encountered"><Textarea id="delaysOrIssues-dlform" value={delaysOrIssues} onChange={e => setDelaysOrIssues(e.target.value)} placeholder="Access problems, equipment breakdown, material shortage, RFI raised..." /></DailyLogFormField>
          </DailyLogSectionCard>
          
          <DailyLogSectionCard title="Attachments (Max 5)" icon={UploadCloud} iconColor="text-purple-500">
            <Input id="attachments-dlform" type="file" multiple onChange={handleFileChange} accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" />
            {attachments.length > 0 && (
              <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                {attachments.map(file => (
                  <li key={file.id || file.name} className="flex justify-between items-center">
                    <span><Paperclip className="inline mr-1 h-3 w-3"/>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                    <Button type="button" variant="ghost" size="xs" onClick={() => removeAttachment(file.id || file.name)}><Trash2 className="h-3 w-3 text-destructive"/></Button>
                  </li>
                ))}
              </ul>
            )}
            {attachments.length >=5 && <p className="text-xs text-orange-600 mt-1">Maximum 5 attachments reached.</p>}
          </DailyLogSectionCard>

          <DialogFooterCustom className="pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
            <Button type="submit">{initialData.id ? 'Update Log' : 'Submit Log'}</Button>
          </DialogFooterCustom>
        </form>
      );
    };
    export default DailyLogForm;