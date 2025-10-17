import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { BookOpenIcon, CheckBadgeIcon, UsersIcon } from '../components/Icons';

const FeatureCard = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
    <div className="bg-white/50 dark:bg-slate-800/50 p-6 rounded-xl shadow-lg backdrop-blur-sm border border-white/20">
        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-indigo-500 text-white mb-4">
            {icon}
        </div>
        <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">{title}</h3>
        <p className="text-slate-600 dark:text-slate-300">{children}</p>
    </div>
);

const LandingPage: React.FC = () => {
    return (
        <div className="text-center">
            <section className="py-20 md:py-32">
                <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white leading-tight">
                    Welcome to <span className="text-indigo-600 dark:text-indigo-400">EduHub LMS</span>
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-300">
                    The modern, intuitive, and powerful Learning Management System designed for students and educators.
                </p>
                <div className="mt-8 flex justify-center gap-4">
                    <Button as={Link} to="/register" size="lg">Get Started for Free</Button>
                    <Button as={Link} to="/login" variant="secondary" size="lg">Sign In</Button>
                </div>
            </section>

            <section className="py-16 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-12">Why Choose EduHub?</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard icon={<BookOpenIcon className="w-6 h-6" />} title="Engaging Courses">
                            Explore a wide range of courses with rich content, including text, videos, and interactive assignments.
                        </FeatureCard>
                        <FeatureCard icon={<CheckBadgeIcon className="w-6 h-6" />} title="Track Your Progress">
                            Stay on top of your learning with clear progress tracking, grades, and timely feedback from instructors.
                        </FeatureCard>
                        <FeatureCard icon={<UsersIcon className="w-6 h-6" />} title="Built for Collaboration">
                            A seamless experience for both students and teachers to interact, submit work, and manage courses effectively.
                        </FeatureCard>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
