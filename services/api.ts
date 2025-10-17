import { User, UserRole, Course, Assignment, Submission, SubmissionStatus } from '../types';

// --- LocalStorage Database Simulation ---

const USERS_KEY = 'lms_users';
const COURSES_KEY = 'lms_courses';
const ASSIGNMENTS_KEY = 'lms_assignments';
const SUBMISSIONS_KEY = 'lms_submissions';
const ENROLLMENTS_KEY = 'lms_enrollments'; // { studentId: string, courseId: string }[]

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to get data from localStorage
const getData = <T>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Error reading from localStorage key “${key}”:`, error);
        return defaultValue;
    }
};

// Helper to set data to localStorage
const setData = <T>(key: string, value: T): void => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error writing to localStorage key “${key}”:`, error);
    }
};

// --- Seed Initial Data ---

const seedData = () => {
    // Check if data exists
    if (localStorage.getItem(USERS_KEY)) return;

    const teacher1: User = { id: 'teacher-1', name: 'Dr. Ada Lovelace', email: 'ada@example.com', role: UserRole.Teacher };
    const student1: User = { id: 'student-1', name: 'Charles Babbage', email: 'charles@example.com', role: UserRole.Student };
    const student2: User = { id: 'student-2', name: 'Grace Hopper', email: 'grace@example.com', role: UserRole.Student };
    
    // NOTE: In a real app, passwords would be hashed. Here we store them in plain text for simplicity.
    const users = [
        { ...teacher1, password: 'password123' },
        { ...student1, password: 'password123' },
        { ...student2, password: 'password123' },
    ];
    setData(USERS_KEY, users);

    const course1: Course = { id: 'course-1', title: 'Introduction to Computer Science', description: 'Learn the fundamentals of programming and computer science.', duration: '10 weeks', teacherId: teacher1.id, teacherName: teacher1.name };
    const course2: Course = { id: 'course-2', title: 'Advanced Algorithms', description: 'Deep dive into complex algorithms and data structures.', duration: '8 weeks', teacherId: teacher1.id, teacherName: teacher1.name };
    setData(COURSES_KEY, [course1, course2]);

    const assignment1: Assignment = { id: 'assign-1', courseId: course1.id, title: 'Hello, World!', description: 'Write a program that prints "Hello, World!" to the console.', dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString() };
    const assignment2: Assignment = { id: 'assign-2', courseId: course1.id, title: 'Variables and Data Types', description: 'Explain the difference between integers, floats, and strings. Provide code examples.', dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString() };
    setData(ASSIGNMENTS_KEY, [assignment1, assignment2]);

    // Enroll student1 in course1
    setData(ENROLLMENTS_KEY, [{ studentId: student1.id, courseId: course1.id }]);

    const submission1: Submission = {
        id: 'sub-1',
        assignmentId: assignment1.id,
        studentId: student1.id,
        studentName: student1.name,
        content: 'console.log("Hello, World!");',
        submittedAt: new Date().toISOString(),
        grade: 95,
        feedback: 'Excellent work! Clean and concise.',
        status: SubmissionStatus.Graded
    };
    setData(SUBMISSIONS_KEY, [submission1]);
};

// Initialize DB on load
seedData();

// --- API Functions ---

// Auth
export const apiLogin = async (email: string, pass: string): Promise<User> => {
    await wait(500);
    const users = getData<({password: string} & User)[]>(USERS_KEY, []);
    const user = users.find(u => u.email === email && u.password === pass);
    if (user) {
        const { password, ...userWithoutPass } = user;
        return userWithoutPass;
    }
    throw new Error('Invalid credentials');
};

export const apiRegister = async (name: string, email: string, pass: string, role: UserRole): Promise<User> => {
    await wait(500);
    const users = getData<({password: string} & User)[]>(USERS_KEY, []);
    if (users.some(u => u.email === email)) {
        throw new Error('Email already in use');
    }
    const newUser: User = { id: `user-${Date.now()}`, name, email, role };
    users.push({ ...newUser, password: pass });
    setData(USERS_KEY, users);
    return newUser;
};


