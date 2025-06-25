import React, {useState, useEffect} from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
    import { CheckCircle, XCircle, Clock, WifiOff, Wifi, AlertTriangle } from 'lucide-react';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button.jsx';
    import useLocalStorage from '@/hooks/useLocalStorage.jsx';
    import { useToast } from '@/components/ui/use-toast.jsx';

    const AttendanceApp = () => {
      const [attendanceLog, setAttendanceLog] = useLocalStorage('attendanceLog', []);
      const [isOnline, setIsOnline] = useState(navigator.onLine);
      const [showLocationPrompt, setShowLocationPrompt] = useState(false);
      const [lastPunch, setLastPunch] = useLocalStorage('lastPunch', { type: null, time: null });
      const {toast} = useToast();

      // Mock user ID - in a real app this would come from auth
      const MOCK_USER_ID = "STAFF_001"; 

      // Listen to online/offline events
      useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
          window.removeEventListener('online', handleOnline);
          window.removeEventListener('offline', handleOffline);
        };
      }, []);

      const handlePunch = (type) => {
        setShowLocationPrompt(true); // Show a mock prompt
        // Simulate getting location and then logging
        setTimeout(() => {
          const newRecord = {
            userId: MOCK_USER_ID,
            type: type,
            timestamp: new Date().toISOString(),
            location: "Mocked Location (12.345, 67.890)", // Replace with actual GPS data
            synced: isOnline,
          };
          
          setAttendanceLog(prevLog => [...prevLog, newRecord]);
          setLastPunch({type: type, time: newRecord.timestamp});
          setShowLocationPrompt(false);
          
          toast({
            title: `Punched ${type === 'in' ? 'In' : 'Out'}`,
            description: `Successfully recorded at ${new Date(newRecord.timestamp).toLocaleTimeString()}. Status: ${isOnline ? 'Online (Synced)' : 'Offline (Queued)'}`,
            variant: type === 'in' ? 'default' : 'destructive',
          });

          if (!isOnline) {
            // Store offline data to be synced later
            const offlineQueue = JSON.parse(localStorage.getItem('offlineAttendanceQueue') || '[]');
            localStorage.setItem('offlineAttendanceQueue', JSON.stringify([...offlineQueue, newRecord]));
          } else {
            // TODO: Attempt to sync any queued offline data
            syncOfflineData();
          }
        }, 1500); // Simulate delay for location & processing
      };
      
      const syncOfflineData = () => {
        const offlineQueue = JSON.parse(localStorage.getItem('offlineAttendanceQueue') || '[]');
        if (offlineQueue.length > 0 && isOnline) {
          // Simulate API call to sync data
          console.log("Attempting to sync offline data:", offlineQueue);
          setTimeout(() => { // Simulate API delay
            // Assuming sync is successful
            const successfullySyncedIds = offlineQueue.map(r => r.timestamp); // Use timestamp as a mock ID for this example
            
            // Update the main log to mark as synced
            setAttendanceLog(prevLog => prevLog.map(logEntry => 
                successfullySyncedIds.includes(logEntry.timestamp) && !logEntry.synced ? {...logEntry, synced: true} : logEntry
            ));

            localStorage.setItem('offlineAttendanceQueue', '[]'); // Clear queue
            toast({ title: "Offline Data Synced", description: `${offlineQueue.length} records synced successfully.`});
          }, 2000);
        }
      };
      
      // Attempt to sync on load if online
      useEffect(() => {
          if(isOnline) syncOfflineData();
      }, [isOnline]);


      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-4 md:p-6 lg:p-8 max-w-2xl mx-auto"
        >
          <Card className="shadow-xl border-t-4 border-blue-500">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold tracking-tight text-blue-600 flex items-center justify-center">
                <Clock className="mr-2 h-7 w-7"/>Attendance Punch System
              </CardTitle>
              <CardDescription>
                Location-based punch-in/out. Works offline and syncs when reconnected.
              </CardDescription>
               <div className={`mt-2 p-2 rounded-md text-sm flex items-center justify-center ${isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {isOnline ? <Wifi className="mr-2 h-4 w-4"/> : <WifiOff className="mr-2 h-4 w-4"/>}
                {isOnline ? 'Online Mode: Synced in real-time' : 'Offline Mode: Data queued for sync'}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {showLocationPrompt && (
                <div className="p-3 bg-yellow-100 border border-yellow-300 rounded-md text-yellow-700 text-sm text-center">
                  Acquiring location... Please wait.
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  size="lg" 
                  className="py-8 bg-green-500 hover:bg-green-600 text-lg font-semibold flex flex-col items-center"
                  onClick={() => handlePunch('in')}
                  disabled={lastPunch.type === 'in' || showLocationPrompt}
                >
                  <CheckCircle className="mb-1 h-6 w-6"/> Punch In
                </Button>
                <Button 
                  size="lg" 
                  className="py-8 bg-red-500 hover:bg-red-600 text-lg font-semibold flex flex-col items-center"
                  onClick={() => handlePunch('out')}
                  disabled={lastPunch.type === 'out' || lastPunch.type === null || showLocationPrompt}
                >
                  <XCircle className="mb-1 h-6 w-6"/> Punch Out
                </Button>
              </div>
              {lastPunch.time && (
                <p className="text-center text-sm text-muted-foreground">
                  Last Punch: {lastPunch.type === 'in' ? 'IN' : 'OUT'} at {new Date(lastPunch.time).toLocaleTimeString()}
                </p>
              )}

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2 text-center">Recent Activity (Mock)</h3>
                {attendanceLog.length === 0 ? (
                  <p className="text-muted-foreground text-center">No attendance records yet.</p>
                ) : (
                  <ul className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar p-2 border rounded-md bg-slate-50">
                    {attendanceLog.slice().reverse().slice(0, 5).map((record, index) => ( // Show last 5
                      <li key={index} className={`flex justify-between items-center p-2 rounded text-xs ${record.type === 'in' ? 'bg-green-50' : 'bg-red-50'}`}>
                        <span>{record.type === 'in' ? 'PUNCH IN' : 'PUNCH OUT'} at {new Date(record.timestamp).toLocaleTimeString()}</span>
                        <span className={`px-1.5 py-0.5 rounded-full text-white text-[10px] ${record.synced ? 'bg-green-500' : 'bg-yellow-500'}`}>
                          {record.synced ? 'Synced' : 'Queued'}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
               <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-500 text-blue-700 rounded-md">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0 text-blue-600" />
                    <div>
                      <p className="font-medium text-sm">Location & Offline Mode:</p>
                      <p className="text-xs">This is a simplified demonstration. A real app would require GPS permissions and more robust offline data handling and synchronization logic.</p>
                    </div>
                  </div>
                </div>
            </CardContent>
          </Card>
        </motion.div>
      );
    };

    export default AttendanceApp;