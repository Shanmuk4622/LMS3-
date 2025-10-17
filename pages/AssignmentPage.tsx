import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiGetAssignmentById, apiGetSubmissionsForAssignment, apiSubmitAssignment, apiGradeSubmission, apiGetStudentSubmission } from '../services/api';
import { Assignment, Submission, UserRole, SubmissionStatus } from '../types';
import { useAuth } from '../contexts/AuthContext';
import Spinner from '../components/Spinner';
import Card, { CardContent, CardHeader } from '../components/Card';
import Button from '../components/Button';

const statusStyles: { [key in SubmissionStatus]: string } = {
  [SubmissionStatus.Graded]: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
  [SubmissionStatus.Submitted]: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
  [SubmissionStatus.Late]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const AssignmentPage: React.FC = () => {
  const { courseId, assignmentId } = useParams<{ courseId: string, assignmentId: string }>();
  const { user } = useAuth();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [mySubmission, setMySubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isTeacher = user?.role === UserRole.Teacher;

  const fetchData = useCallback(async () => {
    if (!assignmentId || !user) return;
    try {
      setLoading(true);
      const assignmentData = await apiGetAssignmentById(assignmentId);
      setAssignment(assignmentData);
      
      if(isTeacher) {
        const submissionsData = await apiGetSubmissionsForAssignment(assignmentId);
        setSubmissions(submissionsData);
      } else {
        const submissionData = await apiGetStudentSubmission(assignmentId, user.id);
        setMySubmission(submissionData);
      }
    } catch (err) {
      setError('Failed to load assignment data.');
    } finally {
      setLoading(false);
    }
  }, [assignmentId, user, isTeacher]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmissionGraded = () => {
    fetchData();
  }

  if (loading) return <Spinner />;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!assignment) return <p className="dark:text-white">Assignment not found.</p>;

  return (
    <div>
        <div className="mb-6">
            <Link to={`/courses/${courseId}`} className="text-indigo-600 hover:underline dark:text-indigo-400 dark:hover:text-indigo-300">&larr; Back to Course</Link>
        </div>
      <Card className="mb-8">
        <CardHeader>
          <h1 className="text-3xl font-bold dark:text-white">{assignment.title}</h1>
          <p className="text-slate-500 dark:text-slate-400">Due: {new Date(assignment.dueDate).toLocaleString()}</p>
        </CardHeader>
        <CardContent>
          <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{assignment.description}</p>
          {assignment.attachment && (
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold dark:text-white mb-2">Attachment</h3>
                <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 flex items-center justify-between">
                    <span className="font-medium text-slate-800 dark:text-slate-200 truncate pr-4">{assignment.attachment.name}</span>
                    <Button
                        as="a"
                        href={`data:${assignment.attachment.type};base64,${assignment.attachment.content}`}
                        download={assignment.attachment.name}
                        variant="secondary"
                    >
                        Download
                    </Button>
                </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {user?.role === UserRole.Student && <StudentSubmissionView assignmentId={assignment.id} mySubmission={mySubmission} onSubmission={fetchData} />}
      {user?.role === UserRole.Teacher && <TeacherGradingView submissions={submissions} onSubmissionGraded={handleSubmissionGraded} />}
    </div>
  );
};

// Student's View Component
interface StudentSubmissionViewProps {
  assignmentId: string;
  mySubmission: Submission | null;
  onSubmission: () => void;
}
const StudentSubmissionView: React.FC<StudentSubmissionViewProps> = ({ assignmentId, mySubmission, onSubmission }) => {
    const [content, setContent] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useAuth();

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
        if(!user) return;
        setIsLoading(true);
        try {
            let fileData;
            if (file) {
                const fileContent = await fileToBase64(file);
                fileData = { name: file.name, content: fileContent, type: file.type };
            }
            await apiSubmitAssignment(assignmentId, user.id, content, fileData);
            onSubmission();
        } catch (error) {
            console.error(error);
            alert("Failed to submit assignment.");
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <Card>
            <CardHeader><h2 className="text-xl font-bold dark:text-white">My Submission</h2></CardHeader>
            <CardContent>
                {mySubmission ? (
                    <div>
                        <p className="text-slate-600 dark:text-slate-400 mb-4 flex items-center">
                          <span>Submitted on: {new Date(mySubmission.submittedAt).toLocaleString()}</span>
                           <span className={`ml-4 px-2 py-0.5 text-xs font-medium rounded-full ${statusStyles[mySubmission.status]}`}>
                              {mySubmission.status === SubmissionStatus.Graded ? `Graded: ${mySubmission.grade}/100` : mySubmission.status}
                           </span>
                        </p>
                        {mySubmission.content && (
                           <>
                             <h3 className="text-lg font-semibold dark:text-white mb-2">Text Submission:</h3>
                             <p className="p-4 bg-slate-100 dark:bg-slate-800 rounded-md whitespace-pre-wrap">{mySubmission.content}</p>
                           </>
                        )}
                        {mySubmission.file && (
                           <div className="mt-4">
                               <h3 className="text-lg font-semibold dark:text-white mb-2">Submitted File:</h3>
                               <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 flex items-center justify-between">
                                  <span className="font-medium text-slate-800 dark:text-slate-200 truncate pr-4">{mySubmission.file.name}</span>
                                  <Button
                                      as="a"
                                      href={`data:${mySubmission.file.type};base64,${mySubmission.file.content}`}
                                      download={mySubmission.file.name}
                                      variant="secondary"
                                  >
                                      Download
                                  </Button>
                                </div>
                           </div>
                        )}
                        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <h3 className="text-lg font-semibold dark:text-white">Grade:</h3>
                            {mySubmission.grade !== null ? 
                                <p className="text-2xl font-bold text-indigo-600">{mySubmission.grade} / 100</p> : 
                                <p className="text-slate-500 dark:text-slate-400">Not graded yet.</p>
                            }
                        </div>
                         {mySubmission.feedback && (
                            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                                <h3 className="text-lg font-semibold dark:text-white flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    Teacher Feedback
                                </h3>
                                <div className="mt-2 p-4 bg-indigo-50 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 rounded-lg">
                                    <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{mySubmission.feedback}</p>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                          <label htmlFor="text-submission" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Text Submission</label>
                          <textarea id="text-submission" value={content} onChange={e => setContent(e.target.value)} rows={8} placeholder="Enter your submission here..." className="mt-1 w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"></textarea>
                        </div>
                        <div>
                          <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 dark:text-slate-300">File Upload</label>
                          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-slate-600 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              <div className="flex text-sm text-gray-600 dark:text-slate-400">
                                <label htmlFor="file-input" className="relative cursor-pointer bg-white dark:bg-slate-800 rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                  <span>Upload a file</span>
                                  <input id="file-input" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                              </div>
                              <p className="text-xs text-gray-500 dark:text-slate-500">PDF, DOCX, PNG, JPG, etc.</p>
                            </div>
                          </div>
                          {file && <p className="mt-2 text-sm text-green-600 dark:text-green-400">Selected file: {file.name}</p>}
                        </div>

                        <div className="flex justify-end">
                          <Button type="submit" isLoading={isLoading}>Submit Assignment</Button>
                        </div>
                    </form>
                )}
            </CardContent>
        </Card>
    );
};

// Teacher's View Component
interface TeacherGradingViewProps {
    submissions: Submission[];
    onSubmissionGraded: () => void;
}
const TeacherGradingView: React.FC<TeacherGradingViewProps> = ({ submissions, onSubmissionGraded }) => {
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
    const [grade, setGrade] = useState('');
    const [feedback, setFeedback] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGradeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!selectedSubmission) return;
        setIsLoading(true);
        try {
            await apiGradeSubmission(selectedSubmission.id, parseInt(grade, 10), feedback);
            onSubmissionGraded();
            setSelectedSubmission(null);
            setGrade('');
            setFeedback('');
        } catch (error) {
            alert("Failed to grade submission.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Card>
            <CardHeader><h2 className="text-xl font-bold dark:text-white">Submissions ({submissions.length})</h2></CardHeader>
            <CardContent>
                {submissions.length === 0 ? <p className="text-slate-500 dark:text-slate-400">No submissions yet.</p> : (
                    <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                        {submissions.map(sub => (
                            <li key={sub.id} className="py-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-slate-800 dark:text-slate-200">{sub.studentName}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Submitted: {new Date(sub.submittedAt).toLocaleString()}</p>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusStyles[sub.status]}`}>
                                            {sub.status === SubmissionStatus.Graded ? `Graded: ${sub.grade}/100` : sub.status}
                                        </span>
                                        <Button onClick={() => { setSelectedSubmission(sub); setGrade(sub.grade?.toString() || ''); setFeedback(sub.feedback || ''); }} variant="secondary">View & Grade</Button>
                                    </div>
                                </div>
                                {selectedSubmission?.id === sub.id && (
                                     <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-4">
                                        {sub.content && (
                                          <div>
                                            <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Text Submission</h4>
                                            <p className="whitespace-pre-wrap p-4 bg-slate-100 dark:bg-slate-800 rounded">{sub.content}</p>
                                          </div>
                                        )}
                                        {sub.file && (
                                            <div>
                                                <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Submitted File</h4>
                                                <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3 flex items-center justify-between">
                                                    <span className="font-medium text-slate-800 dark:text-slate-200 truncate pr-4">{sub.file.name}</span>
                                                    <Button
                                                        as="a"
                                                        href={`data:${sub.file.type};base64,${sub.file.content}`}
                                                        download={sub.file.name}
                                                        variant="secondary"
                                                    >
                                                        Download
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                        <form onSubmit={handleGradeSubmit} className="space-y-4">
                                            <div>
                                                <label htmlFor="grade-input" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Grade</label>
                                                <input id="grade-input" type="number" min="0" max="100" placeholder="0-100" value={grade} onChange={e => setGrade(e.target.value)} required className="mt-1 p-2 border rounded w-32 dark:bg-slate-700 dark:border-slate-600 dark:text-white"/>
                                            </div>
                                             <div>
                                                <label htmlFor="feedback-input" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Feedback (Optional)</label>
                                                <textarea 
                                                    id="feedback-input" 
                                                    value={feedback} 
                                                    onChange={e => setFeedback(e.target.value)} 
                                                    placeholder="Provide constructive feedback to help the student improve..." 
                                                    rows={6} 
                                                    className="mt-1 w-full p-3 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                                />
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Button type="submit" isLoading={isLoading}>Save Grade</Button>
                                                <Button onClick={() => setSelectedSubmission(null)} variant="secondary">Cancel</Button>
                                            </div>
                                        </form>
                                     </div>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
};

export default AssignmentPage;