import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { DollarSign, TrendingUp, FileText, PieChart, BarChart2, Loader2, Download, Clock, CheckCircle, XCircle, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button.jsx';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useToast } from '@/components/ui/use-toast.jsx';
import { format } from 'date-fns';

const FinanceDashboard = () => {
  const { toast } = useToast();

  // Convex queries
  const financialDashboard = useQuery(api.finance.getFinancialDashboard, {});
  const pendingApprovals = useQuery(api.finance.getPendingApprovals, {});
  const monthlyTrend = useQuery(api.finance.getMonthlyTrend, { months: 6 });
  const budgetRevisions = useQuery(api.budgetRevisions.listBudgetRevisions, {});
  const vendorPayments = useQuery(api.vendorPayments.listVendorPayments, {});
  const users = useQuery(api.admin.listUsers, { isActive: true });

  // Mutations
  const approveBudgetRevision = useMutation(api.budgetRevisions.approveBudgetRevision);
  const rejectBudgetRevision = useMutation(api.budgetRevisions.rejectBudgetRevision);
  const approveVendorPayment = useMutation(api.vendorPayments.approveVendorPayment);

  const adminUser = users?.find(u => u.role === 'admin') || users?.[0];

  const handleApproveBudgetRevision = async (id) => {
    if (!adminUser) return;
    try {
      await approveBudgetRevision({ id, approvedBy: adminUser._id });
      toast({ title: "Budget Revision Approved", description: "Project budget updated." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to approve." });
    }
  };

  const handleRejectBudgetRevision = async (id) => {
    if (!adminUser) return;
    const notes = window.prompt("Enter rejection reason:");
    if (notes) {
      try {
        await rejectBudgetRevision({ id, approvedBy: adminUser._id, approvalNotes: notes });
        toast({ title: "Budget Revision Rejected", description: "Request has been rejected." });
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: error.message || "Failed to reject." });
      }
    }
  };

  const handleApproveVendorPayment = async (id) => {
    if (!adminUser) return;
    try {
      await approveVendorPayment({ id, approvedBy: adminUser._id });
      toast({ title: "Payment Approved", description: "Vendor payment has been approved." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to approve." });
    }
  };

  // Calculate totals
  const totals = useMemo(() => {
    if (!financialDashboard) return { totalBudget: 0, totalSpent: 0, pendingExpenses: 0 };
    return {
      totalBudget: financialDashboard.projectBudgets.reduce((sum, p) => sum + (p.budget || 0), 0),
      totalSpent: financialDashboard.projectBudgets.reduce((sum, p) => sum + (p.spent || 0), 0),
      pendingExpenses: financialDashboard.expensesByCategory.reduce((sum, e) => sum + (e.pending || 0), 0),
    };
  }, [financialDashboard]);

  const handleGenerateReport = () => {
    if (!financialDashboard) {
      toast({ variant: "destructive", title: "No Data", description: "No financial data to generate report." });
      return;
    }

    const headers = ['Project', 'Budget', 'Spent', 'Remaining', 'Usage %'];
    const rows = financialDashboard.projectBudgets.map(project => [
      project.projectName,
      project.budget || 0,
      project.spent || 0,
      (project.budget || 0) - (project.spent || 0),
      project.budget ? Math.round((project.spent / project.budget) * 100) : 0,
    ].join(','));

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finance-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({ title: "Report Generated", description: "P&L Report downloaded successfully." });
  };

  const isLoading = financialDashboard === undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 md:p-6 lg:p-8"
    >
      <Card className="shadow-xl border-t-4 border-green-500 mb-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold tracking-tight text-green-600 flex items-center">
            <DollarSign className="mr-2 h-6 w-6" />Finance Dashboard
          </CardTitle>
          <CardDescription>
            Cash flow analysis, P&L summaries, budget status by project, and expense tracking.
          </CardDescription>
        </CardHeader>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-green-500" />
          <span className="ml-2 text-muted-foreground">Loading financial data...</span>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card className="border-l-4 border-blue-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center text-muted-foreground">
                  <TrendingUp className="mr-1 h-4 w-4" />Total Budget
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold text-blue-600">{totals.totalBudget.toLocaleString()} SAR</p>
                <p className="text-xs text-muted-foreground">{financialDashboard?.projectBudgets?.length || 0} projects</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-green-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center text-muted-foreground">
                  <PieChart className="mr-1 h-4 w-4" />Total Spent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold text-green-600">{totals.totalSpent.toLocaleString()} SAR</p>
                <p className="text-xs text-muted-foreground">
                  {totals.totalBudget > 0 ? Math.round((totals.totalSpent / totals.totalBudget) * 100) : 0}% of budget
                </p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-orange-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center text-muted-foreground">
                  <Clock className="mr-1 h-4 w-4" />Pending Expenses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold text-orange-600">{totals.pendingExpenses.toLocaleString()} SAR</p>
                <p className="text-xs text-muted-foreground">Awaiting approval</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-purple-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center text-muted-foreground">
                  <FileText className="mr-1 h-4 w-4" />Pending Approvals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold text-purple-600">{pendingApprovals?.purchaseRequests?.length || 0}</p>
                <p className="text-xs text-muted-foreground">
                  {pendingApprovals?.expenseClaims?.length || 0} expense claims
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Budget by Project */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart2 className="mr-2 h-5 w-5" />Budget by Project
                </CardTitle>
              </CardHeader>
              <CardContent>
                {financialDashboard?.projectBudgets && financialDashboard.projectBudgets.length > 0 ? (
                  <div className="space-y-3">
                    {financialDashboard.projectBudgets.map(project => {
                      const usagePercent = project.budget ? Math.round((project.spent / project.budget) * 100) : 0;
                      const isOverBudget = usagePercent > 100;
                      const isNearLimit = usagePercent >= 80 && usagePercent <= 100;

                      return (
                        <div key={project.projectId} className="space-y-1">
                          <div className="flex justify-between items-center text-sm">
                            <span className="font-medium">{project.projectName}</span>
                            <span className={`${
                              isOverBudget ? 'text-red-600' :
                              isNearLimit ? 'text-yellow-600' :
                              'text-green-600'
                            }`}>
                              {usagePercent}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                isOverBudget ? 'bg-red-500' :
                                isNearLimit ? 'bg-yellow-500' :
                                'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(usagePercent, 100)}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Spent: {project.spent?.toLocaleString()} SAR</span>
                            <span>Budget: {project.budget?.toLocaleString()} SAR</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No project budgets found.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="mr-2 h-5 w-5" />Expenses by Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                {financialDashboard?.expensesByCategory && financialDashboard.expensesByCategory.length > 0 ? (
                  <div className="space-y-2">
                    {financialDashboard.expensesByCategory.map((category, index) => (
                      <div key={category.category || index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm font-medium">{category.category || 'Uncategorized'}</span>
                        <div className="text-right">
                          <p className="text-sm font-bold">{(category.total || 0).toLocaleString()} SAR</p>
                          <p className="text-xs text-muted-foreground">
                            {category.approved || 0} approved, {category.pending || 0} pending
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No expense data found.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Monthly Trend */}
          {monthlyTrend && monthlyTrend.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />Monthly Expense Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between h-32 gap-2">
                  {monthlyTrend.map((month, index) => {
                    const maxAmount = Math.max(...monthlyTrend.map(m => m.total || 0));
                    const heightPercent = maxAmount > 0 ? ((month.total || 0) / maxAmount) * 100 : 0;

                    return (
                      <div key={index} className="flex flex-col items-center flex-1">
                        <div
                          className="w-full bg-green-500 rounded-t"
                          style={{ height: `${Math.max(heightPercent, 5)}%` }}
                        />
                        <p className="text-xs mt-1">{month.month}</p>
                        <p className="text-xs text-muted-foreground">{(month.total || 0).toLocaleString()}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Budget Revisions & Vendor Payments */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />Budget Revision Requests
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-80 overflow-y-auto">
                {budgetRevisions?.filter(r => r.status === 'Pending').length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-4">No pending budget revisions.</p>
                ) : (
                  <div className="space-y-3">
                    {budgetRevisions?.filter(r => r.status === 'Pending').slice(0, 5).map(revision => (
                      <div key={revision._id} className="p-3 rounded-lg border bg-white shadow-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{revision.projectName}</p>
                            <p className="text-sm text-muted-foreground">
                              ${revision.currentBudget?.toLocaleString()} → ${revision.proposedBudget?.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{revision.reason}</p>
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => handleApproveBudgetRevision(revision._id)}>
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleRejectBudgetRevision(revision._id)}>
                              <XCircle className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="mr-2 h-5 w-5" />Vendor Payments
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-80 overflow-y-auto">
                {vendorPayments?.filter(p => p.status === 'Pending').length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-4">No pending vendor payments.</p>
                ) : (
                  <div className="space-y-3">
                    {vendorPayments?.filter(p => p.status === 'Pending').slice(0, 5).map(payment => (
                      <div key={payment._id} className="p-3 rounded-lg border bg-white shadow-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{payment.vendorName}</p>
                            <p className="text-sm text-green-600 font-bold">${payment.paymentAmount?.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">{payment.certificateNumber}</p>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">{payment.paymentFor}</p>
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => handleApproveVendorPayment(payment._id)}>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={handleGenerateReport}>
                <Download className="mr-2 h-4 w-4" />Generate P&L Report
              </Button>
              <Button variant="outline" onClick={() => toast({ title: "Coming Soon", description: "Detailed cash flow analysis will be available in a future update." })}>
                View Cash Flow Details
              </Button>
              <Button variant="outline" onClick={() => navigate('/forms/invoice-submission')}>
                Manage Invoices
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </motion.div>
  );
};

export default FinanceDashboard;
