import React from 'react';
import { CheckCircle, Clock, XCircle, FileText } from 'lucide-react';

const StatusBadge = ({ status }) => {
    const styles = {
        'Applied': { icon: FileText, color: 'bg-cyan-500/20 text-cyan-300' },
        'Under Review': { icon: Clock, color: 'bg-yellow-500/20 text-yellow-300' },
        'Shortlisted': { icon: CheckCircle, color: 'bg-green-500/20 text-green-300' },
        'Rejected': { icon: XCircle, color: 'bg-red-500/20 text-red-300' }
    };
    const current = styles[status] || styles['Applied'];
    return (
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${current.color}`}>
            <current.icon size={14} />
            {status}
        </div>
    );
};

export default StatusBadge;