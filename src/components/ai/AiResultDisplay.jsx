import React from 'react';
    import { motion } from 'framer-motion';

    const AiResultDisplay = ({ data, title = "AI Analysis Output:" }) => (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4"
      >
        <h4 className="font-semibold text-md mb-2 text-primary">{title}</h4>
        <div className="p-4 bg-slate-100 rounded-md border border-slate-200 text-sm max-h-80 overflow-y-auto">
          <pre className="whitespace-pre-wrap font-sans">{JSON.stringify(data, null, 2)}</pre>
        </div>
      </motion.div>
    );

    export default AiResultDisplay;