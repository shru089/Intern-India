import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, GripVertical } from 'lucide-react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { useAuth } from '../hooks/useAuth';
import { mockApi } from '../api/mockApi';
import PageWrapper from '../layout/PageWrapper';
import StatusBadge from '../common/StatusBadge';
import AnimatedButton from '../common/AnimatedButton';

const SortableInternshipCard = ({ item }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} className="glass-card p-4 touch-none">
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-bold text-white">{item.title}</p>
                    <p className="text-sm text-neutral-400">{item.company}</p>
                </div>
                <button {...listeners} className="cursor-grab active:cursor-grabbing p-1 text-neutral-400">
                    <GripVertical />
                </button>
            </div>
            <div className="mt-3 pt-3 border-t border-white/10 flex justify-between items-center">
                <StatusBadge status={item.status} />
                <p className="text-xs text-neutral-400">Applied: {new Date(item.dateApplied).toLocaleDateString()}</p>
            </div>
        </div>
    );
};

const AppliedInternshipsPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [applications, setApplications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user) { navigate('/auth'); return; }
        const fetchApplied = async () => {
            setIsLoading(true);
            try {
                const data = await mockApi.getAppliedInternships(user.email);
                setApplications(data);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchApplied();
    }, [navigate, user]);

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setApplications((items) => {
                const oldIndex = items.findIndex(item => item.id === active.id);
                const newIndex = items.findIndex(item => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const columns = {
        'Applied': applications.filter(app => app.status === 'Applied'),
        'Under Review': applications.filter(app => app.status === 'Under Review'),
        'Shortlisted': applications.filter(app => app.status === 'Shortlisted'),
    };

    return (
        <PageWrapper>
            <div className="container mx-auto px-4 sm:px-6 py-12">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                    <h2 className="text-3xl font-bold text-white">Application Tracker</h2>
                    <p className="text-neutral-400 mt-1">Visually track your internship applications.</p>
                </motion.div>

                {isLoading ? (
                    <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary rounded-full border-t-transparent animate-spin"></div></div>
                ) : applications.length === 0 ? (
                    <div className="text-center py-20 glass-card mt-8">
                        <Briefcase size={48} className="mx-auto text-neutral-500" />
                        <p className="mt-4 text-neutral-300 font-semibold text-lg">You haven't applied for any internships yet.</p>
                        <AnimatedButton onClick={() => navigate('/find-internships')} className="mt-6">Find Internships</AnimatedButton>
                    </div>
                ) : (
                    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <div className="grid md:grid-cols-3 gap-6 mt-8">
                            {Object.entries(columns).map(([title, items]) => (
                                <div key={title} className="glass-card p-4">
                                    <h3 className="font-bold text-white px-2 pb-3">{title} ({items.length})</h3>
                                    <SortableContext items={items} strategy={verticalListSortingStrategy}>
                                        <div className="space-y-3">
                                            {items.map(item => <SortableInternshipCard key={item.id} item={item} />)}
                                        </div>
                                    </SortableContext>
                                </div>
                            ))}
                        </div>
                    </DndContext>
                )}
            </div>
        </PageWrapper>
    );
};

export default AppliedInternshipsPage;