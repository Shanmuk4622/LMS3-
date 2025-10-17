export enum UserRole {
  Student = 'Student',
  Teacher = 'Teacher',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  duration: string; // e.g., "8 weeks"
  teacherId: string;
  teacherName: string;
}

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  dueDate: string;
  attachment?: {
    name: string;
    content: string; // base64 encoded content
    type: string; // mime type
  };
}

export enum SubmissionStatus {
  Submitted = 'Submitted',
  Graded = 'Graded',
  Late = 'Late',
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  content: string;
  file?: {
    name: string;
    content: string; // base64 encoded content
    type: string; // mime type
  };
  submittedAt: string;
  grade: number | null;
  feedback: string | null;
  status: SubmissionStatus;
}

export interface Grade {
  assignmentId: string;
  assignmentTitle: string;
  grade: number;
}