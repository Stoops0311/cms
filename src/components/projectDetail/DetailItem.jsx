import React from 'react';
    import { motion } from 'framer-motion';

    const DetailItem = ({ icon: Icon, label, value, className = '', isStatus = false, statusColor = 'text-gray-600' }) => {
      const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
      };

      return (
        <motion.div 
          variants={itemVariants}
          className={`p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow ${className}`}
        >
          <div className="flex items-start space-x-3">
            {Icon && <Icon className="h-6 w-6 text-primary mt-1 flex-shrink-0" />}
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
              {isStatus ? (
                <p className={`text-lg font-semibold ${statusColor}`}>{value || 'N/A'}</p>
              ) : (
                <p className="text-lg font-semibold text-gray-800">{value || <span className="italic text-gray-400">Not Provided</span>}</p>
              )}
            </div>
          </div>
        </motion.div>
      );
    };

    export default DetailItem;