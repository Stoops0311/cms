import React from 'react';
    import { Input } from '@/components/ui/input.jsx';
    import { Label } from '@/components/ui/label.jsx';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';

    const AgreementFormHeader = ({
        agreementTitle, onTitleChange,
        agreementType, onAgreementTypeChange, agreementTypes,
        stakeholderCategoryAggr, onStakeholderCategoryChange, stakeholderCategories
    }) => {
        return (
            <>
                <div>
                    <Label htmlFor="agreementTitle-form">Agreement Title*</Label>
                    <Input id="agreementTitle-form" value={agreementTitle} onChange={e => onTitleChange(e.target.value)} placeholder="e.g., Joint Venture for Project Omega" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="agreementType-form">Agreement Type*</Label>
                        <Select value={agreementType} onValueChange={onAgreementTypeChange}>
                            <SelectTrigger id="agreementType-form"><SelectValue placeholder="Select Type" /></SelectTrigger>
                            <SelectContent>{agreementTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="stakeholderCategoryAggr-form">Overall Agreement Category*</Label>
                        <Select value={stakeholderCategoryAggr} onValueChange={onStakeholderCategoryChange}>
                            <SelectTrigger id="stakeholderCategoryAggr-form"><SelectValue placeholder="Select Category" /></SelectTrigger>
                            <SelectContent>{stakeholderCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                </div>
            </>
        );
    };

    export default AgreementFormHeader;