
import { ScaleType, AssessmentScale } from './types';

export const GENERAL_7_OPTIONS = [
  { value: 1, label: 'Absent' },
  { value: 2, label: 'Minimal' },
  { value: 3, label: 'Mild' },
  { value: 4, label: 'Moderate' },
  { value: 5, label: 'Moderate Severe' },
  { value: 6, label: 'Severe' },
  { value: 7, label: 'Extreme' },
];

export const SAPS_SANS_OPTIONS = [
  { value: 0, label: 'None' },
  { value: 1, label: 'Questionable' },
  { value: 2, label: 'Mild' },
  { value: 3, label: 'Moderate' },
  { value: 4, label: 'Marked' },
  { value: 5, label: 'Severe' },
];

export const SCALES: Record<string, AssessmentScale> = {
  [ScaleType.PHQ9]: {
    type: ScaleType.PHQ9,
    title: 'PHQ-9 (Patient Health Questionnaire-9)',
    description: 'The PHQ-9 is a multipurpose instrument for screening, diagnosing, monitoring and measuring the severity of depression. It incorporates DSM-IV depression diagnostic criteria with other leading major depressive symptoms into a brief self-report tool. It is widely used to track treatment response over time and provides a provisional diagnosis of major depressive disorder.',
    questions: [
      { id: '1', text: 'Little interest or pleasure in doing things' },
      { id: '2', text: 'Feeling down, depressed, or hopeless' },
      { id: '3', text: 'Trouble falling or staying asleep, or sleeping too much' },
      { id: '4', text: 'Feeling tired or having little energy' },
      { id: '5', text: 'Poor appetite or overeating' },
      { id: '6', text: 'Feeling bad about yourself — or that you are a failure or have let yourself or your family down' },
      { id: '7', text: 'Trouble concentrating on things, such as reading the newspaper or watching television' },
      { id: '8', text: 'Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual' },
      { id: '9', text: 'Thoughts that you would be better off dead or of hurting yourself in some way' },
    ],
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' },
    ]
  },
  [ScaleType.GAD7]: {
    type: ScaleType.GAD7,
    title: 'GAD-7 (General Anxiety Disorder-7)',
    description: 'The GAD-7 is a sensitive self-report scale used to identify probable cases of Generalized Anxiety Disorder and assess symptom severity. It is also effective for screening social phobia, PTSD, and panic disorder. Scores of 5, 10, and 15 represent cut-points for mild, moderate, and severe anxiety, respectively. When used as a screening tool, further evaluation is recommended for scores of 10 or greater.',
    questions: [
      { id: '1', text: 'Feeling nervous, anxious or on edge' },
      { id: '2', text: 'Not being able to stop or control worrying' },
      { id: '3', text: 'Worrying too much about different things' },
      { id: '4', text: 'Trouble relaxing' },
      { id: '5', text: 'Being so restless that it is hard to sit still' },
      { id: '6', text: 'Becoming easily annoyed or irritable' },
      { id: '7', text: 'Feeling afraid as if something awful might happen' },
    ],
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' },
    ]
  },
  [ScaleType.SAPS]: {
    type: ScaleType.SAPS,
    title: 'SAPS (Scale for Assessment of Positive Symptoms)',
    description: 'The SAPS is designed to assess positive symptoms, principally those that occur in schizophrenia and related disorders. It focuses on hallucinations, delusions, bizarre behavior, and positive formal thought disorder. Unlike negative symptoms, positive symptoms represent an excess or distortion of normal functions and are often the most visible manifestation of psychotic illness.',
    questions: [
      { id: '1', text: 'Auditory Hallucinations' },
      { id: '2', text: 'Voices Commenting' },
      { id: '3', text: 'Persecutory Delusions' },
      { id: '4', text: 'Delusions of Reference' },
      { id: '5', text: 'Bizarre Behavior' },
    ],
    options: SAPS_SANS_OPTIONS
  },
  [ScaleType.SANS]: {
    type: ScaleType.SANS,
    title: 'SANS (Scale for Assessment of Negative Symptoms)',
    description: 'The SANS evaluates five main areas of negative symptoms: affective flattening or blunting, alogia (poverty of speech), avolition/apathy, anhedonia/asociality, and attentional impairment. Negative symptoms represent a deficit in normal functioning and are frequently associated with poorer long-term outcomes and functional disability in patients with schizophrenia.',
    questions: [
      { id: '1', text: 'Unchanging Facial Expression' },
      { id: '2', text: 'Poverty of Speech' },
      { id: '3', text: 'Poor Grooming and Hygiene' },
      { id: '4', text: 'Global Rating of Anhedonia' },
      { id: '5', text: 'Social Inattentiveness' },
    ],
    options: SAPS_SANS_OPTIONS
  },
  [ScaleType.BPRS]: {
    type: ScaleType.BPRS,
    title: 'BPRS (Brief Psychiatric Rating Scale)',
    description: 'The BPRS is one of the oldest and most widely used scales for evaluating a broad range of psychiatric symptoms. It measures 18 to 24 symptom areas including anxiety, depression, guilt, hostility, somatic concern, and psychotic features. It is particularly valuable for documenting treatment-related changes in patients with psychotic disorders in both inpatient and outpatient settings.',
    questions: [
      { id: '1', text: 'Somatic Concern' },
      { id: '2', text: 'Anxiety' },
      { id: '3', text: 'Emotional Withdrawal' },
      { id: '4', text: 'Conceptual Disorganization' },
      { id: '5', text: 'Hostility' },
      { id: '6', text: 'Hallucinations' },
    ],
    options: GENERAL_7_OPTIONS
  },
  [ScaleType.CAINS]: {
    type: ScaleType.CAINS,
    title: 'CAINS (Clinical Assessment Interview for Negative Symptoms)',
    description: 'The CAINS is a next-generation clinical assessment for negative symptoms, developed to address the limitations of older scales like the SANS. It focuses specifically on the two-factor structure of negative symptoms: expression (facial and vocal) and motivation/pleasure. It provides a more nuanced view of the patient\'s internal experience across social, vocational, and recreational activities.',
    questions: [
      { id: '1', text: 'Social Motivation' },
      { id: '2', text: 'Work/School Motivation' },
      { id: '3', text: 'Recreational Motivation' },
      { id: '4', text: 'Vocal Expression' },
      { id: '5', text: 'Facial Expression' },
    ],
    options: [
      { value: 0, label: 'No Impairment' },
      { value: 1, label: 'Mild' },
      { value: 2, label: 'Moderate' },
      { value: 3, label: 'Marked' },
      { value: 4, label: 'Severe' },
    ]
  }
};

export const getSeverity = (type: string, score: number): string => {
  if (type === ScaleType.PHQ9) {
    if (score <= 4) return 'Minimal/None';
    if (score <= 9) return 'Mild';
    if (score <= 14) return 'Moderate';
    if (score <= 19) return 'Moderately Severe';
    return 'Severe';
  }
  if (type === ScaleType.GAD7) {
    if (score <= 4) return 'Minimal/None';
    if (score <= 9) return 'Mild';
    if (score <= 14) return 'Moderate';
    return 'Severe';
  }
  
  // Generic ratio-based severity for specialized scales
  const scale = SCALES[type];
  if (!scale) return 'Inconclusive';
  
  const minPossible = scale.questions.length * Math.min(...scale.options.map(o => o.value));
  const maxPossible = scale.questions.length * Math.max(...scale.options.map(o => o.value));
  const range = maxPossible - minPossible;
  const relativeScore = (score - minPossible) / range;

  if (relativeScore < 0.2) return 'Absent/Minimal';
  if (relativeScore < 0.4) return 'Mild';
  if (relativeScore < 0.6) return 'Moderate';
  if (relativeScore < 0.8) return 'Marked';
  return 'Severe/Extreme';
};
