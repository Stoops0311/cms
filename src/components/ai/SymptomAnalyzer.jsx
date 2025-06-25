import React, { useState } from 'react';
    import { Button } from '@/components/ui/button.jsx';
    import { Textarea } from '@/components/ui/textarea.jsx';
    import { Label } from '@/components/ui/label.jsx';
    import { Lightbulb, Brain, ListChecks } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast.jsx';
    import AiFeatureCard from '@/components/ai/AiFeatureCard.jsx';

    const SymptomAnalyzer = ({ mockApiCall }) => {
      const { toast } = useToast();
      const [symptoms, setSymptoms] = useState('');
      const [patientDemographics, setPatientDemographics] = useState('');
      const [diagnosisResult, setDiagnosisResult] = useState(null);

      const handleSymptomAnalysis = async () => {
        if (!symptoms.trim()) {
          toast({ variant: "destructive", title: "Input Error", description: "Please enter symptoms." });
          return;
        }
        const mockResponse = {
          rankedPotentialDiagnoses: [
            { 
              name: "Viral Pharyngitis", 
              probability: "High (75%)", 
              riskScore: 15, 
              demographicsHistoryImpact: "Common in young adults, especially with recent exposure. Low risk if no comorbidities." 
            },
            { 
              name: "Streptococcal Pharyngitis", 
              probability: "Medium (20%)", 
              riskScore: 40, 
              demographicsHistoryImpact: "Consider if Centor score > 2. Higher risk of rheumatic fever if untreated." 
            },
            { 
              name: "Infectious Mononucleosis", 
              probability: "Low (5%)", 
              riskScore: 25, 
              demographicsHistoryImpact: "More likely in adolescents/young adults with prolonged fatigue and lymphadenopathy." 
            },
          ],
          recommendedInitialInvestigations: [
            "Rapid Strep Test (if Centor score ≥2 or high suspicion)", 
            "Throat Culture (if Rapid Strep is negative but suspicion remains high)",
            "Monospot Test (if mononucleosis suspected based on clinical picture)"
          ],
          overallRiskAssessment: `Based on input symptoms '${symptoms.substring(0,30)}...' and demographics '${patientDemographics || 'Not provided'}', the overall risk profile suggests a moderate likelihood of requiring specific medical intervention. Further investigation is recommended to confirm diagnosis.`,
        };
        const result = await mockApiCall("Symptom-to-Diagnosis Engine", mockResponse);
        setDiagnosisResult(result);
      };

      return (
        <AiFeatureCard
          title="Symptom-to-Diagnosis Engine"
          icon={<Brain />}
          actionButton={<Button onClick={handleSymptomAnalysis} className="w-full"><Lightbulb className="mr-2 h-4 w-4" />Analyze Symptoms</Button>}
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="symptoms-input-type" className="mb-1 block">Symptom Input Method</Label>
              <div className="flex gap-2">
                  <Button variant="secondary" className="flex-1">
                    <ListChecks className="mr-2 h-4 w-4" /> Structured Checklist (Coming Soon)
                  </Button>
                  <Button variant="default" className="flex-1 ring-2 ring-primary shadow-md">Free-Text Input</Button>
              </div>
            </div>
            <div>
              <Label htmlFor="symptoms">Enter Symptoms (Free Text)</Label>
              <Textarea
                id="symptoms"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="e.g., sore throat, fever 38.2°C, difficulty swallowing, no cough, started 2 days ago"
                className="min-h-[100px]"
              />
            </div>
            <div>
              <Label htmlFor="patientDemographics">Patient Demographics & Brief History (Optional)</Label>
              <Textarea
                id="patientDemographics"
                value={patientDemographics}
                onChange={(e) => setPatientDemographics(e.target.value)}
                placeholder="e.g., 25 y/o male, generally healthy, recent travel to crowded area, history of seasonal allergies"
                className="min-h-[80px]"
              />
            </div>
          </div>

          {diagnosisResult && (
            <div className="mt-6">
              <h4 className="font-semibold text-lg mb-3 text-primary border-b pb-2">AI Diagnostic Advisory:</h4>
              <div className="space-y-4">
                <div>
                  <h5 className="font-medium text-md text-primary-dark mb-1">Ranked Potential Diagnoses:</h5>
                  <ul className="space-y-2">
                    {diagnosisResult.rankedPotentialDiagnoses.map((d, index) => (
                      <li key={index} className="p-3 bg-slate-100 rounded-md border border-slate-200 shadow-sm">
                        <p><strong>{index + 1}. {d.name}</strong></p>
                        <p className="text-sm"><span className="font-semibold">Probability:</span> {d.probability}</p>
                        <p className="text-sm"><span className="font-semibold">Risk Score:</span> {d.riskScore}/100</p>
                        <p className="text-xs text-muted-foreground mt-1"><span className="font-semibold">Demographics/History Impact:</span> {d.demographicsHistoryImpact}</p>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-md text-primary-dark mb-1">Recommended Initial Investigations:</h5>
                  <ul className="list-disc list-inside text-sm space-y-1 pl-4">
                    {diagnosisResult.recommendedInitialInvestigations.map((inv, index) => <li key={index}>{inv}</li>)}
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-md text-primary-dark mb-1">Overall Risk Scoring & Assessment:</h5>
                  <p className="text-sm p-3 bg-blue-50 border border-blue-200 rounded-md">{diagnosisResult.overallRiskAssessment}</p>
                </div>
              </div>
            </div>
          )}
        </AiFeatureCard>
      );
    };

    export default SymptomAnalyzer;