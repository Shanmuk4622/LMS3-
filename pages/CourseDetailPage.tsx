
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiGetCourseById, apiGetAssignmentsForCourse, apiGetCourseRoster, apiCreateAssignment } from '../services/api';
import { Course, Assignment, User, UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';
import Spinner from '../components/Spinner';
import Card, { CardContent, CardHeader, CardFooter } from '../components/Card';
import Button from '../components/Button';

const CourseDetailPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [roster, setRoster] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRoster, setShowRoster] = useState(false);
  const [showCreateAssignment, setShowCreateAssignment] = useState(false);

  const isTeacher = user?.role === UserRole.Teacher && user?.id === course?.teacherId;

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

      <Card>
        <CardHeader><h2 className="text-xl font-bold dark:text-white">Assignments</h2></CardHeader>
        <CardContent>
            {assignments.length > 0 ? (
                <ul className="space-y-4">
                    {assignments.map(assignment => (
                        <li key={assignment.id} className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800 flex justify-between items-center transition hover:bg-slate-200 dark:hover:bg-slate-700">
                            <div>
                                <h3 className="font-semibold text-slate-800 dark:text-slate-200">{assignment.title}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
                            </div>
                            <Button as={Link} to={`/courses/${course.id}/assignments/${assignment.id}`}>
                                View
                            </Button>
                        </li>
                    ))}
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
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await apiCreateAssignment({ courseId, title, description, dueDate });
            onAssignmentCreated();
        } catch (error) {
            alert("Failed to create assignment");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="mb-8">
            <CardHeader><h3 className="text-lg font-bold dark:text-white">New Assignment</h3></CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"/>
                    <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} required className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" rows={3}></textarea>
                    <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"/>
                    <div className="flex justify-end">
                        <Button type="submit" isLoading={isLoading}>Create</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}

export default CourseDetailPage;
