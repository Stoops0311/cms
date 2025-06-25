import React, { useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { DatePicker } from '@/components/ui/date-picker.jsx';
import { ShoppingCart, DollarSign, Users, CalendarDays, FileText, PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const PurchaseRequestFormPage = () => {
    const { toast } = useToast();
    const navigate = useNavigate();
    const { user, userId } = useAuth();
    
    // Convex queries and mutations
    const projects = useQuery(api.projects.listProjects) || [];
    const createPurchaseRequest = useMutation(api.purchaseRequests.createPurchaseRequest);

    const [requestDate, setRequestDate] = useState(new Date());
    const [requestedBy, setRequestedBy] = useState(user?.fullName || '');
    const [department, setDepartment] = useState('');
    const [projectId, setProjectId] = useState('');
    const [items, setItems] = useState([{ itemName: '', quantity: '', unit: '', estimatedCost: '', supplier: '' }]);
    const [justification, setJustification] = useState('');
    const [status, setStatus] = useState('Pending');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const addItem = () => setItems([...items, { itemName: '', quantity: '', unit: '', estimatedCost: '', supplier: '' }]);
    const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

    const calculateTotalCost = () => {
        return items.reduce((total, item) => {
            const cost = parseFloat(item.estimatedCost || 0);
            const quantity = parseFloat(item.quantity || 0);
            return total + (cost * quantity);
        }, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!user) {
            toast({ variant: "destructive", title: "Authentication Required", description: "Please sign in to submit a request." });
            return;
        }

        if (!userId || !department || items.some(item => !item.itemName || !item.quantity)) {
            toast({ variant: "destructive", title: "Missing Fields", description: "Requester, department, and item details are required." });
            return;
        }

        setIsSubmitting(true);
        
        try {
            // Filter out items with missing required fields
            const validItems = items.filter(item => item.itemName && item.quantity);
            
            const requestData = {
                requestDate: requestDate.toISOString(),
                requestedBy: userId,
                department,
                projectId: projectId || null,
                items: validItems,
                justification
            };

            const newRequestId = await createPurchaseRequest(requestData);
            
            toast({ 
                title: "Purchase Request Submitted", 
                description: `Request submitted successfully with ID: ${newRequestId}` 
            });
            
            // Reset form
            setRequestedBy(user.fullName || '');
            setDepartment('');
            setProjectId('');
            setItems([{ itemName: '', quantity: '', unit: '', estimatedCost: '', supplier: '' }]);
            setJustification('');
            setRequestDate(new Date());
            
            navigate('/forms-documents');
            
        } catch (error) {
            console.error('Purchase request submission error:', error);
            toast({ 
                variant: "destructive", 
                title: "Submission Failed", 
                description: "Could not submit purchase request. Please try again." 
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto">
            <Card className="shadow-xl border-t-4 border-green-600">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-green-700 flex items-center">
                        <ShoppingCart className="mr-3 h-7 w-7"/>Purchase Request Form
                    </CardTitle>
                    <CardDescription>Submit a request for purchasing materials, equipment, or services.</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="requestDate">Request Date</Label>
                                <DatePicker id="requestDate" date={requestDate} setDate={setRequestDate} className="w-full"/>
                            </div>
                            <div>
                                <Label htmlFor="requestedBy">Requested By</Label>
                                <Input 
                                    id="requestedBy" 
                                    value={requestedBy} 
                                    onChange={e=>setRequestedBy(e.target.value)} 
                                    placeholder="Your Name"
                                    required
                                />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="department">Department</Label>
                                <Input 
                                    id="department" 
                                    value={department} 
                                    onChange={e=>setDepartment(e.target.value)} 
                                    placeholder="e.g., Civil Works, Telecom, MEP"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="projectId-pr">Project (Optional)</Label>
                                <Select value={projectId} onValueChange={setProjectId}>
                                    <SelectTrigger id="projectId-pr">
                                        <SelectValue placeholder="Select Project"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {projects.map(p => (
                                            <SelectItem key={p._id} value={p._id}>
                                                {p.projectName} ({p.projectIDString || p._id.slice(-6)})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        
                        <Card className="p-4 bg-slate-50">
                            <CardHeader className="p-0 pb-2">
                                <CardTitle className="text-md flex items-center">
                                    <FileText className="mr-2 h-5 w-5 text-green-600"/>Items Requested
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 space-y-3">
                                {items.map((item, index) => (
                                    <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-2 p-3 bg-white border rounded">
                                        <div className="md:col-span-2">
                                            <Label className="text-xs">Item Name*</Label>
                                            <Input 
                                                value={item.itemName} 
                                                onChange={e => handleItemChange(index, 'itemName', e.target.value)} 
                                                placeholder="Item description"
                                                size="sm"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Quantity*</Label>
                                            <Input 
                                                type="number" 
                                                value={item.quantity} 
                                                onChange={e => handleItemChange(index, 'quantity', e.target.value)} 
                                                placeholder="Qty"
                                                size="sm"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Unit</Label>
                                            <Input 
                                                value={item.unit} 
                                                onChange={e => handleItemChange(index, 'unit', e.target.value)} 
                                                placeholder="pcs/kg/m"
                                                size="sm"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Est. Cost (each)</Label>
                                            <Input 
                                                type="number" 
                                                step="0.01"
                                                value={item.estimatedCost} 
                                                onChange={e => handleItemChange(index, 'estimatedCost', e.target.value)} 
                                                placeholder="0.00"
                                                size="sm"
                                            />
                                        </div>
                                        <div className="flex items-end">
                                            {items.length > 1 && (
                                                <Button 
                                                    type="button" 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    onClick={() => removeItem(index)}
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                
                                <div className="flex justify-between items-center pt-2">
                                    <Button type="button" variant="outline" size="sm" onClick={addItem}>
                                        <PlusCircle className="mr-2 h-4 w-4" />Add Item
                                    </Button>
                                    
                                    {calculateTotalCost() > 0 && (
                                        <div className="flex items-center text-sm font-medium">
                                            <DollarSign className="h-4 w-4 mr-1 text-green-600" />
                                            Total Est: ${calculateTotalCost().toFixed(2)}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <div>
                            <Label htmlFor="justification">Justification</Label>
                            <Textarea 
                                id="justification" 
                                value={justification} 
                                onChange={e => setJustification(e.target.value)} 
                                placeholder="Explain why these items are needed and how they relate to the project..."
                                rows={3}
                            />
                        </div>

                        <div>
                            <Label htmlFor="status">Initial Status</Label>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger id="status">
                                    <SelectValue placeholder="Select Status"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Pending">Pending Review</SelectItem>
                                    <SelectItem value="Draft">Save as Draft</SelectItem>
                                    <SelectItem value="Urgent">Urgent Priority</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                    
                    <CardFooter className="flex justify-between">
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => navigate('/forms-documents')}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            className="bg-green-600 hover:bg-green-700"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Request'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </motion.div>
    );
};

export default PurchaseRequestFormPage;