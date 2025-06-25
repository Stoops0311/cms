import React from 'react';

    export const mockApiCallGlobal = (toast, moduleName, dataToReturn, delay = 1200) => {
      return new Promise((resolve, reject) => {
        if (toast && typeof toast === 'function') {
           toast({
            title: `AI Processing: ${moduleName}`,
            description: "Simulating AI model response...",
            className: "bg-sky-500 text-white"
          });
        } else if (toast && typeof toast.toast === 'function') {
           toast.toast({
            title: `AI Processing: ${moduleName}`,
            description: "Simulating AI model response...",
            className: "bg-sky-500 text-white"
          });
        }


        setTimeout(() => {
          if (dataToReturn) {
            resolve(dataToReturn);
          } else {
            reject(new Error(`Mock API call failed for ${moduleName}: No data provided`));
          }
        }, delay);
      });
    };