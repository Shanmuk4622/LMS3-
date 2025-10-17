import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { BookOpenIcon, CheckBadgeIcon, UsersIcon } from '../components/Icons';

const FeatureCard = ({ icon, title, children, color }: { icon: React.ReactNode, title: string, children: React.ReactNode, color: string }) => (
    <div className="bg-white/50 dark:bg-slate-800/50 p-6 rounded-xl shadow-lg backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
        <div className={`flex items-center justify-center h-12 w-12 rounded-full ${color} text-white mb-4`}>
            {icon}
        </div>
        <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">{title}</h3>
        <p className="text-slate-600 dark:text-slate-300 text-left">{children}</p>
    </div>
);

const LandingPage: React.FC = () => {
    return (
        <div className="space-y-16">
            <section className="text-center py-16 md:py-24 relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
                <div className="absolute inset-0 bg-black/30"></div>
                <div className="relative z-10">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight drop-shadow-lg">
                        Welcome to EduHub LMS
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-indigo-100 drop-shadow-md">
                        The modern, intuitive, and powerful Learning Management System designed for students and educators.
                    </p>
                    <div className="mt-8 flex justify-center gap-4">
                        <Button as={Link} to="/register" size="lg" className="bg-white text-indigo-600 hover:bg-slate-100">Get Started for Free</Button>
                        <Button as={Link} to="/login" variant="secondary" size="lg" className="border-white/50 text-white hover:bg-white/10">Sign In</Button>
                    </div>
                </div>
            </section>

            <section className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-12 text-center">Why Choose EduHub?</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    <FeatureCard icon={<BookOpenIcon className="w-6 h-6" />} title="Engaging Courses" color="bg-sky-500">
                        Explore a wide range of courses with rich content, including text, videos, and interactive assignments.
                    </FeatureCard>
                    <FeatureCard icon={<CheckBadgeIcon className="w-6 h-6" />} title="Track Your Progress" color="bg-emerald-500">
                        Stay on top of your learning with clear progress tracking, grades, and timely feedback from instructors.
                    </FeatureCard>
                    <FeatureCard icon={<UsersIcon className="w-6 h-6" />} title="Built for Collaboration" color="bg-rose-500">
                        A seamless experience for both students and teachers to interact, submit work, and manage courses effectively.
                    </FeatureCard>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
