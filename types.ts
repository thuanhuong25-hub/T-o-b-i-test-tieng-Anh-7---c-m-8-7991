export enum AppStep {
  UPLOAD = 'UPLOAD',
  CONFIGURE = 'CONFIGURE',
  PROCESSING = 'PROCESSING',
  RESULTS = 'RESULTS',
}

export interface TestConfig {
  listeningTopic1: string;
  listeningTopic2: string;
  readingTopic: string;
  writingTopic: string;
}

// --- Generated Test Structure Interfaces ---

export interface Question {
  id: number;
  questionText: string;
  options?: string[]; // For MCQ
  correctAnswer: string;
  type: 'MCQ' | 'TRUE_FALSE' | 'GAP_FILL' | 'ERROR_ID' | 'REORDER' | 'REWRITE' | 'ESSAY';
  level: 'Recognition' | 'Comprehension' | 'Application' | 'High Application';
  explanation?: string;
}

export interface Section {
  title: string;
  instructions: string;
  content?: string; // For reading passages or listening scripts contexts
  questions: Question[];
  totalPoints: number;
}

export interface GeneratedTest {
  testTitle: string;
  partA: {
    title: "PART A – LISTENING";
    task1: {
      script: string;
      questions: Question[];
    };
    task2: {
      script: string;
      questions: Question[];
    };
  };
  partB: {
    title: "PART B – LANGUAGE FOCUS";
    section1_mcq: Question[];
    section2_error: Question[];
    section3_verbs: Question[];
  };
  partC: {
    title: "PART C – READING";
    signQuestion: Question; // 1 question
    clozePassage: {
      text: string;
      questions: Question[];
    };
    comprehensionPassage: {
      text: string;
      questions: Question[];
    };
  };
  partD: {
    title: "PART D – WRITING";
    reordering: Question[];
    rewriting: Question[];
    paragraph: {
      prompt: string;
      sampleAnswer: string;
    };
  };
  matrixReport: {
    recognitionCount: number;
    comprehensionCount: number;
    applicationCount: number;
    totalQuestions: number;
    complianceNote: string;
  };
}

export interface SavedTestRecord {
  id: string;
  name: string;
  timestamp: number;
  data: GeneratedTest;
  config: TestConfig;
}
