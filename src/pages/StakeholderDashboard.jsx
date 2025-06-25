import React from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card.jsx';
    import { Users, Briefcase, DollarSign, HeartHandshake as Handshake, AlertTriangle } from 'lucide-react';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button.jsx';
    import { Link } from 'react-router-dom';

    const StakeholderDashboard = () => {
      const sections = [
        { title: "Contractor Management", description: "Register, view, and manage contractors & consultants.", link: "/stakeholder-contractor-registration", icon: Briefcase, buttonText: "Manage Contractors" },
        { title: "Supplier Portal", description: "Access supplier catalogues, delivery logs, and invoices.", link: "/stakeholder-supplier-portal", icon: Handshake, buttonText: "Access Supplier Portal" },
        { title: "Investor/Funding Partner View", description: "View financial dashboards, project ROI, and performance KPIs.", link: "/dashboard-finance", icon: DollarSign, buttonText: "View Investor Dashboard" },
      ];

      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-4 md:p-6 lg:p-8"
        >
          <Card className="shadow-xl border-t-4 border-lime-500 mb-8">
            <CardHeader>
              <CardTitle className="text-2xl font-bold tracking-tight text-lime-600 flex items-center">
                <Users className="mr-2 h-6 w-6"/>Stakeholder & Vendor System
              </CardTitle>
              <CardDescription>
                Centralized hub for managing contractors, consultants, suppliers, and investor relations.
              </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="mt-2 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded-md flex items-start">
                  <AlertTriangle className="h-5 w-5 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Placeholder Content:</p>
                    <p className="text-sm">The linked pages are placeholders and will be developed with specific functionalities.</p>
                  </div>
                </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.2 }}
              >
                <Card className="shadow-lg hover:shadow-xl transition-shadow h-full flex flex-col">
                  <CardHeader className="flex-grow-0">
                    <div className="flex items-center space-x-3 mb-2">
                        <section.icon className="h-8 w-8 text-lime-600"/>
                        <CardTitle className="text-xl">{section.title}</CardTitle>
                    </div>
                    <CardDescription className="text-sm">{section.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow"/>
                  <CardFooter>
                    <Button asChild className="w-full bg-lime-600 hover:bg-lime-700 text-white">
                      <Link to={section.link}>{section.buttonText}</Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      );
    };

    export default StakeholderDashboard;