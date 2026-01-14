import React from 'react';
    import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
    import Layout from '@/components/Layout.jsx';
    import { AuthProvider } from '@/contexts/AuthContext.jsx';
    import AuthGuard from '@/components/auth/AuthGuard.jsx';
    import { Toaster } from '@/components/ui/toaster.jsx';
    import Dashboard from '@/pages/Dashboard.jsx';
    import DashboardConvex from '@/pages/DashboardConvex.jsx';
    
    import ProjectSetup from '@/pages/ProjectSetup.jsx'; 
    import ProjectSetupConvex from '@/pages/ProjectSetupConvex.jsx';
    import ProjectsList from '@/pages/ProjectsList.jsx';
    import ProjectsListConvex from '@/pages/ProjectsListConvex.jsx';
    import ProjectDetail from '@/pages/ProjectDetail.jsx';
    import LiveMapDashboard from '@/pages/LiveMapDashboard.jsx';

    import FormsAndDocumentsEntry from '@/pages/FormsAndDocumentsEntry.jsx';
    import PurchaseRequestFormPage from '@/pages/formsHub/PurchaseRequestFormPage.jsx';
    import PurchaseRequestFormPageConvex from '@/pages/formsHub/PurchaseRequestFormPageConvex.jsx';
    import WorkCompletionReportPage from '@/pages/formsHub/WorkCompletionReportPage.jsx';
    import SiteInspectionChecklistPage from '@/pages/formsHub/SiteInspectionChecklistPage.jsx';
    import ExpenseClaimFormPage from '@/pages/formsHub/ExpenseClaimFormPage.jsx';
    import ContractVariationRequestPage from '@/pages/formsHub/ContractVariationRequestPage.jsx';
    import GenericFormPage from '@/pages/formsHub/GenericFormPage.jsx';
    import AutoIdCardGeneratorPage from '@/pages/formsHub/AutoIdCardGeneratorPage.jsx';

    // New form pages
    import TrainingRequestFormPage from '@/pages/formsHub/TrainingRequestFormPage.jsx';
    import LeaveRequestFormPage from '@/pages/formsHub/LeaveRequestFormPage.jsx';
    import IncidentReportFormPage from '@/pages/formsHub/IncidentReportFormPage.jsx';
    import TimesheetSubmissionFormPage from '@/pages/formsHub/TimesheetSubmissionFormPage.jsx';
    import InventoryTransferFormPage from '@/pages/formsHub/InventoryTransferFormPage.jsx';
    import DPRSubmissionFormPage from '@/pages/formsHub/DPRSubmissionFormPage.jsx';
    import BudgetRevisionRequestPage from '@/pages/formsHub/BudgetRevisionRequestPage.jsx';
    import VendorPaymentCertificatePage from '@/pages/formsHub/VendorPaymentCertificatePage.jsx';
    import VendorCompletionCertificatePage from '@/pages/formsHub/VendorCompletionCertificatePage.jsx';
    import InvoiceSubmissionFormPage from '@/pages/formsHub/InvoiceSubmissionFormPage.jsx';
    import MedicalInsuranceUploadPage from '@/pages/formsHub/MedicalInsuranceUploadPage.jsx';
    import StaffExitClearanceFormPage from '@/pages/formsHub/StaffExitClearanceFormPage.jsx';
    import MedicalPrescriptionUploadPage from '@/pages/formsHub/MedicalPrescriptionUploadPage.jsx';
    import EngineerSketchUploadPage from '@/pages/formsHub/EngineerSketchUploadPage.jsx';
    import MaterialReceivingReportPage from '@/pages/formsHub/MaterialReceivingReportPage.jsx';
    import PnLSheetPage from '@/pages/formsHub/PnLSheetPage.jsx';


    import HRDashboard from '@/pages/HRDashboard.jsx';
    import AttendanceApp from '@/pages/AttendanceApp.jsx';
    import AttendanceAppConvex from '@/pages/AttendanceAppConvex.jsx';
    import ShiftManagement from '@/pages/ShiftManagement.jsx';
    import HealthSafetyDashboard from '@/pages/HealthSafetyDashboard.jsx';
    import StaffRegistration from '@/pages/StaffRegistration.jsx';


    import InventoryDashboard from '@/pages/InventoryDashboard.jsx';
    import ProcurementLog from '@/pages/ProcurementLog.jsx';

    import StakeholderDashboard from '@/pages/StakeholderDashboard.jsx';
    import ContractorRegistration from '@/pages/ContractorRegistration.jsx';
    import SupplierPortal from '@/pages/SupplierPortal.jsx';
    import LegalAgreements from '@/pages/LegalAgreements.jsx';
    
    import SecuritySettings from '@/pages/SecuritySettings.jsx';
    import AiToolsDashboard from '@/pages/AiToolsDashboard.jsx';

    import SiteManagerDashboard from '@/pages/SiteManagerDashboard.jsx';
    import ContractorDashboard from '@/pages/ContractorDashboard.jsx';
    import FinanceDashboard from '@/pages/FinanceDashboard.jsx';
    import AdminDashboard from '@/pages/AdminDashboard.jsx';

    import Reports from '@/pages/Reports.jsx';
    import QualityControl from '@/pages/QualityControl.jsx';
    import Communication from '@/pages/Communication.jsx';
    import EquipmentDispatch from '@/pages/EquipmentDispatch.jsx';
    import EquipmentDispatchConvex from '@/pages/EquipmentDispatchConvex.jsx';
    import Schedules from '@/pages/Schedules.jsx';
    import DailyLogs from '@/pages/DailyLogs.jsx';
    import UrgentAlerts from '@/pages/UrgentAlerts.jsx';
    import FiberHandonTrainingPage from '@/pages/FiberHandonTrainingPage.jsx';

    import PlaceholderPage from '@/pages/PlaceholderPage.jsx';

    function App() {
      return (
        <AuthProvider>
          <AuthGuard>
            <Router>
              <Routes>
                <Route path="/" element={<Layout />}>
              <Route index element={<DashboardConvex />} />
              <Route path="dashboard-legacy" element={<Dashboard />} />

              {/* Site & Project Management */}
              <Route path="project-setup" element={<ProjectSetupConvex />} />
              <Route path="project-setup-legacy" element={<ProjectSetup />} />
              <Route path="projects" element={<ProjectsListConvex />} />
              <Route path="projects-legacy" element={<ProjectsList />} />
              <Route path="projects/:projectId" element={<ProjectDetail />} />
              <Route path="live-map-dashboard" element={<LiveMapDashboard />} />
              <Route path="schedules-tasks" element={<Schedules />} />
              <Route path="daily-logs" element={<DailyLogs />} />

              {/* Forms & Document Workflow */}
              <Route path="forms-documents" element={<FormsAndDocumentsEntry />} />
              <Route path="forms/purchase-request" element={<PurchaseRequestFormPageConvex />} />
              <Route path="forms/purchase-request-legacy" element={<PurchaseRequestFormPage />} />
              <Route path="forms/work-completion-report" element={<WorkCompletionReportPage />} />
              <Route path="forms/site-inspection-checklist" element={<SiteInspectionChecklistPage />} />
              <Route path="forms/expense-claim" element={<ExpenseClaimFormPage />} />
              <Route path="forms/contract-variation" element={<ContractVariationRequestPage />} />
              
              {/* Internal Operations Forms */}
              <Route path="forms/inventory-transfer" element={<InventoryTransferFormPage />} />
              <Route path="forms/leave-request" element={<LeaveRequestFormPage />} />
              <Route path="forms/incident-report" element={<IncidentReportFormPage />} />
              <Route path="forms/timesheet-submission" element={<TimesheetSubmissionFormPage />} />
              <Route path="forms/dpr-submission" element={<DPRSubmissionFormPage />} />

              {/* Training Request Forms - all use same component */}
              <Route path="forms/training-request" element={<TrainingRequestFormPage />} />
              <Route path="forms/fiber-training-request" element={<TrainingRequestFormPage />} />
              <Route path="forms/eng-training-request" element={<TrainingRequestFormPage />} />
              <Route path="forms/telecom-training-request" element={<TrainingRequestFormPage />} />
              <Route path="forms/civil-eng-training-request" element={<TrainingRequestFormPage />} />

              {/* Site Document Forms */}
              <Route path="forms/medical-prescription-upload" element={<MedicalPrescriptionUploadPage />} />
              <Route path="forms/engineer-sketch-upload" element={<EngineerSketchUploadPage />} />
              <Route path="forms/material-receiving-report" element={<MaterialReceivingReportPage />} />

              {/* Financial Forms */}
              <Route path="forms/pnl-sheet" element={<PnLSheetPage />} />
              <Route path="forms/budget-revision" element={<BudgetRevisionRequestPage />} />
              <Route path="forms/vendor-payment" element={<VendorPaymentCertificatePage />} />
              <Route path="forms/vendor-completion" element={<VendorCompletionCertificatePage />} />
              <Route path="forms/invoice-submission" element={<InvoiceSubmissionFormPage />} />

              {/* HR Forms */}
              <Route path="forms/medical-insurance-upload" element={<MedicalInsuranceUploadPage />} />
              <Route path="forms/id-card-generator" element={<AutoIdCardGeneratorPage />} />
              <Route path="forms/staff-exit-clearance" element={<StaffExitClearanceFormPage />} />

              {/* AI Features - Keep as placeholders */}
              <Route path="forms/ai-risk-assessment" element={<GenericFormPage />} />
              <Route path="forms/ocr-note-form" element={<GenericFormPage />} />
              <Route path="forms/ai-cash-flow" element={<GenericFormPage />} />

              {/* Generic fallback */}
              <Route path="forms/placeholder/:formId" element={<GenericFormPage />} />


              <Route path="reports" element={<Reports />} />
              {/* Cloud Drive Links is part of ProjectDetail */}

              {/* HR, Attendance & Safety */}
              <Route path="hr-dashboard" element={<HRDashboard />} />
              <Route path="hr-staff-registration" element={<StaffRegistration />} />
              <Route path="hr-attendance" element={<AttendanceAppConvex />} />
              <Route path="hr-attendance-legacy" element={<AttendanceApp />} />
              <Route path="hr-shifts" element={<ShiftManagement />} />
              <Route path="hr-safety" element={<HealthSafetyDashboard />} />
              
              {/* Inventory & Procurement */}
              <Route path="inventory-dashboard" element={<InventoryDashboard />} />
              <Route path="equipment-dispatch" element={<EquipmentDispatchConvex />} />
              <Route path="equipment-dispatch-legacy" element={<EquipmentDispatch />} />
              <Route path="inventory-procurement-log" element={<ProcurementLog />} />

              {/* Stakeholder & Agreements */}
              <Route path="stakeholder-dashboard" element={<StakeholderDashboard />} />
              <Route path="stakeholder-contractor-registration" element={<ContractorRegistration />} />
              <Route path="stakeholder-supplier-portal" element={<SupplierPortal />} />
              <Route path="legal-agreements" element={<LegalAgreements />} />

              {/* Training & Certification */}
              <Route path="fiber-handon-training" element={<FiberHandonTrainingPage />} />
              
              {/* Quality & Communication */}
              <Route path="quality-control" element={<QualityControl />} />
              <Route path="communication" element={<Communication />} />
              
              {/* System Dashboards */}
              <Route path="dashboard-sitemanager" element={<SiteManagerDashboard />} />
              <Route path="dashboard-contractor" element={<ContractorDashboard />} />
              <Route path="dashboard-finance" element={<FinanceDashboard />} />
              <Route path="dashboard-admin" element={<AdminDashboard />} />
              
              {/* AI & System */}
              <Route path="ai-tools" element={<AiToolsDashboard />} />
              <Route path="security-settings" element={<SecuritySettings />} /> {/* Also for ERP */}
              <Route path="urgent-alerts" element={<UrgentAlerts />} />
              
              {/* Fallback for old/potentially deprecated routes for smoother transition */}
              <Route path="site-manager-dashboard" element={<SiteManagerDashboard />} />
              <Route path="materials-inventory" element={<InventoryDashboard />} />
              <Route path="schedules" element={<Schedules />} />
              <Route path="safety-compliance" element={<HealthSafetyDashboard />} />
              <Route path="personnel-dashboard" element={<HRDashboard />} />
              <Route path="personnel-registration" element={<StaffRegistration />} />
              <Route path="personnel-registration/:staffId" element={<StaffRegistration />} />
              <Route path="contractors" element={<StakeholderDashboard />} />
              <Route path="partners" element={<StakeholderDashboard />} /> 
              <Route path="project-financials" element={<FinanceDashboard />} />
              <Route path="settings" element={<SecuritySettings />} />


              <Route path="*" element={<PlaceholderPage title="Page Not Found" description="The page you are looking for does not exist." />} />
            </Route>
              </Routes>
              <Toaster />
            </Router>
          </AuthGuard>
        </AuthProvider>
      );
    }

    export default App;