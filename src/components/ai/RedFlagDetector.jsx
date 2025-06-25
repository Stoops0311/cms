import React from 'react';
    import { AlertTriangle, Zap, ShieldAlert, UserCheck, BedDouble, Users, Eye } from 'lucide-react';
    import AiFeatureCard from '@/components/ai/AiFeatureCard.jsx';
    import { Button } from '@/components/ui/button.jsx';

    const mockAlertsData = [
      {
        id: "ALERT001",
        patientId: "P007",
        condition: "Critical: Suspected Sepsis",
        detectedCombination: "High Fever (40.1°C) + Hypotension (BP 85/50 mmHg) + Tachycardia (130 bpm) + Altered Mental Status.",
        details: "Patient presents with classic signs of systemic inflammatory response. Labs pending.",
        severity: "Critical",
        recommendation: "Immediate ER Referral & Sepsis Protocol Activation. Prepare for potential ICU admission.",
        escalationDetails: "Alert sent to On-Call Senior Physician, ICU Team, and Nursing Supervisor.",
        recommendedActionIcon: BedDouble, 
        timestamp: "2 mins ago"
      },
      {
        id: "ALERT002",
        patientId: "P012",
        condition: "High Risk: Acute Myocardial Infarction",
        detectedCombination: "Sudden severe retrosternal chest pain + ECG ST elevation (V1-V4) + Elevated Troponin.",
        details: "Patient has significant cardiac risk factors. Pain radiating to left arm.",
        severity: "High",
        recommendation: "Emergency Cardiac Intervention. Activate Cath Lab immediately. Administer MONA protocol.",
        escalationDetails: "Cardiology team paged. Cath lab notified and preparing.",
        recommendedActionIcon: UserCheck,
        timestamp: "5 mins ago"
      },
      {
        id: "ALERT003",
        patientId: "P025",
        condition: "Moderate Risk: Severe Hypoglycemia",
        detectedCombination: "Blood Glucose: 45 mg/dL + Diaphoresis + Confusion.",
        details: "Patient is a known diabetic on insulin. Last meal > 6 hours ago.",
        severity: "Moderate",
        recommendation: "Administer IV Dextrose or Glucagon. Recheck BG in 15 mins. Observe closely for neurological recovery. Consider admission if recurrent or prolonged.",
        escalationDetails: "Endocrinology notified for consultation if refractory.",
        recommendedActionIcon: Eye,
        timestamp: "10 mins ago"
      },
      {
        id: "ALERT004",
        patientId: "P031",
        condition: "High Risk: Potential Stroke",
        detectedCombination: "Sudden onset unilateral facial droop + Arm weakness + Slurred speech (FAST positive).",
        details: "Patient reports symptoms started approx. 30 minutes ago. No history of anticoagulants.",
        severity: "High",
        recommendation: "STAT CT Head. Activate Stroke Protocol. Neurology consult. Prepare for possible thrombolysis.",
        escalationDetails: "Neurology and Radiology teams alerted. Stroke cart prepared.",
        recommendedActionIcon: Users, // Represents multidisciplinary team for stroke
        timestamp: "12 mins ago"
      }
    ];

    const getSeverityStyles = (severity) => {
        switch (severity) {
            case "Critical": return { icon: AlertTriangle, color: "text-red-700", bgColor: "bg-red-50", borderColor: "border-red-500" };
            case "High": return { icon: Zap, color: "text-orange-600", bgColor: "bg-orange-50", borderColor: "border-orange-500" };
            case "Moderate": return { icon: AlertTriangle, color: "text-yellow-600", bgColor: "bg-yellow-50", borderColor: "border-yellow-500" };
            default: return { icon: ShieldAlert, color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-500" };
        }
    };

    const RedFlagDetector = () => {
      const [alerts, setAlerts] = React.useState(mockAlertsData);

      const acknowledgeAlert = (alertId) => {
        setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== alertId));
        // Here you would typically call an API to mark the alert as acknowledged
        console.log(`Alert ${alertId} acknowledged.`);
      };

      return (
        <AiFeatureCard title="Red Flag Detection & Triage Advisor" icon={<ShieldAlert />}>
          <p className="text-sm text-muted-foreground mb-1">
            This module simulates real-time monitoring for critical patient symptoms, vitals, and combinations.
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            It triggers auto-escalation alerts and provides triage recommendations to doctors and administrators.
          </p>
          {alerts.length === 0 && (
            <div className="text-center py-10">
                <ShieldAlert className="mx-auto h-12 w-12 text-green-500" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">All Clear!</h3>
                <p className="mt-1 text-sm text-gray-500">No active red flag alerts at this moment.</p>
            </div>
          )}
          <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-2 custom-scrollbar">
            {alerts.map(alert => {
              const styles = getSeverityStyles(alert.severity);
              const ActionIcon = alert.recommendedActionIcon;
              return (
                <div key={alert.id} className={`p-4 border-l-4 rounded-md shadow-lg ${styles.bgColor} ${styles.borderColor} transition-all duration-300 hover:shadow-xl`}>
                  <div className="flex items-start justify-between">
                    <div className={`flex items-center ${styles.color}`}>
                      <styles.icon className="h-7 w-7 mr-2.5 flex-shrink-0" />
                      <h4 className="font-semibold text-lg leading-tight">{alert.condition}</h4>
                    </div>
                    <span className="text-xs text-gray-500 flex-shrink-0 ml-2">{alert.timestamp}</span>
                  </div>
                  
                  <div className="ml-[calc(1.75rem+0.625rem)] mt-1 space-y-1.5"> {/* Align with heading text */}
                    <p className="text-sm text-gray-800"><strong>Patient ID:</strong> {alert.patientId}</p>
                    <p className="text-sm text-gray-700"><strong>Detected Factors:</strong> {alert.detectedCombination}</p>
                    <p className="text-xs text-gray-600"><strong>Details:</strong> {alert.details}</p>
                    <p className={`text-xs italic ${styles.color} opacity-80`}><strong>Escalation:</strong> {alert.escalationDetails}</p>
                    
                    <div className={`mt-2 p-2.5 rounded-md flex items-start bg-opacity-60 ${styles.bgColor} border ${styles.borderColor}`}>
                       <ActionIcon className={`h-5 w-5 mr-2 mt-0.5 flex-shrink-0 ${styles.color}`} />
                       <p className={`text-sm font-medium ${styles.color}`}><strong>Recommendation:</strong> {alert.recommendation}</p>
                    </div>
                  </div>
                   <div className="flex justify-end mt-3">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => acknowledgeAlert(alert.id)}
                            className={`border-2 ${styles.borderColor} ${styles.color} hover:${styles.bgColor} hover:opacity-80`}
                        >
                            Acknowledge & Clear
                        </Button>
                    </div>
                </div>
              );
            })}
          </div>
        </AiFeatureCard>
      );
    };

    export default RedFlagDetector;