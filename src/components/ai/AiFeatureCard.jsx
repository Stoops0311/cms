import React from 'react';
    import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card.jsx';

    const AiFeatureCard = ({ title, icon, children, actionButton }) => (
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-t-4 border-primary flex flex-col h-full">
        <CardHeader className="bg-gradient-to-br from-primary/5 to-accent/5">
          <CardTitle className="flex items-center text-xl font-semibold text-primary">
            {React.cloneElement(icon, { className: "mr-3 h-7 w-7 flex-shrink-0" })}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4 flex-grow">
          {children}
        </CardContent>
        {actionButton && (
          <CardFooter className="p-6 border-t bg-slate-50">
            {actionButton}
          </CardFooter>
        )}
      </Card>
    );

    export default AiFeatureCard;