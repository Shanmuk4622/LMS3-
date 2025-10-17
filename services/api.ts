import { User, UserRole, Course, Assignment, Submission } from '../types';

// Mock API using localStorage
const DELAY = 500; // simulate network delay

const get = <T>(key: string, defaultValue: T): T => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
  } catch (error) {
    console.error(`Error getting localStorage key "${key}":`, error);
    return defaultValue;
  }
};

const set = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting localStorage key "${key}":`, error);
  }
};

// --- ID Generation ---
const generateId = () => Date.now().toString() + Math.random().toString(36).substring(2, 9);

// --- Seeding Initial Data ---
const initializeData = () => {
  if (!localStorage.getItem('lms_initialized')) {
    const teacher: User = { id: 'teacher1', name: 'Dr. Ada Lovelace', email: 'teacher@lms.com', role: UserRole.Teacher };
    const student: User = { id: 'student1', name: 'Alan Turing', email: 'student@lms.com', role: UserRole.Student };
    const users: User[] = [teacher, student];

    const course1: Course = { id: 'course1', title: 'Introduction to Computer Science', description: 'Learn the fundamentals of programming and computer science.', duration: '10 Weeks', teacherId: 'teacher1', teacherName: 'Dr. Ada Lovelace' };
    const course2: Course = { id: 'course2', title: 'Advanced Algorithms', description: 'Deep dive into data structures and algorithms.', duration: '8 Weeks', teacherId: 'teacher1', teacherName: 'Dr. Ada Lovelace' };
    const courses: Course[] = [course1, course2];

    const assignment1: Assignment = { id: 'assign1', courseId: 'course1', title: 'Binary Search Tree Implementation', description: 'Implement a BST in your language of choice.', dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString() };
    const assignments: Assignment[] = [assignment1];

    set('lms_users', users);
    set('lms_courses', courses);
    set('lms_assignments', assignments);
    set('lms_enrollments', [{ userId: 'student1', courseId: 'course1' }]);
    set('lms_submissions', []);
    
    localStorage.setItem('lms_initialized', 'true');
  }
};

initializeData();

// --- API Functions ---

// Authentication
export const apiLogin = (email: string, pass: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const users = get<User[]>('lms_users', []);
      const user = users.find(u => u.email === email);
      // NOTE: Password check is omitted for this mock API
      if (user) {
        resolve(user);
      } else {
        reject(new Error('User not found'));
      }
    }, DELAY);
  });
};

export const apiRegister = (name: string, email: string, pass: string, role: UserRole): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const users = get<User[]>('lms_users', []);
      if (users.some(u => u.email === email)) {
        return reject(new Error('Email already in use'));
      }
      const newUser: User = { id: generateId(), name, email, role };
      users.push(newUser);
      set('lms_users', users);
      resolve(newUser);
    }, DELAY);
  });
};

// Courses
export const apiGetAllCourses = (): Promise<Course[]> => {
  return new Promise(resolve => {
    setTimeout(() => resolve(get<Course[]>('lms_courses', [])), DELAY);
  });
};

export const apiGetCourseById = (courseId: string): Promise<Course> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const courses = get<Course[]>('lms_courses', []);
      const course = courses.find(c => c.id === courseId);
      if (course) resolve(course);
      else reject(new Error('Course not found'));
    }, DELAY);
  });
};

export const apiCreateCourse = (data: { title: string; description: string; duration: string; teacherId: string }): Promise<Course> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const users = get<User[]>('lms_users', []);
      const teacher = users.find(u => u.id === data.teacherId);
      const newCourse: Course = { ...data, id: generateId(), teacherName: teacher?.name || 'Unknown' };
      const courses = get<Course[]>('lms_courses', []);
      courses.push(newCourse);
      set('lms_courses', courses);
      resolve(newCourse);
    }, DELAY);
  });
};

// Enrollment
export const apiGetMyCourses = (studentId: string): Promise<Course[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const enrollments = get<{ userId: string; courseId: string }[]>('lms_enrollments', []);
      const myCourseIds = enrollments.filter(e => e.userId === studentId).map(e => e.courseId);
      const allCourses = get<Course[]>('lms_courses', []);
      resolve(allCourses.filter(c => myCourseIds.includes(c.id)));
    }, DELAY);
  });
};

export const apiEnrollInCourse = (studentId: string, courseId: string): Promise<void> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const enrollments = get<{ userId: string; courseId: string }[]>('lms_enrollments', []);
      if (!enrollments.some(e => e.userId === studentId && e.courseId === courseId)) {
        enrollments.push({ userId: studentId, courseId: courseId });
        set('lms_enrollments', enrollments);
      }
      resolve();
    }, DELAY);
  });
};

export const apiGetCourseRoster = (courseId: string): Promise<User[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const enrollments = get<{ userId: string; courseId: string }[]>('lms_enrollments', []);
            const studentIds = enrollments.filter(e => e.courseId === courseId).map(e => e.userId);
            const allUsers = get<User[]>('lms_users', []);
            resolve(allUsers.filter(u => studentIds.includes(u.id)));
        }, DELAY);
    });
};

// Assignments
export const apiGetAssignmentsForCourse = (courseId: string): Promise<Assignment[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const assignments = get<Assignment[]>('lms_assignments', []);
      resolve(assignments.filter(a => a.courseId === courseId));
    }, DELAY);
  });
};

export const apiGetAssignmentById = (assignmentId: string): Promise<Assignment> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const assignments = get<Assignment[]>('lms_assignments', []);
            const assignment = assignments.find(a => a.id === assignmentId);
            if (assignment) resolve(assignment);
            else reject(new Error('Assignment not found'));
        }, DELAY);
    });
};

export const apiCreateAssignment = (data: { courseId: string; title: string; description: string; dueDate: string }): Promise<Assignment> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const newAssignment: Assignment = { ...data, id: generateId() };
      const assignments = get<Assignment[]>('lms_assignments', []);
      assignments.push(newAssignment);
      set('lms_assignments', assignments);
      resolve(newAssignment);
    }, DELAY);
  });
};

// Submissions
export const apiSubmitAssignment = (assignmentId: string, studentId: string, content: string, file?: { name: string; content: string; type: string; }): Promise<Submission> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const users = get<User[]>('lms_users', []);
      const student = users.find(u => u.id === studentId);
      const newSubmission: Submission = {
        id: generateId(),
        assignmentId,
        studentId,
        studentName: student?.name || 'Unknown',
        content,
        file,
        submittedAt: new Date().toISOString(),
        grade: null,
      };
      const submissions = get<Submission[]>('lms_submissions', []);
      submissions.push(newSubmission);
      set('lms_submissions', submissions);
      resolve(newSubmission);
    }, DELAY);
  });
};

export const apiGetSubmissionsForAssignment = (assignmentId: string): Promise<Submission[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const submissions = get<Submission[]>('lms_submissions', []);
      resolve(submissions.filter(s => s.assignmentId === assignmentId));
    }, DELAY);
  });
};

export const apiGetStudentSubmission = (assignmentId: string, studentId: string): Promise<Submission | null> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const submissions = get<Submission[]>('lms_submissions', []);
            const submission = submissions.find(s => s.assignmentId === assignmentId && s.studentId === studentId) || null;
            resolve(submission);
        }, DELAY);
    });
};

export const apiGradeSubmission = (submissionId: string, grade: number): Promise<Submission> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const submissions = get<Submission[]>('lms_submissions', []);
            const submissionIndex = submissions.findIndex(s => s.id === submissionId);
            if (submissionIndex > -1) {
                submissions[submissionIndex].grade = grade;
                set('lms_submissions', submissions);
                resolve(submissions[submissionIndex]);
            } else {
                reject(new Error('Submission not found'));
            }
        }, DELAY);
    });
};
