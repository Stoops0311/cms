import React, { useState, useMemo } from 'react';
    import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { Input } from '@/components/ui/input.jsx';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
    import { PackageSearch, AlertTriangle, QrCode, Edit2, Trash2, SortAsc, SortDesc, PlusCircle, ArrowRightLeft } from 'lucide-react';
    import { format, differenceInDays, parseISO } from 'date-fns';
    import { useToast } from '@/components/ui/use-toast.jsx';
    import {
      Select,
      SelectContent,
      SelectItem,
      SelectTrigger,
      SelectValue,
    } from "@/components/ui/select.jsx"


    const InventoryList = ({ inventory, onEdit, onDelete, onLogUsage, onTransfer }) => {
      const { toast } = useToast();
      const [searchTerm, setSearchTerm] = useState('');
      const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
      const [filterLocation, setFilterLocation] = useState('all_locations'); // Default to "all_locations"

      const uniqueLocations = useMemo(() => {
        const locations = new Set(inventory.map(item => item.location));
        return ["all_locations", ...Array.from(locations)]; // Use "all_locations" as the value for "All Locations"
      }, [inventory]);


      const filteredInventory = useMemo(() => {
        let sortableItems = [...inventory];
        if (filterLocation && filterLocation !== "all_locations") { // Check against "all_locations"
            sortableItems = sortableItems.filter(item => item.location === filterLocation);
        }
        if (sortConfig.key !== null) {
          sortableItems.sort((a, b) => {
            const valA = typeof a[sortConfig.key] === 'string' ? a[sortConfig.key].toLowerCase() : a[sortConfig.key];
            const valB = typeof b[sortConfig.key] === 'string' ? b[sortConfig.key].toLowerCase() : b[sortConfig.key];
            if (valA < valB) {
              return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (valA > valB) {
              return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
          });
        }
        return sortableItems.filter(item =>
          (item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.batchNo.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }, [inventory, searchTerm, sortConfig, filterLocation]);

      const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
          direction = 'descending';
        }
        setSortConfig({ key, direction });
      };

      const getSortIndicator = (key) => {
        if (sortConfig.key === key) {
          return sortConfig.direction === 'ascending' ? <SortAsc className="h-4 w-4 inline ml-1" /> : <SortDesc className="h-4 w-4 inline ml-1" />;
        }
        return null;
      };

      return (
        <Card className="shadow-lg border-t-4 border-primary h-full">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-blue-500/10">
            <CardTitle className="text-xl font-semibold text-primary flex items-center">
              <PackageSearch className="mr-2 h-6 w-6" /> Current Inventory
            </CardTitle>
            <CardDescription>View, manage stock levels, log usage, and transfer items.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <Input 
                placeholder="Search by name or batch no..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-grow"
              />
              <Select value={filterLocation} onValueChange={setFilterLocation}>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by location" />
                </SelectTrigger>
                <SelectContent>
                    {uniqueLocations.map(loc => (
                        <SelectItem key={loc} value={loc}>
                            {loc === "all_locations" ? 'All Locations' : loc}
                        </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Button variant="outline" className="w-full sm:w-auto" onClick={() => toast({title: "QR Scan", description: "QR Code scanning feature coming soon!"})}>
                <QrCode className="mr-2 h-4 w-4"/> Scan Item
              </Button>
            </div>
            <div className="overflow-x-auto max-h-[calc(100vh-300px)]">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    <TableHead onClick={() => requestSort('name')} className="cursor-pointer hover:bg-muted/50">Name {getSortIndicator('name')}</TableHead>
                    <TableHead onClick={() => requestSort('quantity')} className="cursor-pointer hover:bg-muted/50">Qty {getSortIndicator('quantity')}</TableHead>
                    <TableHead>Batch No.</TableHead>
                    <TableHead onClick={() => requestSort('expiryDate')} className="cursor-pointer hover:bg-muted/50">Expiry {getSortIndicator('expiryDate')}</TableHead>
                    <TableHead onClick={() => requestSort('location')} className="cursor-pointer hover:bg-muted/50">Location {getSortIndicator('location')}</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventory.length > 0 ? filteredInventory.map(item => {
                    const daysToExpiry = item.expiryDate ? differenceInDays(parseISO(item.expiryDate), new Date()) : null;
                    const isLowStock = item.quantity < item.lowStockThreshold;
                    const isExpiringSoon = daysToExpiry !== null && daysToExpiry <= 30 && daysToExpiry > 0;
                    const isExpired = daysToExpiry !== null && daysToExpiry <= 0;

                    let statusClass = "bg-slate-100 text-slate-700";
                    let statusText = "Nominal";
                    if (isExpired) {
                        statusClass = "text-red-600 bg-red-100"; statusText = "Expired";
                    } else if (isExpiringSoon) {
                        statusClass = "text-orange-600 bg-orange-100"; statusText = `Expires in ${daysToExpiry}d`;
                    } else if (isLowStock) {
                        statusClass = "text-yellow-600 bg-yellow-100"; statusText = "Low Stock";
                    }

                    return (
                      <TableRow key={item.id} className={`${isExpired ? "bg-red-50 hover:bg-red-100" : ""} ${isLowStock && !isExpired ? "bg-yellow-50 hover:bg-yellow-100" : ""}`}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className={isLowStock && !isExpired ? "font-bold" : ""}>{item.quantity}</TableCell>
                        <TableCell>{item.batchNo}</TableCell>
                        <TableCell className={isExpired ? "font-semibold" : (isExpiringSoon ? "font-semibold" : "")}>
                            {item.expiryDate ? format(parseISO(item.expiryDate), 'dd MMM yyyy') : 'N/A'}
                        </TableCell>
                        <TableCell>{item.location}</TableCell>
                        <TableCell>
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${statusClass}`}>
                                {statusText}
                            </span>
                            {isLowStock && !isExpired && !isExpiringSoon && <AlertTriangle className="inline ml-1 h-4 w-4 text-yellow-600" />}
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                            <Button variant="ghost" size="icon" onClick={() => onLogUsage(item)} className="text-teal-600 hover:text-teal-700 hover:bg-teal-100" title="Log Usage">
                                <PlusCircle className="h-4 w-4" />
                            </Button>
                             <Button variant="ghost" size="icon" onClick={() => onTransfer(item)} className="text-sky-600 hover:text-sky-700 hover:bg-sky-100" title="Transfer Item">
                                <ArrowRightLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => onEdit(item)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-100" title="Edit Item">
                                <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => onDelete(item.id)} className="text-red-600 hover:text-red-700 hover:bg-red-100" title="Delete Item">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </TableCell>
                      </TableRow>
                    );
                  }) : (
                    <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                            <PackageSearch className="mx-auto h-12 w-12 mb-2 text-gray-400" />
                            No inventory items found for current filters.
                        </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      );
    };

    export default InventoryList;