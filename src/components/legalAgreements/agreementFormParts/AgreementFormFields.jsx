import React from 'react';
    import { Input } from '@/components/ui/input.jsx';
    import { Label } from '@/components/ui/label.jsx';
    import { DatePicker } from '@/components/ui/date-picker.jsx';
    import { MapPin as MapPinIcon, CalendarPlus as CalendarIcon } from 'lucide-react';

    const AgreementFormFields = ({
        agreementDate, onAgreementDateChange,
        placeOfAgreement, onPlaceOfAgreementChange,
        effectiveDate, onEffectiveDateChange,
        expiryDate, onExpiryDateChange
    }) => {
        return (
            <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="agreementDate-form" className="flex items-center"><CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground"/>Agreement Date*</Label>
                        <DatePicker id="agreementDate-form" date={agreementDate} setDate={onAgreementDateChange} className="w-full"/>
                    </div>
                    <div>
                        <Label htmlFor="placeOfAgreement-form" className="flex items-center"><MapPinIcon className="mr-2 h-4 w-4 text-muted-foreground"/>Place of Agreement*</Label>
                        <Input id="placeOfAgreement-form" value={placeOfAgreement} onChange={e => onPlaceOfAgreementChange(e.target.value)} placeholder="e.g., Mumbai, India" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="effectiveDate-form">Effective Date*</Label>
                        <DatePicker id="effectiveDate-form" date={effectiveDate} setDate={onEffectiveDateChange} className="w-full"/>
                    </div>
                    <div>
                        <Label htmlFor="expiryDate-form">Expiry Date</Label>
                        <DatePicker id="expiryDate-form" date={expiryDate} setDate={onExpiryDateChange} className="w-full"/>
                    </div>
                </div>
            </>
        );
    };

    export default AgreementFormFields;