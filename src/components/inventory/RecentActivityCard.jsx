import React from 'react';
    import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card.jsx';
    import { History } from 'lucide-react';

    const RecentActivityCard = ({ recentLogs }) => {
      return (
        <Card className="shadow-lg border-t-4 border-purple-500">
          <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10">
            <CardTitle className="text-xl font-semibold text-purple-600 flex items-center">
              <History className="mr-2 h-6 w-6" /> Recent Activity
            </CardTitle>
            <CardDescription>Last 5 inventory transactions.</CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-2 text-sm max-h-96 overflow-y-auto custom-scrollbar">
            {recentLogs.length > 0 ? recentLogs.map(log => (
              <div key={log.logId} className="p-2 border-b last:border-b-0 hover:bg-purple-50/50 rounded-md transition-colors">
                <p className="font-medium">{log.itemName}
                  <span className={`ml-2 font-bold ${log.quantityChanged < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ({log.quantityChanged > 0 ? `+${log.quantityChanged}` : log.quantityChanged})
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">{log.reason} - by {log.staffIssuing}</p>
                <p className="text-xs text-muted-foreground">
                  {log.type === 'transfer' ? `From: ${log.fromLocation} To: ${log.toLocation}` : `Location: ${log.location || 'N/A'}`}
                </p>
                <p className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</p>
              </div>
            )) : <p className="text-muted-foreground text-center py-4">No recent activity.</p>}
          </CardContent>
        </Card>
      );
    };

    export default RecentActivityCard;