import React, { useState } from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { Input } from '@/components/ui/input.jsx';
    import { Label } from '@/components/ui/label.jsx';
    import { Textarea } from '@/components/ui/textarea.jsx';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
    import { DatePicker } from '@/components/ui/date-picker.jsx';
    import { DollarSign, CalendarDays, User, List, FilePlus, PlusCircle, Trash2, UploadCloud, Paperclip } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast.jsx';
    import useLocalStorage from '@/hooks/useLocalStorage.jsx';
    import { motion } from 'framer-motion';
    import { useNavigate } from 'react-router-dom';

    const expenseTypes = ["Travel", "Meals", "Accommodation", "Office Supplies", "Training", "Client Entertainment", "Software/Subscription", "Other"];

    const ExpenseClaimFormPage = () => {
        const { toast } = useToast();
        const navigate = useNavigate();
        const [projects] = useLocalStorage('projects', []);
        const [expenseClaims, setExpenseClaims] = useLocalStorage('cmsExpenseClaims', []);

        const [claimDate, setClaimDate] = useState(new Date());
        const [claimantName, setClaimantName] = useState('');
        const [employeeId, setEmployeeId] = useState('');
        const [department, setDepartment] = useState('');
        const [expenses, setExpenses] = useState([{ date: null, type: '', description: '', amount: '', projectId: '' }]);
        const [totalAmount, setTotalAmount] = useState(0);
        const [purpose, setPurpose] = useState('');
        const [attachments, setAttachments] = useState([]);

        const handleExpenseChange = (index, field, value) => {
            const newExpenses = [...expenses];
            newExpenses[index][field] = value;
            setExpenses(newExpenses);
            recalculateTotal(newExpenses);
        };

        const recalculateTotal = (currentExpenses) => {
            const total = currentExpenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
            setTotalAmount(total);
        };

        const addExpenseItem = () => setExpenses([...expenses, { date: null, type: '', description: '', amount: '', projectId: '' }]);
        const removeExpenseItem = (index) => {
            const newExpenses = expenses.filter((_, i) => i !== index);
            setExpenses(newExpenses);
            recalculateTotal(newExpenses);
        };
        
        const handleFileChange = (event) => {
            if (event.target.files) {
              const newFiles = Array.from(event.target.files).map(file => ({ name: file.name, type: file.type, size: file.size, id: `FILE-${Date.now()}-${Math.random().toString(36).substr(2,5)}`}));
              setAttachments(prev => [...prev, ...newFiles].slice(0, 5)); 
              if (attachments.length + newFiles.length > 5) { toast({variant: "warning", title: "File Limit", description: "Max 5 attachments."}) }
            }
        };
        const removeAttachment = (id) => setAttachments(attachments.filter(file => file.id !== id));

        const handleSubmit = (e) => {
            e.preventDefault();
            if (!claimantName || !department || expenses.some(exp => !exp.date || !exp.type || !exp.description || !exp.amount)) {
                toast({ variant: "destructive", title: "Missing Fields", description: "Claimant, department, and complete expense item details are required." });
                return;
            }
            const newClaim = {
                id: `EXP-${Date.now()}`,
                claimDate: claimDate.toISOString(), claimantName, employeeId, department,
                expenses: expenses.map(ex => ({...ex, date: ex.date ? ex.date.toISOString() : null})), 
                totalAmount, purpose, status: 'Submitted',
                attachments: attachments.map(f => ({ name: f.name, type: f.type, size: f.size, id: f.id })),
            };
            setExpenseClaims([...expenseClaims, newClaim]);
            toast({ title: "Expense Claim Submitted", description: `Claim ID: ${newClaim.id}, Total: $${totalAmount.toFixed(2)}` });
            navigate('/forms-documents');
        };

        return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto">
                <Card className="shadow-xl border-t-4 border-purple-600">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-purple-700 flex items-center"><DollarSign className="mr-3 h-7 w-7"/>Expense Claim Form</CardTitle>
                        <CardDescription>Submit claims for reimbursement of business-related expenses.</CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><Label htmlFor="claimDate">Claim Submission Date</Label><DatePicker id="claimDate" date={claimDate} setDate={setClaimDate} className="w-full"/></div>
                                <div><Label htmlFor="claimantName">Claimant Name</Label><Input id="claimantName" value={claimantName} onChange={e=>setClaimantName(e.target.value)} placeholder="Your Full Name"/></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><Label htmlFor="employeeId">Employee ID (Optional)</Label><Input id="employeeId" value={employeeId} onChange={e=>setEmployeeId(e.target.value)} placeholder="Your Employee ID"/></div>
                                <div><Label htmlFor="department-exp">Department</Label><Input id="department-exp" value={department} onChange={e=>setDepartment(e.target.value)} placeholder="Your Department"/></div>
                            </div>
                             <div><Label htmlFor="purpose">Purpose of Expenses</Label><Textarea id="purpose" value={purpose} onChange={e=>setPurpose(e.target.value)} placeholder="e.g., Client meeting for Project Alpha, Site visit to Sector C" rows={2}/></div>

                            <Card className="p-4 bg-slate-50">
                                <CardHeader className="p-0 pb-2"><CardTitle className="text-md flex items-center text-purple-700"><List className="mr-2 h-5 w-5"/>Expense Items</CardTitle></CardHeader>
                                <CardContent className="p-0 space-y-3">
                                {expenses.map((exp, index) => (
                                    <div key={index} className="p-3 border rounded bg-white space-y-2">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            <div><Label className="text-xs">Date of Expense</Label><DatePicker date={exp.date} setDate={val => handleExpenseChange(index, 'date', val)} className="h-8 text-xs w-full"/></div>
                                            <div><Label className="text-xs">Expense Type</Label><Select value={exp.type} onValueChange={val => handleExpenseChange(index, 'type', val)}><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select Type"/></SelectTrigger><SelectContent>{expenseTypes.map(t=><SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                            <div className="md:col-span-2"><Label className="text-xs">Description</Label><Input value={exp.description} onChange={e=>handleExpenseChange(index, 'description', e.target.value)} placeholder="e.g., Lunch with client, Taxi fare" className="h-8 text-xs"/></div>
                                            <div><Label className="text-xs">Amount (USD)</Label><Input type="number" step="0.01" value={exp.amount} onChange={e=>handleExpenseChange(index, 'amount', e.target.value)} placeholder="e.g., 25.50" className="h-8 text-xs"/></div>
                                        </div>
                                        <div>
                                            <Label className="text-xs">Related Project (Optional)</Label>
                                            <Select value={exp.projectId} onValueChange={val => handleExpenseChange(index, 'projectId', val)}><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select Project"/></SelectTrigger><SelectContent>{projects.map(p=><SelectItem key={p.id} value={p.id}>{p.projectName}</SelectItem>)}</SelectContent></Select>
                                        </div>
                                        {expenses.length > 1 && <Button type="button" variant="destructive" size="sm" onClick={()=>removeExpenseItem(index)} className="mt-1"><Trash2 className="h-3 w-3 mr-1"/>Remove Item</Button>}
                                    </div>
                                ))}
                                <Button type="button" variant="outline" size="sm" onClick={addExpenseItem}><PlusCircle className="mr-2 h-4 w-4"/>Add Expense Item</Button>
                                </CardContent>
                            </Card>
                            
                            <div className="text-right font-semibold text-lg">Total Claim Amount: ${totalAmount.toFixed(2)}</div>

                             <div>
                                <Label htmlFor="attachments-exp" className="flex items-center"><UploadCloud className="mr-2 h-4 w-4" />Attach Receipts/Supporting Documents (Max 5)</Label>
                                <Input id="attachments-exp" type="file" multiple onChange={handleFileChange} accept="image/*,.pdf,.doc,.docx" />
                                {attachments.length > 0 && (
                                  <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                                    {attachments.map(file => (<li key={file.id} className="flex justify-between items-center"><span className="flex items-center"><Paperclip className="inline mr-1 h-3 w-3"/>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span><Button type="button" variant="ghost" size="xs" onClick={() => removeAttachment(file.id)}><Trash2 className="h-3 w-3 text-destructive"/></Button></li>))}
                                  </ul>
                                )}
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end space-x-2 border-t pt-6">
                            <Button type="button" variant="outline" onClick={()=>navigate('/forms-documents')}>Cancel</Button>
                            <Button type="submit" className="bg-purple-600 hover:bg-purple-700">Submit Claim</Button>
                        </CardFooter>
                    </form>
                </Card>
            </motion.div>
        );
    };
    export default ExpenseClaimFormPage;