import React, { useState } from 'react';
    import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
    import { Eye, Edit3, CheckCircle, XCircle, Clock, Truck } from 'lucide-react';
    import { format } from 'date-fns';
    import { useToast } from '@/components/ui/use-toast.jsx';

    const RequestStatusBadge = ({ status }) => {
      let bgColor = 'bg-gray-100';
      let textColor = 'text-gray-700';
      let Icon = Clock;

      switch (status) {
        case 'Pending':
          bgColor = 'bg-yellow-100'; textColor = 'text-yellow-700'; Icon = Clock;
          break;
        case 'Approved':
          bgColor = 'bg-blue-100'; textColor = 'text-blue-700'; Icon = CheckCircle;
          break;
        case 'Partially Fulfilled':
          bgColor = 'bg-indigo-100'; textColor = 'text-indigo-700'; Icon = Truck;
          break;
        case 'Fulfilled':
          bgColor = 'bg-green-100'; textColor = 'text-green-700'; Icon = CheckCircle;
          break;
        case 'Rejected':
          bgColor = 'bg-red-100'; textColor = 'text-red-700'; Icon = XCircle;
          break;
        default:
          break;
      }
      return (
        <span className={`px-2 py-1 text-xs rounded-full font-semibold ${bgColor} ${textColor} inline-flex items-center`}>
          <Icon className="h-3 w-3 mr-1" />
          {status}
        </span>
      );
    };


    const InventoryRequestList = ({ requests, onUpdateRequestStatus, onEditRequest, onViewRequestDetails }) => {
      const { toast } = useToast();
      const requestStatuses = ["Pending", "Approved", "Partially Fulfilled", "Fulfilled", "Rejected"];

      if (!requests || requests.length === 0) {
        return (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Inventory Requests</CardTitle>
              <CardDescription>No shortage requests found.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-4">Create a new request if you have shortages.</p>
            </CardContent>
          </Card>
        );
      }
      
      const handleStatusChange = (requestId, newStatus) => {
        onUpdateRequestStatus(requestId, newStatus);
        toast({ title: "Status Updated", description: `Request ${requestId} status changed to ${newStatus}.`});
      };

      return (
        <Card className="shadow-lg border-t-4 border-orange-500">
          <CardHeader className="bg-gradient-to-r from-orange-500/10 to-amber-500/10">
            <CardTitle className="text-xl font-semibold text-orange-600">Inventory Shortage Requests</CardTitle>
            <CardDescription>Track and manage requests for items from HQ.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Requesting Unit</TableHead>
                    <TableHead>Requested By</TableHead>
                    <TableHead>Items Summary</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.sort((a,b) => new Date(b.requestDate) - new Date(a.requestDate)).map(req => (
                    <TableRow key={req.id}>
                      <TableCell className="font-mono text-xs">{req.id}</TableCell>
                      <TableCell>{format(new Date(req.requestDate), 'dd MMM yyyy, HH:mm')}</TableCell>
                      <TableCell>{req.requestingUnit}</TableCell>
                      <TableCell>{req.requestedBy}</TableCell>
                      <TableCell className="text-xs">
                        {req.items.slice(0, 2).map(item => `${item.itemName} (${item.quantityRequested})`).join(', ')}
                        {req.items.length > 2 ? ', ...' : ''}
                      </TableCell>
                      <TableCell>
                        <Select value={req.status} onValueChange={(newStatus) => handleStatusChange(req.id, newStatus)}>
                            <SelectTrigger className="h-8 text-xs w-[150px] focus:ring-orange-500">
                                <SelectValue><RequestStatusBadge status={req.status} /></SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {requestStatuses.map(status => (
                                    <SelectItem key={status} value={status} className="text-xs">
                                        <RequestStatusBadge status={status} />
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => onViewRequestDetails(req)} title="View Details" className="text-blue-600 hover:text-blue-700 hover:bg-blue-100">
                          <Eye className="h-4 w-4" />
                        </Button>
                        { (req.status === "Pending" || req.status === "Approved") &&
                          <Button variant="ghost" size="icon" onClick={() => onEditRequest(req)} title="Edit Request" className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-100">
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      );
    };

    export default InventoryRequestList;