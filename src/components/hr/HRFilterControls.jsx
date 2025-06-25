import React from 'react';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { Label } from '@/components/ui/label.jsx';
    import { ListFilter } from 'lucide-react';

    const HRFilterControls = ({
      filterType,
      setFilterType,
      filterStaff,
      setFilterStaff,
      documentTypes,
      mockStaffList,
      onGenerateReport
    }) => {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border rounded-lg bg-slate-50 shadow-sm items-end">
          <div>
            <Label htmlFor="filterDocType" className="text-sm font-medium">Filter by Document Type</Label>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger id="filterDocType" className="w-full mt-1">
                <SelectValue placeholder="All Document Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Document Types</SelectItem>
                {documentTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="filterStaffMember" className="text-sm font-medium">Filter by Staff Member</Label>
            <Select value={filterStaff} onValueChange={setFilterStaff}>
              <SelectTrigger id="filterStaffMember" className="w-full mt-1">
                <SelectValue placeholder="All Staff Members" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Staff Members</SelectItem>
                {mockStaffList.map(staff => <SelectItem key={staff.id} value={staff.id}>{staff.name} ({staff.id})</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" className="w-full lg:w-auto" onClick={onGenerateReport}>
            <ListFilter className="mr-2 h-4 w-4" /> Generate Report
          </Button>
        </div>
      );
    };

    export default HRFilterControls;