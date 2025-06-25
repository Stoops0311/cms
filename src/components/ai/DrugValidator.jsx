import React, { useState } from 'react';
    import { Button } from '@/components/ui/button.jsx';
    import { Input } from '@/components/ui/input.jsx';
    import { Label } from '@/components/ui/label.jsx';
    import { Textarea } from '@/components/ui/textarea.jsx';
    import { Pill, Activity, AlertTriangle as AlertTriangleIcon, UserMinus, UserPlus, Ban } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast.jsx';
    import AiFeatureCard from '@/components/ai/AiFeatureCard.jsx';

    const DrugValidator = ({ mockApiCall }) => {
      const { toast } = useToast();
      const [drugs, setDrugs] = useState([{ name: '', dosage: '' }]);
      const [patientAge, setPatientAge] = useState('');
      const [patientWeight, setPatientWeight] = useState('');
      const [patientConditions, setPatientConditions] = useState('');
      const [drugInteractionResult, setDrugInteractionResult] = useState(null);

      const handleAddDrug = () => {
        setDrugs([...drugs, { name: '', dosage: '' }]);
      };

      const handleDrugChange = (index, field, value) => {
        const newDrugs = [...drugs];
        newDrugs[index][field] = value;
        setDrugs(newDrugs);
      };

      const handleRemoveDrug = (index) => {
        const newDrugs = drugs.filter((_, i) => i !== index);
        setDrugs(newDrugs);
      };

      const handleDrugValidation = async () => {
        if (drugs.some(d => !d.name.trim() || !d.dosage.trim()) || !patientAge || !patientWeight) {
          toast({ variant: "destructive", title: "Input Error", description: "Please enter all drug details, patient age, and weight." });
          return;
        }
        
        const drugNames = drugs.map(d => d.name).filter(name => name.trim() !== '');
        const firstDrug = drugNames[0] || "Drug A";
        const secondDrug = drugNames[1] || (drugNames.length > 1 ? "Drug B" : "N/A");

        const mockResponse = {
          interactionFlags: [
            { drugA: firstDrug, drugB: secondDrug, severity: "Major", description: `Significant risk of ${Math.random() > 0.5 ? 'QTc prolongation' : 'serotonin syndrome'}. ECG monitoring advised or consider alternative.` },
            { drugA: firstDrug, drugB: "Grapefruit Juice (example food interaction)", severity: "Moderate", description: "Increased ${firstDrug} plasma concentration. Advise patient to avoid grapefruit products." },
            { drugA: secondDrug, drugB: "Antacid (example OTC interaction)", severity: "Minor", description: `Decreased absorption of ${secondDrug}. Separate administration by at least 2 hours.` },
          ],
          dosageAdjustmentSuggestions: drugs.map(d => ({ 
            drug: d.name || "Unnamed Drug", 
            suggestion: `For a ${patientAge}-year-old patient weighing ${patientWeight}kg with conditions: '${patientConditions || 'none specified'}'. ${
              parseFloat(patientAge) < 18 ? 'Pediatric dose adjustment may be required. Consult pediatric guidelines.' : 
              parseFloat(patientAge) > 65 ? 'Consider geriatric dose reduction due to potential decreased renal clearance.' : 
              'Standard adult dosage likely appropriate, but monitor for efficacy and side effects.'
            } ${patientConditions.toLowerCase().includes('renal') ? 'Adjust dose for renal impairment (e.g., CrCl < 50 mL/min, reduce dose by 50%).' : ''}` 
          })),
          contraindicationWarnings: [
            { drug: firstDrug, condition: "Known hypersensitivity to this drug class", warning: `Contraindicated due to documented patient allergy to ${firstDrug} or related compounds.` },
            ...(patientConditions.toLowerCase().includes('pregnancy') ? [{ drug: secondDrug, condition: "Pregnancy (Category X or D)", warning: `${secondDrug} is potentially teratogenic or has known risks in pregnancy. Avoid use.`}] : []),
            { drug: "Simvastatin (example)", condition: "Concomitant use with strong CYP3A4 inhibitors (e.g., ketoconazole)", warning: "Increased risk of myopathy and rhabdomyolysis. Concomitant use contraindicated."}
          ],
        };
        const result = await mockApiCall("Drug Interaction & Dosage Validator", mockResponse);
        setDrugInteractionResult(result);
      };
      
      const getSeverityClass = (severity) => {
        switch(severity?.toLowerCase()){
            case "major": return "text-red-700 bg-red-50 border-red-500";
            case "moderate": return "text-orange-600 bg-orange-50 border-orange-500";
            case "minor": return "text-yellow-600 bg-yellow-50 border-yellow-500";
            default: return "text-gray-600 bg-gray-100 border-gray-500";
        }
      }

      return (
        <AiFeatureCard
          title="Drug Interaction & Dosage Validator"
          icon={<Pill />}
          actionButton={<Button onClick={handleDrugValidation} className="w-full"><Activity className="mr-2 h-4 w-4" />Validate Drugs & Dosage</Button>}
        >
          <div className="space-y-3">
            {drugs.map((drug, index) => (
              <div key={index} className="flex items-end gap-2 p-3 border rounded-md bg-slate-50 shadow-sm">
                <div className="flex-grow">
                  <Label htmlFor={`drugName-${index}`}>Drug Name {index + 1}</Label>
                  <Input id={`drugName-${index}`} value={drug.name} onChange={(e) => handleDrugChange(index, 'name', e.target.value)} placeholder="e.g., Lisinopril" />
                </div>
                <div className="flex-grow">
                  <Label htmlFor={`drugDosage-${index}`}>Dosage {index + 1}</Label>
                  <Input id={`drugDosage-${index}`} value={drug.dosage} onChange={(e) => handleDrugChange(index, 'dosage', e.target.value)} placeholder="e.g., 10mg OD" />
                </div>
                {drugs.length > 1 && <Button variant="destructive" size="sm" onClick={() => handleRemoveDrug(index)}>Remove</Button>}
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={handleAddDrug} className="w-full">Add Another Drug</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <Label htmlFor="patientAge">Patient Age (Years)</Label>
              <Input id="patientAge" type="number" value={patientAge} onChange={(e) => setPatientAge(e.target.value)} placeholder="e.g., 68" />
            </div>
            <div>
              <Label htmlFor="patientWeight">Patient Weight (kg)</Label>
              <Input id="patientWeight" type="number" value={patientWeight} onChange={(e) => setPatientWeight(e.target.value)} placeholder="e.g., 75" />
            </div>
          </div>
          <div className="mt-4">
            <Label htmlFor="patientConditions">Relevant Patient Conditions (comma-separated)</Label>
            <Textarea 
              id="patientConditions" 
              value={patientConditions} 
              onChange={(e) => setPatientConditions(e.target.value)} 
              placeholder="e.g., Renal impairment (CrCl 45 mL/min), Hypertension, History of allergy to Sulfa drugs, Pregnancy" 
              className="min-h-[100px]"
            />
          </div>
          {drugInteractionResult && (
             <div className="mt-6">
                <h4 className="font-semibold text-lg mb-3 text-primary border-b pb-2">AI Drug Validation Report:</h4>
                <div className="space-y-4">
                    <div>
                        <h5 className="font-medium text-md text-primary-dark mb-1 flex items-center"><AlertTriangleIcon className="h-5 w-5 mr-2 text-orange-500"/>Interaction Flags:</h5>
                        {drugInteractionResult.interactionFlags.length > 0 ? (
                            <ul className="space-y-2 text-sm">
                                {drugInteractionResult.interactionFlags.map((flag, idx) => (
                                    <li key={idx} className={`p-3 border-l-4 rounded-md shadow-sm ${getSeverityClass(flag.severity)}`}>
                                        <strong className="flex items-center"><AlertTriangleIcon className="h-4 w-4 mr-1.5"/>{flag.severity} Interaction:</strong> 
                                        <span className="font-semibold">{flag.drugA} & {flag.drugB}</span> - {flag.description}
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-sm text-muted-foreground p-2 bg-slate-50 rounded-md">No significant interactions flagged based on input.</p>}
                    </div>
                     <div>
                        <h5 className="font-medium text-md text-primary-dark mb-1 flex items-center">
                            {parseFloat(patientAge) < 18 ? <UserMinus className="h-5 w-5 mr-2 text-blue-500"/> : <UserPlus className="h-5 w-5 mr-2 text-blue-500"/>}
                            Dosage Adjustment Suggestions:
                        </h5>
                        <ul className="list-none space-y-2 text-sm">
                            {drugInteractionResult.dosageAdjustmentSuggestions.map((sugg, idx) => (
                              <li key={idx} className="p-3 bg-blue-50 border border-blue-200 rounded-md shadow-sm">
                                <strong>{sugg.drug}:</strong> {sugg.suggestion}
                              </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h5 className="font-medium text-md text-primary-dark mb-1 flex items-center"><Ban className="h-5 w-5 mr-2 text-red-500"/>Contraindication Warnings:</h5>
                         {drugInteractionResult.contraindicationWarnings.length > 0 ? (
                            <ul className="list-none space-y-2 text-sm">
                                {drugInteractionResult.contraindicationWarnings.map((warn, idx) => (
                                  <li key={idx} className="p-3 bg-red-50 border border-red-200 rounded-md shadow-sm text-red-700">
                                    <strong>{warn.drug} with {warn.condition}:</strong> {warn.warning}
                                  </li>
                                ))}
                            </ul>
                        ) : <p className="text-sm text-muted-foreground p-2 bg-slate-50 rounded-md">No specific contraindications identified based on input.</p>}
                    </div>
                </div>
            </div>
          )}
        </AiFeatureCard>
      );
    };

    export default DrugValidator;