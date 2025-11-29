
import React from 'react';
import { Phone, MapPin, Clock, Briefcase, CheckCircle, XCircle, Heart, ShieldAlert, BadgeCheck, Navigation, Eye, CalendarCheck } from 'lucide-react';
import { Job, User } from '../types';
import { useAuth } from '../context/AuthContext';

interface JobCardProps {
  job: Job;
  onClickCall?: (phone: string) => void;
  onApply?: (id: string) => void;
  onSave?: (id: string) => void;
  isSaved?: boolean;
  langCode?: string; // Optional now as we use context
  user?: User | null;
  readonly?: boolean;
}

const JobCard: React.FC<JobCardProps> = ({ job, onClickCall, onApply, onSave, isSaved = false, user, readonly = false }) => {
  const { t } = useAuth();
  const isUrgent = job.urgent;
  const application = user ? job.applicants.find(a => a.userId === user.id) : null;
  const isApplied = !!application;

  const handleReport = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Report this job as suspicious?")) {
      alert("Thanks! Our AI team will verify this job post.");
    }
  };

  const openDirections = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (job.coordinates) {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${job.coordinates.lat},${job.coordinates.lng}`, '_blank');
    } else {
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.location)}`, '_blank');
    }
  };

  const getStatusBadge = () => {
      if (!application) return null;
      switch(application.status) {
          case 'HIRED': return <span className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs font-bold border border-green-100"><CheckCircle className="w-3 h-3"/> {t.hired || 'Hired'}</span>;
          case 'REJECTED': return <span className="flex items-center gap-1 text-red-600 bg-red-50 px-3 py-1 rounded-full text-xs font-bold border border-red-100"><XCircle className="w-3 h-3"/> {t.rejected || 'Not Selected'}</span>;
          case 'INTERVIEW': return <span className="flex items-center gap-1 text-purple-600 bg-purple-50 px-3 py-1 rounded-full text-xs font-bold border border-purple-100 animate-pulse-fast"><CalendarCheck className="w-3 h-3"/> {t.interview || 'Interview'}</span>;
          case 'SEEN': return <span className="flex items-center gap-1 text-orange-600 bg-orange-50 px-3 py-1 rounded-full text-xs font-bold border border-orange-100"><Eye className="w-3 h-3"/> {t.seen || 'Viewed'}</span>;
          default: return <span className="text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">{t.applied || 'Applied'}</span>;
      }
  };

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 p-4 sm:p-5 relative overflow-hidden transition-all hover:shadow-md group">
      {isUrgent && !isApplied && (
        <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider shadow-sm z-10">
          {t.urgent || 'Urgent'}
        </div>
      )}
      
      <div className="flex justify-between items-start mb-3">
        <div className="pr-8 flex-1">
          <div className="flex items-start justify-between">
             <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1 group-hover:text-brand-700 transition-colors">{job.title}</h3>
             {getStatusBadge()}
          </div>
          <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
            <Briefcase className="w-3 h-3" /> {job.employerName}
            {job.employerVerified && (
              <BadgeCheck className="w-3.5 h-3.5 text-blue-500" />
            )}
          </p>
        </div>
        
        {/* Save & Report Actions */}
        {!readonly && (
            <div className="absolute top-4 right-4 flex flex-col gap-2">
                {onSave && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); onSave(job.id); }}
                        className={`p-1.5 rounded-full ${isSaved ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-300 hover:text-gray-400'}`}
                    >
                        <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                    </button>
                )}
            </div>
        )}
      </div>

      <div className="flex items-baseline gap-1 mb-3">
         <span className="text-2xl font-bold text-brand-700">₹{job.wage.toLocaleString()}</span>
         <span className="text-xs text-gray-400 font-medium uppercase">/{job.wageType}</span>
      </div>

      <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-gray-600 mb-5">
        <button onClick={openDirections} className="flex items-center bg-blue-50 hover:bg-blue-100 transition-colors px-2 py-1 rounded-md text-blue-700">
          <MapPin className="w-3.5 h-3.5 mr-1" />
          <span className="truncate max-w-[120px] text-xs font-bold">{job.location}</span>
          <span className="ml-1 text-blue-500 text-[10px]">({job.distance}km)</span>
          <Navigation className="w-3 h-3 ml-2" />
        </button>
        <div className="flex items-center bg-gray-50 px-2 py-1 rounded-md">
          <Clock className="w-3.5 h-3.5 mr-1 text-gray-400" />
          <span className="text-xs font-medium">
             {new Date(job.postedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric'})}
          </span>
        </div>
      </div>

      {!readonly && !isApplied && onApply && (
        <div className="flex gap-3 flex-wrap sm:flex-nowrap">
            <button 
                onClick={(e) => { e.stopPropagation(); if(onClickCall) onClickCall("9999999999"); }}
                className="flex-1 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm whitespace-nowrap min-w-[100px]"
            >
                <Phone className="w-4 h-4 fill-current" />
                {t.call_now || 'Call'}
            </button>
            <button 
                onClick={() => onApply(job.id)}
                className="flex-[2] bg-brand-600 text-white hover:bg-brand-700 font-bold py-2.5 px-4 rounded-xl shadow-sm hover:shadow-md transition-all text-sm whitespace-nowrap min-w-[120px]"
            >
                {t.apply || 'Apply Now'}
            </button>
        </div>
      )}

      {isApplied && (
          <div className="w-full bg-blue-50/50 border border-blue-100 text-blue-800 py-2 rounded-lg text-center text-xs font-medium">
             {application.status === 'INTERVIEW' ? 'Employer wants to interview you!' : 'Application sent to employer'}
          </div>
      )}
      
      {!readonly && (
          <button onClick={handleReport} className="absolute bottom-2 right-2 p-2 text-gray-200 hover:text-red-400 transition-colors" title="Report this job">
              <ShieldAlert className="w-4 h-4" />
          </button>
      )}
    </div>
  );
};

export default JobCard;
