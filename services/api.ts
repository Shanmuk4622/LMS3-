import { User, Course, Module, Lesson, LessonType, Assignment, Submission, Grade, Notification, NotificationType } from '../types';
import { db } from './firebase';
import { 
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    setDoc,
    query,
    where,
    Timestamp,
    orderBy,
    writeBatch
} from 'firebase/firestore';

// Helper to convert Firestore doc to our types
const fromDoc = <T>(doc: any): T => {
    const data = doc.data();
    return { ...data, id: doc.id };
};

const fromDate = (timestamp: Timestamp | Date): string => {
    if (timestamp instanceof Timestamp) {
        return timestamp.toDate().toISOString();
    }
    return timestamp.toISOString();
}

// User Profile
export const apiCreateUserInDb = async (userData: Omit<User, 'id'> & { id: string }): Promise<void> => {
    const userRef = doc(db, "users", userData.id);
    await setDoc(userRef, {
        name: userData.name,
        email: userData.email,
        role: userData.role
    });
};

// Courses
export const apiGetAllCourses = async (): Promise<Course[]> => {
    const coursesCol = collection(db, 'courses');
    const courseSnapshot = await getDocs(coursesCol);
    return courseSnapshot.docs.map(doc => fromDoc<Course>(doc));
}

export const apiGetMyCourses = async (userId: string): Promise<Course[]> => {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) throw new Error("User not found");

    const user = { ...userDoc.data(), id: userDoc.id };

    let coursesQuery;
    if (user.role === 'Teacher') {
        coursesQuery = query(collection(db, 'courses'), where('teacherId', '==', userId));
    } else {
        const enrollmentsQuery = query(collection(db, 'enrollments'), where('userId', '==', userId));
        const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
        const courseIds = enrollmentsSnapshot.docs.map(d => d.data().courseId);
        if (courseIds.length === 0) return [];
        coursesQuery = query(collection(db, 'courses'), where('__name__', 'in', courseIds));
    }

    const courseSnapshot = await getDocs(coursesQuery);
    const courses = courseSnapshot.docs.map(doc => fromDoc<Course>(doc));

    // Calculate progress for each course
    const progressPromises = courses.map(async (course) => {
        const modulesQuery = query(collection(db, `courses/${course.id}/modules`));
        const modulesSnapshot = await getDocs(modulesQuery);
        const lessonsPromises = modulesSnapshot.docs.map(m => getDocs(collection(db, `courses/${course.id}/modules/${m.id}/lessons`)));
        const lessonsSnapshots = await Promise.all(lessonsPromises);
        const allLessons = lessonsSnapshots.flatMap(snapshot => snapshot.docs.map(d => fromDoc<Lesson>(d)));

        if (allLessons.length === 0) {
            return { ...course, progress: { completed: 0, total: 0 }};
        }

        const completionsQuery = query(collection(db, `users/${userId}/lessonCompletions`), where('courseId', '==', course.id));
        const completionsSnapshot = await getDocs(completionsQuery);
        const completedCount = completionsSnapshot.size;

        return { ...course, progress: { completed: completedCount, total: allLessons.length } };
    });

    return Promise.all(progressPromises);
}

export const apiEnrollInCourse = async (userId: string, courseId: string): Promise<void> => {
    const enrollmentQuery = query(collection(db, 'enrollments'), where('userId', '==', userId), where('courseId', '==', courseId));
    const snapshot = await getDocs(enrollmentQuery);

    if (snapshot.empty) {
        await addDoc(collection(db, 'enrollments'), { userId, courseId });
    }
}

export const apiCreateCourse = async (courseData: {title: string, description: string, duration: string, teacherId: string}): Promise<Course> => {
    const userDoc = await getDoc(doc(db, 'users', courseData.teacherId));
    if (!userDoc.exists()) throw new Error("Teacher not found");
    const teacherName = userDoc.data().name;

    const newCourseData = {
        ...courseData,
        teacherName,
        progress: { completed: 0, total: 0 }
    }
    const docRef = await addDoc(collection(db, 'courses'), newCourseData);
    return { ...newCourseData, id: docRef.id };
}

