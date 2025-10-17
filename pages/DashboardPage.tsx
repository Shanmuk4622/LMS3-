import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole, Assignment, Submission, SubmissionStatus } from '../types';
import { apiGetStudentDashboardSummary, apiGetTeacherDashboardSummary } from '../services/api';
import Spinner from '../components/Spinner';
import Card, { CardContent, CardHeader } from '../components/Card';
import { Link } from 'react-router-dom';
import Button from '../components/Button';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <Card>
        <CardContent className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900/50 mr-4 text-indigo-600 dark:text-indigo-300">
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">{title}</p>
                <p className="text-2xl font-semibold text-slate-900 dark:text-white">{value}</p>
            </div>
        </CardContent>
    </Card>
);

const BookOpenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const AcademicCapIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 14v6" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5.965 5.965 0 0112 13a5.965 5.965 0 014.5 2.803" /></svg>;
const PencilAltIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;

const StudentDashboard: React.FC<{ userId: string }> = ({ userId }) => {
    const [summary, setSummary] = useState<{ enrolledCourses: number; upcomingAssignments: (Assignment & { courseTitle: string })[]; averageGrade: number | null; } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiGetStudentDashboardSummary(userId)
            .then(setSummary)
            .catch(error => console.error("Failed to load student dashboard summary", error))
            .finally(() => setLoading(false));
    }, [userId]);
    
    if (loading) return <Spinner />;
    if (!summary) return <p className="text-slate-500 dark:text-slate-400">Could not load dashboard data.</p>;

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Enrolled Courses" value={summary.enrolledCourses} icon={<BookOpenIcon />} />
                <StatCard title="Assignments Due Soon" value={summary.upcomingAssignments.length} icon={<ClockIcon />} />
                <StatCard title="Average Grade" value={summary.averageGrade !== null ? `${summary.averageGrade}%` : 'N/A'} icon={<AcademicCapIcon />} />
            </div>
            
            <Card>
                <CardHeader>
                    <h2 className="text-xl font-bold dark:text-white">Upcoming Deadlines (Next 7 Days)</h2>
                </CardHeader>
                <CardContent>
                    {summary.upcomingAssignments.length > 0 ? (
                        <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                            {summary.upcomingAssignments.map(a => (
                                <li key={a.id} className="py-3 flex justify-between items-center">
                                    <div>
                                        <p className="font-medium text-slate-800 dark:text-slate-200">{a.title}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{a.courseTitle} - Due: {new Date(a.dueDate).toLocaleDateString()}</p>
                                    </div>
                                    <Button as={Link} to={`/courses/${a.courseId}/assignments/${a.id}`} variant="secondary" size="sm">View</Button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                       <p className="text-slate-500 dark:text-slate-400">No assignments due in the next 7 days. You're all caught up!</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

const TeacherDashboard: React.FC<{ userId: string }> = ({ userId }) => {
    const [summary, setSummary] = useState<{ totalCourses: number; totalStudents: number; submissionsToGrade: (Submission & { assignmentTitle: string, courseTitle: string, courseId: string })[] } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiGetTeacherDashboardSummary(userId)
            .then(setSummary)
            .catch(error => console.error("Failed to load teacher dashboard summary", error))
            .finally(() => setLoading(false));
    }, [userId]);

    if (loading) return <Spinner />;
    if (!summary) return <p className="text-slate-500 dark:text-slate-400">Could not load dashboard data.</p>;

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Courses" value={summary.totalCourses} icon={<BookOpenIcon />} />
                <StatCard title="Total Students" value={summary.totalStudents} icon={<UsersIcon />} />
                <StatCard title="Submissions to Grade" value={summary.submissionsToGrade.length} icon={<PencilAltIcon />} />
            </div>
            
            <Card>
                <CardHeader>
                    <h2 className="text-xl font-bold dark:text-white">Recent Submissions to Grade</h2>
                </CardHeader>
                <CardContent>
                    {summary.submissionsToGrade.length > 0 ? (
                        <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                            {summary.submissionsToGrade.slice(0, 5).map(s => (
                                <li key={s.id} className="py-3 flex justify-between items-center">
                                    <div>
                                        <p className="font-medium text-slate-800 dark:text-slate-200">{s.studentName}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            {s.assignmentTitle} ({s.courseTitle}) - Submitted: {new Date(s.submittedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <Button as={Link} to={`/courses/${s.courseId}/assignments/${s.assignmentId}`} variant="secondary" size="sm">Grade</Button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                       <p className="text-slate-500 dark:text-slate-400">No submissions need grading. Great job!</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div>
      <div className="pb-8 border-b border-slate-200 dark:border-slate-700 mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Dashboard</h1>
        <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">Welcome back, {user?.name}. Here's your overview.</p>
      </div>

      {user?.role === UserRole.Student && user.id && <StudentDashboard userId={user.id} />}
      {user?.role === UserRole.Teacher && user.id && <TeacherDashboard userId={user.id} />}
    </div>
  );
};

export default DashboardPage;