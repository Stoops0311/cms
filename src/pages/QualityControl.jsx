import React from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
    import { CheckSquare, ClipboardList, AlertTriangle, Microscope, Signal } from 'lucide-react';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button.jsx';

    const QCCard = ({ title, description, icon: Icon, onClick }) => (
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center space-x-3 pb-2">
          <Icon className="h-6 w-6 text-green-500" />
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">{description}</p>
          <Button variant="outline" size="sm" onClick={onClick} className="w-full">
            Manage QC (Placeholder)
          </Button>
        </CardContent>
      </Card>
    );

    const QualityControl = () => {
      const qcAreas = [
        { title: "Civil Works QA/QC", description: "Manage concrete strength tests, soil compaction reports, material approvals.", icon: ClipboardList },
        { title: "Telecom Installation QC", description: "Track fiber optic testing (OTDR, power levels), splice loss records, and equipment commissioning.", icon: Signal },
        { title: "Non-Conformance Reports (NCRs)", description: "Log and track non-conformances and their corrective actions.", icon: AlertTriangle },
        { title: "Material Inspection Records", description: "Document incoming material inspections and approvals.", icon: Microscope },
        { title: "Test & Inspection Plans (ITPs)", description: "Define and manage Inspection and Test Plans for various activities.", icon: CheckSquare },
      ];

      const handleManageQC = (title) => {
        alert(`Managing Quality Control for: ${title}. This feature is a placeholder.`);
      };

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
                <CheckSquare className="mr-2 h-6 w-6" />Quality Control (Civil & Telecom)
              </CardTitle>
              <CardDescription>
                Manage quality assurance for civil works (concrete strength, soil compaction) and telecom installations (fiber optic testing - OTDR, power levels, splice loss).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mt-2 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded-md flex items-start">
                <AlertTriangle className="h-5 w-5 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Under Development:</p>
                  <p className="text-sm">This module is currently a placeholder. Full quality control management features will be implemented.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {qcAreas.map((area, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 + 0.1 }}
              >
                <QCCard
                  title={area.title}
                  description={area.description}
                  icon={area.icon}
                  onClick={() => handleManageQC(area.title)}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      );
    };

    export default QualityControl;