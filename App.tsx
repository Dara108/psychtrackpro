import React, { useState, useMemo, useEffect } from 'react';
import { Patient, ScaleType, AssessmentResult, AIAnalysisResult, AssessmentScale } from './types';
import PatientCard from './components/PatientCard';
import AssessmentForm from './components/AssessmentForm';
import HistoryChart from './components/HistoryChart';
import { analyzePatientData, generateScaleFromAI } from './services/gemini';
import { SCALES } from './constants';
import { 
  Plus, 
  Search, 
  ArrowLeft, 
  ChevronRight, 
  Info, 
  Loader2, 
  X, 
  ClipboardCheck,
  Home,
  Trash2,
  Globe,
  Sparkles
} from 'lucide-react';

const STORAGE_KEY_CUSTOM_SCALES = 'psychetrack_custom_scales';
const STORAGE_KEY_PATIENTS = 'psychetrack_patients';

const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'p1',
    name: 'Sarah Johnson',
    age: 36,
    gender: 'Female',
    history: [
      { id: 'a1', patientId: 'p1', date: '2023-11-15', scaleType: ScaleType.PHQ9, totalScore: 12, responses: {}, severity: 'Moderate' },
      { id: 'a2', patientId: 'p1', date: '2023-12-20', scaleType: ScaleType.PHQ9, totalScore: 15, responses: {}, severity: 'Moderately Severe' },
      { id: 'a3', patientId: 'p1', date: '2024-01-25', scaleType: ScaleType.PHQ9, totalScore: 18, responses: {}, severity: 'Moderately Severe' }
    ]
  },
  {
    id: 'p2',
    name: 'Michael Chen',
    age: 49,
    gender: 'Male',
    history: [
      { id: 'a4', patientId: 'p2', date: '2023-10-10', scaleType: ScaleType.GAD7, totalScore: 18, responses: {}, severity: 'Severe' },
      { id: 'a5', patientId: 'p2', date: '2023-12-05', scaleType: ScaleType.GAD7, totalScore: 12, responses: {}, severity: 'Moderate' }
    ]
  }
];

