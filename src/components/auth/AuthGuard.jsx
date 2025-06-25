import React from 'react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import LoginForm from './LoginForm.jsx';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { Loader2 } from 'lucide-react';

const AuthGuard = ({ children }) => {
  const { user, loading, error } = useAuth();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-gray-100">
        <Card className="p-8">
          <CardContent className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-muted-foreground">Authenticating...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!user) {
    return <LoginForm />;
  }

  // Show error state if there's an authentication error
  if (error && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-gray-100">
        <Card className="p-8 max-w-md mx-auto">
          <CardContent className="text-center space-y-4">
            <h2 className="text-xl font-semibold text-destructive">Authentication Error</h2>
            <p className="text-muted-foreground">{error}</p>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render protected content if authenticated
  return children;
};

export default AuthGuard;