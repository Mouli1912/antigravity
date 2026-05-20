import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task, generateSmartSuggestions, Subtask } from '@/lib/intelligence';
import { Button } from '@/components/ui/button';
import { X, Sparkles, Target, BatteryWarning } from 'lucide-react';

interface InterventionModalProps {
  task: Task | null;
  onClose: () => void;
  onApplySuggestions: (taskId: number, subtasks: Subtask[]) => void;
}

const REASONS = [
  { id: 'too_difficult', label: 'Too difficult' },
  { id: 'too_long', label: 'Too long' },
  { id: 'no_motivation', label: 'No motivation' },
  { id: 'no_time', label: 'No time' },
  { id: 'forgot', label: 'Forgot about it' },
];

export function InterventionModal({ task, onClose, onApplySuggestions }: InterventionModalProps) {
  const [step, setStep] = useState<'reason' | 'suggestions'>('reason');
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Subtask[]>([]);

  if (!task) return null;

  const handleReasonSelect = (reasonId: string) => {
    setSelectedReason(reasonId);
    setSuggestions(generateSmartSuggestions(task.title, reasonId));
    setStep('suggestions');
  };

  const handleApply = () => {
    onApplySuggestions(task.id, suggestions);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg overflow-hidden border border-white/10 rounded-3xl bg-card shadow-2xl glass-card"
        >
          <div className="p-8">
            {step === 'reason' ? (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                    <BatteryWarning className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Stuck on this task?</h2>
                    <p className="text-sm text-muted-foreground">"{task.title}" has been delayed.</p>
                  </div>
                </div>
                
                <h3 className="font-medium mb-4">What's stopping you from completing this?</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  {REASONS.map((r) => (
                    <Button 
                      key={r.id} 
                      variant="outline" 
                      className="justify-start border-white/10 bg-background/50 hover:bg-primary/20"
                      onClick={() => handleReasonSelect(r.id)}
                    >
                      {r.label}
                    </Button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Let's break it down</h2>
                    <p className="text-sm text-muted-foreground">Here are some tiny steps to build momentum.</p>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  {suggestions.map((sub, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-background/50">
                      <Target className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">{sub.title}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={onClose}>
                    Skip for now
                  </Button>
                  <Button className="flex-1 bg-gradient-to-r from-primary to-purple-500 hover:opacity-90" onClick={handleApply}>
                    Restart Momentum
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted/50 transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