// Courses
export const apiGetAllCourses = async (): Promise<Course[]> => {
    await wait(500);
    return getData(COURSES_KEY, []);
};

export const apiGetMyCourses = async (studentId: string): Promise<(Course & { progress: { completed: number; total: number; } })[]> => {
    await wait(500);
    const allCourses = getData<Course[]>(COURSES_KEY, []);
    const enrollments = getData<{ studentId: string, courseId: string }[]>(ENROLLMENTS_KEY, []);
    const myCourseIds = enrollments.filter(e => e.studentId === studentId).map(e => e.courseId);
    
    const myCourses = allCourses.filter(c => myCourseIds.includes(c.id));

    return myCourses.map(course => {
        const progress = _getStudentCourseProgress(course.id, studentId);
        return {
            ...course,
            progress: {
                completed: progress.completed,
                total: progress.total
            }
        };
    });
};

export const apiGetCourseById = async (courseId: string): Promise<Course> => {
    await wait(300);
    const courses = getData<Course[]>(COURSES_KEY, []);
    const course = courses.find(c => c.id === courseId);
    if (!course) throw new Error('Course not found');
    return course;
};

export const apiEnrollInCourse = async (studentId: string, courseId: string): Promise<void> => {
    await wait(700);
    const enrollments = getData<{ studentId: string, courseId: string }[]>(ENROLLMENTS_KEY, []);
    if (!enrollments.some(e => e.studentId === studentId && e.courseId === courseId)) {
        enrollments.push({ studentId, courseId });
        setData(ENROLLMENTS_KEY, enrollments);
    }
};

export const apiCreateCourse = async (courseData: { title: string; description: string; duration: string; teacherId: string; }): Promise<Course> => {
    await wait(800);
    const courses = getData<Course[]>(COURSES_KEY, []);
    const users = getData<User[]>(USERS_KEY, []);
    const teacher = users.find(u => u.id === courseData.teacherId);
    if (!teacher) throw new Error('Teacher not found');
    
    const newCourse: Course = {
        id: `course-${Date.now()}`,
        teacherName: teacher.name,
        ...courseData,
    };
    courses.push(newCourse);
    setData(COURSES_KEY, courses);
    return newCourse;
};

export const apiGetCourseRoster = async (courseId: string): Promise<User[]> => {
    await wait(400);
    const allUsers = getData<User[]>(USERS_KEY, []);
    const enrollments = getData<{ studentId: string, courseId: string }[]>(ENROLLMENTS_KEY, []);
    const studentIds = enrollments.filter(e => e.courseId === courseId).map(e => e.studentId);
    return allUsers.filter(u => studentIds.includes(u.id));
};

// Assignments
export const apiGetAssignmentsForCourse = async (courseId: string): Promise<Assignment[]> => {
    await wait(400);
    const assignments = getData<Assignment[]>(ASSIGNMENTS_KEY, []);
    return assignments.filter(a => a.courseId === courseId);
};

export const apiGetAssignmentById = async (assignmentId: string): Promise<Assignment> => {
    await wait(300);
    const assignments = getData<Assignment[]>(ASSIGNMENTS_KEY, []);
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) throw new Error('Assignment not found');
    return assignment;
};

export const apiCreateAssignment = async (assignmentData: Omit<Assignment, 'id'>): Promise<Assignment> => {
    await wait(800);
    const assignments = getData<Assignment[]>(ASSIGNMENTS_KEY, []);
    const newAssignment: Assignment = {
        id: `assign-${Date.now()}`,
        ...assignmentData,
    };
    assignments.push(newAssignment);
    setData(ASSIGNMENTS_KEY, assignments);
    return newAssignment;
};

// Submissions
export const apiGetSubmissionsForAssignment = async (assignmentId: string): Promise<Submission[]> => {
    await wait(500);
    const submissions = getData<Submission[]>(SUBMISSIONS_KEY, []);
    return submissions.filter(s => s.assignmentId === assignmentId);
};

