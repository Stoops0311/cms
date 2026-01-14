import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { DatePicker } from '@/components/ui/date-picker.jsx';
import { FileSpreadsheet, Loader2, Download, TrendingUp, TrendingDown } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast.jsx';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

const PnLSheetPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const projects = useQuery(api.projects.listProjects, {});
  const financeRecords = useQuery(api.finance.listFinanceRecords, {});

  const [projectId, setProjectId] = useState('all');
  const [startDate, setStartDate] = useState(startOfMonth(subMonths(new Date(), 1)));
  const [endDate, setEndDate] = useState(endOfMonth(new Date()));

  // Calculate P&L from finance records
  const pnlData = useMemo(() => {
    if (!financeRecords) return null;

    let filtered = financeRecords;

    // Filter by project if selected
    if (projectId !== 'all') {
      filtered = filtered.filter(r => r.projectId === projectId);
    }

    // Filter by date range
    filtered = filtered.filter(r => {
      const recordDate = new Date(r.date);
      return recordDate >= startDate && recordDate <= endDate;
    });

    // Categorize income and expenses
    const income = {
      projectRevenue: 0,
      otherIncome: 0,
    };

    const expenses = {
      labor: 0,
      materials: 0,
      equipment: 0,
      subcontractors: 0,
      overhead: 0,
      other: 0,
    };

    filtered.forEach(record => {
      if (record.type === 'Income') {
        if (record.category === 'Project Revenue') {
          income.projectRevenue += record.amount;
        } else {
          income.otherIncome += record.amount;
        }
      } else if (record.type === 'Expense') {
        const cat = (record.category || 'other').toLowerCase();
        if (cat.includes('labor') || cat.includes('salary') || cat.includes('wage')) {
          expenses.labor += record.amount;
        } else if (cat.includes('material')) {
          expenses.materials += record.amount;
        } else if (cat.includes('equipment') || cat.includes('rental')) {
          expenses.equipment += record.amount;
        } else if (cat.includes('subcontract') || cat.includes('contractor')) {
          expenses.subcontractors += record.amount;
        } else if (cat.includes('overhead') || cat.includes('admin') || cat.includes('office')) {
          expenses.overhead += record.amount;
        } else {
          expenses.other += record.amount;
        }
      }
    });

    const totalIncome = income.projectRevenue + income.otherIncome;
    const totalExpenses = Object.values(expenses).reduce((a, b) => a + b, 0);
    const netProfit = totalIncome - totalExpenses;
    const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

    return {
      income,
      expenses,
      totalIncome,
      totalExpenses,
      netProfit,
      profitMargin,
      recordCount: filtered.length,
    };
  }, [financeRecords, projectId, startDate, endDate]);

  const handleExport = () => {
    if (!pnlData) {
      toast({ variant: "destructive", title: "No Data", description: "No data available to export." });
      return;
    }

    const projectName = projectId === 'all' ? 'All Projects' : (projects?.find(p => p._id === projectId)?.projectName || 'Unknown');
    const period = `${format(startDate, 'MMM d yyyy')} - ${format(endDate, 'MMM d yyyy')}`;

    // Build CSV content
    const csvRows = [
      ['Profit & Loss Statement'],
      ['Project', projectName],
      ['Period', period],
      [''],
      ['INCOME'],
      ['Project Revenue', pnlData.income.projectRevenue],
      ['Other Income', pnlData.income.otherIncome],
      ['Total Income', pnlData.totalIncome],
      [''],
      ['EXPENSES'],
      ['Labor & Wages', pnlData.expenses.labor],
      ['Materials', pnlData.expenses.materials],
      ['Equipment', pnlData.expenses.equipment],
      ['Subcontractors', pnlData.expenses.subcontractors],
      ['Overhead', pnlData.expenses.overhead],
      ['Other Expenses', pnlData.expenses.other],
      ['Total Expenses', pnlData.totalExpenses],
      [''],
      ['NET PROFIT/LOSS', pnlData.netProfit],
      ['Profit Margin (%)', pnlData.profitMargin.toFixed(2)],
    ];

    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `PnL_${projectName.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({ title: "Export Complete", description: "P&L report has been downloaded as CSV." });
  };

  if (!projects || !financeRecords) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto">
      <Card className="shadow-xl border-t-4 border-emerald-600">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold text-emerald-700 flex items-center">
                <FileSpreadsheet className="mr-3 h-7 w-7"/>Profit & Loss Statement
              </CardTitle>
              <CardDescription>Auto-generated P&L report based on financial records.</CardDescription>
            </div>
            <Button onClick={handleExport} variant="outline" className="gap-2">
              <Download className="h-4 w-4" /> Export
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg">
            <div>
              <Label>Project</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="All Projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects?.map(project => (
                    <SelectItem key={project._id} value={project._id}>{project.projectName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Start Date</Label>
              <DatePicker date={startDate} setDate={setStartDate} className="w-full" />
            </div>
            <div>
              <Label>End Date</Label>
              <DatePicker date={endDate} setDate={setEndDate} className="w-full" />
            </div>
          </div>

          {/* Period Summary */}
          <div className="text-center p-3 bg-emerald-50 rounded-lg">
            <p className="text-sm text-emerald-700">
              Report Period: {format(startDate, 'MMM d, yyyy')} - {format(endDate, 'MMM d, yyyy')}
              <span className="mx-2">|</span>
              {pnlData?.recordCount || 0} transactions
            </p>
          </div>

          {pnlData && (
            <>
              {/* Income Section */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-emerald-700 border-b pb-2">Revenue / Income</h3>
                <div className="grid grid-cols-2 gap-2 pl-4">
                  <span className="text-slate-600">Project Revenue</span>
                  <span className="text-right font-medium">{formatCurrency(pnlData.income.projectRevenue)}</span>
                  <span className="text-slate-600">Other Income</span>
                  <span className="text-right font-medium">{formatCurrency(pnlData.income.otherIncome)}</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-700 border-t pt-2 pl-4">
                  <span>Total Income</span>
                  <span>{formatCurrency(pnlData.totalIncome)}</span>
                </div>
              </div>

              {/* Expenses Section */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-red-700 border-b pb-2">Expenses</h3>
                <div className="grid grid-cols-2 gap-2 pl-4">
                  <span className="text-slate-600">Labor & Wages</span>
                  <span className="text-right font-medium">{formatCurrency(pnlData.expenses.labor)}</span>
                  <span className="text-slate-600">Materials</span>
                  <span className="text-right font-medium">{formatCurrency(pnlData.expenses.materials)}</span>
                  <span className="text-slate-600">Equipment</span>
                  <span className="text-right font-medium">{formatCurrency(pnlData.expenses.equipment)}</span>
                  <span className="text-slate-600">Subcontractors</span>
                  <span className="text-right font-medium">{formatCurrency(pnlData.expenses.subcontractors)}</span>
                  <span className="text-slate-600">Overhead</span>
                  <span className="text-right font-medium">{formatCurrency(pnlData.expenses.overhead)}</span>
                  <span className="text-slate-600">Other Expenses</span>
                  <span className="text-right font-medium">{formatCurrency(pnlData.expenses.other)}</span>
                </div>
                <div className="flex justify-between font-bold text-red-700 border-t pt-2 pl-4">
                  <span>Total Expenses</span>
                  <span>{formatCurrency(pnlData.totalExpenses)}</span>
                </div>
              </div>

              {/* Net Profit */}
              <div className={`p-4 rounded-lg ${pnlData.netProfit >= 0 ? 'bg-emerald-100' : 'bg-red-100'}`}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {pnlData.netProfit >= 0 ? (
                      <TrendingUp className="h-6 w-6 text-emerald-600" />
                    ) : (
                      <TrendingDown className="h-6 w-6 text-red-600" />
                    )}
                    <span className="text-xl font-bold">Net {pnlData.netProfit >= 0 ? 'Profit' : 'Loss'}</span>
                  </div>
                  <span className={`text-2xl font-bold ${pnlData.netProfit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                    {formatCurrency(Math.abs(pnlData.netProfit))}
                  </span>
                </div>
                <div className="text-right text-sm mt-1">
                  Profit Margin: <span className="font-medium">{pnlData.profitMargin.toFixed(1)}%</span>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                <div className="p-4 bg-slate-50 rounded-lg text-center">
                  <p className="text-sm text-slate-600">Gross Revenue</p>
                  <p className="text-xl font-bold text-slate-800">{formatCurrency(pnlData.totalIncome)}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg text-center">
                  <p className="text-sm text-slate-600">Total Cost</p>
                  <p className="text-xl font-bold text-slate-800">{formatCurrency(pnlData.totalExpenses)}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg text-center">
                  <p className="text-sm text-slate-600">Profit Margin</p>
                  <p className={`text-xl font-bold ${pnlData.profitMargin >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {pnlData.profitMargin.toFixed(1)}%
                  </p>
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => navigate('/forms-documents')}>
              Back to Forms Hub
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PnLSheetPage;
