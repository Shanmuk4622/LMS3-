// Fix: Removed self-import of UserRole, which was causing a conflict with its own declaration.
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
  duration: string;
  teacherId: string;
  teacherName: string;
  progress: {
      completed: number;
      total: number;
  };
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export enum LessonType {
    Text = 'text',
    Video = 'video',
    Quiz = 'quiz',
    Assignment = 'assignment',
}

export interface Lesson {
  id: string;
  title: string;
  type: LessonType;
  content: string; // URL for video, markdown for text, or assignment ID
}

export interface Assignment {
    id:string;
    courseId: string;
    title: string;
    description: string;
    dueDate: string; // ISO string
}

export interface Submission {
    id: string;
    assignmentId: string;
    studentId: string;
    content: string;
    grade: number | null;
    feedback: string | null;
    submittedAt: string; // ISO string
}

export interface Grade {
    studentId: string;
    studentName: string;
    submission: Submission | null;
}

export enum NotificationType {
  NewSubmission = 'new-submission',
  AssignmentGraded = 'assignment-graded',
  DeadlineReminder = 'deadline-reminder',
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string; // ISO string
  link: string; // e.g., /courses/c1/assignments/a1
}