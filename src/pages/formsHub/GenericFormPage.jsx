import React from 'react';
    import { useLocation, useNavigate } from 'react-router-dom';
    import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card.jsx';
    import { Button } from '@/components/ui/button.jsx';
    import { AlertTriangle, Construction } from 'lucide-react';
    import { motion } from 'framer-motion';

    const GenericFormPage = () => {
      const location = useLocation();
      const navigate = useNavigate();
      const formTitle = location.state?.title || "Form Placeholder";

      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-4 md:p-6 lg:p-8 flex justify-center items-center min-h-[calc(100vh-150px)] bg-gradient-to-br from-slate-100 to-sky-100"
        >
          <Card className="w-full max-w-xl shadow-2xl border-t-4 border-amber-500">
            <CardHeader className="text-center">
              <Construction className="mx-auto h-16 w-16 text-amber-500 mb-4" />
              <CardTitle className="text-2xl font-bold text-amber-700">{formTitle}</CardTitle>
              <CardDescription className="text-slate-600">
                This form is currently under construction.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-slate-700">
                The functionality for the "{formTitle}" is planned and will be implemented soon. 
                Thank you for your patience.
              </p>
              <div className="mt-4 p-3 bg-amber-50 border-l-4 border-amber-400 text-amber-700 rounded-md text-sm">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
                  <span>Further details and input fields specific to this form will appear here once developed.</span>
                </div>
              </div>
              <Button onClick={() => navigate(-1)} className="mt-6 bg-amber-600 hover:bg-amber-700">
                Go Back
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      );
    };

    export default GenericFormPage;