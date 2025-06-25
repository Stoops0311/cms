import React, { useState } from 'react';
    import { Button } from '@/components/ui/button.jsx';
    import { Input } from '@/components/ui/input.jsx';
    import { Label } from '@/components/ui/label.jsx';
    import { Textarea } from '@/components/ui/textarea.jsx';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog.jsx';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
    import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card.jsx';
    import { Link2, PlusCircle, Edit2, Trash2, FolderOpen, ExternalLink } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast.jsx';
    import { motion } from 'framer-motion';
    import { format } from 'date-fns';

    const linkCategories = ["Blueprints & Drawings", "As-Built Documents", "Site Photos & Videos", "Contracts & Agreements", "Permits & Licenses", "Progress Reports", "Material Specifications", "Equipment Manuals", "Safety Documentation", "Meeting Minutes", "Financial Reports", "Correspondence", "Other"];
    const MAX_LINKS = 200;

    const CloudDriveLinkForm = ({ onSubmit, initialData = {}, onCancel }) => {
        const [linkName, setLinkName] = useState(initialData.linkName || '');
        const [url, setUrl] = useState(initialData.url || '');
        const [category, setCategory] = useState(initialData.category || linkCategories[0]);
        const [description, setDescription] = useState(initialData.description || '');
        const [version, setVersion] = useState(initialData.version || '');
        const [tags, setTags] = useState(initialData.tags ? initialData.tags.join(', ') : '');
        const { toast } = useToast();

        const handleSubmit = (e) => {
            e.preventDefault();
            if (!linkName || !url || !category) {
                toast({ variant: "destructive", title: "Missing Fields", description: "Link Name, URL and Category are required." });
                return;
            }
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                toast({ variant: "destructive", title: "Invalid URL", description: "URL must start with http:// or https://" });
                return;
            }
            onSubmit({
                id: initialData.id || `LINK-${Date.now().toString(36).substr(2, 9)}`,
                linkName, url, category, description, version,
                tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
                addedDate: initialData.addedDate || new Date().toISOString(),
                lastModified: new Date().toISOString()
            });
        };

        return (
            <form onSubmit={handleSubmit} className="space-y-4">
                <div><Label htmlFor="linkName-drive">Link Name / Title</Label><Input id="linkName-drive" value={linkName} onChange={e => setLinkName(e.target.value)} placeholder="e.g., Site Plan Rev C, Electrical Schematics"/></div>
                <div><Label htmlFor="url-drive">URL (Google Drive, Dropbox, SharePoint, etc.)</Label><Input id="url-drive" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://docs.google.com/..."/></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="category-drive">Category</Label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger id="category-drive"><SelectValue placeholder="Select Category"/></SelectTrigger>
                            <SelectContent>{linkCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                    <div><Label htmlFor="version-drive">Version (Optional)</Label><Input id="version-drive" value={version} onChange={e => setVersion(e.target.value)} placeholder="e.g., v1.2, Rev D"/></div>
                </div>
                <div><Label htmlFor="description-drive">Description (Optional)</Label><Textarea id="description-drive" value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description of the link content, e.g., Final approved blueprints for Sector A." rows={3}/></div>
                <div><Label htmlFor="tags-drive">Tags (Comma-separated, Optional)</Label><Input id="tags-drive" value={tags} onChange={e => setTags(e.target.value)} placeholder="e.g., blueprint, electrical, sector-a, approved"/></div>
                <DialogFooter className="pt-2">
                    <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                    <Button type="submit">{initialData.id ? 'Update Link' : 'Add Link'}</Button>
                </DialogFooter>
            </form>
        );
    };


    const ProjectCloudDriveLinksTab = ({ project, updateProjectData }) => {
        const [isModalOpen, setIsModalOpen] = useState(false);
        const [editingLink, setEditingLink] = useState(null);
        const { toast } = useToast();
        
        const driveLinks = project.driveLinks || [];

        const handleSaveLink = (linkData) => {
            let updatedLinks;
            if (editingLink) {
                updatedLinks = driveLinks.map(link => link.id === linkData.id ? linkData : link);
            } else {
                if (driveLinks.length >= MAX_LINKS) {
                    toast({ variant: "destructive", title: "Limit Reached", description: `Maximum of ${MAX_LINKS} drive links per project.` });
                    return;
                }
                updatedLinks = [...driveLinks, linkData];
            }
            updateProjectData({ driveLinks: updatedLinks });
            toast({ title: editingLink ? "Drive Link Updated" : "Drive Link Added", description: `Link "${linkData.linkName}" has been saved.` });
            setIsModalOpen(false);
            setEditingLink(null);
        };

        const handleDeleteLink = (linkId) => {
            const linkToDelete = driveLinks.find(link => link.id === linkId);
            if (window.confirm(`Are you sure you want to delete the link "${linkToDelete?.linkName || 'this link'}"? This action cannot be undone.`)) {
                const updatedLinks = driveLinks.filter(link => link.id !== linkId);
                updateProjectData({ driveLinks: updatedLinks });
                toast({ title: "Drive Link Deleted", variant: "destructive" });
            }
        };
        
        const openEditModal = (link) => {
            setEditingLink(link);
            setIsModalOpen(true);
        };

        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="space-y-6">
                <Card className="shadow-lg border-t-4 border-blue-500">
                    <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div>
                            <CardTitle className="text-xl flex items-center"><Link2 className="mr-2 h-5 w-5 text-primary"/>Cloud Drive Links Management</CardTitle>
                            <CardDescription>Organize and access all project-related documents stored in cloud drives. Maximum of {MAX_LINKS} links.</CardDescription>
                        </div>
                        <Button 
                            onClick={() => { setEditingLink(null); setIsModalOpen(true); }} 
                            disabled={driveLinks.length >= MAX_LINKS} 
                            className="bg-blue-600 hover:bg-blue-700 text-white mt-4 md:mt-0"
                        >
                            <PlusCircle className="mr-2 h-4 w-4"/>Add New Link
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {driveLinks.length === 0 ? (
                            <div className="text-center py-10">
                                <FolderOpen className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                                <p className="text-muted-foreground">No cloud drive links have been added for this project yet.</p>
                                <p className="text-sm text-gray-500">Click "Add New Link" to get started.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name / Title</TableHead><TableHead>Category</TableHead>
                                            <TableHead>Version</TableHead><TableHead>Last Modified</TableHead>
                                            <TableHead>Tags</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {driveLinks.sort((a,b) => new Date(b.lastModified) - new Date(a.lastModified)).map(link => (
                                            <TableRow key={link.id} className="hover:bg-slate-50">
                                                <TableCell className="font-medium">
                                                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center" title={link.description || link.linkName}>
                                                        <ExternalLink className="mr-1.5 h-3.5 w-3.5 flex-shrink-0"/>{link.linkName}
                                                    </a>
                                                </TableCell>
                                                <TableCell>{link.category}</TableCell>
                                                <TableCell>{link.version || 'N/A'}</TableCell>
                                                <TableCell>{format(new Date(link.lastModified), 'dd MMM yyyy, HH:mm')}</TableCell>
                                                <TableCell className="max-w-xs">
                                                    {link.tags && link.tags.length > 0 ? 
                                                        link.tags.map(tag => <span key={tag} className="text-xs bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-full mr-1 mb-1 inline-block">{tag}</span>) 
                                                        : <span className="text-xs text-muted-foreground">No tags</span>}
                                                </TableCell>
                                                <TableCell className="text-right space-x-1">
                                                    <Button variant="ghost" size="icon" onClick={() => openEditModal(link)} title="Edit Link Details"><Edit2 className="h-4 w-4"/></Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteLink(link.id)} title="Delete Link"><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="text-sm text-muted-foreground pt-4 border-t">
                        Total links stored: {driveLinks.length} / {MAX_LINKS}.
                    </CardFooter>
                </Card>

                <Dialog open={isModalOpen} onOpenChange={(open) => { if(!open) { setEditingLink(null); setIsModalOpen(false); } else { setIsModalOpen(true); }}}>
                    <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <DialogHeader>
                            <DialogTitle>{editingLink ? 'Edit Cloud Drive Link' : 'Add New Cloud Drive Link'}</DialogTitle>
                            <DialogDescription>Provide the details for the cloud-stored document or folder.</DialogDescription>
                        </DialogHeader>
                        <CloudDriveLinkForm onSubmit={handleSaveLink} initialData={editingLink || {}} onCancel={() => { setIsModalOpen(false); setEditingLink(null); }}/>
                    </DialogContent>
                </Dialog>
            </motion.div>
        );
    };

    export default ProjectCloudDriveLinksTab;