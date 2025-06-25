import React, { useState, useEffect } from 'react';
    import { Button } from '@/components/ui/button.jsx';
    import { Input } from '@/components/ui/input.jsx';
    import { Textarea } from '@/components/ui/textarea.jsx';
    import { Label } from '@/components/ui/label.jsx';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.jsx";
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog.jsx';
    import { useToast } from '@/components/ui/use-toast.jsx';

    const NoticeFormModal = ({ isOpen, onClose, onSubmit, editingNotice }) => {
      const { toast } = useToast();
      const [noticeFormData, setNoticeFormData] = useState({ title: '', content: '', department: 'All' });

      useEffect(() => {
        if (editingNotice) {
          setNoticeFormData({ title: editingNotice.title, content: editingNotice.content, department: editingNotice.department });
        } else {
          setNoticeFormData({ title: '', content: '', department: 'All' });
        }
      }, [editingNotice, isOpen]);

      const handleSubmitForm = () => {
        if (!noticeFormData.title || !noticeFormData.content) {
          toast({ variant: "destructive", title: "Missing Fields", description: "Please fill title and content for the notice." });
          return;
        }
        onSubmit(noticeFormData, editingNotice);
      };

      return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingNotice ? 'Edit' : 'Post New'} Notice</DialogTitle>
                <DialogDescription>
                  {editingNotice ? 'Update the existing notice details.' : 'Create a new announcement for staff.'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="noticeTitle">Title</Label>
                  <Input id="noticeTitle" value={noticeFormData.title} onChange={(e) => setNoticeFormData(prev => ({...prev, title: e.target.value}))} placeholder="Enter notice title" className="mt-1"/>
                </div>
                <div>
                  <Label htmlFor="noticeContent">Content</Label>
                  <Textarea id="noticeContent" value={noticeFormData.content} onChange={(e) => setNoticeFormData(prev => ({...prev, content: e.target.value}))} placeholder="Enter notice details" className="mt-1" rows={5}/>
                </div>
                 <div>
                  <Label htmlFor="noticeDepartment">Target Department</Label>
                  <Select value={noticeFormData.department} onValueChange={(value) => setNoticeFormData(prev => ({...prev, department: value}))}>
                    <SelectTrigger id="noticeDepartment" className="w-full mt-1">
                      <SelectValue placeholder="Select target department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Departments</SelectItem>
                      <SelectItem value="Medical Staff">Medical Staff (Doctors, Nurses)</SelectItem>
                      <SelectItem value="Ambulance Crew">Ambulance Crew</SelectItem>
                      <SelectItem value="Pharmacy">Pharmacy</SelectItem>
                      <SelectItem value="Admin">Admin Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="button" onClick={handleSubmitForm} className="bg-teal-600 hover:bg-teal-700">{editingNotice ? 'Save Changes' : 'Post Notice'}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
      );
    };
    export default NoticeFormModal;