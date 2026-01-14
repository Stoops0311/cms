import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { Shield, UserCog, Lock, ListChecks, AlertTriangle, Search, Filter, Loader2, Calendar, User, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button.jsx';
import { Switch } from '@/components/ui/switch.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

const SecuritySettings = () => {
  const [actionFilter, setActionFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch access logs and users
  const accessLogs = useQuery(api.admin.listAccessLogs, { limit: 100 });
  const users = useQuery(api.admin.listUsers, {});

  // Extract unique action types from logs
  const actionTypes = useMemo(() => {
    if (!accessLogs) return [];
    const actions = [...new Set(accessLogs.map(log => log.action))];
    return actions.sort();
  }, [accessLogs]);

  // Filter logs
  const filteredLogs = useMemo(() => {
    if (!accessLogs) return [];

    return accessLogs.filter(log => {
      const matchesAction = actionFilter === 'all' || log.action === actionFilter;
      const matchesUser = userFilter === 'all' || log.userId === userFilter;
      const matchesSearch = searchTerm === '' ||
        log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.resource?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userName?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesAction && matchesUser && matchesSearch;
    });
  }, [accessLogs, actionFilter, userFilter, searchTerm]);

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get action badge color
  const getActionBadge = (action) => {
    const actionLower = action?.toLowerCase() || '';
    if (actionLower.includes('create') || actionLower.includes('add')) {
      return <Badge className="bg-green-100 text-green-800">{action}</Badge>;
    } else if (actionLower.includes('update') || actionLower.includes('edit')) {
      return <Badge className="bg-blue-100 text-blue-800">{action}</Badge>;
    } else if (actionLower.includes('delete') || actionLower.includes('remove')) {
      return <Badge className="bg-red-100 text-red-800">{action}</Badge>;
    } else if (actionLower.includes('login') || actionLower.includes('auth')) {
      return <Badge className="bg-purple-100 text-purple-800">{action}</Badge>;
    } else if (actionLower.includes('view') || actionLower.includes('read')) {
      return <Badge className="bg-gray-100 text-gray-800">{action}</Badge>;
    }
    return <Badge variant="outline">{action}</Badge>;
  };

  const isLoading = accessLogs === undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 md:p-6 lg:p-8 space-y-6"
    >
      {/* Header Card */}
      <Card className="shadow-xl border-t-4 border-red-500">
        <CardHeader>
          <CardTitle className="text-2xl font-bold tracking-tight text-red-600 flex items-center">
            <Shield className="mr-2 h-6 w-6"/>Security & Access Control
          </CardTitle>
          <CardDescription>
            Manage role-based access levels, user logs, authentication, and document encryption settings.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Cards - Left Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <UserCog className="mr-2 h-5 w-5"/>Role-Based Access
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">Define permissions for different user roles.</p>
              <Button variant="outline" disabled className="w-full">
                <Lock className="mr-2 h-4 w-4" />
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Lock className="mr-2 h-5 w-5"/>Authentication & Encryption
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <Label htmlFor="twoFactorAuth" className="flex flex-col space-y-1">
                  <span className="text-sm font-medium">Two-Factor Authentication</span>
                  <span className="text-xs text-muted-foreground">Enhance account security</span>
                </Label>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                  <Switch id="twoFactorAuth" disabled />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <Label htmlFor="docEncryption" className="flex flex-col space-y-1">
                  <span className="text-sm font-medium">Document Encryption</span>
                  <span className="text-xs text-muted-foreground">Encrypt stored documents</span>
                </Label>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                  <Switch id="docEncryption" checked disabled />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Access Logs - Right Column (2 cols wide) */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="flex items-center text-lg">
                  <ListChecks className="mr-2 h-5 w-5"/>Access Logs
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Activity className="h-4 w-4" />
                  {filteredLogs.length} {filteredLogs.length === 1 ? 'entry' : 'entries'}
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger>
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="All Actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    {actionTypes.map(action => (
                      <SelectItem key={action} value={action}>{action}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={userFilter} onValueChange={setUserFilter}>
                  <SelectTrigger>
                    <User className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="All Users" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    {users?.map(user => (
                      <SelectItem key={user._id} value={user._id}>{user.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="text-center py-12">
                  <ListChecks className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">No access logs found</p>
                  <p className="text-sm text-muted-foreground/70">
                    {accessLogs?.length === 0
                      ? "System activity will appear here as users interact with the platform."
                      : "Try adjusting your filters to see more results."}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {filteredLogs.map((log, index) => (
                    <div
                      key={log._id || index}
                      className="flex items-start gap-4 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-shrink-0 mt-1">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{log.userName || 'Unknown User'}</span>
                          {getActionBadge(log.action)}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          Resource: {log.resource || 'N/A'}
                          {log.resourceId && <span className="ml-1 text-xs">({log.resourceId})</span>}
                        </p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatTimestamp(log.timestamp)}
                          </span>
                          {log.ipAddress && (
                            <span>IP: {log.ipAddress}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Security Notice */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">Security Notice</p>
              <p className="text-sm text-amber-700">
                Access logs are retained for audit purposes. Advanced security features including 2FA
                and document encryption are planned for future releases.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SecuritySettings;
