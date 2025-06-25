import React, { useState, useMemo } from 'react';
    import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { Input } from '@/components/ui/input.jsx';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
    import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog.jsx';
    import { Package, PackagePlus, Edit2, Trash2, Search, Filter, AlertTriangle, History } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast.jsx';
    import useLocalStorage from '@/hooks/useLocalStorage.jsx';
    import { motion } from 'framer-motion';
    import MaterialForm, { materialCategories, mockLocations, materialUnits } from '@/components/materials/MaterialForm.jsx';
    import LogUsageForm from '@/components/materials/LogUsageForm.jsx';
    import ViewUsageLogModal from '@/components/materials/ViewUsageLogModal.jsx';

    const MaterialsInventory = () => {
      const [materials, setMaterials] = useLocalStorage('cmsMaterials', []);
      const [usageLog, setUsageLog] = useLocalStorage('cmsMaterialUsageLog', []);
      const [projects] = useLocalStorage('projects', []);
      const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
      const [isLogUsageModalOpen, setIsLogUsageModalOpen] = useState(false);
      const [isViewLogModalOpen, setIsViewLogModalOpen] = useState(false);
      const [editingMaterial, setEditingMaterial] = useState(null);
      const [loggingUsageFor, setLoggingUsageFor] = useState(null);
      const [viewingLogFor, setViewingLogFor] = useState(null);
      const [searchTerm, setSearchTerm] = useState('');
      const [filterCategory, setFilterCategory] = useState('All Categories');
      const [filterLocation, setFilterLocation] = useState('All Locations');
      const { toast } = useToast();

      const handleSaveMaterial = (data) => {
        if (editingMaterial) {
          setMaterials(prev => prev.map(m => m.id === data.id ? data : m));
          toast({ title: "Material Updated", description: `${data.name} details have been updated.` });
        } else {
          setMaterials(prev => [...prev, data]);
          toast({ title: "Material Added", description: `${data.name} has been added to inventory.` });
        }
        setIsMaterialModalOpen(false);
        setEditingMaterial(null);
      };

      const handleDeleteMaterial = (id) => {
        const materialToDelete = materials.find(m => m.id === id);
        if (window.confirm(`Are you sure you want to delete ${materialToDelete?.name || 'this material'}? This action cannot be undone.`)) {
          setMaterials(prev => prev.filter(m => m.id !== id));
          toast({ title: "Material Deleted", description: `${materialToDelete?.name || 'Material'} has been removed.`, variant: "destructive" });
        }
      };
      
      const handleLogUsage = (logData) => {
        setMaterials(prevMaterials => prevMaterials.map(m => 
          m.id === logData.materialId 
          ? {...m, quantity: Math.max(0, m.quantity - logData.quantityUsed) } // Ensure quantity doesn't go below zero
          : m
        ));
        setUsageLog(prevLog => [{...logData, id: `LOG-${Date.now()}`, logDate: new Date().toISOString()}, ...prevLog]);
        toast({ title: "Usage Logged", description: `${logData.quantityUsed} ${loggingUsageFor?.unit} of ${loggingUsageFor?.name} logged.` });
        setIsLogUsageModalOpen(false);
        setLoggingUsageFor(null);
      };

      const openEditMaterialModal = (material) => {
        setEditingMaterial(material);
        setIsMaterialModalOpen(true);
      };
      
      const openLogUsageModal = (material) => {
        setLoggingUsageFor(material);
        setIsLogUsageModalOpen(true);
      };

      const openViewLogModal = (material) => {
        setViewingLogFor(material);
        setIsViewLogModalOpen(true);
      }

      const filteredMaterials = useMemo(() => {
        return materials.filter(m => 
          (m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.sku.toLowerCase().includes(searchTerm.toLowerCase())) &&
          (filterCategory === 'All Categories' || m.category === filterCategory) &&
          (filterLocation === 'All Locations' || m.location === filterLocation)
        ).sort((a,b) => a.name.localeCompare(b.name));
      }, [materials, searchTerm, filterCategory, filterLocation]);

      return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-8">
          <Card className="shadow-xl border-t-4 border-green-600">
            <CardHeader className="bg-gradient-to-r from-green-600/10 to-emerald-600/10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <CardTitle className="text-2xl font-bold text-green-700 flex items-center"><Package className="mr-3 h-7 w-7" />Materials Inventory</CardTitle>
                  <CardDescription>Track and manage construction materials stock across all locations.</CardDescription>
                </div>
                <Button onClick={() => { setEditingMaterial(null); setIsMaterialModalOpen(true); }} className="mt-4 md:mt-0 bg-green-600 hover:bg-green-700">
                  <PackagePlus className="mr-2 h-4 w-4" /> Add New Material
                </Button>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input placeholder="Search by name or SKU..." className="pl-10 w-full" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger><div className="flex items-center"><Filter className="mr-2 h-4 w-4 text-muted-foreground" /> <SelectValue placeholder="Filter by Category" /></div></SelectTrigger>
                  <SelectContent>{['All Categories', ...materialCategories].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={filterLocation} onValueChange={setFilterLocation}>
                  <SelectTrigger><div className="flex items-center"><Filter className="mr-2 h-4 w-4 text-muted-foreground" /> <SelectValue placeholder="Filter by Location" /></div></SelectTrigger>
                  <SelectContent>{['All Locations', ...mockLocations].map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead><TableHead>SKU</TableHead><TableHead>Category</TableHead>
                      <TableHead>Quantity</TableHead><TableHead>Unit</TableHead><TableHead>Location</TableHead>
                      <TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMaterials.length === 0 && (
                        <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No materials found. Adjust filters or add new materials.</TableCell></TableRow>
                    )}
                    {filteredMaterials.map(mat => {
                      const isLowStock = mat.quantity < mat.lowStockThreshold;
                      return (
                        <TableRow key={mat.id} className={`hover:bg-muted/50 ${isLowStock ? 'bg-yellow-500/10' : ''}`}>
                          <TableCell className="font-medium">{mat.name}</TableCell><TableCell>{mat.sku}</TableCell><TableCell>{mat.category}</TableCell>
                          <TableCell className={isLowStock ? 'font-bold text-orange-600' : ''}>{mat.quantity}</TableCell>
                          <TableCell>{mat.unit}</TableCell><TableCell>{mat.location}</TableCell>
                          <TableCell>
                            {isLowStock && <span className="px-2 py-1 text-xs rounded-full font-medium bg-yellow-100 text-yellow-700 inline-flex items-center"><AlertTriangle className="h-3 w-3 mr-1"/>Low Stock</span>}
                            {!isLowStock && <span className="px-2 py-1 text-xs rounded-full font-medium bg-green-100 text-green-700">In Stock</span>}
                          </TableCell>
                          <TableCell className="text-right space-x-1">
                            <Button variant="outline" size="xs" onClick={() => openLogUsageModal(mat)} className="text-xs">Log Usage</Button>
                            <Button variant="ghost" size="icon" onClick={() => openViewLogModal(mat)} title="View Usage Log"><History className="h-4 w-4 text-blue-600" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => openEditMaterialModal(mat)} title="Edit"><Edit2 className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteMaterial(mat.id)} title="Delete"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            {filteredMaterials.length > 0 && (
                 <CardFooter className="p-4 border-t text-sm text-muted-foreground">
                    Showing {filteredMaterials.length} of {materials.length} total material types.
                </CardFooter>
            )}
          </Card>

          <Dialog open={isMaterialModalOpen} onOpenChange={(open) => { if(!open) { setEditingMaterial(null); setIsMaterialModalOpen(false); } else { setIsMaterialModalOpen(true); }}}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingMaterial ? 'Edit Material Details' : 'Add New Material to Inventory'}</DialogTitle>
              </DialogHeader>
              <MaterialForm onSubmit={handleSaveMaterial} initialData={editingMaterial || {}} onCancel={() => { setIsMaterialModalOpen(false); setEditingMaterial(null); }} />
            </DialogContent>
          </Dialog>
          
          <Dialog open={isLogUsageModalOpen} onOpenChange={(open) => { if(!open) { setLoggingUsageFor(null); setIsLogUsageModalOpen(false); } else { setIsLogUsageModalOpen(true); }}}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Log Material Usage: {loggingUsageFor?.name}</DialogTitle>
              </DialogHeader>
              {loggingUsageFor && <LogUsageForm item={loggingUsageFor} onSubmit={handleLogUsage} projects={projects} onCancel={() => { setIsLogUsageModalOpen(false); setLoggingUsageFor(null); }} />}
            </DialogContent>
          </Dialog>

          {viewingLogFor && (
            <ViewUsageLogModal 
                isOpen={isViewLogModalOpen} 
                onClose={() => { setIsViewLogModalOpen(false); setViewingLogFor(null); }} 
                material={viewingLogFor} 
                usageLog={usageLog.filter(log => log.materialId === viewingLogFor.id)}
                projects={projects}
            />
          )}

        </motion.div>
      );
    };

    export default MaterialsInventory;