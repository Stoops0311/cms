import React from 'react';
    import { Label } from '@/components/ui/label.jsx';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
    import { Checkbox } from '@/components/ui/checkbox.jsx';

    const AgreementFormMetaFields = ({
        status, onStatusChange, agreementStatuses,
        confidentialityLevel, onConfidentialityLevelChange, confidentialityLevels,
        autoReminders, onAutoRemindersChange
    }) => {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                 <div>
                    <Label htmlFor="status-form">Status*</Label>
                    <Select value={status} onValueChange={onStatusChange}>
                        <SelectTrigger id="status-form"><SelectValue placeholder="Select Status" /></SelectTrigger>
                        <SelectContent>{agreementStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="confidentialityLevel-form">Confidentiality Level</Label>
                    <Select value={confidentialityLevel} onValueChange={onConfidentialityLevelChange}>
                        <SelectTrigger id="confidentialityLevel-form"><SelectValue placeholder="Select Level" /></SelectTrigger>
                        <SelectContent>{confidentialityLevels.map(cl => <SelectItem key={cl} value={cl}>{cl}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div className="flex items-center space-x-2 pt-2 md:pt-6 col-span-1 md:col-span-2"> {/* Ensure checkbox aligns better */}
                    <Checkbox id="autoReminders-form" checked={autoReminders} onCheckedChange={onAutoRemindersChange} />
                    <Label htmlFor="autoReminders-form" className="font-normal">Set Auto Reminders before expiry</Label>
                </div>
            </div>
        );
    };

    export default AgreementFormMetaFields;