export const apiGetStudentSubmission = async (assignmentId: string, studentId: string): Promise<Submission | null> => {
    await wait(300);
    const submissions = getData<Submission[]>(SUBMISSIONS_KEY, []);
    return submissions.find(s => s.assignmentId === assignmentId && s.studentId === studentId) || null;
};

export const apiSubmitAssignment = async (assignmentId: string, studentId: string, content: string, file?: Submission['file']): Promise<Submission> => {
    await wait(1000);
    const submissions = getData<Submission[]>(SUBMISSIONS_KEY, []);
    const users = getData<User[]>(USERS_KEY, []);
    const assignments = getData<Assignment[]>(ASSIGNMENTS_KEY, []);
    
    const student = users.find(u => u.id === studentId);
    if (!student) throw new Error('Student not found');

    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) throw new Error('Assignment not found');

    const submittedAt = new Date();
    const dueDate = new Date(assignment.dueDate);
    
    const status = submittedAt > dueDate ? SubmissionStatus.Late : SubmissionStatus.Submitted;
    
    // For simplicity, we just add a new one. A real system would handle re-submissions.
    const newSubmission: Submission = {
        id: `sub-${Date.now()}`,
        assignmentId,
        studentId,
        studentName: student.name,
        content,
        file,
        submittedAt: submittedAt.toISOString(),
        grade: null,
        feedback: null,
        status: status,
    };
    submissions.push(newSubmission);
    setData(SUBMISSIONS_KEY, submissions);
    return newSubmission;
};

export const apiGradeSubmission = async (submissionId: string, grade: number, feedback: string): Promise<Submission> => {
    await wait(700);
    const submissions = getData<Submission[]>(SUBMISSIONS_KEY, []);
    const submissionIndex = submissions.findIndex(s => s.id === submissionId);
    if (submissionIndex === -1) throw new Error('Submission not found');
    
    submissions[submissionIndex] = {
        ...submissions[submissionIndex],
        grade,
        feedback,
        status: SubmissionStatus.Graded,
    };
    setData(SUBMISSIONS_KEY, submissions);
    return submissions[submissionIndex];
};

export const apiGetOverallCourseGrade = async (courseId: string, studentId: string): Promise<number | null> => {
    await wait(200);
    const submissions = getData<Submission[]>(SUBMISSIONS_KEY, []);
    const assignments = getData<Assignment[]>(ASSIGNMENTS_KEY, []);

    const courseAssignments = assignments.filter(a => a.courseId === courseId);
    if (courseAssignments.length === 0) return null;

    const studentSubmissionsForCourse = submissions.filter(s =>
        s.studentId === studentId && courseAssignments.some(a => a.id === s.assignmentId) && s.grade !== null
    );

    if (studentSubmissionsForCourse.length === 0) {
        return null; // No graded assignments
    }

    const totalGrade = studentSubmissionsForCourse.reduce((sum, sub) => sum + (sub.grade || 0), 0);
    return Math.round(totalGrade / studentSubmissionsForCourse.length);
};

// --- Progress & Dashboard APIs ---

// Private helper for progress calculation
const _getStudentCourseProgress = (courseId: string, studentId: string) => {
    const allAssignments = getData<Assignment[]>(ASSIGNMENTS_KEY, []);
    const allSubmissions = getData<Submission[]>(SUBMISSIONS_KEY, []);

    const courseAssignments = allAssignments.filter(a => a.courseId === courseId);
    const total = courseAssignments.length;

    if (total === 0) {
        return { total: 0, completed: 0, completedIds: new Set<string>() };
    }

    const studentSubmissions = allSubmissions.filter(s => s.studentId === studentId);
    const studentSubmittedCourseAssignmentIds = new Set(
        studentSubmissions
            .filter(s => courseAssignments.some(a => a.id === s.assignmentId))
            .map(s => s.assignmentId)
    );

    const completed = studentSubmittedCourseAssignmentIds.size;

    return { total, completed, completedIds: studentSubmittedCourseAssignmentIds };
};

