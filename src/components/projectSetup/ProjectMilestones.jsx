import React from 'react';
    import { Input } from '@/components/ui/input.jsx';
    import { Label } from '@/components/ui/label.jsx';
    import { Textarea } from '@/components/ui/textarea.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { DatePicker } from '@/components/ui/date-picker.jsx';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
    import { Card } from '@/components/ui/card.jsx';
    import { Milestone, PlusCircle, Trash2 } from 'lucide-react';

    const SectionHeader = ({ title, icon: Icon, onAdd, addLabel }) => (
      <div className="flex justify-between items-center mb-3 border-b pb-2">
        <h3 className="text-lg font-semibold text-primary flex items-center">
          <Icon className="mr-2 h-5 w-5" />{title}
        </h3>
        {onAdd && <Button type="button" variant="outline" size="sm" onClick={onAdd} className="text-primary border-primary hover:bg-primary/10"><PlusCircle className="mr-2 h-4 w-4" />{addLabel}</Button>}
      </div>
    );

    const ProjectMilestones = ({ formData, handleMilestoneChange, addMilestone, removeMilestone }) => {
      return (
        <section>
          <SectionHeader title="Milestones & Deliverables" icon={Milestone} onAdd={addMilestone} addLabel="Add Milestone" />
          {formData.milestones.map((milestone, index) => (
            <Card key={index} className="mb-4 p-4 bg-slate-50/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label htmlFor={`milestoneTitle-${index}`}>Milestone Title</Label><Input id={`milestoneTitle-${index}`} value={milestone.title} onChange={(e) => handleMilestoneChange(index, 'title', e.target.value)} placeholder="e.g., Foundation Complete" /></div>
                <div><Label htmlFor={`milestoneDueDate-${index}`}>Due Date</Label><DatePicker date={milestone.dueDate} setDate={(date) => handleMilestoneChange(index, 'dueDate', date)} /></div>
              </div>
              <div className="mt-4">
                <Label htmlFor={`milestoneDesc-${index}`}>Description/Deliverables</Label>
                <Textarea id={`milestoneDesc-${index}`} value={milestone.description} onChange={(e) => handleMilestoneChange(index, 'description', e.target.value)} placeholder="Key deliverables for this milestone" />
              </div>
              <div className="mt-4">
                <Label htmlFor={`milestoneStatus-${index}`}>Status</Label>
                <Select value={milestone.status} onValueChange={(value) => handleMilestoneChange(index, 'status', value)}>
                  <SelectTrigger id={`milestoneStatus-${index}`}><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem><SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem><SelectItem value="Delayed">Delayed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.milestones.length > 1 && (
                <div className="text-right mt-2">
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeMilestone(index)} className="text-destructive hover:bg-destructive/10"><Trash2 className="mr-1 h-3 w-3" />Remove</Button>
                </div>
              )}
            </Card>
          ))}
        </section>
      );
    };
    export default ProjectMilestones;