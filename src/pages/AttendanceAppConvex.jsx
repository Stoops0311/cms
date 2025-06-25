import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { CheckCircle, XCircle, Clock, WifiOff, Wifi, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button.jsx';
import { useToast } from '@/components/ui/use-toast.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import useOfflineSync from '@/hooks/useOfflineSync.jsx';

const AttendanceApp = () => {
  const { user, userId } = useAuth();
  const { toast } = useToast();
  const offlineSync = useOfflineSync();
  
  // Convex queries and mutations
  const attendanceRecords = useQuery(api.attendance.listAttendanceRecords) || [];
  const createAttendanceRecord = useMutation(api.attendance.createAttendanceRecord);
  
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [lastPunch, setLastPunch] = useState({ type: null, time: null });
  const [currentLocation, setCurrentLocation] = useState(null);

  // Get user's attendance records
  const userAttendance = attendanceRecords.filter(record => 
    record.userId === userId
  );

  // Get today's records
  const todayRecords = userAttendance.filter(record => {
    const today = new Date().toDateString();
    const recordDate = new Date(record.timestamp).toDateString();
    return recordDate === today;
  });

  // Determine last punch type
  useEffect(() => {
    if (todayRecords.length > 0) {
      const latest = todayRecords.sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      )[0];
      setLastPunch({
        type: latest.punchType,
        time: latest.timestamp
      });
    }
  }, [todayRecords]);

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

  // Get user's location
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          console.warn('Location error:', error);
          // Provide mock location for demo
          resolve({
            latitude: 25.276987,
            longitude: 55.296249,
            accuracy: 10,
            mock: true
          });
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  };

  const handlePunch = async (type) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please sign in to record attendance"
      });
      return;
    }

    setShowLocationPrompt(true);
    
    try {
      // Get location
      const location = await getCurrentLocation();
      setCurrentLocation(location);
      
      const attendanceData = {
        userId: userId,
        punchType: type,
        timestamp: new Date().toISOString(),
        location: location.mock 
          ? "Demo Location (25.276987, 55.296249)" 
          : `${location.latitude}, ${location.longitude}`,
        locationAccuracy: location.accuracy,
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform
        },
        isOnline: isOnline
      };
      
      if (isOnline) {
        // Online: Direct Convex mutation
        try {
          await createAttendanceRecord(attendanceData);
          setLastPunch({ type, time: attendanceData.timestamp });
          
          toast({
            title: `Punched ${type === 'in' ? 'In' : 'Out'}`,
            description: `Successfully recorded at ${new Date(attendanceData.timestamp).toLocaleTimeString()}. Status: Online (Synced)`,
            variant: type === 'in' ? 'default' : 'destructive',
          });
        } catch (error) {
          throw error;
        }
      } else {
        // Offline: Queue for later sync
        offlineSync.queueOperation({
          type: 'CREATE_ATTENDANCE',
          data: attendanceData
        });
        
        setLastPunch({ type, time: attendanceData.timestamp });
        
        toast({
          title: `Punched ${type === 'in' ? 'In' : 'Out'} (Offline)`,
          description: `Recorded locally at ${new Date(attendanceData.timestamp).toLocaleTimeString()}. Will sync when online.`,
          variant: type === 'in' ? 'default' : 'destructive',
        });
      }
      
    } catch (error) {
      console.error('Punch error:', error);
      toast({
        variant: "destructive",
        title: "Punch Failed",
        description: error.message || "Could not record attendance. Please try again."
      });
    } finally {
      setShowLocationPrompt(false);
    }
  };

  const canPunchIn = !lastPunch.type || lastPunch.type === 'out';
  const canPunchOut = lastPunch.type === 'in';

  const getLastPunchDisplay = () => {
    if (!lastPunch.time) return "No punches today";
    
    const time = new Date(lastPunch.time).toLocaleTimeString();
    const type = lastPunch.type === 'in' ? 'Punched In' : 'Punched Out';
    return `${type} at ${time}`;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="max-w-md mx-auto shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center space-x-2 mb-2">
            {isOnline ? (
              <Wifi className="h-5 w-5 text-green-500" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-500" />
            )}
            <span className={`text-sm font-medium ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
              {isOnline ? 'Online' : 'Offline Mode'}
            </span>
          </div>
          
          <CardTitle className="text-2xl font-bold">Attendance System</CardTitle>
          <CardDescription>
            {user ? `Welcome, ${user.fullName}` : 'Please sign in to continue'}
          </CardDescription>
          
          {offlineSync.stats.hasItems && (
            <div className="mt-2 p-2 bg-yellow-50 rounded-lg">
              <div className="flex items-center justify-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-700">
                  {offlineSync.stats.total} items queued for sync
                </span>
              </div>
              {isOnline && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="mt-2 w-full"
                  onClick={offlineSync.processQueue}
                  disabled={offlineSync.isSyncing}
                >
                  {offlineSync.isSyncing ? 'Syncing...' : 'Sync Now'}
                </Button>
              )}
            </div>
          )}
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Current Status */}
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Current Status</div>
            <div className="font-medium">{getLastPunchDisplay()}</div>
          </div>

          {/* Location Prompt */}
          {showLocationPrompt && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
            >
              <div className="flex items-center justify-center space-x-2 text-blue-700">
                <Clock className="h-4 w-4 animate-spin" />
                <span className="text-sm font-medium">Getting your location...</span>
              </div>
            </motion.div>
          )}

          {/* Punch Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => handlePunch('in')}
              disabled={!canPunchIn || showLocationPrompt || !user}
              className="h-20 text-lg font-semibold bg-green-600 hover:bg-green-700 disabled:opacity-50"
            >
              <div className="flex flex-col items-center space-y-2">
                <CheckCircle className="h-6 w-6" />
                <span>Punch In</span>
              </div>
            </Button>
            
            <Button
              onClick={() => handlePunch('out')}
              disabled={!canPunchOut || showLocationPrompt || !user}
              variant="destructive"
              className="h-20 text-lg font-semibold disabled:opacity-50"
            >
              <div className="flex flex-col items-center space-y-2">
                <XCircle className="h-6 w-6" />
                <span>Punch Out</span>
              </div>
            </Button>
          </div>

          {/* Today's Records */}
          {todayRecords.length > 0 && (
            <div className="mt-6">
              <h3 className="font-medium mb-3">Today's Records</h3>
              <div className="space-y-2">
                {todayRecords
                  .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                  .slice(0, 5)
                  .map((record, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                      <div className="flex items-center space-x-2">
                        {record.punchType === 'in' ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="text-sm font-medium">
                          {record.punchType === 'in' ? 'Punch In' : 'Punch Out'}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(record.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Network Status Info */}
          <div className="text-xs text-muted-foreground text-center">
            {isOnline ? (
              "Your attendance is being synced in real-time"
            ) : (
              "Operating in offline mode. Data will sync when connection is restored."
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AttendanceApp;