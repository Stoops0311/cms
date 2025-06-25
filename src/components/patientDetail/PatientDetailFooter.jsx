import React from 'react';
    import { CardFooter } from '@/components/ui/card.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { PlusCircle } from 'lucide-react';

    const PatientDetailFooter = ({ patientId, onNavigateToEdit, onManagePrescriptions }) => {
      return (
        <CardFooter className="border-t p-6 bg-slate-50 rounded-b-lg flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onNavigateToEdit(patientId)}>Edit Patient Details</Button>
            <Button 
                className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white"
                onClick={onManagePrescriptions}
            >
                <PlusCircle className="mr-2 h-4 w-4" /> Manage Prescriptions
            </Button>
        </CardFooter>
      );
    };
    
    export default PatientDetailFooter;