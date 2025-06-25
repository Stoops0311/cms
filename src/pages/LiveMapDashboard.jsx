import React from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
    import { MapPin, AlertTriangle } from 'lucide-react';
    import { motion } from 'framer-motion';

    const LiveMapDashboard = () => {
      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-4 md:p-6 lg:p-8"
        >
          <Card className="shadow-xl border-t-4 border-green-500">
            <CardHeader>
              <CardTitle className="text-2xl font-bold tracking-tight text-green-600 flex items-center">
                <MapPin className="mr-2 h-6 w-6"/>Live Map Dashboard
              </CardTitle>
              <CardDescription>
                Visualize project sites, status, and geofencing. Real-time staff movement will be overlaid here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-lg h-96 flex flex-col items-center justify-center p-6 text-center">
                <MapPin className="h-24 w-24 text-muted-foreground mb-6 animate-pulse" />
                <h3 className="text-xl font-semibold text-muted-foreground mb-2">Live Map Integration Placeholder</h3>
                <p className="text-muted-foreground max-w-md">
                  This area will display an interactive map (e.g., OpenStreetMap) showing all active construction sites. 
                  Features like geofencing, status indicators, and real-time staff tracking will be available.
                </p>
                <div className="mt-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded-md flex items-start">
                  <AlertTriangle className="h-5 w-5 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Under Development:</p>
                    <p className="text-sm">Full map functionality, GPS tracking, and geofencing are planned for a future update.</p>
                  </div>
                </div>
                <img  alt="Conceptual map of construction sites" className="mt-8 rounded-lg shadow-md opacity-50" style={{ maxWidth: '400px', maxHeight: '200px', objectFit: 'cover' }} src="https://images.unsplash.com/photo-1469288205312-804b99a8d717" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      );
    };

    export default LiveMapDashboard;