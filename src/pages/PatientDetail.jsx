import React, { useState, useEffect } from 'react';
    import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
    import useLocalStorage from '@/hooks/useLocalStorage.jsx';
    import { Card, CardContent, CardTitle, CardDescription, CardHeader } from '@/components/ui/card.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { ArrowLeft, AlertTriangle } from 'lucide-react';
    import { motion } from 'framer-motion';
    import { useToast } from '@/components/ui/use-toast.jsx';

    import PatientDetailHeader from '@/components/patientDetail/PatientDetailHeader.jsx';
    import PatientDetailTabs from '@/components/patientDetail/PatientDetailTabs.jsx';
    import PatientDetailFooter from '@/components/patientDetail/PatientDetailFooter.jsx';

    const PatientDetail = () => {
      const { patientId } = useParams();
      const [patients, setPatients] = useLocalStorage('patients', []);
      const patient = patients.find(p => p.id === patientId);
      const location = useLocation();
      const navigate = useNavigate();
      const { toast } = useToast();
      
      const [activeTab, setActiveTab] = useState("profile");

      useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab) {
          setActiveTab(tab);
        }
      }, [location.search]);

      if (!patient) {
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
              <Card className="w-full max-w-md text-center shadow-xl border-t-4 border-destructive">
                <CardHeader>
                  <AlertTriangle className="mx-auto h-16 w-16 text-destructive mb-4" />
                  <CardTitle className="text-2xl font-bold text-destructive">Patient Not Found</CardTitle>
                  <CardDescription>The patient record you are looking for does not exist or could not be loaded.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to="/patients">
                    <Button variant="outline">
                      <ArrowLeft className="mr-2 h-4 w-4" /> Back to Patients List
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        );
      }

      const isInsuranceExpired = patient.insuranceExpiryDate && new Date(patient.insuranceExpiryDate) < new Date();
      const hasExpiredDocuments = patient.documents ? patient.documents.some(doc => doc.expiryDate && new Date(doc.expiryDate) < new Date()) : false;
      
      const updatePatientData = (updatedData) => {
        const updatedPatients = patients.map(p => 
          p.id === patientId 
          ? { ...p, ...updatedData } 
          : p
        );
        setPatients(updatedPatients);
      };

      const handleMarkEmergency = (isEmergency) => {
        updatePatientData({ isEmergencyVisit: isEmergency });
        toast({
            title: `Visit Marked as ${isEmergency ? 'Emergency' : 'Normal'}`,
            description: `Patient visit status updated for ${patient.fullName}.`,
            className: isEmergency ? "bg-red-500 text-white" : "bg-green-500 text-white",
        });
      };

      const navigateToEdit = (id) => {
        navigate(`/patient-registration?edit=${id}`);
      };

      const managePrescriptions = () => {
        setActiveTab("prescriptions");
      };

      return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
           <Button variant="outline" onClick={() => navigate(-1)} className="mb-6">
             <ArrowLeft className="mr-2 h-4 w-4" /> Back
           </Button>
          <Card className="shadow-2xl border-t-4 border-primary">
            <PatientDetailHeader 
              patient={patient} 
              isInsuranceExpired={isInsuranceExpired} 
              hasExpiredDocuments={hasExpiredDocuments} 
              onMarkEmergency={handleMarkEmergency} 
            />
            <CardContent className="p-6">
              <PatientDetailTabs 
                patient={patient}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                updatePatientData={updatePatientData}
                isInsuranceExpired={isInsuranceExpired}
              />
            </CardContent>
            <PatientDetailFooter 
              patientId={patient.id}
              onNavigateToEdit={navigateToEdit}
              onManagePrescriptions={managePrescriptions}
            />
          </Card>
        </motion.div>
      );
    };

    export default PatientDetail;