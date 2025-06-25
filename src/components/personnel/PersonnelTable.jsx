import React from 'react';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { Eye, Edit, Archive, Users, AlertTriangle, CheckCircle } from 'lucide-react';
    import { Link } from 'react-router-dom';
    import { format, parseISO, differenceInDays, isValid } from 'date-fns';

    const getDocumentStatus = (expiryDateStr) => {
        if (!expiryDateStr) return { text: "N/A", colorClass: "text-gray-500", icon: null, days: Infinity };
        const expiryDate = parseISO(expiryDateStr);
        if (!isValid(expiryDate)) return { text: "Invalid Date", colorClass: "text-gray-500", icon: null, days: Infinity };
        
        const daysLeft = differenceInDays(expiryDate, new Date());

        if (daysLeft < 0) return { text: "Expired", colorClass: "text-red-600 font-semibold", icon: <AlertTriangle className="inline h-4 w-4" />, days: daysLeft };
        if (daysLeft <= 30) return { text: `Expires in ${daysLeft}d`, colorClass: "text-orange-500", icon: <AlertTriangle className="inline h-4 w-4" />, days: daysLeft };
        return { text: "Valid", colorClass: "text-green-600", icon: <CheckCircle className="inline h-4 w-4" />, days: daysLeft };
    };

    const PersonnelTable = ({ staffList, onArchive }) => {
      if (!staffList || staffList.length === 0) {
        return (
          <div className="text-center text-muted-foreground py-10">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-2" />
            No personnel found matching your criteria.
          </div>
        );
      }

      return (
        <div className="overflow-x-auto max-h-[calc(100vh-450px)] custom-scrollbar">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
              <TableRow>
                <TableHead>Staff ID</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Overall Status</TableHead>
                <TableHead>Document Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staffList.map(staff => {
                const overallDocStatusList = staff.documents?.map(doc => getDocumentStatus(doc.expiry)) || [];
                const hasExpired = overallDocStatusList.some(s => s.days < 0);
                const hasExpiringSoon = overallDocStatusList.some(s => s.days >= 0 && s.days <= 30);
                let displayDocStatus;
                if (hasExpired) {
                  displayDocStatus = { text: "Expired", colorClass: "text-red-600 font-semibold", icon: <AlertTriangle className="inline h-4 w-4" /> };
                } else if (hasExpiringSoon) {
                  displayDocStatus = { text: "Expiring Soon", colorClass: "text-orange-500", icon: <AlertTriangle className="inline h-4 w-4" /> };
                } else if (staff.documents && staff.documents.length > 0) {
                  displayDocStatus = { text: "All Valid", colorClass: "text-green-600", icon: <CheckCircle className="inline h-4 w-4" /> };
                } else {
                  displayDocStatus = { text: "No Documents", colorClass: "text-gray-500", icon: null };
                }

                return (
                  <TableRow key={staff.id} className={staff.status === "Archived" ? "bg-gray-100 opacity-70" : ""}>
                    <TableCell className="font-mono text-xs">{staff.id}</TableCell>
                    <TableCell className="font-medium">{staff.fullName}</TableCell>
                    <TableCell>{staff.role}</TableCell>
                    <TableCell>{staff.department}</TableCell>
                    <TableCell>{staff.mobileNumber}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs rounded-full font-semibold ${
                        staff.status === "Active" ? "bg-green-100 text-green-700" :
                        staff.status === "Archived" ? "bg-gray-200 text-gray-600" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>
                        {staff.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${displayDocStatus.colorClass}`}>
                        {displayDocStatus.icon} {displayDocStatus.text}
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Link to={`/personnel-profile/${staff.id}`}>
                        <Button variant="ghost" size="icon" title="View Profile" className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link to={`/personnel-registration/${staff.id}`}>
                        <Button variant="ghost" size="icon" title="Edit Profile" className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-100 h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      {staff.status !== "Archived" && (
                          <Button variant="ghost" size="icon" title="Archive Staff" className="text-red-600 hover:text-red-700 hover:bg-red-100 h-8 w-8" onClick={() => onArchive(staff)}>
                              <Archive className="h-4 w-4" />
                          </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      );
    };

    export default PersonnelTable;