import React, { useState } from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { Input } from '@/components/ui/input.jsx';
    import { Label } from '@/components/ui/label.jsx';
    import { Textarea } from '@/components/ui/textarea.jsx';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
    import { DatePicker } from '@/components/ui/date-picker.jsx';
    import { ShoppingCart, DollarSign, Users, CalendarDays, FileText, PlusCircle, Trash2 } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast.jsx';
    import useLocalStorage from '@/hooks/useLocalStorage.jsx';
    import { motion } from 'framer-motion';
    import { useNavigate } from 'react-router-dom';

    const PurchaseRequestFormPage = () => {
        const { toast } = useToast();
        const navigate = useNavigate();
        const [projects] = useLocalStorage('projects', []); 
        const [purchaseRequests, setPurchaseRequests] = useLocalStorage('cmsPurchaseRequests', []);

        const [requestDate, setRequestDate] = useState(new Date());
        const [requestedBy, setRequestedBy] = useState('');
        const [department, setDepartment] = useState('');
        const [projectId, setProjectId] = useState('');
        const [items, setItems] = useState([{ itemName: '', quantity: '', unit: '', estimatedCost: '', supplier: '' }]);
        const [justification, setJustification] = useState('');
        const [status, setStatus] = useState('Pending');

        const handleItemChange = (index, field, value) => {
            const newItems = [...items];
            newItems[index][field] = value;
            setItems(newItems);
        };

        const addItem = () => setItems([...items, { itemName: '', quantity: '', unit: '', estimatedCost: '', supplier: '' }]);
        const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

        const handleSubmit = (e) => {
            e.preventDefault();
            if (!requestedBy || !department || items.some(item => !item.itemName || !item.quantity)) {
                toast({ variant: "destructive", title: "Missing Fields", description: "Requester, department, and item details are required." });
                return;
            }
            const newRequest = {
                id: `PR-${Date.now()}`,
                requestDate: requestDate.toISOString(),
                requestedBy, department, projectId, items, justification, status,
            };
            setPurchaseRequests([...purchaseRequests, newRequest]);
            toast({ title: "Purchase Request Submitted", description: `Request ID: ${newRequest.id}` });
            navigate('/forms-documents'); // Or a list page for PRs
        };

        return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto">
                <Card className="shadow-xl border-t-4 border-green-600">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-green-700 flex items-center"><ShoppingCart className="mr-3 h-7 w-7"/>Purchase Request Form</CardTitle>
                        <CardDescription>Submit a request for purchasing materials, equipment, or services.</CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><Label htmlFor="requestDate">Request Date</Label><DatePicker id="requestDate" date={requestDate} setDate={setRequestDate} className="w-full"/></div>
                                <div><Label htmlFor="requestedBy">Requested By</Label><Input id="requestedBy" value={requestedBy} onChange={e=>setRequestedBy(e.target.value)} placeholder="Your Name"/></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><Label htmlFor="department">Department</Label><Input id="department" value={department} onChange={e=>setDepartment(e.target.value)} placeholder="e.g., Civil Works, Telecom, MEP"/></div>
                                <div>
                                    <Label htmlFor="projectId-pr">Project (Optional)</Label>
                                    <Select value={projectId} onValueChange={setProjectId}>
                                        <SelectTrigger id="projectId-pr"><SelectValue placeholder="Select Project"/></SelectTrigger>
                                        <SelectContent>{projects.map(p=><SelectItem key={p.id} value={p.id}>{p.projectName} ({p.projectCode || p.id})</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                            </div>
                            
                            <Card className="p-4 bg-slate-50">
                                <CardHeader className="p-0 pb-2"><CardTitle className="text-md flex items-center"><FileText className="mr-2 h-5 w-5 text-green-600"/>Items Requested</CardTitle></CardHeader>
                                <CardContent className="p-0 space-y-3">
                                    {items.map((item, index) => (
                                        <div key={index} className="p-3 border rounded bg-white space-y-2">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                                <div><Label htmlFor={`itemName-${index}`} className="text-xs">Item Name/Description</Label><Input id={`itemName-${index}`} value={item.itemName} onChange={e=>handleItemChange(index, 'itemName', e.target.value)} placeholder="e.g., Fiber Optic Cable"/></div>
                                                <div><Label htmlFor={`quantity-${index}`} className="text-xs">Quantity</Label><Input id={`quantity-${index}`} type="number" value={item.quantity} onChange={e=>handleItemChange(index, 'quantity', e.target.value)} placeholder="e.g., 1000"/></div>
                                                <div><Label htmlFor={`unit-${index}`} className="text-xs">Unit</Label><Input id={`unit-${index}`} value={item.unit} onChange={e=>handleItemChange(index, 'unit', e.target.value)} placeholder="e.g., meters, units, kg"/></div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                <div><Label htmlFor={`cost-${index}`} className="text-xs">Estimated Cost (per unit)</Label><Input id={`cost-${index}`} type="number" value={item.estimatedCost} onChange={e=>handleItemChange(index, 'estimatedCost', e.target.value)} placeholder="e.g., 5.50"/></div>
                                                <div><Label htmlFor={`supplier-${index}`} className="text-xs">Suggested Supplier (Optional)</Label><Input id={`supplier-${index}`} value={item.supplier} onChange={e=>handleItemChange(index, 'supplier', e.target.value)} placeholder="Supplier Name"/></div>
                                            </div>
                                            {items.length > 1 && <Button type="button" variant="destructive" size="sm" onClick={()=>removeItem(index)} className="mt-1"><Trash2 className="h-3 w-3 mr-1"/>Remove Item</Button>}
                                        </div>
                                    ))}
                                    <Button type="button" variant="outline" size="sm" onClick={addItem}><PlusCircle className="mr-2 h-4 w-4"/>Add Another Item</Button>
                                </CardContent>
                            </Card>

                            <div><Label htmlFor="justification">Justification / Purpose</Label><Textarea id="justification" value={justification} onChange={e=>setJustification(e.target.value)} placeholder="Reason for this purchase request..." rows={3}/></div>
                        </CardContent>
                        <CardFooter className="flex justify-end space-x-2 border-t pt-6">
                            <Button type="button" variant="outline" onClick={()=>navigate('/forms-documents')}>Cancel</Button>
                            <Button type="submit" className="bg-green-600 hover:bg-green-700">Submit Request</Button>
                        </CardFooter>
                    </form>
                </Card>
            </motion.div>
        );
    };
    export default PurchaseRequestFormPage;