import React from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
    import { FileText, BarChart2, PieChart, AlertTriangle } from 'lucide-react';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button.jsx';

    const ReportCard = ({ title, description, icon: Icon, onClick }) => (
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center space-x-3 pb-2">
          <Icon className="h-6 w-6 text-blue-500" />
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">{description}</p>
          <Button variant="outline" size="sm" onClick={onClick} className="w-full">
            Generate Report (Placeholder)
          </Button>
        </CardContent>
      </Card>
    );

    const Reports = () => {
      const reportTypes = [
        { title: "Project Progress Report", description: "Overall project status, milestone completion, and S-curves.", icon: BarChart2 },
        { title: "Resource Utilization Report", description: "Tracks manpower and equipment usage against planned allocation.", icon: PieChart },
        { title: "Cost Variance Report", description: "Compares actual costs with budgeted amounts, highlighting variances.", icon: FileText },
        { title: "Telecom Test Summary", description: "Aggregated results for fiber optic tests (OTDR, power levels, splice loss).", icon: FileText },
        { title: "Safety Incident Report", description: "Summary of safety observations, near misses, and incidents.", icon: AlertTriangle },
        { title: "Quality Assurance Summary", description: "Overview of QA checks, non-conformances, and corrective actions.", icon: FileText },
      ];

      const handleGenerateReport = (title) => {
        alert(`Generating ${title}. This feature is a placeholder.`);
      };

      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-4 md:p-6 lg:p-8"
        >
          <Card className="shadow-xl border-t-4 border-blue-500 mb-8">
            <CardHeader>
              <CardTitle className="text-2xl font-bold tracking-tight text-blue-600 flex items-center">
                <FileText className="mr-2 h-6 w-6" />Project Reports (Civil & Telecom)
              </CardTitle>
              <CardDescription>
                Generate various project reports like progress S-curves, resource utilization, cost variance, and specialized telecom reports.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mt-2 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded-md flex items-start">
                <AlertTriangle className="h-5 w-5 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Under Development:</p>
                  <p className="text-sm">This module is currently a placeholder. Full report generation capabilities will be implemented based on available data.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportTypes.map((report, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 + 0.1 }}
              >
                <ReportCard
                  title={report.title}
                  description={report.description}
                  icon={report.icon}
                  onClick={() => handleGenerateReport(report.title)}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      );
    };

    export default Reports;