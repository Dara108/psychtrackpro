
import React, { useState } from 'react';
import { AssessmentScale, ScaleType } from '../types';
import { SCALES, getSeverity } from '../constants';
import { ChevronRight, X } from 'lucide-react';

interface AssessmentFormProps {
  scaleType: ScaleType | string;
  customScale?: AssessmentScale;
  patientId: string;
  onSave: (responses: Record<string, number>, total: number, severity: string) => void;
  onCancel: () => void;
}

const AssessmentForm: React.FC<AssessmentFormProps> = ({ scaleType, customScale, patientId, onSave, onCancel }) => {
  const scale = customScale || SCALES[scaleType as ScaleType];
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  const handleOptionSelect = (qId: string, val: number) => {
    setResponses(prev => ({ ...prev, [qId]: val }));
  };

  const calculateTotal = (): number => {
    return (Object.values(responses) as number[]).reduce((acc: number, curr: number) => acc + curr, 0);
  };

  const isComplete = Object.keys(responses).length === scale.questions.length;

  const handleSubmit = () => {
    if (!isComplete) {
      setError("Please complete all questions.");
      return;
    }
    const total = calculateTotal();
    const severity = getSeverity(scaleType as string, total);
    onSave(responses, total, severity);
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{scale.title}</h2>
          <p className="text-slate-500 mt-1">{scale.description}</p>
        </div>
        <button onClick={onCancel} className="p-2 text-slate-400 hover:text-slate-600">
          <X size={24} />
        </button>
      </div>

      <div className="space-y-6">
        {scale.questions.map((q, idx) => (
          <div key={q.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-lg text-slate-900 font-medium mb-4">
              <span className="text-slate-400 mr-2">{idx + 1}.</span>
              {q.text}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {scale.options.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleOptionSelect(q.id, opt.value)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    responses[q.id] === opt.value
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {error && <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

      <div className="mt-10 flex items-center justify-between p-6 bg-slate-900 rounded-xl text-white shadow-xl">
        <div className="flex flex-col">
          <span className="text-slate-400 text-sm uppercase">Score</span>
          <span className="text-3xl font-bold">{calculateTotal()}</span>
        </div>
        <button
          onClick={handleSubmit}
          disabled={!isComplete}
          className={`flex items-center space-x-2 px-8 py-4 rounded-lg font-bold transition-all ${
            isComplete ? 'bg-indigo-500 hover:bg-indigo-400' : 'bg-slate-700 opacity-50 cursor-not-allowed'
          }`}
        >
          <span>Complete Assessment</span>
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default AssessmentForm;
