import React, { useMemo } from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
    import { Briefcase, CheckSquare, DollarSign, AlertTriangle, Loader2, FileCheck, Award } from 'lucide-react';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button.jsx';
    import { Link } from 'react-router-dom';
    import { useQuery } from 'convex/react';
    import { api } from '../../convex/_generated/api';

    const ContractorDashboard = () => {
      // Convex queries for real data
      const vendorCompletions = useQuery(api.vendorCompletions.listVendorCompletions, {});
      const vendorPayments = useQuery(api.vendorPayments.listVendorPayments, {});
      const projects = useQuery(api.projects.listProjects, {});
      const contractors = useQuery(api.contractors.listContractors, {});

      // Get project IDs for milestone query
      const projectIds = useMemo(() => {
        return projects?.slice(0, 3).map(p => p._id) || [];
      }, [projects]);

      // Fetch next milestones for the displayed projects
      const milestonesData = useQuery(
        api.projects.getProjectsNextMilestones,
        projectIds.length > 0 ? { projectIds } : "skip"
      );

      const isLoading = vendorCompletions === undefined || vendorPayments === undefined;

      // Build assigned projects with real milestone data
      const assignedProjects = useMemo(() => {
        if (!projects) return [];

        const milestonesMap = new Map();
        if (milestonesData) {
          milestonesData.forEach(m => {
            milestonesMap.set(m.projectId, m.nextMilestone);
          });
        }

        return projects.slice(0, 3).map(p => ({
          id: p._id,
          name: p.projectName,
          status: p.status,
          nextMilestone: milestonesMap.get(p._id) || "No upcoming milestones"
        }));
      }, [projects, milestonesData]);

      // Real pending approvals from completion certificates
      const pendingApprovals = vendorCompletions?.filter(vc => vc.status === 'Pending Review').map(vc => ({
        id: vc._id,
        type: "Work Completion Certificate",
        project: vc.projectName,
        submitted: vc._creationTime ? new Date(vc._creationTime).toLocaleDateString() : 'N/A',
      })) || [];

      // Real payment status from vendor payments
      const paymentStatus = vendorPayments?.map(vp => ({
        id: vp._id,
        invoice: vp.certificateNumber,
        project: vp.projectName,
        amount: `${vp.netPayable?.toLocaleString()} SAR`,
        status: vp.status
      })) || [];

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
                <div className="mt-2 p-4 bg-blue-100 border-l-4 border-blue-500 text-blue-700 rounded-md flex items-start">
                  <AlertTriangle className="h-5 w-5 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Personalized View:</p>
                    <p className="text-sm">This dashboard shows vendor completion certificates and payment status from the database.</p>
                  </div>
                </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <span className="ml-2 text-muted-foreground">Loading contractor data...</span>
            </div>
          ) : (
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
          )}

          {/* Vendor Completion Certificates Section */}
          {!isLoading && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="mr-2 h-5 w-5 text-purple-600" />
                  Completion Certificates
                </CardTitle>
                <CardDescription>Work completion certificates submitted for review</CardDescription>
              </CardHeader>
              <CardContent>
                {vendorCompletions && vendorCompletions.length > 0 ? (
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {vendorCompletions.map(vc => (
                      <div key={vc._id} className="p-3 rounded-lg border bg-white shadow-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{vc.certificateNumber}</p>
                            <p className="text-sm text-muted-foreground">{vc.workDescription}</p>
                            <p className="text-xs text-muted-foreground">
                              Project: {vc.projectName} | Completed: {vc.completionDate}
                            </p>
                            {vc.qualityRating && (
                              <p className="text-xs text-muted-foreground">Quality: {vc.qualityRating}</p>
                            )}
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            vc.status === 'Approved' ? 'bg-green-100 text-green-800' :
                            vc.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {vc.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    <FileCheck className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    No completion certificates submitted yet.
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </motion.div>
      );
    };

    export default ContractorDashboard;