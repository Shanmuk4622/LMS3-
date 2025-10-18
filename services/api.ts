import { User, UserRole, Course, Module, Lesson, LessonType, Assignment, Submission, Grade, Notification, NotificationType } from '../types';

// Mock Database
let users: User[] = [
  { id: '1', name: 'Alice Teacher', email: 'teacher@example.com', role: UserRole.Teacher },
  { id: '2', name: 'Bob Student', email: 'student@example.com', role: UserRole.Student },
];
let courses: Course[] = [
  { id: 'c1', title: 'Introduction to React', description: 'Learn the fundamentals of React, including components, state, and props.', duration: '8 Weeks', teacherId: '1', teacherName: 'Alice Teacher', progress: { completed: 0, total: 10 } },
  { id: 'c2', title: 'Advanced TypeScript', description: 'Master TypeScript for large-scale applications, covering generics, decorators, and more.', duration: '6 Weeks', teacherId: '1', teacherName: 'Alice Teacher', progress: { completed: 0, total: 12 } },
];
let enrollments: { userId: string, courseId: string }[] = [{ userId: '2', courseId: 'c1' }];
let modules: Module[] = [
    { id: 'm1', title: 'Module 1: Getting Started', lessons: [
        {id: 'l1', title: 'Introduction', type: LessonType.Text, content: 'Welcome to the course! This module will cover the basics.'},
        {id: 'l2', title: 'Setting up your environment', type: LessonType.Video, content: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'},
        {id: 'l3', title: 'Your First Component', type: LessonType.Assignment, content: 'a1'}
    ]},
    { id: 'm2', title: 'Module 2: State and Props', lessons: []},
];
let courseModules: {courseId: string, moduleId: string}[] = [{courseId: 'c1', moduleId: 'm1'}, {courseId: 'c1', moduleId: 'm2'}];

let assignments: Assignment[] = [
    { id: 'a1', courseId: 'c1', title: 'Build a Counter Component', description: 'Create a simple counter component in React that increments and decrements a value.', dueDate: new Date(Date.now() + 23 * 60 * 60 * 1000).toISOString() },
];
let submissions: Submission[] = [];

let lessonCompletions: { userId: string, lessonId: string }[] = [
    { userId: '2', lessonId: 'l1' } // Bob Student has completed the intro lesson
];

let notifications: Notification[] = [];


const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Auth
export const apiLogin = async (email: string, pass: string): Promise<User> => {
  await delay(500);
  const user = users.find(u => u.email === email);
  if (user) { // Don't check password for mock
    return user;
  }
  throw new Error('User not found');
};

export const apiRegister = async (name: string, email: string, pass: string, role: UserRole): Promise<User> => {
  await delay(500);
  if (users.some(u => u.email === email)) {
    throw new Error('Email already in use');
  }
  const newUser: User = {
    id: String(users.length + 1),
    name,
    email,
    role,
  };
  users.push(newUser);
  return newUser;
};

// Courses
export const apiGetAllCourses = async (): Promise<Course[]> => {
    await delay(500);
    return courses;
}

export const apiGetMyCourses = async (userId: string): Promise<Course[]> => {
    await delay(500);
    const user = users.find(u => u.id === userId);
    if (!user) throw new Error("User not found");

    if (user.role === UserRole.Teacher) {
        return courses.filter(c => c.teacherId === userId);
    }
    
    const enrolledCourseIds = enrollments.filter(e => e.userId === userId).map(e => e.courseId);
    const myCourses = courses.filter(c => enrolledCourseIds.includes(c.id));
    
    // Mock progress more accurately
    return myCourses.map(course => {
        const courseAssignments = assignments.filter(a => a.courseId === course.id);
        const moduleIds = courseModules.filter(cm => cm.courseId === course.id).map(cm => cm.moduleId);
        const courseModulesForCourse = modules.filter(m => moduleIds.includes(m.id));
        const allLessons = courseModulesForCourse.flatMap(m => m.lessons);

        const totalItems = allLessons.length;
        
        const submittedAssignmentIds = new Set(
            submissions
                .filter(s => s.studentId === userId && courseAssignments.some(a => a.id === s.assignmentId))
                .map(s => s.assignmentId)
        );

        const completedLessonIds = new Set(
            lessonCompletions
                .filter(lc => lc.userId === userId && allLessons.some(l => l.id === lc.lessonId))
                .map(lc => lc.lessonId)
        );

        const completedAssignmentsCount = allLessons.filter(l => l.type === LessonType.Assignment && submittedAssignmentIds.has(l.content)).length;
        const completedOtherLessonsCount = allLessons.filter(l => l.type !== LessonType.Assignment && completedLessonIds.has(l.id)).length;

        const completedItems = completedAssignmentsCount + completedOtherLessonsCount;

        return {
            ...course,
            progress: {
                completed: completedItems,
                total: totalItems
            }
        }
    })
}

export const apiEnrollInCourse = async (userId: string, courseId: string): Promise<void> => {
    await delay(500);
    if (!enrollments.some(e => e.userId === userId && e.courseId === courseId)) {
        enrollments.push({ userId, courseId });
    }
}

export const apiCreateCourse = async (courseData: {title: string, description: string, duration: string, teacherId: string}): Promise<Course> => {
    await delay(500);
    const teacher = users.find(u => u.id === courseData.teacherId);
    if (!teacher) throw new Error("Teacher not found");
    
    const newCourse: Course = {
        id: `c${courses.length + 1}`,
        ...courseData,
        teacherName: teacher.name,
        progress: { completed: 0, total: 0 }
    };
    courses.push(newCourse);
    return newCourse;
}

export const apiGetCourseById = async (courseId: string): Promise<Course> => {
    await delay(500);
    const course = courses.find(c => c.id === courseId);
    if (!course) throw new Error("Course not found");
    return course;
}

export const apiGetCourseModules = async (courseId: string, userId: string): Promise<Module[]> => {
    await delay(500);
    const moduleIds = courseModules.filter(cm => cm.courseId === courseId).map(cm => cm.moduleId);
    const courseModulesData = modules.filter(m => moduleIds.includes(m.id));

    // Add completion status for the given user
    const courseAssignments = assignments.filter(a => a.courseId === courseId);
    const submittedAssignmentIds = new Set(
        submissions
            .filter(s => s.studentId === userId && courseAssignments.some(a => a.id === s.assignmentId))
            .map(s => s.assignmentId)
    );
     const completedLessonIds = new Set(
        lessonCompletions
            .filter(lc => lc.userId === userId)
            .map(lc => lc.lessonId)
    );

    return courseModulesData.map(module => ({
        ...module,
        lessons: module.lessons.map(lesson => {
            let isCompleted = false;
            if (lesson.type === LessonType.Assignment) {
                isCompleted = submittedAssignmentIds.has(lesson.content);
            } else {
                isCompleted = completedLessonIds.has(lesson.id);
            }
            return { ...lesson, isCompleted };
        })
    }));
}

export const apiMarkLessonAsComplete = async (lessonId: string, userId: string): Promise<void> => {
    await delay(200);
    if (!lessonCompletions.some(lc => lc.lessonId === lessonId && lc.userId === userId)) {
        lessonCompletions.push({ lessonId, userId });
    }
}

export const apiCreateModule = async (courseId: string, title: string): Promise<Module> => {
    await delay(500);
    const newModule: Module = {
        id: `m${modules.length + 1}`,
        title,
        lessons: []
    };
    modules.push(newModule);
    courseModules.push({ courseId, moduleId: newModule.id });
    return newModule;
}

export const apiCreateLesson = async (moduleId: string, lessonData: { title: string, type: LessonType, content: string }): Promise<Lesson> => {
    await delay(500);
    const module = modules.find(m => m.id === moduleId);
    if (!module) throw new Error("Module not found");

    let newLesson: Lesson;
    const course = courses.find(c => courseModules.some(cm => cm.courseId === c.id && cm.moduleId === moduleId));
    if (!course) throw new Error("Course not found for this module");
        
    if (lessonData.type === LessonType.Assignment) {
        const newAssignment: Assignment = {
            id: `a${assignments.length + 1}`,
            courseId: course.id,
            title: lessonData.title,
            description: lessonData.content,
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        }
        assignments.push(newAssignment);
        newLesson = {
            id: `l${Math.random().toString(36).substr(2, 9)}`,
            title: lessonData.title,
            type: LessonType.Assignment,
            content: newAssignment.id,
        }
    } else {
        newLesson = {
            id: `l${Math.random().toString(36).substr(2, 9)}`,
            ...lessonData
        }
    }
    
    module.lessons.push(newLesson);
    return newLesson;
}

// Assignments & Submissions
export const apiGetAssignmentById = async (assignmentId: string): Promise<Assignment> => {
    await delay(500);
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) throw new Error("Assignment not found");
    return assignment;
}

