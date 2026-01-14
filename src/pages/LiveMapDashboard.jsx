import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { MapPin, AlertTriangle, ExternalLink, Building2, Loader2, Map } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

const LiveMapDashboard = () => {
  const projects = useQuery(api.projects.listProjects, {});
  const isLoading = projects === undefined;

  const getStatusBadge = (status) => {
    const colors = {
      'Not Started': 'bg-gray-100 text-gray-800',
      'In Progress': 'bg-blue-100 text-blue-800',
      'On Hold': 'bg-yellow-100 text-yellow-800',
      'Completed': 'bg-green-100 text-green-800',
    };
    return <Badge className={colors[status] || 'bg-gray-100'}>{status}</Badge>;
  };

  const openInGoogleMaps = (location) => {
    const encodedLocation = encodeURIComponent(location);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedLocation}`, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 md:p-6 lg:p-8 space-y-6"
    >
      <Card className="shadow-xl border-t-4 border-green-500">
        <CardHeader>
          <CardTitle className="text-2xl font-bold tracking-tight text-green-600 flex items-center">
            <MapPin className="mr-2 h-6 w-6"/>Live Map Dashboard
          </CardTitle>
          <CardDescription>
            View project locations and status. Interactive map features coming soon.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Project Locations Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Project Locations
          </CardTitle>
          <CardDescription>
            Click on any location to view it in Google Maps
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-green-500" />
            </div>
          ) : projects?.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No projects found.</p>
          ) : (
            <div className="space-y-3">
              {projects?.map((project) => (
                <div
                  key={project._id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">{project.projectName}</h4>
                      <p className="text-sm text-muted-foreground">{project.location || 'Location not specified'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusBadge(project.status)}
                        <span className="text-xs text-muted-foreground">
                          {project.startDate} - {project.endDate}
                        </span>
                      </div>
                    </div>
                  </div>
                  {project.location && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openInGoogleMaps(project.location)}
                      className="gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View on Map
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Map Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="h-5 w-5" />
            Interactive Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-100 rounded-lg h-72 flex flex-col items-center justify-center p-6 text-center">
            <MapPin className="h-16 w-16 text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-600 mb-2">Interactive Map Coming Soon</h3>
            <p className="text-sm text-slate-500 max-w-md">
              Full map integration with real-time tracking, geofencing, and status overlays is planned for a future release.
            </p>
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span className="text-sm text-amber-700">Use the table above to view project locations in Google Maps</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      {!isLoading && projects && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-blue-700">{projects.length}</p>
              <p className="text-xs text-blue-600">Total Projects</p>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-green-700">
                {projects.filter(p => p.status === 'In Progress').length}
              </p>
              <p className="text-xs text-green-600">Active Sites</p>
            </CardContent>
          </Card>
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-yellow-700">
                {projects.filter(p => p.status === 'On Hold').length}
              </p>
              <p className="text-xs text-yellow-600">On Hold</p>
            </CardContent>
          </Card>
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-purple-700">
                {projects.filter(p => p.status === 'Completed').length}
              </p>
              <p className="text-xs text-purple-600">Completed</p>
            </CardContent>
          </Card>
        </div>
      )}
    </motion.div>
  );
};

export default LiveMapDashboard;
