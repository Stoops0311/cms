import React from 'react';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import DetailItem from '@/components/projectDetail/DetailItem.jsx'; // Reusing DetailItem for consistent display
    import { FileText, CalendarDays, UserCircle, Settings, Link2, Info, AlertTriangle, CheckCircle } from 'lucide-react';
    import { format, differenceInDays, parseISO } from 'date-fns';

    const ViewSafetyDocumentModal = ({ isOpen, onClose, doc, getRelatedName, onDownload }) => {
      if (!doc) return null;

      const daysToExpiry = doc.expiryDate ? differenceInDays(parseISO(doc.expiryDate), new Date()) : null;
      let statusText = "Valid";
      let statusColor = "text-green-600";
      let StatusIcon = CheckCircle;

      if (daysToExpiry !== null) {
        if (daysToExpiry < 0) { 
          statusText = "Expired"; 
          statusColor = "text-red-600";
          StatusIcon = AlertTriangle;
        } else if (daysToExpiry <= 30) { 
          statusText = `Expires in ${daysToExpiry + 1} day(s)`; 
          statusColor = "text-orange-600";
          StatusIcon = AlertTriangle;
        }
      } else {
        statusText = "No Expiry Date";
        statusColor = "text-gray-600";
        StatusIcon = Info;
      }

      return (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center"><FileText className="mr-2 h-5 w-5 text-primary" />{doc.docName}</DialogTitle>
              <DialogDescription>Details for safety document: {doc.docNumber || 'N/A'}</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-3">
              <DetailItem icon={FileText} label="Document Type" value={doc.docType} />
              <DetailItem icon={UserCircle} label="Issuing Authority" value={doc.issuedBy || 'N/A'} />
              <DetailItem icon={CalendarDays} label="Issue Date" value={format(new Date(doc.issueDate), 'PPP')} />
              <DetailItem icon={CalendarDays} label="Expiry Date" value={doc.expiryDate ? format(new Date(doc.expiryDate), 'PPP') : 'Not Applicable'} />
              <DetailItem icon={StatusIcon} label="Status" value={statusText} statusColor={statusColor} />
              <DetailItem icon={Settings} label="Related To" value={`${doc.relatedTo}: ${getRelatedName(doc)}`} />
              {doc.fileName && doc.fileName !== "No file attached" && doc.fileName !== "Link to Cloud Document" && (
                 <DetailItem icon={Link2} label="Attached File" value={doc.fileName} />
              )}
              {doc.fileUrl && (
                 <DetailItem icon={Link2} label="Cloud Link">
                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">{doc.fileUrl}</a>
                 </DetailItem>
              )}
              {doc.notes && <DetailItem icon={Info} label="Notes" value={doc.notes} />}
            </div>
            <DialogFooter className="sm:justify-between">
              { (doc.fileName && doc.fileName !== "No file attached") || doc.fileUrl ? (
                <Button variant="outline" onClick={() => onDownload(doc)}>
                  {doc.fileUrl ? "Open Link" : "Download (Simulated)"}
                </Button>
              ) : <div/> }
              <Button onClick={onClose}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    };

    export default ViewSafetyDocumentModal;