export const apiGetSubmission = async (assignmentId: string, studentId: string): Promise<Submission | null> => {
    await delay(500);
    const submission = submissions.find(s => s.assignmentId === assignmentId && s.studentId === studentId);
    return submission || null;
}

export const apiSubmitAssignment = async (assignmentId: string, studentId: string, content: string): Promise<Submission> => {
    await delay(500);
    let submission = submissions.find(s => s.assignmentId === assignmentId && s.studentId === studentId);
    if (submission) {
        submission.content = content;
        submission.submittedAt = new Date().toISOString();
    } else {
         submission = {
            id: `s${submissions.length + 1}`,
            assignmentId,
            studentId,
            content,
            grade: null,
            feedback: null,
            submittedAt: new Date().toISOString(),
        };
        submissions.push(submission);
    }
    
    // Notify teacher
    const assignment = assignments.find(a => a.id === assignmentId);
    const course = courses.find(c => c.id === assignment?.courseId);
    const student = users.find(u => u.id === studentId);
    if (course && student) {
        apiCreateNotification({
            userId: course.teacherId,
            message: `${student.name} submitted an assignment for "${assignment?.title}".`,
            type: NotificationType.NewSubmission,
            link: `/courses/${course.id}/assignments/${assignmentId}`
        });
    }

    return submission;
}

