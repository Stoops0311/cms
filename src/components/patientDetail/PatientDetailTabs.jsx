import React from 'react';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.jsx";
    import PatientProfileTab from '@/components/patientDetail/PatientProfileTab.jsx';
    import PatientMedicalTab from '@/components/patientDetail/PatientMedicalTab.jsx';
    import PatientPrescriptionsTab from '@/components/patientDetail/PatientPrescriptionsTab.jsx';
    import PatientDocumentsTab from '@/components/patientDetail/PatientDocumentsTab.jsx';
    import PatientVisitHistoryTab from '@/components/patientDetail/PatientVisitHistoryTab.jsx';
    import PatientLabRequestsTab from '@/components/patientDetail/PatientLabRequestsTab.jsx';

    const PatientDetailTabs = ({ patient, activeTab, setActiveTab, updatePatientData, isInsuranceExpired }) => {
      const tabItems = [
        { value: "profile", label: "Profile", component: <PatientProfileTab patient={patient} /> },
        { value: "medical", label: "Medical", component: <PatientMedicalTab patient={patient} isInsuranceExpired={isInsuranceExpired} /> },
        { value: "prescriptions", label: "Prescriptions", component: <PatientPrescriptionsTab patient={patient} updatePatientData={updatePatientData} /> },
        { value: "lab_requests", label: "Lab Requests", component: <PatientLabRequestsTab patient={patient} updatePatientData={updatePatientData} /> },
        { value: "documents", label: "Documents", component: <PatientDocumentsTab patient={patient} updatePatientData={updatePatientData} /> },
        { value: "history", label: "Visit History", component: <PatientVisitHistoryTab patient={patient} updatePatientData={updatePatientData} /> },
      ];

      return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6 mb-4">
            {tabItems.map(tab => (
              <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>
            ))}
          </TabsList>
          
          {tabItems.map(tab => (
            <TabsContent key={tab.value} value={tab.value} className="pt-4">
              {tab.component}
            </TabsContent>
          ))}
        </Tabs>
      );
    };

    export default PatientDetailTabs;