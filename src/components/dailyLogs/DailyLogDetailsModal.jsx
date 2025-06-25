import React from 'react';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { format } from 'date-fns';
    import { Clock, MapPin, Users, Briefcase, AlertCircle, ShieldCheck, Construction, Image as ImageIcon, Paperclip, FileText } from 'lucide-react';

    const DetailItem = ({ icon: Icon, label, value, isHtml = false }) => (
        <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-slate-100 last:border-b-0">
            <dt className="text-sm font-medium text-slate-600 flex items-center col-span-1">
                <Icon className="w-4 h-4 mr-2 text-slate-500" />
                {label}:
            </dt>
            {isHtml ? (
                <dd className="text-sm text-slate-800 col-span-2" dangerouslySetInnerHTML={{ __html: value || 'N/A' }} />
            ) : (
                <dd className="text-sm text-slate-800 col-span-2">{value || 'N/A'}</dd>
            )}
        </div>
    );

    const DailyLogDetailsModal = ({ isOpen, onClose, log, projectDetails }) => {
        if (!log) return null;

        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
                    <DialogHeader className="pb-4 border-b">
                        <DialogTitle className="text-xl font-semibold text-teal-700 flex items-center">
                            <Clock className="mr-2 h-6 w-6" />Daily Log Details
                        </DialogTitle>
                        <DialogDescription>
                            Log for: {projectDetails?.projectName || log.projectId} on {format(new Date(log.logDate), 'PPP')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <dl className="divide-y divide-slate-100">
                            <DetailItem icon={MapPin} label="Site Location" value={log.siteLocation} />
                            <DetailItem icon={Clock} label="Weather" value={log.weather} />
                            <DetailItem icon={Users} label="Manpower Count" value={log.manpowerCount?.toString()} />
                            <DetailItem icon={Briefcase} label="Work Accomplished" value={log.workAccomplished?.replace(/\n/g, '<br />')} isHtml={true} />
                            <DetailItem icon={Construction} label="Equipment Used" value={log.equipmentUsed?.replace(/\n/g, '<br />')} isHtml={true} />
                            <DetailItem icon={ShieldCheck} label="Safety Observations" value={log.safetyObservations?.replace(/\n/g, '<br />')} isHtml={true} />
                            <DetailItem icon={AlertCircle} label="Issues/Delays" value={log.issuesEncountered?.replace(/\n/g, '<br />')} isHtml={true} />
                             <DetailItem icon={FileText} label="General Notes" value={log.generalNotes?.replace(/\n/g, '<br />')} isHtml={true} />
                        </dl>

                        {log.attachments && log.attachments.length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium text-slate-600 flex items-center mb-1">
                                    <Paperclip className="w-4 h-4 mr-2 text-slate-500" />Attachments:
                                </h4>
                                <ul className="list-disc list-inside text-sm space-y-1">
                                    {log.attachments.map((att, index) => (
                                        <li key={index} className="text-blue-600 hover:underline cursor-pointer" onClick={() => alert(`Simulating download/view of ${att.name}`)}>
                                            {att.name} ({(att.size / 1024).toFixed(1)} KB)
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                    <div className="pt-4 border-t flex justify-end">
                        <Button variant="outline" onClick={onClose}>Close</Button>
                    </div>
                </DialogContent>
            </Dialog>
        );
    };

    export default DailyLogDetailsModal;