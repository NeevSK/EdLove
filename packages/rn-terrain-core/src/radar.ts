export type RadarVerdict = 'ADOPT' | 'TRIAL' | 'ASSESS' | 'HOLD';
export type RadarEvidenceKind =
  | 'package'
  | 'screenshot'
  | 'article'
  | 'issue'
  | 'benchmark'
  | 'other';

export interface RadarRecord {
  id: string;
  subject: string;
  subject_type: RadarEvidenceKind;
  verdict: RadarVerdict;
  confidence: 'low' | 'medium' | 'high';
  category: string;
  use_case: string;
  problem: string;
  current_stack: string[];
  compatibility: {
    expo: string;
    react_native: string;
    new_architecture: 'required' | 'supported' | 'unknown' | 'incompatible';
    web: 'supported' | 'partial' | 'unknown' | 'incompatible';
  };
  risks: string[];
  alternatives: string[];
  evidence: Array<{ kind: RadarEvidenceKind; value: string; note?: string }>;
  decision: string;
  revisit_when: string;
  created_at: string;
  updated_at: string;
}