export const apiGetSubmissionsForAssignment = async (assignmentId: string): Promise<Grade[]> => {
    await delay(500);
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) throw new Error("Assignment not found");
    
    const course = courses.find(c => c.id === assignment.courseId);
    if (!course) throw new Error("Course not found");
    
    const enrolledStudentIds = enrollments.filter(e => e.courseId === course.id).map(e => e.userId);
    const students = users.filter(u => enrolledStudentIds.includes(u.id));

    return students.map(student => {
        const submission = submissions.find(s => s.assignmentId === assignmentId && s.studentId === student.id);
        return {
            studentId: student.id,
            studentName: student.name,
            submission: submission || null,
        }
    })
}

export const apiGradeSubmission = async (submissionId: string, grade: number, feedback: string): Promise<Submission> => {
    await delay(500);
    const submission = submissions.find(s => s.id === submissionId);
    if (!submission) throw new Error("Submission not found");
    submission.grade = grade;
    submission.feedback = feedback;
    
    // Notify student
    const assignment = assignments.find(a => a.id === submission.assignmentId);
    if (assignment) {
        apiCreateNotification({
            userId: submission.studentId,
            message: `Your submission for "${assignment.title}" has been graded.`,
            type: NotificationType.AssignmentGraded,
            link: `/courses/${assignment.courseId}/assignments/${assignment.id}`
        });
    }

    return submission;
}

export const apiGetOverallCourseGrade = async (courseId: string, studentId: string): Promise<number | null> => {
    await delay(500);
    const courseAssignments = assignments.filter(a => a.courseId === courseId);
    const studentSubmissions = submissions.filter(s => s.studentId === studentId && courseAssignments.some(a => a.id === s.assignmentId) && s.grade !== null);

    if (studentSubmissions.length === 0) return null;

    const totalGrade = studentSubmissions.reduce((acc, sub) => acc + (sub.grade || 0), 0);
    return Math.round(totalGrade / studentSubmissions.length);
}

// Notifications
export const apiCreateNotification = async (data: Omit<Notification, 'id' | 'read' | 'createdAt'>): Promise<Notification> => {
    const newNotification: Notification = {
        id: `n${notifications.length + 1}`,
        ...data,
        read: false,
        createdAt: new Date().toISOString(),
    };
    notifications.unshift(newNotification); // Add to the beginning
    return newNotification;
};

export const apiGetNotifications = async (userId: string): Promise<Notification[]> => {
    await delay(300);
    return notifications.filter(n => n.userId === userId);
};

export const apiMarkNotificationAsRead = async (notificationId: string): Promise<Notification> => {
    await delay(100);
    const notification = notifications.find(n => n.id === notificationId);
    if (!notification) throw new Error("Notification not found");
    notification.read = true;
    return notification;
}

export const apiMarkAllNotificationsAsRead = async (userId: string): Promise<Notification[]> => {
    await delay(300);
    const userNotifications = notifications.filter(n => n.userId === userId);
    userNotifications.forEach(n => n.read = true);
    return userNotifications;
}

export const apiCheckAndCreateDeadlineReminders = async (studentId: string): Promise<void> => {
    const now = new Date();
    const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const enrolledCourseIds = new Set(enrollments.filter(e => e.userId === studentId).map(e => e.courseId));
    
    const upcomingAssignments = assignments.filter(a => {
        const dueDate = new Date(a.dueDate);
        return enrolledCourseIds.has(a.courseId) &&
               dueDate > now &&
               dueDate <= twentyFourHoursFromNow;
    });

    for (const assignment of upcomingAssignments) {
        const hasExistingReminder = notifications.some(n =>
            n.userId === studentId &&
            n.type === NotificationType.DeadlineReminder &&
            n.link.includes(assignment.id)
        );
        const hasBeenSubmitted = submissions.some(s => s.assignmentId === assignment.id && s.studentId === studentId);

        if (!hasExistingReminder && !hasBeenSubmitted) {
            await apiCreateNotification({
                userId: studentId,
                message: `Reminder: "${assignment.title}" is due in less than 24 hours.`,
                type: NotificationType.DeadlineReminder,
                link: `/courses/${assignment.courseId}/assignments/${assignment.id}`
            });
        }
    }
};