export const apiGetCourseById = async (courseId: string): Promise<Course> => {
    const courseDoc = await getDoc(doc(db, 'courses', courseId));
    if (!courseDoc.exists()) throw new Error("Course not found");
    return fromDoc<Course>(courseDoc);
}

export const apiGetCourseModules = async (courseId: string, userId: string): Promise<Module[]> => {
    const modulesQuery = query(collection(db, `courses/${courseId}/modules`), orderBy('title'));
    const modulesSnapshot = await getDocs(modulesQuery);

    const modulesData: Module[] = [];

    for (const moduleDoc of modulesSnapshot.docs) {
        const module = fromDoc<Omit<Module, 'lessons'>>(moduleDoc);
        const lessonsQuery = query(collection(db, `courses/${courseId}/modules/${module.id}/lessons`), orderBy('title'));
        const lessonsSnapshot = await getDocs(lessonsQuery);
        const lessons = lessonsSnapshot.docs.map(l => fromDoc<Lesson>(l));
        
        const completionsQuery = query(collection(db, `users/${userId}/lessonCompletions`), where('moduleId', '==', module.id));
        const completionsSnapshot = await getDocs(completionsQuery);
        const completedLessonIds = new Set(completionsSnapshot.docs.map(d => d.data().lessonId));
        
        const lessonsWithCompletion = lessons.map(lesson => ({
            ...lesson,
            isCompleted: completedLessonIds.has(lesson.id)
        }));

        modulesData.push({ ...module, lessons: lessonsWithCompletion });
    }
    return modulesData;
}


export const apiMarkLessonAsComplete = async (lessonId: string, userId: string, courseId: string, moduleId: string): Promise<void> => {
    const completionRef = doc(db, `users/${userId}/lessonCompletions`, `${courseId}_${lessonId}`);
    const completionDoc = await getDoc(completionRef);
    if (!completionDoc.exists()) {
       await setDoc(completionRef, { userId, lessonId, courseId, moduleId, completedAt: Timestamp.now() });
    }
}

export const apiCreateModule = async (courseId: string, title: string): Promise<Module> => {
    const docRef = await addDoc(collection(db, `courses/${courseId}/modules`), { title });
    return { id: docRef.id, title, lessons: [] };
}

export const apiCreateLesson = async (courseId: string, moduleId: string, lessonData: { title: string, type: LessonType, content: string }): Promise<Lesson> => {
    let newLessonData: Omit<Lesson, 'id'>;

    if (lessonData.type === LessonType.Assignment) {
        const newAssignment: Omit<Assignment, 'id'> = {
            courseId,
            title: lessonData.title,
            description: lessonData.content,
            dueDate: fromDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)),
        }
        const assignmentRef = await addDoc(collection(db, 'assignments'), newAssignment);
        newLessonData = {
            title: lessonData.title,
            type: LessonType.Assignment,
            content: assignmentRef.id,
        }
    } else {
        newLessonData = lessonData;
    }

    const lessonRef = await addDoc(collection(db, `courses/${courseId}/modules/${moduleId}/lessons`), newLessonData);
    return { ...newLessonData, id: lessonRef.id };
}


// Assignments & Submissions
export const apiGetAssignmentById = async (assignmentId: string): Promise<Assignment> => {
    const assignmentDoc = await getDoc(doc(db, 'assignments', assignmentId));
    if (!assignmentDoc.exists()) throw new Error("Assignment not found");
    const data = fromDoc<any>(assignmentDoc);
    return { ...data, dueDate: fromDate(data.dueDate) };
}

export const apiGetSubmission = async (assignmentId: string, studentId: string): Promise<Submission | null> => {
    const q = query(collection(db, 'submissions'), where('assignmentId', '==', assignmentId), where('studentId', '==', studentId));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const data = fromDoc<any>(snapshot.docs[0]);
    return { ...data, submittedAt: fromDate(data.submittedAt) };
}

