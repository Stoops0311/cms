import React from 'react';
    import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.jsx';
    import { Phone, Mail, Briefcase, MapPin, AlertTriangle, CheckCircle, Edit, Archive, Eye } from 'lucide-react';
    import { Link } from 'react-router-dom';
    import { format, parseISO, differenceInDays, isValid } from 'date-fns';

    const getInitials = (name) => {
        if (!name) return "?";
        const names = name.split(' ');
        if (names.length === 1) return names[0].charAt(0).toUpperCase();
        return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
    };
    
    const getDocumentStatus = (expiryDateStr) => {
        if (!expiryDateStr) return { text: "N/A", colorClass: "text-gray-500", icon: null, days: Infinity };
        const expiryDate = parseISO(expiryDateStr);
        if (!isValid(expiryDate)) return { text: "Invalid Date", colorClass: "text-gray-500", icon: null, days: Infinity };
        
        const daysLeft = differenceInDays(expiryDate, new Date());

        if (daysLeft < 0) return { text: "Expired", colorClass: "text-red-600 font-semibold", icon: <AlertTriangle className="inline h-3 w-3 mr-1" />, days: daysLeft };
        if (daysLeft <= 30) return { text: `Expires in ${daysLeft}d`, colorClass: "text-orange-500", icon: <AlertTriangle className="inline h-3 w-3 mr-1" />, days: daysLeft };
        return { text: "Valid", colorClass: "text-green-600", icon: <CheckCircle className="inline h-3 w-3 mr-1" />, days: daysLeft };
    };


    const PersonnelCard = ({ staff, onArchive }) => {
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
            <Card className={`shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col ${staff.status === "Archived" ? "bg-slate-100 opacity-75" : "bg-white"}`}>
                <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={staff.profileImageUrl || `https://api.dicebear.com/6.x/initials/svg?seed=${staff.fullName}`} alt={staff.fullName} />
                            <AvatarFallback>{getInitials(staff.fullName)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-lg font-semibold text-primary">{staff.fullName}</CardTitle>
                            <p className="text-xs text-muted-foreground">{staff.id} | {staff.role}</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-2 text-xs flex-grow">
                    <p className="flex items-center"><Briefcase className="h-3.5 w-3.5 mr-2 text-muted-foreground" /> Department: {staff.department}</p>
                    <p className="flex items-center"><MapPin className="h-3.5 w-3.5 mr-2 text-muted-foreground" /> Location: {staff.assignedLocation}</p>
                    {staff.email && <p className="flex items-center truncate" title={staff.email}><Mail className="h-3.5 w-3.5 mr-2 text-muted-foreground" /> {staff.email}</p>}
                    {staff.mobileNumber && <p className="flex items-center"><Phone className="h-3.5 w-3.5 mr-2 text-muted-foreground" /> {staff.mobileNumber}</p>}
                     <div className="pt-1">
                        <span className={`px-1.5 py-0.5 text-xs rounded-full font-medium ${ displayDocStatus.colorClass } ${displayDocStatus.colorClass.replace('text-', 'bg-').replace('-600', '-100').replace('-500', '-100')}`}>
                            {displayDocStatus.icon} {displayDocStatus.text}
                        </span>
                        <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full font-semibold ${
                            staff.status === "Active" ? "bg-green-100 text-green-700" :
                            staff.status === "Archived" ? "bg-gray-200 text-gray-600" :
                            "bg-yellow-100 text-yellow-700"
                        }`}>
                            {staff.status}
                        </span>
                    </div>
                     {staff.status === "Archived" && staff.archiveReason && (
                        <p className="text-xs italic text-red-500 mt-1">Archived: {staff.archiveReason}</p>
                    )}
                </CardContent>
                <CardFooter className="p-3 border-t flex justify-end space-x-1">
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
                </CardFooter>
            </Card>
        );
    };
    export default PersonnelCard;