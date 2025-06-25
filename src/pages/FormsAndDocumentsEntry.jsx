import React from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
    import { FileText, Edit3, DollarSign, Users, Brain, Briefcase, Award } from 'lucide-react';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button.jsx';
    import { useNavigate } from 'react-router-dom';

    const FormCategoryCard = ({ title, description, icon: Icon, forms = [], onFormClick }) => (
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-t-2 border-primary/50 flex flex-col">
        <CardHeader className="flex flex-row items-center space-x-3 pb-2">
          <Icon className="h-6 w-6 text-primary" />
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow">
          <CardDescription className="mb-3 text-sm">{description}</CardDescription>
          {forms.length > 0 ? (
            <ul className="space-y-1.5">
              {forms.map(form => (
                <li key={form.id}>
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-primary hover:underline text-left text-sm leading-snug" 
                    onClick={() => onFormClick(form.id, form.title, form.link)}
                    disabled={form.disabled}
                    title={form.disabled ? "This form is planned for future implementation." : form.title}
                  >
                    {form.title}{form.isAi && <Brain className="h-3 w-3 ml-1.5 text-purple-500"/>}
                  </Button>
                </li>
              ))}
            </ul>
          ) : <p className="text-xs text-muted-foreground italic">No forms defined yet.</p>}
        </CardContent>
      </Card>
    );


    const FormsAndDocumentsEntry = () => {
      const navigate = useNavigate();
      
      const internalForms = [
        { id: "purchase-request", title: "Purchase Request Form", link: "/forms/purchase-request" },
        { id: "inventory-use-transfer", title: "Inventory Use/Transfer Form", link: "/forms/inventory-transfer" },
        { id: "leave-shift-request", title: "Leave & Shift Change Request", link: "/forms/leave-request" },
        { id: "incident-report", title: "Incident Report Form", link: "/forms/incident-report" },
        { id: "work-completion-report", title: "Work Completion Report", link: "/forms/work-completion-report" },
        { id: "ai-risk-assessment", title: "AI-Generated Risk Assessment", link: "/forms/ai-risk-assessment", isAi: true },
        { id: "dpr-submission", title: "DPR (Daily Report) Submission Form", link: "/forms/dpr-submission" },
      ];

      const siteForms = [
        { id: "daily-log", title: "Daily Site Log", link: "/daily-logs" },
        { id: "ocr-note-photo", title: "Handwritten Note/Photo to Form (AI)", link: "/forms/ocr-note-form", isAi: true },
        { id: "medical-prescription-upload", title: "Medical Prescription Upload", link: "/forms/medical-prescription-upload" },
        { id: "engineer-sketch-report", title: "Engineer’s Sketch/Report Upload", link: "/forms/engineer-sketch-upload" },
        { id: "site-inspection-checklist", title: "Site Inspection Checklist", link: "/forms/site-inspection-checklist" },
        { id: "material-receiving-report", title: "Material Receiving Report", link: "/forms/material-receiving-report" },
      ];

      const financialForms = [
        { id: "ai-cash-flow", title: "AI-Generated Cash Flow Sheet", link: "/forms/ai-cash-flow", isAi: true },
        { id: "p-and-l-sheet", title: "P&L Sheet (Auto Consolidated)", link: "/forms/pnl-sheet" },
        { id: "budget-revision-request", title: "Budget Revision Request", link: "/forms/budget-revision" },
        { id: "vendor-payment-cert", title: "Vendor Payment Certificate", link: "/forms/vendor-payment" },
        { id: "vendor-completion-cert", title: "Vendor Completion Certificate", link: "/forms/vendor-completion" },
        { id: "expense-claim-form", title: "Expense Claim Form", link: "/forms/expense-claim" },
        { id: "invoice-submission-form", title: "Invoice Submission Form", link: "/forms/invoice-submission" },
      ];
      
      const hrForms = [
          { id: "staff-registration", title: "Staff Registration Form", link: "/hr-staff-registration"},
          { id: "medical-insurance-upload", title: "Medical Insurance Upload + Expiry Tracker", link: "/forms/medical-insurance-upload" },
          { id: "auto-id-card-qr", title: "Auto ID Card with QR Code Generator", link: "/forms/id-card-generator" },
          { id: "staff-exit-clearance", title: "Staff Exit/Clearance Form", link: "/forms/staff-exit-clearance" },
          { id: "timesheet-submission", title: "Timesheet Submission Form", link: "/forms/timesheet-submission" },
      ];

      const trainingForms = [
        { id: "training-request-form", title: "General Training Request Form", link: "/forms/training-request" },
        { id: "fiber-training-request", title: "Fiber Training Request Form", link: "/forms/fiber-training-request" },
        { id: "eng-training-request", title: "Training Engineering Request Form", link: "/forms/eng-training-request" },
        { id: "telecom-training-request", title: "Telecom Training Request Form", link: "/forms/telecom-training-request" },
        { id: "civil-eng-training-request", title: "Civil Eng. Training Request Form", link: "/forms/civil-eng-training-request" },
      ];
      
      const handleFormClick = (formId, formTitle, formLink) => {
        if (formLink) {
            if(formLink.includes("?")) {
                const [path, query] = formLink.split("?");
                navigate(`${path}?${query}`);
            } else {
                 navigate(formLink);
            }
        } else {
            navigate(`/forms/placeholder/${formId}`, { state: { title: formTitle } });
        }
      };
      
      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-4 md:p-6 lg:p-8"
        >
          <Card className="shadow-xl border-t-4 border-indigo-500 mb-8">
            <CardHeader>
              <CardTitle className="text-2xl font-bold tracking-tight text-indigo-600 flex items-center">
                <Briefcase className="mr-2 h-6 w-6"/>Forms & Document Workflow Hub
              </CardTitle>
              <CardDescription>
                Access and manage all necessary forms for internal processes, site operations, financials, HR, and legal matters.
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FormCategoryCard 
              title="Internal Forms"
              description="For purchase requests, inventory, leave, incidents, and work completion."
              icon={Edit3}
              forms={internalForms}
              onFormClick={handleFormClick}
            />
            <FormCategoryCard 
              title="Site Forms (AI-Enhanced)"
              description="Daily logs, AI data capture for notes, medical info, and sketches, inspections."
              icon={Brain}
              forms={siteForms}
              onFormClick={handleFormClick}
            />
            <FormCategoryCard 
              title="Financial Forms"
              description="Manage cash flow, P&L, budget revisions, vendor payments, expenses, and invoices."
              icon={DollarSign}
              forms={financialForms}
              onFormClick={handleFormClick}
            />
            <FormCategoryCard 
              title="HR Forms"
              description="Staff registration, insurance, ID cards, clearance, timesheets, and training requests."
              icon={Users}
              forms={hrForms}
              onFormClick={handleFormClick}
            />
             <FormCategoryCard 
              title="Training Request Forms"
              description="Submit requests for various specialized training programs."
              icon={Award}
              forms={trainingForms}
              onFormClick={handleFormClick}
            />
          </div>
        </motion.div>
      );
    };

    export default FormsAndDocumentsEntry;