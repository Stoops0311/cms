import React from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
    import { Briefcase, CheckSquare, DollarSign, AlertTriangle } from 'lucide-react';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button.jsx';
    import { Link } from 'react-router-dom';

    const ContractorDashboard = () => {
      // Mock data - replace with actual data for the logged-in contractor
      const assignedProjects = [
        { id: "proj1", name: "Downtown Tower - Phase 2", status: "In Progress", nextMilestone: "Facade Installation" },
        { id: "proj2", name: "West Bridge Repair", status: "Pending Approval", nextMilestone: "Material Procurement" },
      ];
      const pendingApprovals = [
        { id: "app1", type: "Variation Order", project: "Downtown Tower - Phase 2", submitted: "2025-05-15" },
        { id: "app2", type: "Work Completion Certificate", project: "Old Warehouse Demolition", submitted: "2025-05-12" },
      ];
      const paymentStatus = [
        { id: "pay1", invoice: "INV-00123", project: "Downtown Tower - Phase 2", amount: "50,000 SAR", status: "Paid" },
        { id: "pay2", invoice: "INV-00125", project: "West Bridge Repair", amount: "25,000 SAR", status: "Pending" },
      ];

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
                <Briefcase className="mr-2 h-6 w-6"/>Contractor Dashboard
              </CardTitle>
              <CardDescription>
                Overview of your assigned projects, pending approvals, and payment status.
              </CardDescription>
            </CardHeader>
             <CardContent>
                <div className="mt-2 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded-md flex items-start">
                  <AlertTriangle className="h-5 w-5 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Personalized View (Mock Data):</p>
                    <p className="text-sm">This dashboard will be personalized for each logged-in contractor. The data shown is for demonstration purposes.</p>
                  </div>
                </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Assigned Projects */}
            <Card className="lg:col-span-1">
              <CardHeader><CardTitle className="flex items-center"><Briefcase className="mr-2 h-5 w-5 text-blue-600"/>Assigned Projects</CardTitle></CardHeader>
              <CardContent>
                {assignedProjects.length > 0 ? (
                  assignedProjects.map(proj => (
                    <div key={proj.id} className="mb-3 pb-3 border-b last:border-b-0">
                      <h4 className="font-semibold">{proj.name}</h4>
                      <p className="text-xs text-muted-foreground">Status: {proj.status}</p>
                      <p className="text-xs text-muted-foreground">Next: {proj.nextMilestone}</p>
                      <Button variant="link" size="sm" className="p-0 h-auto text-xs mt-1"><Link to={`/projects/${proj.id}`}>View Details</Link></Button>
                    </div>
                  ))
                ) : <p className="text-sm text-muted-foreground">No projects currently assigned.</p>}
              </CardContent>
            </Card>

            {/* Pending Approvals */}
            <Card className="lg:col-span-1">
              <CardHeader><CardTitle className="flex items-center"><CheckSquare className="mr-2 h-5 w-5 text-orange-500"/>Pending Approvals</CardTitle></CardHeader>
              <CardContent>
                 {pendingApprovals.length > 0 ? (
                  pendingApprovals.map(app => (
                    <div key={app.id} className="mb-2 pb-2 border-b last:border-b-0">
                      <h4 className="font-semibold text-sm">{app.type}</h4>
                      <p className="text-xs text-muted-foreground">Project: {app.project}</p>
                      <p className="text-xs text-muted-foreground">Submitted: {app.submitted}</p>
                    </div>
                  ))
                ) : <p className="text-sm text-muted-foreground">No pending approvals.</p>}
              </CardContent>
            </Card>

            {/* Payment Status */}
            <Card className="lg:col-span-1">
              <CardHeader><CardTitle className="flex items-center"><DollarSign className="mr-2 h-5 w-5 text-green-500"/>Payment Status</CardTitle></CardHeader>
              <CardContent>
                {paymentStatus.length > 0 ? (
                  paymentStatus.map(pay => (
                    <div key={pay.id} className="mb-2 pb-2 border-b last:border-b-0">
                      <h4 className="font-semibold text-sm">Invoice: {pay.invoice}</h4>
                      <p className="text-xs text-muted-foreground">Project: {pay.project} | Amount: {pay.amount}</p>
                      <p className={`text-xs font-medium ${pay.status === 'Paid' ? 'text-green-600' : 'text-yellow-600'}`}>Status: {pay.status}</p>
                    </div>
                  ))
                ) : <p className="text-sm text-muted-foreground">No payment information available.</p>}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      );
    };

    export default ContractorDashboard;