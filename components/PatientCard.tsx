import React from 'react';
import { Patient, ScaleType } from '../types';
import { User, Calendar } from 'lucide-react';

interface PatientCardProps {
  patient: Patient;
  onSelect: (patient: Patient) => void;
}

const PatientCard: React.FC<PatientCardProps> = ({ patient, onSelect }) => {
  const lastPHQ = patient.history.filter(h => h.scaleType === ScaleType.PHQ9).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  const lastGAD = patient.history.filter(h => h.scaleType === ScaleType.GAD7).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  return (
    <div 
      onClick={() => onSelect(patient)}
      className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow cursor-pointer group relative"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <User size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">{patient.name}</h3>
            <p className="text-sm text-slate-500">{patient.gender} • Age: {patient.age}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="p-3 bg-slate-50 rounded-lg">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Latest PHQ-9</p>
          <div className="flex items-baseline space-x-2">
            <span className="text-xl font-bold text-slate-900">{lastPHQ?.totalScore ?? '--'}</span>
            <span className="text-xs text-slate-500">{lastPHQ?.severity ?? 'N/A'}</span>
          </div>
        </div>
        <div className="p-3 bg-slate-50 rounded-lg">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Latest GAD-7</p>
          <div className="flex items-baseline space-x-2">
            <span className="text-xl font-bold text-slate-900">{lastGAD?.totalScore ?? '--'}</span>
            <span className="text-xs text-slate-500">{lastGAD?.severity ?? 'N/A'}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center text-xs text-slate-400">
        <Calendar size={12} className="mr-1" />
        <span>Last assessment: {patient.history[0]?.date || 'None'}</span>
      </div>
    </div>
  );
};

export default PatientCard;