export const apiSubmitAssignment = async (assignmentId: string, studentId: string, content: string): Promise<Submission> => {
    const existingSubmission = await apiGetSubmission(assignmentId, studentId);
    
    if (existingSubmission) {
        const submissionRef = doc(db, 'submissions', existingSubmission.id);
        await updateDoc(submissionRef, { content, submittedAt: Timestamp.now() });
        return { ...existingSubmission, content, submittedAt: new Date().toISOString() };
    } else {
        const newSubmissionData = {
            assignmentId,
            studentId,
            content,
            grade: null,
            feedback: null,
            submittedAt: Timestamp.now(),
        };
        const docRef = await addDoc(collection(db, 'submissions'), newSubmissionData);

        // Notify teacher logic remains similar but separated for clarity
        const assignment = await apiGetAssignmentById(assignmentId);
        const course = await apiGetCourseById(assignment.courseId);
        const studentDoc = await getDoc(doc(db, 'users', studentId));
        if (course && studentDoc.exists()) {
            apiCreateNotification({
                userId: course.teacherId,
                message: `${studentDoc.data().name} submitted an assignment for "${assignment?.title}".`,
                type: NotificationType.NewSubmission,
                link: `/courses/${course.id}/assignments/${assignmentId}`
            });
        }

        return { id: docRef.id, ...newSubmissionData, submittedAt: fromDate(newSubmissionData.submittedAt) };
    }
}

export const apiGetSubmissionsForAssignment = async (assignmentId: string): Promise<Grade[]> => {
    const assignment = await apiGetAssignmentById(assignmentId);
    
    const enrollmentsQuery = query(collection(db, 'enrollments'), where('courseId', '==', assignment.courseId));
    const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
    const studentIds = enrollmentsSnapshot.docs.map(d => d.data().userId);

    if (studentIds.length === 0) return [];

    const grades: Grade[] = [];
    for (const studentId of studentIds) {
        const studentDoc = await getDoc(doc(db, 'users', studentId));
        if (studentDoc.exists()) {
            const submission = await apiGetSubmission(assignmentId, studentId);
            grades.push({
                studentId,
                studentName: studentDoc.data().name,
                submission: submission || null,
            });
        }
    }
    return grades;
}

export const apiGradeSubmission = async (submissionId: string, grade: number, feedback: string): Promise<Submission> => {
    const submissionRef = doc(db, 'submissions', submissionId);
    await updateDoc(submissionRef, { grade, feedback });
    
    const submissionDoc = await getDoc(submissionRef);
    const submission = fromDoc<Submission>(submissionDoc);

    const assignment = await apiGetAssignmentById(submission.assignmentId);
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


// Notifications
export const apiCreateNotification = async (data: Omit<Notification, 'id' | 'read' | 'createdAt'>): Promise<Notification> => {
    const newNotification = {
        ...data,
        read: false,
        createdAt: Timestamp.now(),
    };
    const docRef = await addDoc(collection(db, 'notifications'), newNotification);
    return { ...newNotification, id: docRef.id, createdAt: fromDate(newNotification.createdAt) };
};

export const apiGetNotifications = async (userId: string): Promise<Notification[]> => {
    const q = query(collection(db, 'notifications'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ ...fromDoc<any>(d), createdAt: fromDate(d.data().createdAt) }));
};

export const apiMarkNotificationAsRead = async (notificationId: string): Promise<void> => {
    await updateDoc(doc(db, 'notifications', notificationId), { read: true });
}

export const apiMarkAllNotificationsAsRead = async (userId: string): Promise<void> => {
    const q = query(collection(db, 'notifications'), where('userId', '==', userId), where('read', '==', false));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return;

    const batch = writeBatch(db);
    snapshot.docs.forEach(d => {
        batch.update(d.ref, { read: true });
    });
    await batch.commit();
}
