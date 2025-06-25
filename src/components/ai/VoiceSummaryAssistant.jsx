import React, { useState, useEffect } from 'react';
    import { Button } from '@/components/ui/button.jsx';
    import { Textarea } from '@/components/ui/textarea.jsx';
    import { Mic, FileText, Tags, CheckCircle, AlertCircle } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast.jsx';
    import AiFeatureCard from '@/components/ai/AiFeatureCard.jsx';
    import { motion, AnimatePresence } from 'framer-motion';

    const VoiceSummaryAssistant = ({ mockApiCall }) => {
      const { toast } = useToast();
      const [isDictating, setIsDictating] = useState(false);
      const [transcription, setTranscription] = useState('');
      const [soapNotes, setSoapNotes] = useState(null);
      const [nlpTags, setNlpTags] = useState([]);
      const [processing, setProcessing] = useState(false);

      const handleToggleDictation = async () => {
        if (isDictating) {
          setIsDictating(false);
          setProcessing(true);
          toast({
            title: "Voice Dictation Stopped",
            description: "Processing transcription, generating SOAP notes, and extracting NLP tags...",
          });

          const mockTranscriptionResult = "Patient, John Doe, a 45-year-old male, presents with a chief complaint of persistent dry cough and shortness of breath for the past three weeks. Symptoms are worse with exertion and at night. He also reports occasional wheezing. Denies fever, chills, or chest pain. Past medical history significant for mild intermittent asthma, usually well-controlled with albuterol PRN. Social history: non-smoker. On examination, lungs reveal bilateral expiratory wheezes. Heart rate 88, respiratory rate 20, SpO2 95% on room air. Peak flow meter reading is 350 L/min, which is 70% of his personal best. Impression is acute asthma exacerbation. Plan to administer nebulized albuterol and ipratropium, start a short course of oral prednisone 40mg daily for 5 days, and reassess response in 1 hour. Advised to continue regular SABA use and follow up with primary care in 3-5 days or sooner if symptoms worsen.";
          
          try {
            const result = await mockApiCall("Voice Summary", { transcription: mockTranscriptionResult });
            setTranscription(result.transcription);
            generateSoapNotesAndTags(result.transcription);
            toast({
              title: "Processing Complete",
              description: "SOAP notes and NLP tags generated.",
              className: "bg-green-500 text-white"
            });
          } catch (error) {
            toast({
              variant: "destructive",
              title: "Processing Error",
              description: "Failed to process voice input.",
            });
          } finally {
            setProcessing(false);
          }

        } else {
          setIsDictating(true);
          setTranscription('');
          setSoapNotes(null);
          setNlpTags([]);
          toast({
            title: "Voice Dictation Started (Simulated)",
            description: "Speak now. Click 'Stop Dictation' to process.",
            className: "bg-blue-500 text-white"
          });
        }
      };
      
      const generateSoapNotesAndTags = (text) => {
        const notes = {
          subjective: "Patient, John Doe, 45 y/o male, c/o persistent dry cough and SOB x 3 weeks, worse with exertion and at night. Occasional wheezing. Denies fever, chills, chest pain. PMH: mild intermittent asthma (albuterol PRN). SH: non-smoker.",
          objective: "Lungs: bilateral expiratory wheezes. HR 88, RR 20, SpO2 95% RA. PEFR: 350 L/min (70% personal best).",
          assessment: "Acute asthma exacerbation.",
          plan: [
            "Administer nebulized albuterol and ipratropium.",
            "Start Prednisone 40mg PO daily x 5 days.",
            "Reassess response in 1 hour.",
            "Continue regular SABA use.",
            "F/U with PCP in 3-5 days or sooner if symptoms worsen."
          ]
        };
        setSoapNotes(notes);

        const tags = [
          { type: "Symptom", value: "dry cough", confidence: 0.95 },
          { type: "Symptom", value: "shortness of breath", confidence: 0.98 },
          { type: "Symptom", value: "wheezing", confidence: 0.85 },
          { type: "Medical History", value: "asthma", confidence: 0.99 },
          { type: "Finding", value: "expiratory wheezes", confidence: 0.92 },
          { type: "Measurement", value: "SpO2 95%", confidence: 0.90 },
          { type: "Measurement", value: "PEFR 350 L/min", confidence: 0.93 },
          { type: "Diagnosis", value: "asthma exacerbation", confidence: 0.96 },
          { type: "Medication", value: "albuterol", confidence: 0.99 },
          { type: "Medication", value: "ipratropium", confidence: 0.90 },
          { type: "Medication", value: "prednisone", confidence: 0.98 },
          { type: "Action", value: "nebulized treatment", confidence: 0.97 },
          { type: "Action", value: "oral steroids", confidence: 0.96 },
          { type: "Action", value: "reassess", confidence: 0.88 },
          { type: "Action", value: "follow up", confidence: 0.91 }
        ];
        setNlpTags(tags);
      };

      return (
        <AiFeatureCard
          title="AI-Powered Voice-to-Summary Assistant"
          icon={<Mic />}
          actionButton={
            <Button 
                onClick={handleToggleDictation} 
                className={`w-full ${isDictating ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                disabled={processing}
            >
              <Mic className="mr-2 h-4 w-4" />
              {processing ? 'Processing...' : (isDictating ? 'Stop Dictation & Process' : 'Start Dictation (Simulated)')}
            </Button>
          }
        >
          <p className="text-sm text-muted-foreground mb-4">
            Simulates transcribing doctor dictation into structured records, generating SOAP notes, and performing NLP-based tagging of symptoms and actions.
          </p>
          
          <AnimatePresence>
            {isDictating && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-700 text-sm flex items-center"
              >
                <Mic className="h-5 w-5 mr-2 animate-pulse" />
                Listening... Speak your notes. Click "Stop Dictation & Process" when finished.
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
                <label htmlFor="transcription" className="block text-sm font-medium text-gray-700 mb-1">Full Transcription (Simulated)</label>
                <Textarea 
                    id="transcription"
                    placeholder={isDictating ? "Dictation in progress..." : "Transcription will appear here after stopping dictation."}
                    className="min-h-[200px] lg:min-h-[350px] bg-slate-50" 
                    value={transcription}
                    readOnly
                />
            </div>
            <div className="lg:col-span-2 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <FileText className="h-4 w-4 mr-1.5 text-primary"/>Generated SOAP Notes (Simulated)
                    </label>
                    {soapNotes ? (
                        <div className="p-3 border rounded-md bg-white shadow-sm min-h-[150px] text-xs space-y-1.5">
                            <p><strong>S:</strong> {soapNotes.subjective}</p>
                            <p><strong>O:</strong> {soapNotes.objective}</p>
                            <p><strong>A:</strong> {soapNotes.assessment}</p>
                            <div><strong>P:</strong>
                                <ul className="list-disc list-inside ml-4">
                                    {soapNotes.plan.map((item, index) => <li key={index}>{item}</li>)}
                                </ul>
                            </div>
                        </div>
                    ) : (
                        <Textarea 
                            placeholder="SOAP notes will be generated here..." 
                            className="min-h-[150px] bg-slate-50" 
                            readOnly 
                        />
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <Tags className="h-4 w-4 mr-1.5 text-green-600"/>NLP-based Tags (Simulated)
                    </label>
                    {nlpTags.length > 0 ? (
                        <div className="p-3 border rounded-md bg-white shadow-sm min-h-[120px] max-h-[150px] overflow-y-auto custom-scrollbar">
                            <div className="flex flex-wrap gap-1.5">
                                {nlpTags.map((tag, index) => (
                                    <span key={index} className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center
                                        ${tag.confidence > 0.9 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {tag.confidence > 0.9 ? <CheckCircle className="h-3 w-3 mr-1"/> : <AlertCircle className="h-3 w-3 mr-1"/>}
                                        {tag.type}: {tag.value} ({ (tag.confidence * 100).toFixed(0) }%)
                                    </span>
                                ))}
                            </div>
                        </div>
                    ) : (
                         <Textarea 
                            placeholder="NLP tags will appear here..." 
                            className="min-h-[120px] bg-slate-50" 
                            readOnly 
                        />
                    )}
                </div>
            </div>
          </div>
        </AiFeatureCard>
      );
    };

    export default VoiceSummaryAssistant;