import React from 'react';
    import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { User, AlertTriangle, QrCode as QrCodeIcon } from 'lucide-react';
    import { format } from 'date-fns';

    const PatientDetailHeader = ({ patient, isInsuranceExpired, hasExpiredDocuments, onMarkEmergency }) => {
      return (
        <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 rounded-t-lg flex flex-col md:flex-row justify-between items-start">
          <div>
            <div className="flex items-center space-x-3">
              <User className="h-10 w-10 text-primary" />
              <div>
                <CardTitle className="text-3xl font-bold text-primary">{patient.fullName}</CardTitle>
                <CardDescription>Patient ID: {patient.id} {patient.isEmergencyVisit && <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">EMERGENCY VISIT</span>}</CardDescription>
              </div>
            </div>
            {(isInsuranceExpired || hasExpiredDocuments) && (
                <div className="mt-3 space-y-1">
                    {isInsuranceExpired && (
                        <div className="flex items-center text-sm text-destructive bg-destructive/10 p-2 rounded-md">
                            <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
                            <span>Insurance Expired on {format(new Date(patient.insuranceExpiryDate), 'PPP')}</span>
                        </div>
                    )}
                    {hasExpiredDocuments && (
                         <div className="flex items-center text-sm text-orange-600 bg-orange-500/10 p-2 rounded-md">
                            <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
                            <span>One or more personal documents have expired. Check Documents tab.</span>
                        </div>
                    )}
                </div>
            )}
          </div>
          <div className="mt-4 md:mt-0 flex flex-col items-center">
            {patient.qrCodeValue ? (
                <img  alt={`QR Code for ${patient.fullName}`} class="w-24 h-24 border p-1 rounded-md bg-white shadow-sm" src="https://images.unsplash.com/photo-1626682561113-d1db402cc866" />
            ) : (
                <div className="w-24 h-24 border p-1 rounded-md bg-white shadow-sm flex flex-col items-center justify-center text-center">
                    <QrCodeIcon className="h-8 w-8 text-gray-400 mb-1" />
                    <p className="text-xs text-gray-500">No QR Code</p>
                </div>
            )}
             <Button 
                variant={patient.isEmergencyVisit ? "destructive" : "outline"} 
                size="sm" 
                className="mt-2 w-full"
                onClick={() => onMarkEmergency(!patient.isEmergencyVisit)}
            >
                <AlertTriangle className="mr-2 h-4 w-4" /> {patient.isEmergencyVisit ? "Unmark Emergency" : "Mark Emergency"}
            </Button>
          </div>
        </CardHeader>
      );
    };

    export default PatientDetailHeader;