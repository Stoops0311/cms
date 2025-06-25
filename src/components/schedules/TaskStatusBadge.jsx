import React from 'react';
    import { Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

    const TaskStatusBadge = ({ status }) => {
      let colors = "bg-gray-100 text-gray-700";
      let Icon = Clock;
      if (status === "Pending") { colors = "bg-yellow-100 text-yellow-700"; Icon = Clock; }
      else if (status === "In Progress") { colors = "bg-blue-100 text-blue-700"; Icon = Clock; }
      else if (status === "Completed") { colors = "bg-green-100 text-green-700"; Icon = CheckCircle; }
      else if (status === "Blocked") { colors = "bg-red-100 text-red-700"; Icon = XCircle; }
      else if (status === "On Hold") { colors = "bg-orange-100 text-orange-700"; Icon = AlertTriangle; }
      return <span className={`px-2 py-1 text-xs rounded-full font-medium inline-flex items-center ${colors}`}><Icon className="h-3 w-3 mr-1.5"/>{status || 'N/A'}</span>;
    };
    export default TaskStatusBadge;