import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog.jsx';
import { Truck, PlusCircle, Edit2, Trash2, Search, Filter, CalendarDays } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import EquipmentForm from '@/components/equipmentDispatch/EquipmentForm.jsx';
import EquipmentStatusBadge from '@/components/equipmentDispatch/EquipmentStatusBadge.jsx';

const equipmentTypes = ["Excavator", "Bulldozer", "Crane", "Loader", "Dump Truck", "Concrete Mixer", "Generator", "Scaffolding", "Splicing Machine", "OTDR", "Cable Puller"];
const equipmentStatuses = ["Available", "In Use", "Maintenance", "Unavailable"];
const dispatchStatuses = ["Pending", "Approved", "Dispatched", "Returned", "Cancelled"];

const EquipmentDispatch = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Convex queries and mutations
  const equipmentList = useQuery(api.equipment.listEquipment) || [];
  const dispatchLog = useQuery(api.equipment.listDispatches) || [];
  const projects = useQuery(api.projects.listProjects) || [];
  
  const createEquipment = useMutation(api.equipment.createEquipment);
  const updateEquipment = useMutation(api.equipment.updateEquipment);
  const deleteEquipment = useMutation(api.equipment.deleteEquipment);
  const createDispatch = useMutation(api.equipment.createDispatch);
  const updateDispatch = useMutation(api.equipment.updateDispatch);
  const deleteDispatch = useMutation(api.equipment.deleteDispatch);
  
  const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All Types');
  const [filterStatus, setFilterStatus] = useState('All Statuses');

  const handleSaveEquipment = async (data) => {
    try {
      if (editingData && editingData._id && !editingData.dispatchId) { 
        await updateEquipment({ equipmentId: data._id, ...data });
        toast({ title: "Equipment Updated", description: `${data.name} details saved.` });
      } else { 
        await createEquipment({
          ...data,
          createdBy: user?.userId || "anonymous"
        });
        toast({ title: "Equipment Added", description: `${data.name} added to inventory.` });
      }
      setIsEquipmentModalOpen(false);
      setEditingData(null);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Could not save equipment. Please try again."
      });
    }
  };
  
  const handleSaveDispatch = async (data) => {
    try {
      if (editingData && editingData.dispatchId) { 
        await updateDispatch({ dispatchId: data.dispatchId, ...data });
        toast({ title: "Dispatch Updated", description: `Dispatch for ${data.equipmentName} updated.` });
      } else { 
        const dispatchData = {
          ...data,
          createdBy: user?.userId || "anonymous"
        };
        
        await createDispatch(dispatchData);
        
        // Update equipment status if needed
        const equipment = equipmentList.find(eq => eq._id === data.equipmentId);
        if (equipment && equipment.status === "Available" && (data.dispatchStatus === "Approved" || data.dispatchStatus === "Dispatched")) {
          await updateEquipment({
            equipmentId: data.equipmentId,
            status: "In Use"
          });
        }
        
        toast({ title: "Equipment Dispatched", description: `${data.equipmentName} scheduled for dispatch.` });
      }
      setIsDispatchModalOpen(false);
      setEditingData(null);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Dispatch Failed",
        description: "Could not process dispatch. Please try again."
      });
    }
  };

  const handleDeleteEquipment = async (id) => {
    if (window.confirm("Are you sure you want to delete this equipment?")) {
      try {
        await deleteEquipment({ equipmentId: id });
        toast({ title: "Equipment Deleted", variant: "destructive" });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Delete Failed",
          description: "Could not delete equipment. Please try again."
        });
      }
    }
  };
  
  const handleDeleteDispatch = async (dispatchId) => {
    if (window.confirm("Are you sure you want to delete this dispatch record?")) {
      try {
        await deleteDispatch({ dispatchId });
        toast({ title: "Dispatch Record Deleted", variant: "destructive" });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Delete Failed", 
          description: "Could not delete dispatch record. Please try again."
        });
      }
    }
  };

  const openEditEquipmentModal = (equipment) => {
    setEditingData(equipment);
    setIsEquipmentModalOpen(true);
  };
  
  const openEditDispatchModal = (dispatchEntry) => {
    setEditingData(dispatchEntry);
    setIsDispatchModalOpen(true);
  };

  const openNewDispatchModal = (equipment) => {
    setEditingData({
      equipmentId: equipment._id,
      equipmentName: equipment.name,
      equipmentType: equipment.equipmentType
    });
    setIsDispatchModalOpen(true);
  };

  const filteredEquipment = useMemo(() => {
    return equipmentList.filter(equipment => {
      const matchesSearchTerm = (
        equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        equipment.equipmentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (equipment.serialNumber && equipment.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      const matchesType = filterType === 'All Types' || equipment.equipmentType === filterType;
      const matchesStatus = filterStatus === 'All Statuses' || equipment.status === filterStatus;
      
      return matchesSearchTerm && matchesType && matchesStatus;
    });
  }, [equipmentList, searchTerm, filterType, filterStatus]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
      <Card className="shadow-xl border-t-4 border-orange-500">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <CardTitle className="text-2xl font-bold text-orange-700 flex items-center">
                <Truck className="mr-3 h-7 w-7"/>Equipment Dispatch Management
              </CardTitle>
              <CardDescription>Manage equipment inventory and dispatch operations for construction projects.</CardDescription>
            </div>
            <div className="flex space-x-2 mt-4 md:mt-0">
              <Button onClick={() => setIsEquipmentModalOpen(true)} className="bg-orange-600 hover:bg-orange-700">
                <PlusCircle className="mr-2 h-4 w-4" />Add Equipment
              </Button>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Search equipment..."
                className="pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Filter by Type" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Types">All Types</SelectItem>
                {equipmentTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Filter by Status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Statuses">All Statuses</SelectItem>
                {equipmentStatuses.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent>
          {filteredEquipment.length === 0 ? (
            <div className="text-center py-12">
              <Truck className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No Equipment Found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {equipmentList.length === 0 ? 'Start by adding your first equipment item.' : 'Try adjusting your search or filter criteria.'}
              </p>
              {equipmentList.length === 0 && (
                <Button onClick={() => setIsEquipmentModalOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />Add First Equipment
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Equipment Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Serial Number</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Last Maintained</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEquipment.map((equipment) => (
                    <TableRow key={equipment._id}>
                      <TableCell className="font-medium">{equipment.name}</TableCell>
                      <TableCell>{equipment.equipmentType}</TableCell>
                      <TableCell>{equipment.serialNumber || 'N/A'}</TableCell>
                      <TableCell>
                        <EquipmentStatusBadge status={equipment.status} />
                      </TableCell>
                      <TableCell>{equipment.currentLocation || 'Warehouse'}</TableCell>
                      <TableCell>{formatDate(equipment.lastMaintenance)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          {equipment.status === 'Available' && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => openNewDispatchModal(equipment)}
                              className="text-green-600 hover:text-green-800"
                            >
                              Dispatch
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => openEditEquipmentModal(equipment)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDeleteEquipment(equipment._id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Dispatches */}
      {dispatchLog.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarDays className="mr-2 h-5 w-5" />
              Recent Dispatches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Equipment</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Dispatch Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Operator</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dispatchLog.slice(0, 10).map((dispatch) => (
                    <TableRow key={dispatch._id}>
                      <TableCell className="font-medium">{dispatch.equipmentName}</TableCell>
                      <TableCell>{dispatch.projectName || 'N/A'}</TableCell>
                      <TableCell>{formatDate(dispatch.dispatchDate)}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          dispatch.dispatchStatus === 'Dispatched' ? 'bg-green-100 text-green-800' :
                          dispatch.dispatchStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          dispatch.dispatchStatus === 'Returned' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {dispatch.dispatchStatus}
                        </span>
                      </TableCell>
                      <TableCell>{dispatch.operatorName || 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => openEditDispatchModal(dispatch)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDeleteDispatch(dispatch._id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Equipment Modal */}
      <Dialog open={isEquipmentModalOpen} onOpenChange={setIsEquipmentModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingData?._id ? 'Edit Equipment' : 'Add New Equipment'}</DialogTitle>
            <DialogDescription>
              {editingData?._id ? 'Update equipment information' : 'Add a new piece of equipment to the inventory'}
            </DialogDescription>
          </DialogHeader>
          <EquipmentForm 
            equipment={editingData}
            onSave={handleSaveEquipment}
            onCancel={() => {
              setIsEquipmentModalOpen(false);
              setEditingData(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Dispatch Modal */}
      <Dialog open={isDispatchModalOpen} onOpenChange={setIsDispatchModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingData?.dispatchId ? 'Edit Dispatch' : 'New Equipment Dispatch'}</DialogTitle>
            <DialogDescription>
              {editingData?.dispatchId ? 'Update dispatch information' : 'Schedule equipment for dispatch to a project site'}
            </DialogDescription>
          </DialogHeader>
          <EquipmentForm 
            equipment={editingData}
            projects={projects}
            isDispatchMode={true}
            onSave={handleSaveDispatch}
            onCancel={() => {
              setIsDispatchModalOpen(false);
              setEditingData(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default EquipmentDispatch;