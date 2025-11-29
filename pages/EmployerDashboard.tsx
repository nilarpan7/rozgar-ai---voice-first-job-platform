
import React, { useState, useEffect } from 'react';
import { Plus, ArrowLeft, Users, Loader2, Briefcase, ChevronRight, Phone, CheckCircle, XCircle, Clock, Star, CalendarCheck, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getMyJobs, postJob, updateApplicationStatus } from '../services/jobService';
import { parseVoiceInput } from '../services/geminiService';
import { Job, Application, ApplicationStatus } from '../types';
import MicButton from '../components/MicButton';
import Navbar from '../components/Navbar';

const EmployerDashboard: React.FC = () => {
  const { user, language, t } = useAuth();
  const [viewState, setViewState] = useState<'list' | 'post' | 'detail'>('list');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  
  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Post Job Form State
  const [role, setRole] = useState('');
  const [wage, setWage] = useState('');
  const [location, setLocation] = useState(user?.location || 'Patna');
  const [saving, setSaving] = useState(false);

  const refreshJobs = async () => {
    if (user) {
        setLoading(true);
        const data = await getMyJobs(user.id);
        setMyJobs(data);
        if (selectedJob) {
            // Update selected job reference to reflect changes
            const updated = data.find(j => j.id === selectedJob.id);
            if(updated) setSelectedJob(updated);
        }
        setLoading(false);
    }
  };

  useEffect(() => {
    refreshJobs();
  }, [user]);

  // Mark pending applicants as SEEN when opening details
  useEffect(() => {
    if (viewState === 'detail' && selectedJob) {
        const pendingApplicants = selectedJob.applicants.filter(a => a.status === 'PENDING');
        if (pendingApplicants.length > 0) {
            // Mark them as SEEN (in background)
            pendingApplicants.forEach(app => {
                updateApplicationStatus(selectedJob.id, app.userId, 'SEEN');
            });
            // Delay refresh slightly so user sees the change naturally or on next load
            setTimeout(refreshJobs, 1000);
        }
    }
  }, [viewState, selectedJob?.id]);

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    
    await postJob({
      title: role,
      wage: Number(wage),
      wageType: 'monthly',
      location: location,
      description: 'Hiring urgently via Rozgar AI',
      employerId: user.id,
      employerName: user.companyName || user.name,
      category: role.toLowerCase(),
      urgent: true
    });

    setRole('');
    setWage('');
    setViewState('list');
    setSaving(false);
    refreshJobs();
  };

  const handleVoiceFill = async (text: string) => {
    const parsed = await parseVoiceInput(text, language.nativeName);
    if(parsed.role) setRole(parsed.role);
    if(parsed.minWage) setWage(parsed.minWage.toString());
    if(parsed.location) setLocation(parsed.location);
  };

  const handleAction = async (userId: string, action: ApplicationStatus) => {
      if (!selectedJob) return;
      await updateApplicationStatus(selectedJob.id, userId, action);
      refreshJobs();
  };

  // --- Views ---

  const renderJobDetail = () => {
      if (!selectedJob) return null;
      return (
        <div className="max-w-3xl mx-auto animate-slide-up pb-20">
            <button 
                onClick={() => { setViewState('list'); setSelectedJob(null); }}
                className="mb-6 text-gray-500 hover:text-gray-800 flex items-center gap-2 font-medium px-2"
            >
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </button>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 mx-2 sm:mx-0">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{selectedJob.title}</h2>
                <div className="flex gap-3 text-sm text-gray-500 mb-4">
                    <span>₹{selectedJob.wage}/{selectedJob.wageType}</span>
                    <span>•</span>
                    <span>{selectedJob.location}</span>
                </div>
                <div className="flex gap-4">
                    <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-bold flex flex-col items-center flex-1">
                        <span className="text-xl">{selectedJob.applicants.length}</span>
                        <span className="text-xs font-normal">Total Applied</span>
                    </div>
                    <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm font-bold flex flex-col items-center flex-1">
                        <span className="text-xl">{selectedJob.applicants.filter(a => a.status === 'HIRED').length}</span>
                        <span className="text-xs font-normal">Hired</span>
                    </div>
                </div>
            </div>

            <h3 className="font-bold text-gray-800 mb-4 text-lg px-2 sm:px-0">Applicants ({selectedJob.applicants.length})</h3>
            
            <div className="space-y-4 px-2 sm:px-0">
                {selectedJob.applicants.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200 text-gray-500">
                        No applications yet.
                    </div>
                ) : (
                    selectedJob.applicants.map((app: Application, idx: number) => (
                        <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 transition-shadow hover:shadow-md">
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600 text-lg flex-shrink-0">
                                        {app.userName.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h4 className="font-bold text-gray-900 text-lg truncate">{app.userName}</h4>
                                            {app.userExperience && (
                                                <span className="text-xs font-semibold bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded border border-yellow-100 flex items-center gap-1 whitespace-nowrap">
                                                    <Star className="w-3 h-3 fill-current" /> {app.userExperience}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500 mb-2 font-mono">{app.userPhone}</p>
                                        
                                        {app.userSkills && app.userSkills.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mb-2">
                                                {app.userSkills.map((skill, sIdx) => (
                                                    <span key={sIdx} className="text-[10px] bg-gray-50 text-gray-600 px-2 py-1 rounded-md font-medium border border-gray-200">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex gap-2 text-xs">
                                            <span className="text-gray-400 flex items-center gap-1">
                                                <Clock className="w-3 h-3"/> {new Date(app.appliedAt).toLocaleDateString()}
                                            </span>
                                            {app.status === 'SEEN' && <span className="text-orange-500 flex items-center gap-1 font-bold"><Eye className="w-3 h-3"/> Seen</span>}
                                            {app.status === 'INTERVIEW' && <span className="text-purple-600 flex items-center gap-1 font-bold"><CalendarCheck className="w-3 h-3"/> Interview</span>}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col justify-center border-t md:border-t-0 md:border-l md:pl-4 pt-4 md:pt-0 border-gray-50 gap-2 min-w-full md:min-w-[150px]">
                                    {/* Action Buttons based on Status */}
                                    {app.status === 'HIRED' ? (
                                        <div className="text-center w-full">
                                            <span className="flex items-center justify-center gap-1 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-bold border border-green-200 w-full mb-2">
                                                <CheckCircle className="w-4 h-4"/> HIRED
                                            </span>
                                            <button 
                                                className="text-xs text-brand-600 font-medium hover:underline flex items-center justify-center gap-1 w-full"
                                                onClick={() => window.location.href = `tel:${app.userPhone}`}
                                            >
                                                <Phone className="w-3 h-3" /> Call
                                            </button>
                                        </div>
                                    ) : app.status === 'REJECTED' ? (
                                        <span className="flex items-center justify-center gap-1 bg-gray-100 text-gray-500 px-4 py-2 rounded-full text-sm font-bold w-full">
                                            <XCircle className="w-4 h-4"/> REJECTED
                                        </span>
                                    ) : (
                                        <>
                                            <button 
                                                className="w-full py-2 rounded-xl bg-brand-600 text-white font-bold text-sm hover:bg-brand-700 shadow-sm flex items-center justify-center gap-2"
                                                onClick={() => window.location.href = `tel:${app.userPhone}`}
                                            >
                                                <Phone className="w-4 h-4" /> Call Now
                                            </button>
                                            
                                            {app.status !== 'INTERVIEW' && (
                                                <button 
                                                    className="w-full py-2 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 font-medium text-xs flex items-center justify-center gap-1"
                                                    onClick={() => handleAction(app.userId, 'INTERVIEW')}
                                                >
                                                    <CalendarCheck className="w-4 h-4" /> Interview
                                                </button>
                                            )}

                                            <div className="flex gap-2">
                                                <button 
                                                    className="flex-1 py-2 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 font-medium text-xs flex items-center justify-center gap-1"
                                                    onClick={() => handleAction(app.userId, 'HIRED')}
                                                >
                                                    <CheckCircle className="w-4 h-4" /> Hire
                                                </button>
                                                <button 
                                                    className="flex-1 py-2 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 font-medium text-xs flex items-center justify-center gap-1"
                                                    onClick={() => handleAction(app.userId, 'REJECTED')}
                                                >
                                                    <XCircle className="w-4 h-4" /> Reject
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
      );
  };

  const renderPostForm = () => (
    <div className="max-w-2xl mx-auto animate-slide-up pb-20 px-2 sm:px-0">
        <button 
            onClick={() => setViewState('list')} 
            className="mb-6 text-gray-500 hover:text-gray-800 flex items-center gap-2 font-medium"
        >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-brand-50 border border-gray-100">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Post a New Job</h2>
                <p className="text-gray-500 text-sm mt-1">Use voice to fill details instantly</p>
            </div>
            
            <div className="mb-8 flex justify-center">
                <MicButton 
                    onTranscript={handleVoiceFill} 
                    languageCode={language.voiceCode}
                    label="Tap & Say: 'Need a Cook in Patna for 10k'"
                    isProcessing={false}
                />
            </div>

            <form onSubmit={handlePostJob} className="space-y-5">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Job Role</label>
                    <input 
                        type="text" 
                        required
                        value={role}
                        onChange={e => setRole(e.target.value)}
                        className="w-full p-4 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition-all font-medium"
                        placeholder="e.g. Driver, Cook, Security Guard"
                    />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Monthly Salary (₹)</label>
                        <input 
                            type="number" 
                            required
                            value={wage}
                            onChange={e => setWage(e.target.value)}
                            className="w-full p-4 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition-all font-medium"
                            placeholder="e.g. 15000"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
                        <input 
                            type="text" 
                            value={location}
                            onChange={e => setLocation(e.target.value)}
                            className="w-full p-4 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition-all font-medium"
                        />
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={saving}
                    className="w-full bg-brand-600 hover:bg-brand-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-brand-200 mt-6 flex justify-center items-center gap-2 transition-all transform active:scale-95"
                >
                    {saving ? <Loader2 className="animate-spin" /> : t.post_job_btn}
                </button>
            </form>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      
      <div className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-8">
        
        {viewState === 'list' && (
          <>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
               <div>
                 <h1 className="text-2xl font-bold text-gray-900">Employer Dashboard</h1>
                 <p className="text-gray-500 font-medium">{user?.companyName || user?.name}</p>
               </div>
               <button 
                onClick={() => setViewState('post')}
                className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-brand-200 flex items-center justify-center gap-2 transition-all"
               >
                <Plus className="w-5 h-5" />
                {t.post_job_btn}
               </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-50 rounded-lg"><Briefcase className="w-5 h-5 text-blue-600"/></div>
                    <span className="text-sm text-gray-500 font-medium">Active Jobs</span>
                </div>
                <span className="text-3xl font-bold text-gray-900">{myJobs.length}</span>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-purple-50 rounded-lg"><Users className="w-5 h-5 text-purple-600"/></div>
                    <span className="text-sm text-gray-500 font-medium">Total Applicants</span>
                </div>
                <span className="text-3xl font-bold text-gray-900">
                    {myJobs.reduce((acc, job) => acc + (job.applicants?.length || 0), 0)}
                </span>
              </div>
            </div>

            {/* List */}
            <h2 className="font-bold text-gray-800 mb-4 text-lg">Your Listings</h2>
            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-600 w-8 h-8" /></div>
            ) : myJobs.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-300">
                    <p className="text-gray-500 mb-4">You haven't posted any jobs yet.</p>
                    <button onClick={() => setViewState('post')} className="text-brand-600 font-bold">Post your first job</button>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {myJobs.map(job => (
                    <div 
                        key={job.id} 
                        onClick={() => { setSelectedJob(job); setViewState('detail'); }}
                        className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-lg hover:border-brand-200 transition-all cursor-pointer group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg text-gray-900 group-hover:text-brand-700 transition-colors line-clamp-1">{job.title}</h3>
                                <p className="text-sm text-gray-500">₹{job.wage} • {job.location}</p>
                            </div>
                            <span className="bg-green-50 text-green-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide whitespace-nowrap">
                                Open
                            </span>
                        </div>
                        
                        <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                             <div className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                <Users className="w-4 h-4 text-gray-400" />
                                {job.applicants?.length || 0} Applicants
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-brand-500 group-hover:translate-x-1 transition-all" />
                        </div>
                    </div>
                ))}
                </div>
            )}
          </>
        )}

        {viewState === 'post' && renderPostForm()}
        {viewState === 'detail' && renderJobDetail()}
      </div>
    </div>
  );
};

export default EmployerDashboard;
