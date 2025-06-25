import React, { useState } from 'react';
    import { Button } from '@/components/ui/button.jsx';
    import { Label } from '@/components/ui/label.jsx';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
    import { Route, BarChart3, Pill, Heart, Activity as LifestyleIcon, Info } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast.jsx';
    import AiFeatureCard from '@/components/ai/AiFeatureCard.jsx';

    const TreatmentPathwayAdvisor = ({ mockApiCall }) => {
      const { toast } = useToast();
      const [selectedDisease, setSelectedDisease] = useState('');
      const [treatmentPathway, setTreatmentPathway] = useState(null);

      const diseaseOptions = [
        { value: "Hypertension", label: "Hypertension (Stage 1)" },
        { value: "Diabetes Mellitus Type 2", label: "Diabetes Mellitus Type 2 (Newly Diagnosed)" },
        { value: "Community Acquired Pneumonia", label: "Community Acquired Pneumonia (Mild, Outpatient)" },
        { value: "Asthma Exacerbation", label: "Asthma Exacerbation (Moderate)" },
        { value: "Major Depressive Disorder", label: "Major Depressive Disorder (Initial Treatment)" },
      ];
      
      const mockPathways = {
        "Hypertension": {
            disease: "Hypertension (Stage 1)",
            guidelineSource: "AHA/ACC 2017 Guideline for the Prevention, Detection, Evaluation, and Management of High Blood Pressure in Adults; NICE NG136 (UK)",
            medications: [
                { name: "Lisinopril", dosage: "10mg OD", rationale: "ACE inhibitor, first-line for most patients. Consider ARB if ACEi intolerant." },
                { name: "Amlodipine", dosage: "5mg OD", rationale: "Calcium Channel Blocker, alternative or add-on if ACEi not tolerated/sufficient, or for specific populations (e.g., Black adults)." },
                { name: "Hydrochlorothiazide", dosage: "12.5-25mg OD", rationale: "Thiazide diuretic, often used in combination or as an alternative."}
            ],
            lifestyleChanges: [
                "Low sodium diet (<1.5g/day sodium or <3.75g/day salt)", 
                "DASH (Dietary Approaches to Stop Hypertension) eating plan",
                "Regular aerobic exercise (e.g., 90-150 mins/week of moderate-intensity)",
                "Limit alcohol intake (≤1 drink/day for women, ≤2 drinks/day for men)",
                "Smoking cessation program",
                "Weight management (aim for BMI < 25 kg/m²)"
            ],
            monitoringSchedule: "BP check every 2-4 weeks after initiation or change in therapy until stable. Once stable, every 3-6 months. Annual review including renal function (eGFR, electrolytes), and cardiovascular risk assessment.",
        },
        "Diabetes Mellitus Type 2": {
            disease: "Diabetes Mellitus Type 2 (Newly Diagnosed)",
            guidelineSource: "ADA Standards of Medical Care in Diabetes – 2024; WHO Package of Essential Noncommunicable (PEN) disease interventions",
            medications: [
                { name: "Metformin", dosage: "Start 500mg OD or BD with meals, titrate up to 1g BD as tolerated over several weeks", rationale: "First-line oral hypoglycemic, improves insulin sensitivity, reduces hepatic glucose production. Minimal risk of hypoglycemia." },
                { name: "Consider SGLT2 inhibitor or GLP-1 RA if ASCVD, HF, or CKD present", dosage: "Varies by agent", rationale: "Cardiovascular and renal benefits independent of glycemic control."}
            ],
            lifestyleChanges: [
                "Medical Nutrition Therapy (MNT) with registered dietitian (focus on whole grains, fruits, vegetables, lean protein, healthy fats)",
                "Increase physical activity (≥150 mins/week moderate-intensity aerobic exercise + 2-3 sessions/week resistance training)",
                "Weight management (aim for ≥5% weight loss if overweight/obese)",
                "Diabetes self-management education and support (DSMES)",
                "Smoking cessation"
            ],
            monitoringSchedule: "HbA1c every 3 months until target achieved, then every 6 months. Self-monitoring of blood glucose (SMBG) as indicated by regimen and patient needs. Annual foot exam, dilated eye exam, lipid profile, and urine albumin-to-creatinine ratio (UACR) & eGFR for kidney disease screening.",
        },
         "Community Acquired Pneumonia": {
            disease: "Community Acquired Pneumonia (Mild, Outpatient)",
            guidelineSource: "ATS/IDSA Clinical Practice Guideline on Community-Acquired Pneumonia; CDC Recommendations",
            medications: [
                { name: "Amoxicillin", dosage: "1g TID for 5-7 days", rationale: "First-line for previously healthy outpatients without recent antibiotic use." },
                { name: "Doxycycline", dosage: "100mg BD for 5-7 days", rationale: "Alternative if penicillin allergy or for atypical coverage." },
                { name: "Macrolide (e.g., Azithromycin 500mg Day 1, then 250mg OD for 4 days)", rationale: "Alternative, but consider local resistance patterns."}
            ],
            lifestyleChanges: [
                "Adequate rest", 
                "Increase fluid intake",
                "Symptomatic relief (antipyretics for fever, analgesics for pain)",
                "Smoking cessation (if applicable)"
            ],
            monitoringSchedule: "Follow-up in 48-72 hours if not improving or if symptoms worsen. Advise to seek urgent care for increased shortness of breath, chest pain, confusion, or inability to maintain oral intake. Resolution of symptoms may take several weeks.",
        },
         "Asthma Exacerbation": {
            disease: "Asthma Exacerbation (Moderate)",
            guidelineSource: "GINA (Global Initiative for Asthma) Report 2023; NICE Guideline [NG80] (UK)",
            medications: [
                { name: "Salbutamol (Albuterol) via pMDI + Spacer", dosage: "4-10 puffs every 20 minutes for 1 hour, then as needed", rationale: "Short-acting beta2-agonist (SABA) for rapid bronchodilation." },
                { name: "Prednisolone (Oral Corticosteroid)", dosage: "Adults: 40-50mg OD for 5-7 days. Children: 1-2mg/kg (max 40mg) OD for 3-5 days.", rationale: "Systemic corticosteroid to reduce airway inflammation and prevent relapse." },
                { name: "Consider Ipratropium Bromide (with SABA) for severe exacerbations", dosage: "Via nebulizer or pMDI", rationale: "Anticholinergic, provides additional bronchodilation."}
            ],
            lifestyleChanges: [
                "Identify and avoid known triggers (allergens, irritants)", 
                "Ensure proper inhaler technique and adherence to controller medication",
                "Review and update personalized asthma action plan",
                "Ensure access to reliever medication"
            ],
            monitoringSchedule: "Assess response to SABA within 1 hour. Follow-up with primary care physician or asthma specialist within 1-7 days post-exacerbation. Monitor symptoms and peak expiratory flow (PEF) if used. Step down controller therapy once stable for 3 months.",
        },
        "Major Depressive Disorder": {
            disease: "Major Depressive Disorder (Initial Treatment, Moderate Severity)",
            guidelineSource: "APA Clinical Practice Guideline for the Treatment of Depression Across Three Age Cohorts; NICE Guideline [NG222] (UK)",
            medications: [
                { name: "Sertraline (SSRI)", dosage: "Start 50mg OD, titrate up to 200mg OD based on response and tolerability", rationale: "First-line due to efficacy and tolerability profile." },
                { name: "Fluoxetine (SSRI)", dosage: "Start 20mg OD, can increase to 60-80mg OD", rationale: "Alternative SSRI, longer half-life." },
                { name: "Escitalopram (SSRI)", dosage: "Start 10mg OD, max 20mg OD", rationale: "Well-tolerated SSRI."}
            ],
            lifestyleChanges: [
                "Psychotherapy (e.g., CBT, IPT) - often recommended in combination with medication or as monotherapy for mild-moderate cases.",
                "Regular physical activity (e.g., 30 mins, 3-5 times/week)",
                "Sleep hygiene improvement",
                "Stress management techniques (e.g., mindfulness, relaxation)",
                "Healthy diet",
                "Avoid alcohol and illicit substances"
            ],
            monitoringSchedule: "Follow-up every 1-2 weeks for the first 4-6 weeks to assess response, side effects, and suicidality. Then monthly for 3 months. Continue treatment for at least 6-9 months after remission to prevent relapse. Consider long-term maintenance for recurrent episodes.",
        }
      };

      const handleTreatmentPathway = async () => {
        if (!selectedDisease) {
          toast({ variant: "destructive", title: "Input Error", description: "Please select a disease/condition." });
          return;
        }
        const result = await mockApiCall("Treatment Pathway", mockPathways[selectedDisease] || { disease: selectedDisease, error: "No pathway defined for this condition yet." });
        setTreatmentPathway(result);
      };

      return (
        <AiFeatureCard
          title="Treatment Pathway Recommendation"
          icon={<Route />}
          actionButton={<Button onClick={handleTreatmentPathway} className="w-full"><BarChart3 className="mr-2 h-4 w-4" />Get Recommended Pathway</Button>}
        >
          <Label htmlFor="disease">Select Disease/Condition</Label>
          <Select value={selectedDisease} onValueChange={setSelectedDisease}>
            <SelectTrigger id="disease"><SelectValue placeholder="Select a disease/condition" /></SelectTrigger>
            <SelectContent>
              {diseaseOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="mt-3 p-2.5 bg-blue-50 border border-blue-200 rounded-md text-xs text-blue-700 flex items-start">
            <Info className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <span>AI recommendations are based on established clinical guidelines (e.g., NICE, AHA/ACC, ADA, GINA, WHO). Specific guideline sources are noted in the output. This tool can be configured to prioritize specific regional or institutional guidelines.</span>
          </div>
          {treatmentPathway && (
            <div className="mt-4">
                <h4 className="font-semibold text-md mb-2 text-primary">AI Recommended Pathway for: <span className="font-bold">{treatmentPathway.disease}</span></h4>
                <div className="p-3 bg-slate-50 rounded-md border max-h-[450px] overflow-y-auto space-y-3 text-sm custom-scrollbar pr-2">
                    {treatmentPathway.guidelineSource && <p className="text-xs text-muted-foreground italic mb-2"><strong>Guideline Source(s):</strong> {treatmentPathway.guidelineSource}</p>}
                    
                    {treatmentPathway.medications && treatmentPathway.medications.length > 0 && (
                        <div>
                            <p className="font-medium text-primary-dark flex items-center mb-1"><Pill className="h-4 w-4 mr-1.5"/>Medications:</p>
                            <ul className="list-none space-y-1.5 pl-1">
                                {treatmentPathway.medications.map((med, idx) => (
                                    <li key={idx} className="p-2 bg-slate-100 rounded-md border border-slate-200 shadow-sm">
                                        <strong className="text-slate-800">{med.name} - {med.dosage}</strong>
                                        <p className="text-xs text-gray-600 mt-0.5">{med.rationale}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {treatmentPathway.lifestyleChanges && treatmentPathway.lifestyleChanges.length > 0 && (
                        <div>
                            <p className="font-medium text-primary-dark flex items-center mb-1"><LifestyleIcon className="h-4 w-4 mr-1.5"/>Lifestyle Changes:</p>
                            <ul className="list-disc list-inside pl-3 space-y-0.5">
                                {treatmentPathway.lifestyleChanges.map((change, idx) => <li key={idx} className="text-gray-700">{change}</li>)}
                            </ul>
                        </div>
                    )}

                    {treatmentPathway.monitoringSchedule && (
                        <div>
                            <p className="font-medium text-primary-dark flex items-center mb-1"><Heart className="h-4 w-4 mr-1.5"/>Monitoring Schedule:</p>
                            <p className="pl-1 text-gray-700">{treatmentPathway.monitoringSchedule}</p>
                        </div>
                    )}
                    
                    {treatmentPathway.error && <p className="text-red-600 font-semibold p-2 bg-red-50 rounded-md">{treatmentPathway.error}</p>}
                </div>
            </div>
          )}
        </AiFeatureCard>
      );
    };

    export default TreatmentPathwayAdvisor;