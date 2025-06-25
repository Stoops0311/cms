import React from 'react';
    import { motion } from 'framer-motion';
    import { useToast } from '@/components/ui/use-toast.jsx';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.jsx";
    import { Search, Pill, ShieldAlert, Route, Mic } from 'lucide-react';
    import { mockApiCallGlobal } from '@/lib/aiUtils.jsx';

    import SymptomAnalyzer from '@/components/ai/SymptomAnalyzer.jsx';
    import DrugValidator from '@/components/ai/DrugValidator.jsx';
    import RedFlagDetector from '@/components/ai/RedFlagDetector.jsx';
    import TreatmentPathwayAdvisor from '@/components/ai/TreatmentPathwayAdvisor.jsx';
    import VoiceSummaryAssistant from '@/components/ai/VoiceSummaryAssistant.jsx';
    
    const AI_DOCTOR_ASSISTANT_TABS_CONFIG = [
      { 
        value: "symptom-analyzer", 
        label: "Symptom Analyzer", 
        icon: Search, 
        component: (props) => <SymptomAnalyzer {...props} /> 
      },
      { 
        value: "drug-validator", 
        label: "Drug Validator", 
        icon: Pill, 
        component: (props) => <DrugValidator {...props} /> 
      },
      { 
        value: "red-flag", 
        label: "Red Flag Detector", 
        icon: ShieldAlert, 
        component: (props) => <RedFlagDetector {...props} /> 
      },
      { 
        value: "treatment-pathway", 
        label: "Treatment Pathways", 
        icon: Route, 
        component: (props) => <TreatmentPathwayAdvisor {...props} /> 
      },
      { 
        value: "voice-summary", 
        label: "Voice Summary", 
        icon: Mic, 
        component: (props) => <VoiceSummaryAssistant {...props} /> 
      },
    ];

    const AiDoctorAssistant = () => {
      const { toast } = useToast();
      
      const mockApiCall = (moduleName, data) => mockApiCallGlobal({toast}, moduleName, data);

      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
              AI-Powered Doctor Assistance
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Intelligent tools to support clinical decision-making and enhance patient care.
            </p>
          </div>

          <Tabs defaultValue="symptom-analyzer" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-5 mb-6 gap-1">
              {AI_DOCTOR_ASSISTANT_TABS_CONFIG.map(tab => (
                <TabsTrigger key={tab.value} value={tab.value} className="text-xs sm:text-sm">
                  <tab.icon className="mr-1.5 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" />{tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {AI_DOCTOR_ASSISTANT_TABS_CONFIG.map(tab => (
              <TabsContent key={tab.value} value={tab.value} className="min-h-[60vh]">
                <tab.component mockApiCall={mockApiCall} />
              </TabsContent>
            ))}
          </Tabs>

        </motion.div>
      );
    };

    export default AiDoctorAssistant;