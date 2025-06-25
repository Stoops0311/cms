import React, { useState } from 'react';
    import { ChevronDown, ChevronUp } from 'lucide-react';

    const ExpandableSection = ({ title, icon: Icon, children, defaultOpen = false }) => {
        const [isOpen, setIsOpen] = useState(defaultOpen);
        return (
            <div className="border rounded-md">
                <button type="button" onClick={() => setIsOpen(!isOpen)} className="flex items-center justify-between w-full p-3 bg-slate-50 hover:bg-slate-100 rounded-t-md">
                    <div className="flex items-center">
                        {Icon && <Icon className="h-5 w-5 mr-2 text-primary" />}
                        <span className="font-medium text-sm">{title}</span>
                    </div>
                    {isOpen ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                </button>
                {isOpen && <div className="p-4 border-t space-y-3 bg-white">{children}</div>}
            </div>
        );
    };
    export default ExpandableSection;