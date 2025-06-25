import React from 'react';

    const DetailItem = ({ icon: Icon, label, value, highlight, iconClassName = 'text-primary' }) => (
      <div className="flex items-start space-x-3">
        <Icon className={`h-5 w-5 mt-1 ${highlight ? 'text-destructive' : iconClassName}`} />
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className={`font-medium ${highlight ? 'text-destructive font-semibold' : 'text-foreground'}`}>{value || 'N/A'}</p>
        </div>
      </div>
    );

    export default DetailItem;