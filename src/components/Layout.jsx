import React from 'react';
    import { Outlet, useLocation } from 'react-router-dom';
    import Sidebar from '@/components/Sidebar.jsx';
    import Header from '@/components/Header.jsx';
    import { Toaster } from '@/components/ui/toaster.jsx';
    import { motion, AnimatePresence } from 'framer-motion';

    const getPageTitle = (pathname) => {
      if (pathname.startsWith('/projects/') && pathname.length > '/projects/'.length) {
        return 'Project Details';
      }
      if (pathname.startsWith('/personnel-profile/') && pathname.length > '/personnel-profile/'.length) {
        return 'Personnel Profile';
      }
      if (pathname.startsWith('/personnel-registration/') && pathname.length > '/personnel-registration/'.length) {
        return 'Edit Personnel';
      }
      if (pathname.startsWith('/project-setup?edit=') && pathname.length > '/project-setup?edit='.length) {
        return 'Edit Project Details';
      }
      if (pathname.startsWith('/contractors/') && pathname.length > '/contractors/'.length) {
        return 'Contractor Details';
      }
      if (pathname.startsWith('/partners/') && pathname.length > '/partners/'.length) {
        return 'Partner/Investor Details';
      }


      switch (pathname) {
        case '/': return 'Dashboard';
        case '/site-manager-dashboard': return "Site Manager's Dashboard";
        case '/project-setup': return 'Project Setup';
        case '/projects': return 'Projects List';
        case '/personnel-dashboard': return 'Personnel Management';
        case '/personnel-registration': return 'Personnel Registration';
        case '/equipment-dispatch': return 'Equipment Dispatch';
        case '/materials-inventory': return 'Materials Inventory';
        case '/schedules': return 'Schedules & Tasks';
        case '/daily-logs': return 'Daily Logs';
        case '/safety-compliance': return 'Safety & Compliance';
        case '/contractors': return 'Contractors Management';
        case '/partners': return 'Partnerships & Investors';
        case '/investments': return 'Investment Overview';
        case '/fiber-teams': return 'Fiber Team Management';
        case '/project-financials': return 'Project P&L / Budget';
        case '/settings': return 'General Settings';
        default: return 'CMS';
      }
    };

    const Layout = () => {
      const location = useLocation();
      const pageTitle = getPageTitle(location.pathname);

      return (
        <div className="flex h-screen bg-gradient-to-br from-slate-50 to-gray-100">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header pageTitle={pageTitle} />
            <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 bg-slate-50">
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Outlet />
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
          <Toaster />
        </div>
      );
    };

    export default Layout;