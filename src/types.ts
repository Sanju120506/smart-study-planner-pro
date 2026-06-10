export interface StudyPlanItem {
  id: string;
  subjectName: string;
  allocatedHours: number;
  sessions: string;
  priority: string;
}

export interface ProgressState {
  [subjectName: string]: boolean[];
}

export interface CodeTemplates {
  appPy: string;
  requirementsTxt: string;
  readmeMd: string;
}
