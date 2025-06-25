import React from 'react';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button.jsx';
    import { Megaphone, Edit, Trash2 } from 'lucide-react';
    import { format, parseISO } from 'date-fns';

    const NoticeBoard = ({ notices, currentUserRole, onEdit, onDelete }) => {
      return (
        <div className="p-6 max-h-[600px] overflow-y-auto space-y-4">
          {notices.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                  <Megaphone className="mx-auto h-12 w-12 mb-2 text-gray-400" />
                  <p>No notices posted yet.</p>
              </div>
          ) : (
              notices.map(notice => (
              <motion.div
                  key={notice.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
                  className="p-4 border rounded-lg shadow-sm bg-slate-50"
              >
                  <div className="flex justify-between items-start">
                  <div>
                      <h3 className="font-semibold text-teal-700 text-lg">{notice.title}</h3>
                      <p className="text-xs text-muted-foreground">
                      Posted by {notice.author} on {format(parseISO(notice.date), 'dd MMM yyyy, p')} | For: {notice.department}
                      </p>
                  </div>
                  {currentUserRole === "Admin" && (
                      <div className="space-x-1">
                          <Button variant="ghost" size="icon" onClick={() => onEdit(notice)} className="text-blue-600 hover:text-blue-700 h-7 w-7"> <Edit className="h-4 w-4" /> </Button>
                          <Button variant="ghost" size="icon" onClick={() => onDelete(notice.id)} className="text-red-600 hover:text-red-700 h-7 w-7"> <Trash2 className="h-4 w-4" /> </Button>
                      </div>
                  )}
                  </div>
                  <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{notice.content}</p>
              </motion.div>
              ))
          )}
        </div>
      );
    };

    export default NoticeBoard;