const App: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PATIENTS);
    return saved ? JSON.parse(saved) : INITIAL_PATIENTS;
  });
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [activeScale, setActiveScale] = useState<ScaleType | string | null>(null);
  const [isSelectingScale, setIsSelectingScale] = useState(false);
  const [isAddingPatient, setIsAddingPatient] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [customScales, setCustomScales] = useState<Record<string, AssessmentScale>>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CUSTOM_SCALES);
    return saved ? JSON.parse(saved) : {};
  });
  
  const [hiddenScales, setHiddenScales] = useState<Set<string>>(new Set());

  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiScaleInput, setAiScaleInput] = useState('');

  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientAge, setNewPatientAge] = useState<string>('');
  const [newPatientGender, setNewPatientGender] = useState('Female');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CUSTOM_SCALES, JSON.stringify(customScales));
  }, [customScales]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PATIENTS, JSON.stringify(patients));
  }, [patients]);

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setAnalysis(null);
    setIsSelectingScale(false);
    setActiveScale(null);
  };

  const handleAddPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientName || !newPatientAge) return;

    const newPatient: Patient = {
      id: `p-${Date.now()}`,
      name: newPatientName,
      age: parseInt(newPatientAge, 10),
      gender: newPatientGender,
      history: []
    };

    setPatients(prev => [newPatient, ...prev]);
    setIsAddingPatient(false);
    setNewPatientName('');
    setNewPatientAge('');
    setNewPatientGender('Female');
    setSelectedPatient(newPatient);
  };

  const handleAiScaleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!aiScaleInput.trim()) return;
    setIsAiGenerating(true);
    try {
      const result = await generateScaleFromAI(aiScaleInput);
      const newScale: AssessmentScale = {
        ...(result as AssessmentScale),
        type: ScaleType.CUSTOM
      };
      const scaleId = `AI-${Date.now()}`;
      setCustomScales(prev => ({ ...prev, [scaleId]: newScale }));
      setActiveScale(scaleId);
      setAiScaleInput('');
    } catch (err) {
      alert("Failed to generate scale. Please try again.");
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleRemoveScale = (e: React.MouseEvent, id: string, isCustom: boolean) => {
    e.stopPropagation(); 
    if (isCustom) {
      setCustomScales(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } else {
      setHiddenScales(prev => new Set(prev).add(id));
    }
  };

  const handleSaveAssessment = async (responses: Record<string, number>, total: number, severity: string) => {
    if (!selectedPatient || !activeScale) return;

    const scaleName = activeScale in SCALES 
      ? (activeScale as ScaleType) 
      : customScales[activeScale]?.title || 'Custom Scale';

    const newResult: AssessmentResult = {
      id: `a-${Date.now()}`,
      patientId: selectedPatient.id,
      date: new Date().toISOString().split('T')[0],
      scaleType: scaleName,
      responses,
      totalScore: total,
      severity
    };

    const updatedPatient: Patient = {
      ...selectedPatient,
      history: [newResult, ...selectedPatient.history]
    };

    setPatients(prev => prev.map(p => p.id === selectedPatient.id ? updatedPatient : p));
    setSelectedPatient(updatedPatient);
    setActiveScale(null);
    setIsSelectingScale(false);

    setIsAnalyzing(true);
    try {
      const result = await analyzePatientData(updatedPatient, newResult);
      setAnalysis(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetViews = () => {
    setSelectedPatient(null);
    setIsAddingPatient(false);
    setIsSelectingScale(false);
    setActiveScale(null);
  };

  const currentScaleDefinition = activeScale 
    ? (SCALES[activeScale as ScaleType] || customScales[activeScale])
    : null;

  const allAvailableScales = useMemo(() => {
    const standard = Object.values(SCALES).map(s => ({ ...(s as object), isCustom: false, id: s.type }));
    const custom = Object.entries(customScales).map(([id, s]) => ({ ...(s as object), isCustom: true, id }));
    return [...standard, ...custom].filter(s => !hiddenScales.has(s.id));
  }, [customScales, hiddenScales]);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between z-10">
          <div className="flex items-center space-x-8">
            <button onClick={resetViews} className="flex items-center space-x-3 group outline-none">
              <span className="text-xl font-bold tracking-tight text-slate-900">
                PsycheTrack<span className="text-indigo-600">Pro</span>
              </span>
            </button>
            
            {(selectedPatient || isAddingPatient) && (
              <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
            )}

            {(selectedPatient || isAddingPatient) && (
              <button 
                onClick={() => activeScale ? setActiveScale(null) : isSelectingScale ? setIsSelectingScale(false) : resetViews()} 
                className="flex items-center text-slate-500 hover:text-slate-900 font-medium group transition-colors"
              >
                <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm">
                  {activeScale ? 'Back to Selection' : isSelectingScale ? 'Back to Patient' : 'Back to Directory'}
                </span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-6">
            {!selectedPatient && !isAddingPatient && (
              <div className="hidden lg:flex items-center max-w-xs relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search patients..." 
                  className="w-full pl-9 pr-4 py-1.5 bg-slate-100 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 text-xs transition-all" 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                />
              </div>
            )}
            
            <div className="flex items-center space-x-3">
              <button 
                onClick={resetViews}
                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-all" 
                title="Home / Patient Directory"
              >
                <Home size={20} />
              </button>
              <div className="h-8 w-px bg-slate-200"></div>
              <div className="flex items-center space-x-3 pl-1">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-slate-900">Dr. Smith</p>
                  <p className="text-[10px] text-slate-500">Psychiatrist</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm">
                  <img src="https://picsum.photos/seed/doc/100/100" alt="Doctor profile" />
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {activeScale && currentScaleDefinition ? (
            <AssessmentForm scaleType={currentScaleDefinition.type} customScale={currentScaleDefinition} patientId={selectedPatient!.id} onSave={handleSaveAssessment} onCancel={() => setActiveScale(null)} />
          ) : isSelectingScale && selectedPatient ? (
            <div className="max-w-5xl mx-auto py-12">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl mb-4">
                  <ClipboardCheck size={32} />
                </div>
                <h1 className="text-3xl font-bold text-slate-900">Assessment Library</h1>
                <p className="text-slate-500 mt-2">CONDUCT Standard clinical scales or FETCH specialized tools via AI search.</p>
              </div>

              <div className="max-w-2xl mx-auto mb-12">
                <form onSubmit={handleAiScaleGenerate} className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Globe className={`text-indigo-500 ${isAiGenerating ? 'animate-pulse' : ''}`} size={20} />
                  </div>
                  <input 
                    type="text" 
                    value={aiScaleInput}
                    onChange={(e) => setAiScaleInput(e.target.value)}
                    placeholder="Search scale to add (e.g. 'HAM-D', 'BDI-II', 'MADRS')..."
                    className="w-full pl-12 pr-32 py-4 bg-white border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-slate-900 shadow-sm transition-all"
                    disabled={isAiGenerating}
                  />
                  <div className="absolute inset-y-2 right-2">
                    <button 
                      type="submit"
                      disabled={isAiGenerating || !aiScaleInput.trim()}
                      className="h-full px-4 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all"
                    >
                      {isAiGenerating ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />}
                      <span>{isAiGenerating ? 'Locating...' : 'Search Online'}</span>
                    </button>
                  </div>
                </form>
                <p className="text-center mt-3 text-xs text-slate-400 italic flex items-center justify-center space-x-1">
                  <Info size={12} className="text-slate-300" />
                  <span>Verified clinical scales are saved to your local library once retrieved.</span>
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {allAvailableScales.map((scale) => (
                  <div key={scale.id} className="relative group">
                    <button 
                      onClick={() => setActiveScale(scale.id)} 
                      className="flex flex-col items-start p-8 bg-white border border-slate-200 rounded-3xl hover:border-indigo-500 hover:shadow-xl transition-all text-left w-full h-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <div className="flex-1 flex flex-col justify-between w-full">
                        <div className="relative">
                          <div className="flex items-center justify-between mb-3">
                            <h2 className="text-xl font-bold text-slate-900 transition-transform duration-300 group-hover:-translate-y-1 group-focus:-translate-y-1">
                              {scale.title.split(' (')[0]}
                            </h2>
                            {scale.isCustom && (
                              <span className="flex items-center text-[10px] font-bold text-indigo-500 uppercase bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100">
                                <Sparkles size={10} className="mr-1" />
                                AI Added
                              </span>
                            )}
                          </div>
                          
                          <div className="relative min-h-[96px] mb-6">
                            <p className="text-xs text-slate-500 leading-relaxed line-clamp-4">
                              {scale.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center text-indigo-600 font-bold text-sm mt-auto">
                          <span>Begin Assessment</span>
                          <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 group-focus:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </button>
                    <button 
                      onClick={(e) => handleRemoveScale(e, scale.id, scale.isCustom)}
                      className="absolute top-6 right-6 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 group-focus:opacity-100 z-10"
                      title="Remove from library"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {hiddenScales.size > 0 && (
                <div className="text-center">
                  <button 
                    onClick={() => setHiddenScales(new Set())}
                    className="text-xs text-slate-400 hover:text-indigo-600 font-medium underline underline-offset-4"
                  >
                    Restore hidden library items
                  </button>
                </div>
              )}
            </div>
          ) : isAddingPatient ? (
            <div className="max-w-2xl mx-auto py-12">
               <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="bg-indigo-600 p-8 text-white relative">
                  <button onClick={() => setIsAddingPatient(false)} className="absolute top-6 right-6 text-indigo-100 hover:text-white transition-colors"><X size={24} /></button>
                  <h2 className="text-2xl font-bold">Registration</h2>
                </div>
                <form onSubmit={handleAddPatient} className="p-8 space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 uppercase">Full Name</label>
                    <input required type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={newPatientName} onChange={(e) => setNewPatientName(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 uppercase">Age</label>
                      <input required type="number" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={newPatientAge} onChange={(e) => setNewPatientAge(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 uppercase">Gender</label>
                      <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={newPatientGender} onChange={(e) => setNewPatientGender(e.target.value)}>
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all">Create Profile</button>
                </form>
              </div>
            </div>
          ) : selectedPatient ? (
            <div className="max-w-6xl mx-auto space-y-8">
              <div className="flex justify-between items-end">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">{selectedPatient.name}</h1>
                  <p className="text-slate-500">{selectedPatient.gender} • Age: {selectedPatient.age}</p>
                </div>
                <button onClick={() => setIsSelectingScale(true)} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 shadow-lg shadow-indigo-200 flex items-center space-x-2">
                  <Plus size={20} />
                  <span>New Assessment</span>
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 min-w-0 overflow-hidden">
                  <h2 className="text-lg font-bold text-slate-900 mb-6">
                    Clinical Trajectory
                  </h2>
                  <HistoryChart results={selectedPatient.history} />
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col min-w-0">
                  <div className="p-6 border-b border-slate-100 bg-indigo-50/30 rounded-t-2xl flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-900">
                      Gemini Insights
                    </h2>
                  </div>
                  <div className="p-6 flex-1">
                    {isAnalyzing ? (
                      <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                        <Loader2 className="animate-spin mb-4" size={32} />
                        <p className="text-sm">Browsing clinical research...</p>
                      </div>
                    ) : analysis ? (
                      <div className="space-y-6">
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase mb-2">Longitudinal Summary</p>
                          <p className="text-sm text-slate-700 leading-relaxed">{analysis.summary}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase mb-2">Recommendations</p>
                          <ul className="space-y-2">
                            {analysis.recommendations.map((r, i) => (
                              <li key={i} className="flex items-start text-sm text-slate-700">
                                <ChevronRight size={14} className="mt-1 mr-1 text-indigo-500 flex-shrink-0" />
                                {r}
                              </li>
                            ))}
                          </ul>
                        </div>
                        {analysis.sources && (
                          <div className="pt-4 border-t border-slate-100">
                            <p className="text-xs font-bold text-slate-400 uppercase mb-3">Sources & References</p>
                            <div className="space-y-2">
                              {analysis.sources.slice(0, 3).map((source, i) => (
                                <a 
                                  key={i} 
                                  href={source.uri} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="block text-[11px] text-indigo-600 hover:text-indigo-800 transition-colors bg-indigo-50/50 p-2 rounded-lg border border-indigo-100"
                                >
                                  <span className="truncate block w-full">{source.title}</span>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Info size={40} className="text-slate-200 mb-4" />
                        <p className="text-sm text-slate-500">Run an assessment to unlock AI insights grounded in latest research.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                    <tr>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Scale</th>
                      <th className="px-6 py-4 text-center">Score</th>
                      <th className="px-6 py-4">Severity</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedPatient.history.map(record => (
                      <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-slate-600">{record.date}</td>
                        <td className="px-6 py-4 font-medium text-slate-900">{record.scaleType}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-block px-3 py-1 bg-slate-100 rounded-full font-bold text-slate-700 text-sm">
                            {record.totalScore}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            record.severity.includes('Severe') ? 'bg-red-100 text-red-700' :
                            record.severity.includes('Moderate') ? 'bg-orange-100 text-orange-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {record.severity}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold">Details</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Patient Directory</h1>
                  <p className="text-slate-500 mt-1">Manage cross-patient assessment history.</p>
                </div>
                <button onClick={() => setIsAddingPatient(true)} className="flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 shadow-lg transition-all">
                  <Plus size={20} />
                  <span>Add Patient</span>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {patients.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(patient => (
                  <PatientCard key={patient.id} patient={patient} onSelect={handlePatientSelect} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;