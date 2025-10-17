import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiGetCourseById, apiGetAssignmentsForCourse, apiGetCourseRoster, apiCreateAssignment, apiGetStudentCourseProgressDetails } from '../services/api';
import { Course, Assignment, User, UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';
import Spinner from '../components/Spinner';
import Card, { CardContent, CardHeader, CardFooter } from '../components/Card';
import Button from '../components/Button';

// --- Helper Components ---
const CheckCircleIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-emerald-500 inline-block ml-2 flex-shrink-0">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
  </svg>
);

interface StudentProgress {
  totalAssignments: number;
  completedAssignments: number;
  completionPercentage: number;
  completedAssignmentIds: Set<string>;
}

const CourseCompletionProgress: React.FC<{ progress: StudentProgress | null }> = ({ progress }) => {
  if (!progress || progress.totalAssignments === 0) return null;

  return (
    <Card className="mb-8">
      <CardContent>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Your Progress</h3>
        <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{progress.completionPercentage}% Complete</span>
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{progress.completedAssignments} / {progress.totalAssignments} Assignments</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-4 dark:bg-slate-700">
            <div className="bg-indigo-600 h-4 rounded-full flex items-center justify-center text-xs font-bold text-white transition-all duration-500" style={{ width: `${progress.completionPercentage}%` }}>
              {progress.completionPercentage > 10 && `${progress.completionPercentage}%`}
            </div>
        </div>
      </CardContent>
    </Card>
  );
};


// --- Main Component ---
const CourseDetailPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [roster, setRoster] = useState<User[]>([]);
  const [studentProgress, setStudentProgress] = useState<StudentProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRoster, setShowRoster] = useState(false);
  const [showCreateAssignment, setShowCreateAssignment] = useState(false);

  const isTeacher = user?.role === UserRole.Teacher && user?.id === course?.teacherId;
  const isStudent = user?.role === UserRole.Student;

  const fetchData = useCallback(async () => {
    if (!courseId || !user) return;
    try {
      setLoading(true);
      const courseData = await apiGetCourseById(courseId);
      setCourse(courseData);
      const assignmentData = await apiGetAssignmentsForCourse(courseId);
      setAssignments(assignmentData);

      if (user.role === UserRole.Teacher && user.id === courseData.teacherId) {
        const rosterData = await apiGetCourseRoster(courseId);
        setRoster(rosterData);
      }
      if(user.role === UserRole.Student) {
        const progressData = await apiGetStudentCourseProgressDetails(courseId, user.id);
        setStudentProgress(progressData);
      }

    } catch (err) {
      setError('Failed to load course details.');
    } finally {
      setLoading(false);
    }
  }, [courseId, user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <Spinner />;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!course) return <p className="dark:text-white">Course not found.</p>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">{course.title}</h1>
        <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">{course.description}</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Taught by {course.teacherName} | {course.duration}</p>
      </div>
      
      {isTeacher && (
        <div className="mb-6 flex space-x-4">
          <Button onClick={() => setShowCreateAssignment(true)}>Create Assignment</Button>
          <Button onClick={() => setShowRoster(!showRoster)} variant="secondary">
            {showRoster ? 'Hide Roster' : 'View Roster'} ({roster.length} students)
          </Button>
        </div>
      )}

      {showCreateAssignment && isTeacher && <CreateAssignmentForm courseId={course.id} onAssignmentCreated={() => { fetchData(); setShowCreateAssignment(false); }} />}
      
      {showRoster && isTeacher && (
        <Card className="mb-8">
          <CardHeader><h2 className="text-xl font-bold dark:text-white">Student Roster</h2></CardHeader>
          <CardContent>
            {roster.length > 0 ? (
                <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                    {roster.map(student => <li key={student.id} className="py-3 text-slate-700 dark:text-slate-300">{student.name} - {student.email}</li>)}
                </ul>
            ) : <p className="text-slate-500 dark:text-slate-400">No students enrolled yet.</p>}
          </CardContent>
        </Card>
      )}

      {isStudent && <CourseCompletionProgress progress={studentProgress} />}

      <Card>
        <CardHeader><h2 className="text-xl font-bold dark:text-white">Assignments</h2></CardHeader>
        <CardContent>
            {assignments.length > 0 ? (
                <ul className="space-y-4">
                    {assignments.map(assignment => {
                        const isCompleted = isStudent && studentProgress?.completedAssignmentIds.has(assignment.id);
                        return (
                            <li key={assignment.id} className={`p-4 rounded-lg flex justify-between items-center transition ${isCompleted ? 'bg-emerald-50 dark:bg-slate-800 border-l-4 border-emerald-500' : 'bg-slate-100 dark:bg-slate-800'}`}>
                                <div>
                                    <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center">
                                        {assignment.title}
                                        {isCompleted && <CheckCircleIcon />}
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
                                </div>
                                <Button as={Link} to={`/courses/${course.id}/assignments/${assignment.id}`}>
                                    {isCompleted && isStudent ? 'View Submission' : 'View'}
                                </Button>
                            </li>
                        )
                    })}
                </ul>
            ) : <p className="text-slate-500 dark:text-slate-400">No assignments have been created for this course yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
};


interface CreateAssignmentFormProps {
    courseId: string;
    onAssignmentCreated: () => void;
}

const CreateAssignmentForm: React.FC<CreateAssignmentFormProps> = ({ courseId, onAssignmentCreated }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [dateError, setDateError] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        setFile(e.target.files[0]);
      } else {
        setFile(null);
      }
    };

    const fileToBase64 = (file: File): Promise<string> =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = (error) => reject(error);
      });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // --- Due Date Validation ---
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to the start of the day.

        // Create date from 'YYYY-MM-DD' string to avoid timezone issues.
        const dateParts = dueDate.split('-').map(p => parseInt(p, 10));
        const selectedDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);

        if (selectedDate < today) {
            setDateError('Due date cannot be in the past.');
            return; // Stop submission if validation fails
        }
        // --- End Validation ---

        setIsLoading(true);
        setDateError(''); // Clear any previous error
        try {
            let attachment;
            if (file) {
                const content = await fileToBase64(file);
                attachment = { name: file.name, content, type: file.type };
            }
            await apiCreateAssignment({ courseId, title, description, dueDate, attachment });
            onAssignmentCreated();
        } catch (error) {
            alert("Failed to create assignment");
        } finally {
            setIsLoading(false);
        }
    };
    
    // Handler to clear the error when the date is changed
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDueDate(e.target.value);
        if (dateError) {
            setDateError('');
        }
    }

    return (
        <Card className="mb-8">
            <CardHeader><h3 className="text-lg font-bold dark:text-white">New Assignment</h3></CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"/>
                    <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} required className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" rows={3}></textarea>
                    
                    <div>
                        <input type="date" value={dueDate} onChange={handleDateChange} required className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"/>
                        {dateError && <p className="mt-1 text-sm text-red-500">{dateError}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Attach File (Optional)</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-slate-600 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <div className="flex justify-center text-sm text-gray-600 dark:text-slate-400">
                                <label htmlFor="assignment-file-upload" className="relative cursor-pointer bg-white dark:bg-slate-800 rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                    <span>Upload a file</span>
                                    <input id="assignment-file-upload" name="assignment-file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-slate-500">Any file type is accepted</p>
                            </div>
                        </div>
                        {file && <p className="mt-2 text-sm text-green-600 dark:text-green-400">Selected file: {file.name}</p>}
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit" isLoading={isLoading}>Create</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}

export default CourseDetailPage;