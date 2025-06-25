import React from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { Edit, Trash2, Briefcase, Star, FileText } from 'lucide-react';

    const ContractorList = ({ contractors, onEdit, onDelete }) => {
        if (!contractors || contractors.length === 0) {
            return (
                <Card className="mt-8">
                    <CardContent className="pt-6">
                        <p className="text-muted-foreground text-center">No contractors or consultants registered yet.</p>
                    </CardContent>
                </Card>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {contractors.map(contractor => (
                    <Card key={contractor.id} className="shadow-lg hover:shadow-xl transition-shadow flex flex-col">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-lg font-semibold text-primary flex items-center">
                                    <Briefcase className="mr-2 h-5 w-5" />{contractor.companyName}
                                </CardTitle>
                                {contractor.rating && (
                                    <div className="flex items-center text-sm text-yellow-500">
                                        <Star className="h-4 w-4 mr-1 fill-current" /> {contractor.rating}/5
                                    </div>
                                )}
                            </div>
                            <CardDescription className="text-xs text-muted-foreground">{contractor.businessLicense}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm flex-grow">
                            <p><span className="font-medium">Categories:</span> {contractor.categories.join(', ')}</p>
                            <p><span className="font-medium">Contact:</span> {contractor.contactPerson || 'N/A'} ({contractor.email || 'N/A'})</p>
                            <p><span className="font-medium">Nationality:</span> {contractor.nationality}</p>
                            {contractor.documents && contractor.documents.length > 0 && (
                                <div className="pt-1">
                                    <p className="font-medium text-xs flex items-center"><FileText className="h-3 w-3 mr-1"/>Documents:</p>
                                    <ul className="list-disc list-inside pl-2 text-xs">
                                        {contractor.documents.map(doc => <li key={doc.id} className="truncate" title={doc.name}>{doc.name}</li>)}
                                    </ul>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="flex justify-end space-x-2 border-t pt-4">
                            <Button variant="outline" size="sm" onClick={() => onEdit(contractor)}>
                                <Edit className="mr-1 h-3 w-3" /> Edit
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => onDelete(contractor.id)}>
                                <Trash2 className="mr-1 h-3 w-3" /> Delete
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        );
    };

    export default ContractorList;