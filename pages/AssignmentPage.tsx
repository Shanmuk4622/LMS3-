import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiGetAssignmentById, apiGetSubmissionsForAssignment, apiSubmitAssignment, apiGradeSubmission, apiGetStudentSubmission } from '../services/api';
import { Assignment, Submission, UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';
import Spinner from '../components/Spinner';
import Card, { CardContent, CardHeader } from '../components/Card';
import Button from '../components/Button';

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
            <Link to={`/courses/${courseId}`} className="text-sky-600 hover:underline">&larr; Back to Course</Link>
        </div>
      <Card className="mb-8">
        <CardHeader>
          <h1 className="text-3xl font-bold dark:text-white">{assignment.title}</h1>
          <p className="text-slate-500 dark:text-slate-400">Due: {new Date(assignment.dueDate).toLocaleString()}</p>
        </CardHeader>
        <CardContent>
          <p className="text-slate-700 dark:text-slate-300">{assignment.description}</p>
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
                        <p className="text-slate-600 dark:text-slate-400 mb-4">Submitted on: {new Date(mySubmission.submittedAt).toLocaleString()}</p>
                        {mySubmission.content && (
                           <>
                             <h3 className="text-lg font-semibold dark:text-white mb-2">Text Submission:</h3>
                             <p className="p-4 bg-slate-100 dark:bg-slate-800 rounded-md whitespace-pre-wrap">{mySubmission.content}</p>
                           </>
                        )}
                        {mySubmission.file && (
                           <div className="mt-4">
                               <h3 className="text-lg font-semibold dark:text-white mb-2">Submitted File:</h3>
                               <a 
                                 href={`data:${mySubmission.file.type};base64,${mySubmission.file.content}`} 
                                 download={mySubmission.file.name} 
                                 className="text-sky-600 hover:underline flex items-center"
                               >
                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                 {mySubmission.file.name}
                                </a>
                           </div>
                        )}
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold dark:text-white">Grade:</h3>
                            {mySubmission.grade !== null ? 
                                <p className="text-2xl font-bold text-sky-600">{mySubmission.grade} / 100</p> : 
                                <p className="text-slate-500 dark:text-slate-400">Not graded yet.</p>
                            }
                        </div>
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
                                <label htmlFor="file-input" className="relative cursor-pointer bg-white dark:bg-slate-800 rounded-md font-medium text-sky-600 hover:text-sky-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-sky-500">
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
    const [isLoading, setIsLoading] = useState(false);

    const handleGradeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!selectedSubmission) return;
        setIsLoading(true);
        try {
            await apiGradeSubmission(selectedSubmission.id, parseInt(grade, 10));
            onSubmissionGraded();
            setSelectedSubmission(null);
            setGrade('');
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
                                        <span className={`px-3 py-1 text-sm rounded-full ${sub.grade !== null ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'}`}>
                                            {sub.grade !== null ? `Graded: ${sub.grade}/100` : 'Needs Grading'}
                                        </span>
                                        <Button onClick={() => { setSelectedSubmission(sub); setGrade(sub.grade?.toString() || ''); }} variant="secondary">View & Grade</Button>
                                    </div>
                                </div>
                                {selectedSubmission?.id === sub.id && (
                                     <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                        {sub.content && (
                                          <div className="mb-4">
                                            <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Text Submission</h4>
                                            <p className="whitespace-pre-wrap p-4 bg-slate-100 dark:bg-slate-800 rounded">{sub.content}</p>
                                          </div>
                                        )}
                                        {sub.file && (
                                            <div className="mb-4">
                                                <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Submitted File</h4>
                                                <a href={`data:${sub.file.type};base64,${sub.file.content}`} download={sub.file.name} className="text-sky-600 hover:underline flex items-center">
                                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                                  </svg>
                                                  {sub.file.name}
                                                </a>
                                            </div>
                                        )}
                                        <form onSubmit={handleGradeSubmit} className="flex items-center space-x-2">
                                            <input type="number" min="0" max="100" placeholder="Grade (0-100)" value={grade} onChange={e => setGrade(e.target.value)} required className="p-2 border rounded w-32 dark:bg-slate-700 dark:border-slate-600 dark:text-white"/>
                                            <Button type="submit" isLoading={isLoading}>Save Grade</Button>
                                            <Button onClick={() => setSelectedSubmission(null)} variant="secondary">Cancel</Button>
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
