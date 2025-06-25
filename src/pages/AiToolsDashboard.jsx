import React from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
    import { Brain, Zap, FileScan, Eye, MessageSquare, AlertTriangle } from 'lucide-react';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button.jsx';

    const AiFeatureCard = ({ title, description, icon: Icon, onClick }) => (
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center space-x-3 pb-2">
                <Icon className="h-6 w-6 text-indigo-500"/>
                <CardTitle className="text-lg">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground mb-3">{description}</p>
                <Button variant="outline" size="sm" onClick={onClick} className="w-full">
                    Access Tool (Placeholder)
                </Button>
            </CardContent>
        </Card>
    );

    const AiToolsDashboard = () => {
      const aiFeatures = [
        { title: "Predictive Delay Alerts", description: "AI analyzes project data to predict potential delays.", icon: Zap },
        { title: "Cost Overrun Detection", description: "Identifies patterns leading to cost overruns early.", icon: Zap },
        { title: "AI Document Scanner & Form Generator", description: "Convert scanned documents or handwritten notes to digital forms.", icon: FileScan },
        { title: "Image Recognition for Safety Compliance", description: "Analyzes site photos for PPE and safety protocol adherence.", icon: Eye },
        { title: "AI Assistant for Medical Guidance", description: "Provides initial guidance for on-site injuries (not a replacement for medical professionals).", icon: MessageSquare },
        { title: "Site Assistant AI (Civil/MEP)", description: "Answers technical queries related to civil and MEP tasks.", icon: MessageSquare },
        { title: "AI-Powered Daily Summary Reports", description: "Generates concise daily progress summaries from logs.", icon: FileScan },
      ];

      const handleToolAccess = (title) => {
          alert(`Accessing AI Tool: ${title}. This feature is a placeholder.`);
      };

      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-4 md:p-6 lg:p-8"
        >
          <Card className="shadow-xl border-t-4 border-indigo-500 mb-8">
            <CardHeader>
              <CardTitle className="text-2xl font-bold tracking-tight text-indigo-600 flex items-center">
                <Brain className="mr-2 h-6 w-6"/>AI Tools & Automation Hub
              </CardTitle>
              <CardDescription>
                Leverage AI-powered tools for predictive analytics, automation, and intelligent assistance.
              </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="mt-2 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded-md flex items-start">
                  <AlertTriangle className="h-5 w-5 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Conceptual AI Tools:</p>
                    <p className="text-sm">The AI tools listed are conceptual and represent planned features. Full implementation requires significant development and AI model integration.</p>
                  </div>
                </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aiFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 + 0.1 }}
              >
                <AiFeatureCard 
                    title={feature.title} 
                    description={feature.description} 
                    icon={feature.icon}
                    onClick={() => handleToolAccess(feature.title)}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      );
    };

    export default AiToolsDashboard;