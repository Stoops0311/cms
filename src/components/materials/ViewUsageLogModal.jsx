import React from 'react';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
    import { Package, CalendarDays, FileText } from 'lucide-react';
    import { format } from 'date-fns';

    const ViewUsageLogModal = ({ isOpen, onClose, material, usageLog, projects }) => {
      if (!material) return null;

      const getProjectName = (projectId) => {
        const project = projects.find(p => p.id === projectId);
        return project ? project.projectName : 'N/A';
      };

      return (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Package className="mr-2 h-5 w-5 text-primary" />
                Usage Log: {material.name} ({material.sku})
              </DialogTitle>
              <DialogDescription>
                Detailed history of material usage for {material.name}. Current Stock: {material.quantity} {material.unit}.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 overflow-y-auto custom-scrollbar pr-2">
              {usageLog && usageLog.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead><CalendarDays className="inline-block mr-1 h-4 w-4" />Date</TableHead>
                      <TableHead>Quantity Used</TableHead>
                      <TableHead><FileText className="inline-block mr-1 h-4 w-4" />Project</TableHead>
                      <TableHead>Notes/Reference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usageLog.sort((a, b) => new Date(b.logDate) - new Date(a.logDate)).map((logEntry) => (
                      <TableRow key={logEntry.id}>
                        <TableCell>{format(new Date(logEntry.logDate), 'dd MMM yyyy, HH:mm')}</TableCell>
                        <TableCell>{logEntry.quantityUsed} {material.unit}</TableCell>
                        <TableCell>{getProjectName(logEntry.projectId)}</TableCell>
                        <TableCell className="max-w-xs truncate" title={logEntry.notes}>{logEntry.notes || 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-6">No usage logged for this material yet.</p>
              )}
            </div>
            <DialogFooter>
              <Button onClick={onClose}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    };

    export default ViewUsageLogModal;