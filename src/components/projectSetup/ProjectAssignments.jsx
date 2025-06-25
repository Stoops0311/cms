import React from 'react';
    import { Input } from '@/components/ui/input.jsx';
    import { Label } from '@/components/ui/label.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
    import { Card } from '@/components/ui/card.jsx';
    import { UserPlus, PlusCircle, Trash2 } from 'lucide-react';

    const SectionHeader = ({ title, icon: Icon, onAdd, addLabel }) => (
      <div className="flex justify-between items-center mb-3 border-b pb-2">
        <h3 className="text-lg font-semibold text-primary flex items-center">
          <Icon className="mr-2 h-5 w-5" />{title}
        </h3>
        {onAdd && <Button type="button" variant="outline" size="sm" onClick={onAdd} className="text-primary border-primary hover:bg-primary/10"><PlusCircle className="mr-2 h-4 w-4" />{addLabel}</Button>}
      </div>
    );

    const ProjectAssignments = ({ formData, handleAssignmentChange, addAssignment, removeAssignment }) => {
      return (
        <section>
          <SectionHeader title="Assignment Workflow" icon={UserPlus} onAdd={addAssignment} addLabel="Add Assignment" />
          {formData.assignments.map((assignment, index) => (
            <Card key={index} className="mb-4 p-4 bg-slate-50/50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <Label htmlFor={`assignmentRole-${index}`}>Role</Label>
                  <Select name="role" value={assignment.role} onValueChange={(value) => handleAssignmentChange(index, { target: { name: 'role', value } })}>
                    <SelectTrigger id={`assignmentRole-${index}`}><SelectValue placeholder="Select role" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Project Manager">Project Manager</SelectItem><SelectItem value="Site Engineer">Site Engineer</SelectItem>
                      <SelectItem value="Lead Contractor">Lead Contractor</SelectItem><SelectItem value="Sub-Contractor">Sub-Contractor</SelectItem>
                      <SelectItem value="Consultant">Consultant</SelectItem><SelectItem value="Safety Officer">Safety Officer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label htmlFor={`assignmentName-${index}`}>Name/Company</Label><Input id={`assignmentName-${index}`} name="name" value={assignment.name} onChange={(e) => handleAssignmentChange(index, e)} placeholder="Person or Company Name" /></div>
                <div><Label htmlFor={`assignmentContact-${index}`}>Contact Info</Label><Input id={`assignmentContact-${index}`} name="contact" value={assignment.contact} onChange={(e) => handleAssignmentChange(index, e)} placeholder="Email or Phone" /></div>
              </div>
              {formData.assignments.length > 1 && (
                <div className="text-right mt-2">
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeAssignment(index)} className="text-destructive hover:bg-destructive/10"><Trash2 className="mr-1 h-3 w-3" />Remove</Button>
                </div>
              )}
            </Card>
          ))}
        </section>
      );
    };
    export default ProjectAssignments;