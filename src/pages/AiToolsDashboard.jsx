import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { Brain, Zap, FileScan, Eye, MessageSquare, AlertTriangle, Bell, BellOff, Sparkles, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { useToast } from '@/components/ui/use-toast.jsx';

const aiFeatures = [
  {
    title: "Predictive Delay Alerts",
    description: "AI analyzes project data to predict potential delays.",
    icon: Zap,
    sample: "Based on current progress rates and weather forecasts, Project Alpha has a 73% chance of a 5-day delay in Phase 2 foundation work. Recommended action: Add 2 additional crew members.",
    eta: "Q2 2026"
  },
  {
    title: "Cost Overrun Detection",
    description: "Identifies patterns leading to cost overruns early.",
    icon: Zap,
    sample: "Material costs for concrete have exceeded projections by 12%. Historical pattern suggests 23% final overrun if current trend continues. Consider alternative suppliers or scope adjustment.",
    eta: "Q2 2026"
  },
  {
    title: "AI Document Scanner",
    description: "Convert scanned documents or handwritten notes to digital forms.",
    icon: FileScan,
    sample: "Scanned document converted: Daily Progress Report detected. Extracted: Date: 2026-01-14, Workers: 15, Tasks: Foundation pour complete, Weather: Clear. Auto-populated DPR form ready for review.",
    eta: "Q3 2026"
  },
  {
    title: "Safety Compliance Check",
    description: "Analyzes site photos for PPE and safety protocol adherence.",
    icon: Eye,
    sample: "Image analysis complete: 3 workers detected without hard hats in Zone B. 1 worker missing high-visibility vest near excavation. Safety alert generated and supervisor notified.",
    eta: "Q3 2026"
  },
  {
    title: "Medical Guidance Assistant",
    description: "Provides initial guidance for on-site injuries (not a replacement for professionals).",
    icon: MessageSquare,
    sample: "Minor cut reported. AI guidance: 1) Clean wound with sterile water 2) Apply pressure with clean cloth 3) Use first aid kit bandage 4) Monitor for infection. If bleeding persists >10min, seek medical attention.",
    eta: "Q4 2026"
  },
  {
    title: "Site Technical Assistant",
    description: "Answers technical queries related to civil and MEP tasks.",
    icon: MessageSquare,
    sample: "Query: 'What is the minimum cover for rebar in foundation?' Response: Per ACI 318, minimum concrete cover for cast-in-place concrete exposed to earth is 75mm (3 inches). Check local building codes for specific requirements.",
    eta: "Q2 2026"
  },
  {
    title: "AI Daily Summaries",
    description: "Generates concise daily progress summaries from logs.",
    icon: FileScan,
    sample: "Daily Summary - Jan 14: Overall progress 67%. Key achievements: Completed electrical rough-in Zone A (ahead of schedule). Issues: Delayed concrete delivery caused 2hr standby. Tomorrow: Focus on plumbing installation Zone B.",
    eta: "Q2 2026"
  },
];

const AiToolsDashboard = () => {
  const { toast } = useToast();
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [notifications, setNotifications] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('ai_notifications') || '{}');
    } catch {
      return {};
    }
  });

  const toggleNotification = (title) => {
    const newNotifications = { ...notifications };
    if (newNotifications[title]) {
      delete newNotifications[title];
      toast({ title: "Notifications Off", description: `You won't be notified when "${title}" becomes available.` });
    } else {
      newNotifications[title] = true;
      toast({ title: "Notification Set", description: `You'll be notified when "${title}" becomes available.` });
    }
    setNotifications(newNotifications);
    localStorage.setItem('ai_notifications', JSON.stringify(newNotifications));
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
          <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-indigo-800">Coming Soon</p>
              <p className="text-sm text-indigo-700">
                These AI tools are in development. Click on any tool to preview sample outputs
                and sign up for notifications when they become available.
              </p>
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
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
              <CardHeader className="flex flex-row items-start justify-between space-x-3 pb-2">
                <div className="flex items-center gap-2">
                  <feature.icon className="h-6 w-6 text-indigo-500"/>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
                <Badge variant="secondary" className="text-xs whitespace-nowrap">
                  <Clock className="h-3 w-3 mr-1" />
                  {feature.eta}
                </Badge>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <p className="text-sm text-muted-foreground mb-4 flex-1">{feature.description}</p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setSelectedFeature(feature)}
                  >
                    Preview
                  </Button>
                  <Button
                    variant={notifications[feature.title] ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleNotification(feature.title)}
                    className={notifications[feature.title] ? "bg-indigo-600 hover:bg-indigo-700" : ""}
                  >
                    {notifications[feature.title] ? (
                      <BellOff className="h-4 w-4" />
                    ) : (
                      <Bell className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Feature Preview Modal */}
      <Dialog open={!!selectedFeature} onOpenChange={() => setSelectedFeature(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedFeature?.icon && <selectedFeature.icon className="h-5 w-5 text-indigo-600" />}
              {selectedFeature?.title}
            </DialogTitle>
            <DialogDescription>
              {selectedFeature?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-slate-50 rounded-lg border">
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Sample Output Preview
              </p>
              <p className="text-sm">{selectedFeature?.sample}</p>
            </div>
            <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-indigo-600" />
                <span className="text-sm text-indigo-700">Expected: {selectedFeature?.eta}</span>
              </div>
              <Button
                size="sm"
                variant={notifications[selectedFeature?.title] ? "default" : "outline"}
                onClick={() => selectedFeature && toggleNotification(selectedFeature.title)}
                className={notifications[selectedFeature?.title] ? "bg-indigo-600 hover:bg-indigo-700" : ""}
              >
                {notifications[selectedFeature?.title] ? (
                  <>
                    <BellOff className="h-4 w-4 mr-2" />
                    Notification On
                  </>
                ) : (
                  <>
                    <Bell className="h-4 w-4 mr-2" />
                    Notify Me
                  </>
                )}
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedFeature(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default AiToolsDashboard;
