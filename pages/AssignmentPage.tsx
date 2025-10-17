import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Assignment, Submission, Grade, UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { apiGetAssignmentById, apiGetSubmission, apiSubmitAssignment, apiGetSubmissionsForAssignment, apiGradeSubmission } from '../services/api';
import Spinner from '../components/Spinner';
import Card, { CardHeader, CardContent, CardFooter } from '../components/Card';
import Button from '../components/Button';
import { format } from 'date-fns';

const StudentView: React.FC<{ assignment: Assignment }> = ({ assignment }) => {
    const { user } = useAuth();
    const { addToast } = useNotification();
    const [submission, setSubmission] = useState<Submission | null>(null);
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!user) return;
        apiGetSubmission(assignment.id, user.id).then(data => {
            setSubmission(data);
            if (data) setContent(data.content);
            setIsLoading(false);
        });
    }, [assignment.id, user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !content) return;
        setIsSubmitting(true);
        try {
            const newSubmission = await apiSubmitAssignment(assignment.id, user.id, content);
            setSubmission(newSubmission);
            addToast("Assignment submitted successfully!", "success");
        } catch (error) {
            addToast("Failed to submit assignment.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (isLoading) return <Spinner />;
    
    const isGraded = submission && submission.grade !== null;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <h2 className="text-xl font-bold">Your Submission</h2>
                </CardHeader>
                {isGraded ? (
                     <CardContent>
                        <p className="text-slate-600 dark:text-slate-400 mb-2">Your submission has been graded.</p>
                        <p className="mb-4 whitespace-pre-wrap font-mono p-3 bg-slate-100 dark:bg-slate-700 rounded-md">{submission.content}</p>
                        <div className="mt-4 p-4 border-t border-slate-200 dark:border-slate-700">
                           <h3 className="font-semibold mb-2">Grade and Feedback</h3>
                           <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{submission.grade}/100</p>
                           {submission.feedback && <p className="mt-2 text-slate-600 dark:text-slate-300 italic">"{submission.feedback}"</p>}
                        </div>
                    </CardContent>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <CardContent>
                            <textarea
                                value={content}
                                onChange={e => setContent(e.target.value)}
                                rows={8}
                                className="w-full p-2 border rounded-md bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600"
                                placeholder="Enter your submission here..."
                            />
                             {submission && <p className="text-xs text-slate-500 mt-1">Last submitted: {format(new Date(submission.submittedAt), 'Pp')}</p>}
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" isLoading={isSubmitting}>
                                {submission ? 'Update Submission' : 'Submit Assignment'}
                            </Button>
                        </CardFooter>
                    </form>
                )}
            </Card>
        </div>
    )
}

const TeacherView: React.FC<{ assignment: Assignment }> = ({ assignment }) => {
    const [grades, setGrades] = useState<Grade[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { addToast } = useNotification();
    
    const fetchSubmissions = useCallback(async () => {
        try {
            const data = await apiGetSubmissionsForAssignment(assignment.id);
            setGrades(data);
        } catch (error) {
            addToast("Failed to load submissions.", "error");
        } finally {
            setIsLoading(false);
        }
    }, [assignment.id, addToast]);

    useEffect(() => {
        fetchSubmissions();
    }, [fetchSubmissions]);

    const handleGrade = async (submissionId: string, studentName: string) => {
        const gradeStr = prompt(`Enter grade for ${studentName} (0-100):`);
        const feedback = prompt(`Enter feedback for ${studentName} (optional):`);
        
        if (gradeStr) {
            const grade = parseInt(gradeStr, 10);
            if (!isNaN(grade) && grade >= 0 && grade <= 100) {
                try {
                    await apiGradeSubmission(submissionId, grade, feedback || "");
                    addToast("Grade submitted successfully!", "success");
                    fetchSubmissions(); // Refresh list
                } catch (error) {
                    addToast("Failed to submit grade.", "error");
                }
            } else {
                alert("Please enter a valid number between 0 and 100.");
            }
        }
    };

    if (isLoading) return <Spinner />;

    return (
        <Card>
            <CardHeader>
                <h2 className="text-xl font-bold">Student Submissions</h2>
            </CardHeader>
            <CardContent>
                <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                    {grades.map(({ studentId, studentName, submission }) => (
                        <li key={studentId} className="py-4 flex items-center justify-between">
                            <div>
                                <p className="font-semibold">{studentName}</p>
                                {submission ? (
                                    <p className="text-sm text-slate-500">Submitted at {format(new Date(submission.submittedAt), 'Pp')}</p>
                                ) : (
                                    <p className="text-sm text-red-500">Not submitted</p>
                                )}
                            </div>
                            <div>
                                {submission ? (
                                    submission.grade !== null ? (
                                        <div className="text-right">
                                            <p className="font-bold text-lg text-indigo-600 dark:text-indigo-400">{submission.grade}/100</p>
                                            <button onClick={() => handleGrade(submission.id, studentName)} className="text-xs text-slate-500 hover:underline">Edit Grade</button>
                                        </div>
                                    ) : (
                                        <Button onClick={() => handleGrade(submission.id, studentName)} size="sm">Grade</Button>
                                    )
                                ) : (
                                    <span className="text-sm text-slate-400">Awaiting submission</span>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}


const AssignmentPage: React.FC = () => {
    const { assignmentId } = useParams<{ assignmentId: string }>();
    const { user } = useAuth();
    const [assignment, setAssignment] = useState<Assignment | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!assignmentId) return;
        apiGetAssignmentById(assignmentId).then(data => {
            setAssignment(data);
            setIsLoading(false);
        }).catch(err => {
            console.error(err);
            setIsLoading(false);
        });
    }, [assignmentId]);

    if (isLoading) return <Spinner />;
    if (!assignment) return <p>Assignment not found.</p>;

    const isStudent = user?.role === UserRole.Student;

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">{assignment.title}</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Due: {format(new Date(assignment.dueDate), 'PPP')}</p>
            </header>
            
            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{assignment.description}</p>
            
            {isStudent ? (
                <StudentView assignment={assignment} />
            ) : (
                <TeacherView assignment={assignment} />
            )}
        </div>
    );
};

export default AssignmentPage;
