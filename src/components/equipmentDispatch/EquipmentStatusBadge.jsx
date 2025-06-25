import React from 'react';
    import { Truck, CheckCircle, XCircle, Clock, Wrench } from 'lucide-react';

    const EquipmentStatusBadge = ({ status, type = "equipment" }) => {
      let colors = "bg-gray-100 text-gray-700";
      let Icon = Clock;

      if (type === "equipment") {
        if (status === "Available") { colors = "bg-green-100 text-green-700"; Icon = CheckCircle; }
        else if (status === "In Use") { colors = "bg-blue-100 text-blue-700"; Icon = Truck; }
        else if (status === "Maintenance") { colors = "bg-yellow-100 text-yellow-700"; Icon = Wrench; }
        else if (status === "Unavailable") { colors = "bg-red-100 text-red-700"; Icon = XCircle; }
      } else if (type === "dispatch") {
        if (status === "Pending") { colors = "bg-yellow-100 text-yellow-700"; Icon = Clock; }
        else if (status === "Approved") { colors = "bg-sky-100 text-sky-700"; Icon = CheckCircle; }
        else if (status === "Dispatched") { colors = "bg-blue-100 text-blue-700"; Icon = Truck; }
        else if (status === "Returned") { colors = "bg-green-100 text-green-700"; Icon = CheckCircle; }
        else if (status === "Cancelled") { colors = "bg-red-100 text-red-700"; Icon = XCircle; }
      }
      
      return <span className={`px-2 py-1 text-xs rounded-full font-medium inline-flex items-center ${colors}`}><Icon className="h-3 w-3 mr-1.5"/>{status || 'N/A'}</span>;
    };
    export default EquipmentStatusBadge;