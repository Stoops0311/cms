import React from 'react';
    import { Link, useLocation } from 'react-router-dom';
    import { cn } from '@/lib/utils.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { Card, CardContent } from '@/components/ui/card.jsx';
    import { LayoutDashboard, Briefcase, Map, FileText, Users, ShieldCheck, Package, Truck, Coins, UserCheck, Settings, Brain, UserCog, DollarSign, ClipboardCheck, HardHat, FileSignature, GanttChartSquare, MessageCircle, Users2, Link as LinkIcon, FileUp, ListChecks, BarChart3, GitPullRequestClosed, CheckSquare as QualityCheckSquare, Construction, Clock4, CalendarCheck, Award } from 'lucide-react';
    import { motion } from 'framer-motion';

    const mainNavItems = [
      { href: '/', label: 'Main Dashboard', icon: LayoutDashboard },
    ];

    const moduleNavGroups = [
      {
        title: 'Site & Project Mgt.',
        icon: Briefcase,
        items: [
          { href: '/project-setup', label: 'Setup New Project', icon: Briefcase },
          { href: '/projects', label: 'Projects List', icon: GanttChartSquare },
          { href: '/live-map-dashboard', label: 'Live Map Dashboard', icon: Map },
          { href: '/schedules-tasks', label: 'Schedules & Tasks', icon: CalendarCheck },
          { href: '/daily-logs', label: 'Daily Logs', icon: Clock4 },
        ],
      },
      {
        title: 'Forms & Documents',
        icon: FileText,
        items: [
          { href: '/forms-documents', label: 'Forms Hub', icon: FileText },
          { href: '/reports', label: 'Reports', icon: BarChart3 },
          { href: '/projects', label: 'Cloud Drive Links', query: '?tab=drive_links', icon: LinkIcon },
        ],
      },
      {
        title: 'HR, Attendance & Safety',
        icon: Users,
        items: [
          { href: '/hr-dashboard', label: 'Personnel Mgmt', icon: Users },
          { href: '/hr-staff-registration', label: 'Staff Registration', icon: UserCog },
          { href: '/hr-attendance', label: 'Attendance App', icon: ClipboardCheck },
          { href: '/hr-shifts', label: 'Shift Management', icon: Users2 },
          { href: '/hr-safety', label: 'Safety & Compliance', icon: ShieldCheck },
        ],
      },
      {
        title: 'Inventory & Procurement',
        icon: Package,
        items: [
          { href: '/inventory-dashboard', label: 'Materials Inventory', icon: Package },
          { href: '/equipment-dispatch', label: 'Equipment Dispatch', icon: Construction },
          { href: '/inventory-procurement-log', label: 'Procurement Log', icon: Truck },
        ],
      },
      {
        title: 'Stakeholders & Agreements',
        icon: Coins,
        items: [
          { href: '/stakeholder-dashboard', label: 'Stakeholders Hub', icon: Coins },
          { href: '/stakeholder-contractor-registration', label: 'Contractor Mgt.', icon: UserCheck },
          { href: '/legal-agreements', label: 'MOU/NCNDA/Agreements', icon: FileSignature },
        ],
      },
      {
        title: 'Training & Certification',
        icon: Award,
        items: [
          { href: '/fiber-handon-training', label: 'Fiber Handon Training', icon: Award },
        ],
      },
       {
        title: 'Quality & Communication',
        icon: QualityCheckSquare,
        items: [
          { href: '/quality-control', label: 'Quality Control', icon: QualityCheckSquare },
          { href: '/communication', label: 'Communication', icon: MessageCircle },
        ],
      },
      {
        title: 'System Dashboards',
        icon: LayoutDashboard,
        items: [
            { href: '/dashboard-sitemanager', label: 'Site Manager DB', icon: HardHat },
            { href: '/dashboard-contractor', label: 'Contractor DB', icon: UserCheck },
            { href: '/dashboard-finance', label: 'Finance DB', icon: DollarSign },
            { href: '/dashboard-admin', label: 'Admin DB', icon: UserCog },
        ]
      },
       {
        title: 'AI & System',
        icon: Brain,
        items: [
          { href: '/ai-tools', label: 'AI Tools', icon: Brain },
          { href: '/erp-integration', label: 'ERP Integration', icon: GitPullRequestClosed }, 
          { href: '/security-settings', label: 'Security & Access', icon: Settings },
        ],
      },
    ];
    

    const Sidebar = ({ className }) => {
      const location = useLocation();
      const isActive = (href, query) => {
        const currentPath = location.pathname;
        const currentQuery = location.search;
        if (query) {
            return currentPath === href && currentQuery === query;
        }
        return currentPath === href;
      };

      return (
        <aside className={cn("h-screen sticky top-0 overflow-y-auto custom-scrollbar", className)}>
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-16 items-center border-b px-4 lg:h-[70px] lg:px-6 bg-gradient-to-r from-primary to-primary/80 shadow-md">
              <Link to="/" className="flex items-center gap-2 font-semibold text-primary-foreground">
                <Briefcase className="h-7 w-7" />
                <div className="flex flex-col">
                    <span className="text-sm leading-tight">Construction Management System</span>
                    <span className="text-xs leading-tight opacity-80">– Access AI Tools</span>
                </div>
              </Link>
            </div>
            <div className="flex-1 py-2">
              <nav className="grid items-start px-2 text-sm font-medium lg:px-4 space-y-0.5">
                {mainNavItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-primary/10',
                      isActive(item.href) && 'bg-primary/20 text-primary font-semibold scale-105 shadow-sm',
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                ))}

                {moduleNavGroups.map((group) => (
                  <div key={group.title} className="py-1.5">
                    <h2 className="mb-1.5 px-3 text-xs font-semibold uppercase text-muted-foreground/80 tracking-wider flex items-center">
                       <group.icon className="h-4 w-4 mr-2 text-primary/70"/> {group.title}
                    </h2>
                    <div className="space-y-0.5">
                    {group.items.map((item) => (
                      <Link
                        key={item.href + (item.query || '')}
                        to={`${item.href}${item.query || ''}`}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-primary/10',
                          isActive(item.href, item.query) && 'bg-primary/20 text-primary font-semibold scale-105 shadow-sm',
                          'ml-2 text-[13px]' 
                        )}
                      >
                        <item.icon className="h-3.5 w-3.5" />
                        {item.label}
                      </Link>
                    ))}
                    </div>
                  </div>
                ))}
              </nav>
            </div>
            <div className="mt-auto p-4 border-t">
                <p className="text-center text-xs text-muted-foreground">Powered by NTT Groups</p>
            </div>
          </div>
        </aside>
      );
    };

    export default Sidebar;