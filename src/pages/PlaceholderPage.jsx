import React from 'react';
    import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card.jsx';
    import { motion } from 'framer-motion';
    import { Construction } from 'lucide-react';

    const PlaceholderPage = ({ title, description }) => {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center h-full"
        >
          <Card className="w-full max-w-md text-center shadow-xl border-t-4 border-accent">
            <CardHeader className="bg-gradient-to-r from-accent/10 to-primary/5 p-6 rounded-t-lg">
              <Construction className="mx-auto h-16 w-16 text-accent mb-4" />
              <CardTitle className="text-2xl font-bold text-accent">{title || 'Module Under Construction'}</CardTitle>
              <CardDescription>{description || 'This feature is currently in development. Please check back later!'}</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-muted-foreground">
                We are working hard to bring you this functionality. Thank you for your patience.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      );
    };

    export default PlaceholderPage;