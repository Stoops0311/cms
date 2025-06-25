import React, { useMemo } from 'react';
    import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card.jsx';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
    import { TrendingUp, DollarSign, Users, FolderKanban } from 'lucide-react';
    import useLocalStorage from '@/hooks/useLocalStorage.jsx';
    import { motion } from 'framer-motion';
    import { Link } from 'react-router-dom';
    import { format } from 'date-fns';

    const InvestmentsDashboard = () => {
      const [partners] = useLocalStorage('cmsPartners', []);
      const [projects] = useLocalStorage('projects', []);

      const totalInvestmentAmount = useMemo(() => {
        return partners.reduce((sum, partner) => sum + (partner.totalInvestment || 0), 0);
      }, [partners]);

      const totalInvestors = useMemo(() => {
        return partners.filter(p => p.type === "Investor").length;
      }, [partners]);
      
      const recentInvestments = useMemo(() => {
        const allInvestments = partners.flatMap(p => 
            (p.investments || []).map(inv => ({...inv, partnerName: p.name, partnerId: p.id}))
        );
        return allInvestments.sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
      }, [partners]);

      const projectsWithMostInvestment = useMemo(() => {
        const projectInvestments = {};
        partners.forEach(partner => {
            (partner.investments || []).forEach(inv => {
                projectInvestments[inv.projectId] = (projectInvestments[inv.projectId] || 0) + inv.amount;
            });
        });
        return Object.entries(projectInvestments)
            .map(([projectId, totalAmount]) => ({
                projectId,
                projectName: projects.find(p => p.id === projectId)?.projectName || projectId,
                totalAmount
            }))
            .sort((a,b) => b.totalAmount - a.totalAmount)
            .slice(0,5);
      }, [partners, projects]);


      const summaryCards = [
        { title: "Total Investment Value", value: `$${totalInvestmentAmount.toLocaleString()}`, icon: DollarSign, color: "text-green-600", bgColor: "bg-green-50" },
        { title: "Total Investors", value: totalInvestors.toString(), icon: Users, color: "text-blue-600", bgColor: "bg-blue-50" },
        { title: "Projects Funded", value: projectsWithMostInvestment.length.toString(), icon: FolderKanban, color: "text-purple-600", bgColor: "bg-purple-50" },
        { title: "Recent Transactions", value: recentInvestments.length.toString(), icon: TrendingUp, color: "text-orange-600", bgColor: "bg-orange-50" },
      ];

      return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-8">
          <Card className="shadow-xl border-t-4 border-green-600">
            <CardHeader className="bg-gradient-to-r from-green-600/10 to-emerald-600/10">
              <CardTitle className="text-2xl font-bold text-green-700 flex items-center"><TrendingUp className="mr-3 h-7 w-7" />Investment Overview</CardTitle>
              <CardDescription>Summary of all investment activities and partner contributions.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {summaryCards.map(card => (
                  <Card key={card.title} className={`shadow-lg ${card.bgColor} border-l-4 ${card.color.replace('text-', 'border-')}`}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className={`text-sm font-medium ${card.color}`}>{card.title}</CardTitle>
                      <card.icon className={`h-5 w-5 ${card.color} opacity-70`} />
                    </CardHeader>
                    <CardContent>
                      <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg text-green-700">Recent Investments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {recentInvestments.length === 0 ? <p className="text-muted-foreground">No recent investments.</p> : (
                      <Table>
                        <TableHeader><TableRow><TableHead>Partner</TableHead><TableHead>Project</TableHead><TableHead>Amount</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
                        <TableBody>
                          {recentInvestments.map(inv => (
                            <TableRow key={inv.id}>
                              <TableCell><Link to={`/partners/${inv.partnerId}`} className="text-primary hover:underline">{inv.partnerName}</Link></TableCell>
                              <TableCell><Link to={`/projects/${inv.projectId}`} className="text-primary hover:underline">{projects.find(p=>p.id === inv.projectId)?.projectName || inv.projectId}</Link></TableCell>
                              <TableCell>${inv.amount.toLocaleString()}</TableCell>
                              <TableCell>{format(new Date(inv.date), 'dd MMM yyyy')}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>

                <Card className="shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg text-green-700">Top Funded Projects</CardTitle>
                  </CardHeader>
                  <CardContent>
                     {projectsWithMostInvestment.length === 0 ? <p className="text-muted-foreground">No projects have received investment yet.</p> : (
                      <Table>
                        <TableHeader><TableRow><TableHead>Project</TableHead><TableHead>Total Investment</TableHead></TableRow></TableHeader>
                        <TableBody>
                          {projectsWithMostInvestment.map(proj => (
                            <TableRow key={proj.projectId}>
                              <TableCell><Link to={`/projects/${proj.projectId}`} className="text-primary hover:underline">{proj.projectName}</Link></TableCell>
                              <TableCell>${proj.totalAmount.toLocaleString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      );
    };

    export default InvestmentsDashboard;