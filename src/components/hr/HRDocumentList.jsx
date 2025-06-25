import React from 'react';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { AlertTriangle, UploadCloud, Edit3, Trash2, ShieldCheck } from 'lucide-react';
    import { format, parseISO, isValid, differenceInDays } from 'date-fns';
    import { useToast } from '@/components/ui/use-toast.jsx';

    const HRDocumentList = ({ documents, onEdit, onDelete }) => {
      const { toast } = useToast();

      const getStatus = (expiryDateStr) => {
        if (!expiryDateStr) return { text: "No Date", class: "bg-gray-100 text-gray-700", days: Infinity };
        const expiryDate = parseISO(expiryDateStr);
        if (!isValid(expiryDate)) return { text: "Invalid Date", class: "bg-gray-100 text-gray-700", days: Infinity };
        
        const daysLeft = differenceInDays(expiryDate, new Date());

        if (daysLeft < 0) return { text: "Expired", class: "bg-red-100 text-red-700 font-bold", days: daysLeft };
        if (daysLeft <= 7) return { text: `Expires in ${daysLeft}d`, class: "bg-red-100 text-red-600", days: daysLeft };
        if (daysLeft <= 15) return { text: `Expires in ${daysLeft}d`, class: "bg-orange-100 text-orange-600", days: daysLeft };
        if (daysLeft <= 30) return { text: `Expires in ${daysLeft}d`, class: "bg-yellow-100 text-yellow-600", days: daysLeft };
        return { text: "Valid", class: "bg-green-100 text-green-700", days: daysLeft };
      };

      return (
        <div className="overflow-x-auto max-h-[calc(100vh-350px)]">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead>Staff Name</TableHead>
                <TableHead>Document Type</TableHead>
                <TableHead>Document No.</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.length > 0 ? documents.map(doc => {
                const status = getStatus(doc.expiryDate);
                return (
                  <TableRow key={doc.id} className={status.days < 0 ? "bg-red-50 hover:bg-red-100/70" : status.days <= 30 ? "bg-yellow-50 hover:bg-yellow-100/70" : ""}>
                    <TableCell className="font-medium">{doc.staffName}</TableCell>
                    <TableCell>{doc.documentType}</TableCell>
                    <TableCell>{doc.documentNumber}</TableCell>
                    <TableCell>{doc.expiryDate ? format(parseISO(doc.expiryDate), 'dd MMM yyyy') : 'N/A'}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${status.class}`}>
                        {status.text}
                        {status.days <= 30 && status.days >=0 && <AlertTriangle className="inline ml-1 h-3 w-3" />}
                      </span>
                    </TableCell>
                    <TableCell>{doc.insuranceProvider || 'N/A'}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => toast({title: "Upload Document", description: "File upload feature coming soon."})} className="text-gray-500 hover:text-gray-700 hover:bg-gray-100" title="Upload File">
                          <UploadCloud className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onEdit(doc)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-100" title="Edit Document">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(doc.id)} className="text-red-600 hover:text-red-700 hover:bg-red-100" title="Delete Document">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              }) : (
                  <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          <ShieldCheck className="mx-auto h-12 w-12 mb-2 text-gray-400" />
                          No documents found for current filters.
                      </TableCell>
                  </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      );
    };

    export default HRDocumentList;