import React from 'react';
    import { motion } from 'framer-motion';
    import { CardTitle } from '@/components/ui/card.jsx';
    import { Label } from '@/components/ui/label.jsx';
    import DetailItem from '@/components/patientDetail/DetailItem.jsx';
    import { ShieldCheck, CalendarDays, Droplet, Users, Thermometer, HeartPulse, GitFork } from 'lucide-react';
    import { format, parseISO } from 'date-fns';

    const PatientMedicalTab = ({ patient, isInsuranceExpired }) => {
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <CardTitle className="text-xl mb-6 font-semibold text-gray-700">Medical Information</CardTitle>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
            <DetailItem icon={Droplet} label="Blood Group" value={patient.bloodGroup || 'N/A'} />
            <DetailItem icon={ShieldCheck} label="Insurance Provider" value={patient.insuranceProvider || 'N/A'} />
            <DetailItem icon={ShieldCheck} label="Insurance Policy No." value={patient.insurancePolicyNumber || 'N/A'} />
            <DetailItem 
              icon={CalendarDays} 
              label="Insurance Expiry Date" 
              value={patient.insuranceExpiryDate ? format(parseISO(patient.insuranceExpiryDate), 'PPP') : 'N/A'} 
              highlight={isInsuranceExpired}
              highlightClass="text-destructive font-semibold"
            />
            <DetailItem icon={Thermometer} label="Last Recorded Temp" value={patient.lastVitals?.temperature || 'N/A'} />
            <DetailItem icon={HeartPulse} label="Last Recorded BP" value={patient.lastVitals?.bloodPressure || 'N/A'} />
            <DetailItem icon={Users} label="Emergency Contact" value={`${patient.emergencyContactName || 'N/A'} (${patient.emergencyContactRelation || 'N/A'})`} />
            <DetailItem icon={GitFork} label="Emergency Contact Phone" value={patient.emergencyContactPhone || 'N/A'} />
            
            <div className="md:col-span-2 lg:col-span-3">
              <Label className="text-sm text-muted-foreground font-medium">Known Conditions / Allergies</Label>
              <p className="p-3 bg-slate-50 rounded-md border text-sm min-h-[60px] mt-1 whitespace-pre-wrap">{patient.knownConditions || 'None specified.'}</p>
            </div>
          </div>
        </motion.div>
      );
    };

    export default PatientMedicalTab;