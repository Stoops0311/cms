import React from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
    import { DollarSign, TrendingUp, FileText, AlertTriangle, PieChart, BarChart2 } from 'lucide-react';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button.jsx';

    const FinanceDashboard = () => {
      // Mock data - replace with actual financial data and AI-generated insights
      const cashFlowSummary = { currentMonth: "+150,000 SAR", nextMonthForecast: "+120,000 SAR (AI Predicted)" };
      const pnlSummary = { grossProfit: "850,000 SAR", netProfit: "350,000 SAR", margin: "15.5%" };
      const budgetStatus = [
        { site: "Downtown Tower", budgetUsed: "75%", status: "On Track" },
        { site: "West Bridge Project", budgetUsed: "95%", status: "Alert: Nearing Limit" },
        { site: "New Villa Complex", budgetUsed: "30%", status: "Under Budget" },
      ];
      const invoiceCount = { pending: 15, paid: 120, overdue: 3 };

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
                <DollarSign className="mr-2 h-6 w-6"/>Finance Dashboard
              </CardTitle>
              <CardDescription>
                AI-enhanced cash flow, P&L summaries, budget status by site, and invoice tracking.
              </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="mt-2 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded-md flex items-start">
                  <AlertTriangle className="h-5 w-5 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Illustrative Data & AI Placeholders:</p>
                    <p className="text-sm">Financial figures and AI predictions are for demonstration. Real data and AI models would be integrated in a full system.</p>
                  </div>
                </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center text-muted-foreground"><TrendingUp className="mr-1 h-4 w-4"/>AI Cash Flow</CardTitle></CardHeader>
              <CardContent>
                <p className="text-xl font-bold">{cashFlowSummary.currentMonth}</p>
                <p className="text-xs text-muted-foreground">Next Month: {cashFlowSummary.nextMonthForecast}</p>
              </CardContent>
            </Card>
             <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center text-muted-foreground"><PieChart className="mr-1 h-4 w-4"/>P&L Summary</CardTitle></CardHeader>
              <CardContent>
                <p className="text-xl font-bold">{pnlSummary.netProfit}</p>
                <p className="text-xs text-muted-foreground">Gross: {pnlSummary.grossProfit} | Margin: {pnlSummary.margin}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center text-muted-foreground"><BarChart2 className="mr-1 h-4 w-4"/>Budget Status</CardTitle></CardHeader>
              <CardContent>
                <p className="text-xl font-bold">{budgetStatus.filter(s => s.status.includes("Alert")).length} Site(s) Alert</p>
                <p className="text-xs text-muted-foreground">{budgetStatus.length} sites tracked</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center text-muted-foreground"><FileText className="mr-1 h-4 w-4"/>Invoice Tracker</CardTitle></CardHeader>
              <CardContent>
                <p className="text-xl font-bold">{invoiceCount.pending} Pending</p>
                <p className="text-xs text-muted-foreground">{invoiceCount.overdue} Overdue | {invoiceCount.paid} Paid</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <CardHeader><CardTitle>Budget by Site (Mock)</CardTitle></CardHeader>
                <CardContent>
                    {budgetStatus.map(site => (
                        <div key={site.site} className="flex justify-between items-center mb-1 text-sm">
                            <span>{site.site}</span>
                            <span className={`${site.status.includes("Alert") ? "text-red-500" : "text-green-500"} font-medium`}>{site.budgetUsed} ({site.status})</span>
                        </div>
                    ))}
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">Generate P&L Report (Placeholder)</Button>
                    <Button variant="outline" className="w-full justify-start">View Cash Flow Details (Placeholder)</Button>
                    <Button variant="outline" className="w-full justify-start">Manage Invoices (Placeholder)</Button>
                </CardContent>
            </Card>
          </div>
        </motion.div>
      );
    };

    export default FinanceDashboard;