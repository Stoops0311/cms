import React from 'react';
    import { motion } from 'framer-motion';
    import { CardTitle } from '@/components/ui/card.jsx';
    import DetailItem from '@/components/patientDetail/DetailItem.jsx';
    import { User, MapPin, Phone } from 'lucide-react';

    const PatientProfileTab = ({ patient }) => {
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <CardTitle className="text-xl mb-4 font-semibold text-gray-700">Personal & Contact Information</CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DetailItem icon={User} label="National ID / Iqama" value={patient.nationalId} />
            <DetailItem icon={User} label="Passport Number" value={patient.passportNumber} />
            <DetailItem icon={User} label="Nationality" value={patient.nationality} />
            <DetailItem icon={Phone} label="Mobile Number" value={patient.mobileNumber} />
            <DetailItem icon={Phone} label="Emergency Contact" value={patient.emergencyContact} />
            <DetailItem icon={MapPin} label="Assigned Camp" value={patient.campLocation} />
          </div>
        </motion.div>
      );
    };

    export default PatientProfileTab;