export const apiGetStudentCourseProgressDetails = async (courseId: string, studentId: string) => {
    await wait(250);
    const progress = _getStudentCourseProgress(courseId, studentId);
    const completionPercentage = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;

    return {
        totalAssignments: progress.total,
        completedAssignments: progress.completed,
        completionPercentage,
        completedAssignmentIds: progress.completedIds,
    };
};

interface StudentDashboardSummary {
    enrolledCourses: number;
    upcomingAssignments: (Assignment & { courseTitle: string })[];
    averageGrade: number | null;
}

export const apiGetStudentDashboardSummary = async (studentId: string): Promise<StudentDashboardSummary> => {
    await wait(600);
    const myEnrolledCourses = await apiGetMyCourses(studentId); // This gets courses with progress
    const allAssignments = getData<Assignment[]>(ASSIGNMENTS_KEY, []);
    const allCourses = getData<Course[]>(COURSES_KEY, []);
    const submissions = getData<Submission[]>(SUBMISSIONS_KEY, []);

    const myCourseIds = myEnrolledCourses.map(c => c.id);
    
    // Upcoming Assignments (due in the next 7 days and not submitted)
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const mySubmittedAssignmentIds = new Set(
        submissions.filter(s => s.studentId === studentId).map(s => s.assignmentId)
    );

    const upcomingAssignments = allAssignments.filter(a => {
        const dueDate = new Date(a.dueDate);
        return myCourseIds.includes(a.courseId) &&
               dueDate > now &&
               dueDate <= sevenDaysFromNow &&
               !mySubmittedAssignmentIds.has(a.id);
    }).map(a => {
        const course = allCourses.find(c => c.id === a.courseId);
        return { ...a, courseTitle: course?.title || 'Unknown Course' };
    }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());


    // Average Grade across all courses
    const gradedSubmissions = submissions.filter(s => s.studentId === studentId && s.grade !== null);
    let averageGrade: number | null = null;
    if (gradedSubmissions.length > 0) {
        const total = gradedSubmissions.reduce((acc, sub) => acc + (sub.grade || 0), 0);
        averageGrade = Math.round(total / gradedSubmissions.length);
    }
    
    return {
        enrolledCourses: myEnrolledCourses.length,
        upcomingAssignments,
        averageGrade
    };
};

interface TeacherDashboardSummary {
    totalCourses: number;
    totalStudents: number;
    submissionsToGrade: (Submission & { assignmentTitle: string, courseTitle: string, courseId: string })[];
}

export const apiGetTeacherDashboardSummary = async (teacherId: string): Promise<TeacherDashboardSummary> => {
    await wait(600);
    const allCourses = getData<Course[]>(COURSES_KEY, []);
    const allAssignments = getData<Assignment[]>(ASSIGNMENTS_KEY, []);
    const allSubmissions = getData<Submission[]>(SUBMISSIONS_KEY, []);
    const allEnrollments = getData<{ studentId: string, courseId: string }[]>(ENROLLMENTS_KEY, []);
    
    const myCourses = allCourses.filter(c => c.teacherId === teacherId);
    const myCourseIds = myCourses.map(c => c.id);

    const studentIds = new Set(
        allEnrollments.filter(e => myCourseIds.includes(e.courseId)).map(e => e.studentId)
    );
    
    const myCourseAssignmentIds = new Set(allAssignments.filter(a => myCourseIds.includes(a.courseId)).map(a => a.id));

    const submissionsToGrade = allSubmissions.filter(s => 
        myCourseAssignmentIds.has(s.assignmentId) && s.status !== SubmissionStatus.Graded
    ).map(s => {
        const assignment = allAssignments.find(a => a.id === s.assignmentId);
        const course = allCourses.find(c => c.id === assignment?.courseId);
        return {
            ...s,
            assignmentTitle: assignment?.title || 'Unknown Assignment',
            courseTitle: course?.title || 'Unknown Course',
            courseId: assignment?.courseId || ''
        }
    }).sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

    return {
        totalCourses: myCourses.length,
        totalStudents: studentIds.size,
        submissionsToGrade
    };
};