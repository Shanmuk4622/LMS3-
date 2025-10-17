import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiGetAssignmentById, apiGetSubmission, apiSubmitAssignment, apiGetSubmissionsForAssignment, apiGradeSubmission } from '../services/api';
import { Assignment, Submission, UserRole, Grade } from '../types';
import Spinner from '../components/Spinner';
import Card, { CardContent, CardHeader } from '../components/Card';
import Button from '../components/Button';
import { useNotification } from '../contexts/NotificationContext';
import { CalendarIcon, ChevronDownIcon } from '../components/Icons';

const AssignmentPage: React.FC = () => {
  const { assignmentId } = useParams<{ courseId: string, assignmentId: string }>();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchAssignment = async () => {
      if (!assignmentId) return;
      try {
        setLoading(true);
        const data = await apiGetAssignmentById(assignmentId);
        setAssignment(data);
        setError('');
      } catch (err) {
        setError('Failed to fetch assignment details.');
      } finally {
        setLoading(false);
      }
    };
    fetchAssignment();
  }, [assignmentId]);

  if (loading) return <Spinner />;
  if (error) return <p className="text-red-500 text-center">{error}</p>;
  if (!assignment) return <p className="text-center">Assignment not found.</p>;

  return (
    <div>
      <Card className="mb-8">
        <CardHeader>
            <h1 className="text-3xl font-bold dark:text-white">{assignment.title}</h1>
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mt-2">
                <CalendarIcon className="h-5 w-5" />
                <span>Due: {new Date(assignment.dueDate).toLocaleString()}</span>
            </div>
        </CardHeader>
        <CardContent>
            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{assignment.description}</p>
        </CardContent>
      </Card>

      {user?.role === UserRole.Student && <StudentSubmissionView assignmentId={assignment.id} />}
      {user?.role === UserRole.Teacher && <TeacherGradingView assignmentId={assignment.id} />}
    </div>
  );
};

const StudentSubmissionView: React.FC<{ assignmentId: string }> = ({ assignmentId }) => {
    const { user } = useAuth();
    const [submission, setSubmission] = useState<Submission | null>(null);
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addToast } = useNotification();

    useEffect(() => {
        const fetchSubmission = async () => {
            if (!user) return;
            setIsLoading(true);
            const sub = await apiGetSubmission(assignmentId, user.id);
            setSubmission(sub);
            setContent(sub?.content || '');
            setIsLoading(false);
        };
        fetchSubmission();
    }, [assignmentId, user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsSubmitting(true);
        try {
            const newSubmission = await apiSubmitAssignment(assignmentId, user.id, content);
            setSubmission(newSubmission);
            addToast('Submission successful!', 'success');
        } catch (error) {
            addToast('Failed to submit.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isLoading) return <Spinner />;

    return (
        <Card>
            <CardHeader>
                <h2 className="text-2xl font-bold dark:text-white">Your Submission</h2>
            </CardHeader>
            <CardContent>
                {submission && submission.grade !== null ? (
                    <div>
                        <p className="text-lg font-semibold dark:text-white">Graded!</p>
                        <p className="text-5xl font-bold my-4 text-teal-500">{submission.grade}/100</p>
                        <h4 className="font-semibold mt-6 mb-2 dark:text-white">Teacher's Feedback:</h4>
                        <p className="p-4 bg-slate-100 dark:bg-slate-700 rounded-lg whitespace-pre-wrap">{submission.feedback}</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <textarea
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            rows={10}
                            placeholder="Type your submission here..."
                            className="w-full p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400 transition"
                        />
                        <Button type="submit" isLoading={isSubmitting} className="mt-4" size="lg">
                            {submission ? 'Update Submission' : 'Submit Assignment'}
                        </Button>
                    </form>
                )}
            </CardContent>
        </Card>
    );
};

const TeacherGradingView: React.FC<{ assignmentId: string }> = ({ assignmentId }) => {
    const [submissions, setSubmissions] = useState<Grade[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        setIsLoading(true);
        const data = await apiGetSubmissionsForAssignment(assignmentId);
        setSubmissions(data);
        setIsLoading(false);
    }
    useEffect(() => {
        fetchData();
    }, [assignmentId]);

    if(isLoading) return <Spinner />;

    return (
        <Card>
            <CardHeader><h2 className="text-2xl font-bold dark:text-white">Student Submissions</h2></CardHeader>
            <CardContent>
                {submissions.length === 0 ? <p className="dark:text-slate-400">No submissions yet.</p> : (
                    <div className="space-y-4">
                        {submissions.map(grade => (
                            <SubmissionGradeCard key={grade.studentId} grade={grade} onGraded={fetchData} />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
};

const SubmissionGradeCard: React.FC<{grade: Grade, onGraded: () => void}> = ({grade, onGraded}) => {
    const [isGrading, setIsGrading] = useState(false);
    const [score, setScore] = useState(grade.submission?.grade?.toString() || '');
    const [feedback, setFeedback] = useState(grade.submission?.feedback || '');
    const [isExpanded, setIsExpanded] = useState(false);
    const { addToast } = useNotification();
    
    const handleGrade = async () => {
        if(!grade.submission || !score) return;
        setIsGrading(true);
        try {
            await apiGradeSubmission(grade.submission.id, parseInt(score, 10), feedback);
            addToast('Grade saved successfully!', 'success');
            onGraded(); // Refresh list
        } catch (error) {
            addToast('Failed to save grade.', 'error');
        } finally {
            setIsGrading(false);
        }
    }
    
    return (
        <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
            <div className="flex justify-between items-center cursor-pointer" onClick={() => grade.submission && setIsExpanded(!isExpanded)}>
                <h3 className="font-semibold text-lg dark:text-white">{grade.studentName}</h3>
                <div className="flex items-center gap-4">
                    {grade.submission ? (
                        <span className={`px-3 py-1 text-sm rounded-full font-medium ${grade.submission.grade !== null ? 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200' : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'}`}>
                            {grade.submission.grade !== null ? `Graded: ${grade.submission.grade}` : 'Submitted'}
                        </span>
                    ) : (
                        <span className="px-3 py-1 text-sm rounded-full bg-slate-100 text-slate-800 dark:bg-slate-600 dark:text-slate-200 font-medium">Not Submitted</span>
                    )}
                    {grade.submission && <ChevronDownIcon className={`h-5 w-5 text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />}
                </div>
            </div>
            {isExpanded && grade.submission && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <p className="whitespace-pre-wrap p-4 bg-slate-50 dark:bg-slate-800 rounded-md mb-4">{grade.submission.content}</p>
                    <div className="space-y-4">
                        <input type="number" min="0" max="100" value={score} onChange={e => setScore(e.target.value)} placeholder="Score (0-100)" className="w-full p-2.5 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                        <textarea value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Provide feedback..." rows={3} className="w-full p-2.5 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                        <div className="flex justify-end">
                            <Button onClick={handleGrade} isLoading={isGrading}>Save Grade</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AssignmentPage;