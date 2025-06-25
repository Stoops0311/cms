import React, { useState, useMemo } from 'react';
    import { motion } from 'framer-motion';
    import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { Input } from '@/components/ui/input.jsx';
    import { Label } from '@/components/ui/label.jsx';
    import { DatePicker } from '@/components/ui/date-picker.jsx';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
    import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog.jsx';
    import { DollarSign, PlusCircle, Edit2, Trash2, TrendingUp, TrendingDown, FileSpreadsheet, Percent, AlertCircle } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast.jsx';
    import { format } from 'date-fns';
    import DetailItem from '@/components/projectDetail/DetailItem.jsx';

    const TransactionForm = ({ onSubmit, initialData = {}, onCancel, projectBudget }) => {
      const [description, setDescription] = useState(initialData.description || '');
      const [amount, setAmount] = useState(initialData.amount?.toString() || '');
      const [type, setType] = useState(initialData.type || 'Expense');
      const [category, setCategory] = useState(initialData.category || '');
      const [date, setDate] = useState(initialData.date ? new Date(initialData.date) : new Date());
      const { toast } = useToast();

      const transactionCategories = {
        Expense: ["Material Costs", "Labor Costs", "Equipment Rental", "Subcontractor Payments", "Permit Fees", "Overheads", "Other Expense"],
        Income: ["Client Payment", "Milestone Payment", "Variation Order Payment", "Other Income"],
        BudgetAdjustment: ["Initial Budget Allocation", "Change Order Approval", "Contingency Allocation"]
      };

      const handleSubmit = (e) => {
        e.preventDefault();
        if (!description || !amount || !category) {
          toast({ variant: "destructive", title: "Missing Fields", description: "Description, amount, and category are required." });
          return;
        }
        onSubmit({ 
          id: initialData.id || `TRN-${Date.now()}`, 
          description, 
          amount: parseFloat(amount), 
          type, 
          category,
          date: date.toISOString() 
        });
        if (!initialData.id) {
          setDescription(''); setAmount(''); setType('Expense'); setCategory(''); setDate(new Date());
        }
      };

      return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-slate-50 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label htmlFor="trn-desc">Description</Label><Input id="trn-desc" placeholder="e.g., Purchase of cement bags" value={description} onChange={(e) => setDescription(e.target.value)} /></div>
            <div><Label htmlFor="trn-amount">Amount (USD)</Label><Input id="trn-amount" type="number" placeholder="e.g., 500.00" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label htmlFor="trn-type">Type</Label>
              <Select value={type} onValueChange={(newType) => { setType(newType); setCategory('');}}>
                <SelectTrigger id="trn-type"><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                  {Object.keys(transactionCategories).map(key => <SelectItem key={key} value={key}>{key}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label htmlFor="trn-cat">Category</Label>
                <Select value={category} onValueChange={setCategory} disabled={!type}>
                    <SelectTrigger id="trn-cat"><SelectValue placeholder="Select Category" /></SelectTrigger>
                    <SelectContent>
                        {(transactionCategories[type] || []).map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
          </div>
          <div><Label htmlFor="trn-date">Transaction Date</Label><DatePicker id="trn-date" date={date} setDate={setDate} /></div>
          <DialogFooter className="flex justify-end space-x-2">
            {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
            <Button type="submit">{initialData.id ? 'Update Transaction' : 'Add Transaction'}</Button>
          </DialogFooter>
        </form>
      );
    };

    const ProjectFinancialsTab = ({ project, updateProjectData }) => {
      const [showForm, setShowForm] = useState(false);
      const [editingTransaction, setEditingTransaction] = useState(null);
      const [isModalOpen, setIsModalOpen] = useState(false);
      const { toast } = useToast();
      
      const transactions = project.financials?.transactions || [];
      const initialBudget = project.financials?.initialBudget || parseFloat(project.projectBudget) || 0;
      const approvedChangeOrders = project.financials?.approvedChangeOrders || 0;
      const revisedBudget = initialBudget + approvedChangeOrders;

      const committedCosts = transactions
        .filter(t => t.type === 'Expense' && t.category !== 'Overheads') 
        .reduce((sum, t) => sum + t.amount, 0);

      const actualCostsToDate = transactions
        .filter(t => t.type === 'Expense')
        .reduce((sum, t) => sum + t.amount, 0);
        
      const remainingBudget = revisedBudget - actualCostsToDate;
      const budgetVariance = revisedBudget - actualCostsToDate;
      const percentageSpent = revisedBudget > 0 ? (actualCostsToDate / revisedBudget * 100) : 0;

      const contractValue = project.financials?.contractValue || parseFloat(project.contractValue) || 0;
      const revenue = transactions.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0);
      const cogs = actualCostsToDate; 
      const operatingExpenses = transactions.filter(t => t.type === 'Expense' && t.category === 'Overheads').reduce((sum, t) => sum + t.amount, 0);
      const grossProfit = revenue - cogs;
      const netProfit = grossProfit - operatingExpenses;
      const grossProfitMargin = revenue > 0 ? (grossProfit / revenue * 100) : 0;
      const netProfitMargin = revenue > 0 ? (netProfit / revenue * 100) : 0;

      const handleAddTransaction = (transactionData) => {
        const newTransactions = [...transactions, transactionData];
        updateProjectData({ financials: { ...project.financials, transactions: newTransactions, initialBudget, approvedChangeOrders, contractValue } });
        toast({ title: "Transaction Added" });
        setShowForm(false);
      };

      const handleUpdateTransaction = (transactionData) => {
        const updatedTransactions = transactions.map(t => t.id === transactionData.id ? transactionData : t);
        updateProjectData({ financials: { ...project.financials, transactions: updatedTransactions, initialBudget, approvedChangeOrders, contractValue } });
        toast({ title: "Transaction Updated" });
        setEditingTransaction(null);
        setShowForm(false);
      };

      const handleDeleteTransaction = (transactionId) => {
        if (window.confirm("Are you sure you want to delete this transaction?")) {
          const updatedTransactions = transactions.filter(t => t.id !== transactionId);
          updateProjectData({ financials: { ...project.financials, transactions: updatedTransactions, initialBudget, approvedChangeOrders, contractValue } });
          toast({ title: "Transaction Deleted", variant: "destructive" });
        }
      };
      
      const handleUpdateCoreFinancials = (data) => {
        updateProjectData({ 
            financials: { 
                ...project.financials, 
                initialBudget: parseFloat(data.initialBudget) || 0,
                approvedChangeOrders: parseFloat(data.approvedChangeOrders) || 0,
                contractValue: parseFloat(data.contractValue) || 0,
                transactions: project.financials?.transactions || []
            },
            projectBudget: parseFloat(data.initialBudget) + (parseFloat(data.approvedChangeOrders) || 0) 
        });
        toast({ title: "Core Financials Updated" });
        setIsModalOpen(false);
      };

      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="space-y-6">
          <Card className="border-t-4 border-green-500 shadow-lg">
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle className="text-xl font-semibold text-gray-700">Core Financials</CardTitle>
                <CardDescription>Key budget and contract values for the project.</CardDescription>
              </div>
              <Button variant="outline" onClick={() => setIsModalOpen(true)}><Edit2 className="mr-2 h-4 w-4"/>Edit Core Financials</Button>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <DetailItem icon={DollarSign} label="Initial Budget" value={`$${initialBudget.toLocaleString()}`} />
                <DetailItem icon={PlusCircle} label="Approved Change Orders" value={`$${approvedChangeOrders.toLocaleString()}`} />
                <DetailItem icon={DollarSign} label="Revised Budget" value={`$${revisedBudget.toLocaleString()}`} />
                <DetailItem icon={FileSpreadsheet} label="Contract Value" value={`$${contractValue.toLocaleString()}`} />
            </CardContent>
          </Card>
          
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Core Financials</DialogTitle>
                    <DialogDescription>Update the primary budget and contract figures.</DialogDescription>
                </DialogHeader>
                <CoreFinancialsForm initialData={{initialBudget, approvedChangeOrders, contractValue}} onSubmit={handleUpdateCoreFinancials} onCancel={() => setIsModalOpen(false)}/>
            </DialogContent>
          </Dialog>


          <Card className="shadow-lg">
            <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle className="text-xl font-semibold text-gray-700">Budget Performance</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <DetailItem icon={DollarSign} label="Revised Budget" value={`$${revisedBudget.toLocaleString()}`} />
              <DetailItem icon={TrendingDown} label="Actual Costs to Date" value={`$${actualCostsToDate.toLocaleString()}`} statusColor="text-orange-600" />
              <DetailItem icon={DollarSign} label="Remaining Budget" value={`$${remainingBudget.toLocaleString()}`} statusColor={remainingBudget >=0 ? "text-green-600" : "text-red-600"} />
              <DetailItem icon={Percent} label="Percentage Spent" value={`${percentageSpent.toFixed(1)}%`} statusColor={percentageSpent > 100 ? "text-red-600" : "text-gray-700"}/>
              <DetailItem icon={DollarSign} label="Committed Costs" value={`$${committedCosts.toLocaleString()}`} />
              <DetailItem icon={AlertCircle} label="Budget Variance" value={`$${budgetVariance.toLocaleString()}`} statusColor={budgetVariance >=0 ? "text-green-600" : "text-red-600"}/>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-700">Profit & Loss Summary</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <DetailItem icon={TrendingUp} label="Total Revenue" value={`$${revenue.toLocaleString()}`} statusColor="text-green-600" />
              <DetailItem icon={TrendingDown} label="COGS / Direct Costs" value={`$${cogs.toLocaleString()}`} statusColor="text-orange-600" />
              <DetailItem icon={DollarSign} label="Gross Profit" value={`$${grossProfit.toLocaleString()}`} statusColor={grossProfit >=0 ? "text-green-600" : "text-red-600"}/>
              <DetailItem icon={Percent} label="Gross Profit Margin" value={`${grossProfitMargin.toFixed(1)}%`} statusColor={grossProfitMargin >=0 ? "text-green-600" : "text-red-600"}/>
              <DetailItem icon={TrendingDown} label="Operating Expenses" value={`$${operatingExpenses.toLocaleString()}`} statusColor="text-orange-500" />
              <DetailItem icon={DollarSign} label="Net Profit" value={`$${netProfit.toLocaleString()}`} statusColor={netProfit >=0 ? "text-green-600" : "text-red-600"}/>
              <DetailItem icon={Percent} label="Net Profit Margin" value={`${netProfitMargin.toFixed(1)}%`} statusColor={netProfitMargin >=0 ? "text-green-600" : "text-red-600"}/>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle className="text-xl font-semibold text-gray-700">Financial Transactions</CardTitle>
              <Button onClick={() => { setShowForm(!showForm); setEditingTransaction(null); }} variant={showForm ? "outline" : "default"}>
                <PlusCircle className="mr-2 h-4 w-4" /> {showForm ? "Cancel Transaction Form" : "Add New Transaction"}
              </Button>
            </CardHeader>
            <CardContent>
              {showForm && !editingTransaction && <TransactionForm onSubmit={handleAddTransaction} onCancel={() => setShowForm(false)} projectBudget={revisedBudget}/>}
              {editingTransaction && <TransactionForm onSubmit={handleUpdateTransaction} initialData={editingTransaction} onCancel={() => setEditingTransaction(null)} projectBudget={revisedBudget}/>}

              {transactions.length === 0 && !showForm && !editingTransaction ? (
                <p className="text-muted-foreground text-center py-8">No financial transactions recorded yet.</p>
              ) : transactions.length > 0 ? (
                <div className="overflow-x-auto mt-4">
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead>Date</TableHead><TableHead>Description</TableHead><TableHead>Category</TableHead>
                      <TableHead>Type</TableHead><TableHead>Amount (USD)</TableHead><TableHead className="text-right">Actions</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {transactions.sort((a,b) => new Date(b.date) - new Date(a.date)).map(trn => (
                        <TableRow key={trn.id}>
                          <TableCell>{format(new Date(trn.date), 'dd MMM yyyy')}</TableCell>
                          <TableCell className="font-medium max-w-xs truncate">{trn.description}</TableCell>
                          <TableCell className="text-xs">{trn.category}</TableCell>
                          <TableCell><span className={`px-2 py-0.5 text-xs rounded-full ${
                              trn.type === 'Expense' ? 'bg-red-100 text-red-700' :
                              trn.type === 'Income' ? 'bg-green-100 text-green-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>{trn.type}</span></TableCell>
                          <TableCell className={trn.type === 'Expense' ? 'text-red-600' : 'text-green-600'}>
                            {trn.type === 'Expense' ? '-' : '+'}${trn.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                          </TableCell>
                          <TableCell className="text-right space-x-1">
                            <Button variant="ghost" size="icon" onClick={() => { setEditingTransaction(trn); setShowForm(false); }} title="Edit"><Edit2 className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteTransaction(trn.id)} title="Delete"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ): null }
            </CardContent>
             <CardFooter className="pt-4 text-right">
                <Button variant="outline">
                    <FileSpreadsheet className="mr-2 h-4 w-4" /> Export All Transactions
                </Button>
            </CardFooter>
          </Card>
        </motion.div>
      );
    };
    
    const CoreFinancialsForm = ({ onSubmit, initialData, onCancel }) => {
        const [formState, setFormState] = useState({
            initialBudget: initialData.initialBudget?.toString() || '',
            approvedChangeOrders: initialData.approvedChangeOrders?.toString() || '',
            contractValue: initialData.contractValue?.toString() || '',
        });

        const handleChange = (e) => {
            const { name, value } = e.target;
            setFormState(prev => ({ ...prev, [name]: value }));
        };

        const handleSubmit = (e) => {
            e.preventDefault();
            onSubmit(formState);
        };

        return (
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div>
                    <Label htmlFor="core-initialBudget">Initial Budget (USD)</Label>
                    <Input id="core-initialBudget" name="initialBudget" type="number" value={formState.initialBudget} onChange={handleChange} placeholder="e.g., 1000000" />
                </div>
                <div>
                    <Label htmlFor="core-approvedChangeOrders">Approved Change Orders (USD)</Label>
                    <Input id="core-approvedChangeOrders" name="approvedChangeOrders" type="number" value={formState.approvedChangeOrders} onChange={handleChange} placeholder="e.g., 50000" />
                </div>
                <div>
                    <Label htmlFor="core-contractValue">Contract Value (USD)</Label>
                    <Input id="core-contractValue" name="contractValue" type="number" value={formState.contractValue} onChange={handleChange} placeholder="e.g., 1200000" />
                </div>
                <DialogFooter className="pt-4">
                    <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                    <Button type="submit">Save Core Financials</Button>
                </DialogFooter>
            </form>
        );
    };

    export default ProjectFinancialsTab;