import React from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
    import { ShoppingCart, ListChecks, FileText, AlertTriangle } from 'lucide-react';
    import { motion } from 'framer-motion';

    const SupplierPortal = () => {
      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-4 md:p-6 lg:p-8"
        >
          <Card className="shadow-xl border-t-4 border-green-500 mb-8">
            <CardHeader>
              <CardTitle className="text-2xl font-bold tracking-tight text-green-600 flex items-center">
                <ShoppingCart className="mr-2 h-6 w-6"/>Supplier Portal
              </CardTitle>
              <CardDescription>
                Access supplier catalogues, material specifications, delivery logs, feedback, and invoices.
              </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="mt-2 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded-md flex items-start">
                  <AlertTriangle className="h-5 w-5 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Under Development:</p>
                    <p className="text-sm">This portal is currently a placeholder. Full functionality for supplier interaction will be implemented soon.</p>
                  </div>
                </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="shadow-md">
              <CardHeader className="flex flex-row items-center space-x-3 pb-2">
                <ListChecks className="h-5 w-5 text-green-600"/>
                <CardTitle className="text-lg">Material Catalogues</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Browse and search material specifications. (Placeholder)</p>
              </CardContent>
            </Card>
            <Card className="shadow-md">
              <CardHeader className="flex flex-row items-center space-x-3 pb-2">
                <FileText className="h-5 w-5 text-green-600"/>
                <CardTitle className="text-lg">Delivery Logs & Invoices</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Track deliveries and manage invoices. (Placeholder)</p>
              </CardContent>
            </Card>
             <Card className="shadow-md">
              <CardHeader className="flex flex-row items-center space-x-3 pb-2">
                <ShoppingCart className="h-5 w-5 text-green-600"/>
                <CardTitle className="text-lg">Submit Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Provide feedback on materials and services. (Placeholder)</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      );
    };

    export default SupplierPortal;