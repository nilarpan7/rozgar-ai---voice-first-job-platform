
import React, { useState, useEffect, useRef } from 'react';
import { User as UserIcon, MapPin, Search, Briefcase, FileText, Settings, LogOut, Heart, Mic, Play, Square, Download, BookOpen, Film, Map, List, Layers, Sliders, Clock, Trophy, ChevronRight, UserPlus, Award, X, Navigation, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { JOB_CATEGORIES, SKILL_VIDEOS, SKILL_QUIZ } from '../constants';
import { getJobs, applyToJob, getAppliedJobs, updateUserProfile } from '../services/jobService';
import { StorageService } from '../services/storage';
import { parseVoiceInput } from '../services/geminiService';
import { Job, GeminiParsedIntent, User, RecentSearch, SkillVideo } from '../types';
import MicButton from '../components/MicButton';
import JobCard from '../components/JobCard';
import Navbar from '../components/Navbar';

// Icon mapping helper
const CategoryIcons: Record<string, any> = {
  Car: Briefcase, Hammer: Briefcase, Home: Briefcase, Shield: Briefcase, Bike: Briefcase, ChefHat: Briefcase, TrendingUp: Briefcase
};

const WorkerDashboard: React.FC = () => {
  const { user, language, logout, t } = useAuth();
  const [activeTab, setActiveTab] = useState<'jobs' | 'saved' | 'learn' | 'profile'>('jobs');
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingVoice, setProcessingVoice] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  
  // New Filter States
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [radius, setRadius] = useState<number>(5); // Default 5km
  
  // Profile State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState<Partial<User>>({});
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  // Modals
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // Map Ref
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);

  const loadData = async (filter?: { role?: string; location?: string }) => {
    setLoading(true);
    try {
      const allJobs = await getJobs(filter);
      // Client side filtering for radius mock
      const radiusFiltered = allJobs.filter(j => (j.distance || 0) <= radius);
      setJobs(radiusFiltered);
      if (user) {
          const applied = await getAppliedJobs(user.id);
          setAppliedJobs(applied);
          setProfileData(user);
          if (user.audioResume) setAudioUrl(user.audioResume);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    if (user && user.searchHistory) {
        setRecentSearches(user.searchHistory);
    }
  }, [user, radius]); // Reload when radius changes

  // Initialize Map when viewMode is 'map'
  useEffect(() => {
      if (viewMode === 'map' && mapRef.current && !leafletMap.current && window.L) {
          // Default center (India center roughly or user location mock)
          const defaultLat = 19.0760; // Mumbai default
          const defaultLng = 72.8777;
          
          const map = window.L.map(mapRef.current).setView([defaultLat, defaultLng], 11);
          
          window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '&copy; OpenStreetMap contributors'
          }).addTo(map);
          
          leafletMap.current = map;
      }
      
      // Update Markers
      if (viewMode === 'map' && leafletMap.current && window.L && jobs.length > 0) {
          // Clear existing markers (simplification: remove all layers and re-add tiles)
          leafletMap.current.eachLayer((layer: any) => {
              if (!!layer.toGeoJSON) {
                  leafletMap.current.removeLayer(layer);
              }
          });

          const group = window.L.featureGroup();

          // Add User Location Marker
          const userIcon = window.L.icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41]
          });
          
          // Add Job Markers
          const jobIcon = window.L.icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41]
          });

          jobs.forEach(job => {
              if (job.coordinates) {
                  const marker = window.L.marker([job.coordinates.lat, job.coordinates.lng], { icon: jobIcon })
                      .bindPopup(`
                          <div class="p-2 min-w-[150px]">
                              <h3 class="font-bold text-gray-800 text-sm mb-1">${job.title}</h3>
                              <p class="text-xs text-gray-500 mb-1">${job.location}</p>
                              <p class="text-brand-600 font-bold text-sm">₹${job.wage}</p>
                          </div>
                      `);
                  marker.addTo(group);
              }
          });
          
          group.addTo(leafletMap.current);
          if (jobs.length > 0) {
            try {
                leafletMap.current.fitBounds(group.getBounds(), { padding: [50, 50] });
            } catch(e) {}
          }
      }
      
      return () => {
          // Cleanup if needed
      };
  }, [viewMode, jobs]);


  const addToHistory = async (text: string, role?: string, location?: string) => {
    if (!user) return;
    const newSearch: RecentSearch = { text, role, location, timestamp: new Date().toISOString() };
    const currentHistory = user.searchHistory || [];
    const filtered = currentHistory.filter(s => s.text.toLowerCase() !== text.toLowerCase());
    const updatedHistory = [newSearch, ...filtered].slice(0, 5);
    setRecentSearches(updatedHistory);
    await updateUserProfile({ ...user, searchHistory: updatedHistory });
  };

  const handleVoiceCommand = async (text: string) => {
    setProcessingVoice(true);
    try {
      const intent: GeminiParsedIntent = await parseVoiceInput(text, language.nativeName);
      if (intent.role || intent.location) {
        await loadData({ role: intent.role, location: intent.location });
        setSelectedCategory(null);
        addToHistory(text, intent.role, intent.location);
      } else {
        await loadData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingVoice(false);
    }
  };

  const handleSaveJob = async (jobId: string) => {
      if (!user) return;
      const updatedUser = StorageService.toggleSaveJob(user.id, jobId);
      if (updatedUser) {
          window.location.reload(); 
      }
  };

  const toggleRecording = () => {
      if (isRecording) {
          setIsRecording(false);
          const mockAudio = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"; 
          setAudioUrl(mockAudio);
          if(user) updateUserProfile({ ...user, audioResume: mockAudio });
      } else {
          setIsRecording(true);
      }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user) return;
      await updateUserProfile({ ...user, ...profileData });
      setIsEditingProfile(false);
  };

  const handleCall = (phone: string) => alert("Opening Phone Dialer for: " + phone);

  // Quiz Logic
  const startQuiz = () => {
      setShowQuizModal(true);
      setCurrentQuestionIndex(0);
      setQuizScore(0);
      setQuizFinished(false);
  };

  const handleQuizAnswer = (optionIndex: number) => {
      const isCorrect = SKILL_QUIZ[currentQuestionIndex].correctAnswer === optionIndex;
      if(isCorrect) setQuizScore(prev => prev + 1);
      
      if(currentQuestionIndex < SKILL_QUIZ.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
      } else {
          setQuizFinished(true);
          // Award badge if score > 1
          if(quizScore >= 1 && user) {
             const badges = user.badges || [];
             if(!badges.includes('Verified Worker')) {
                 updateUserProfile({...user, badges: [...badges, 'Verified Worker']});
             }
          }
      }
  };

  // --- COMPONENT SECTIONS ---

  const SideNav = () => (
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-fit sticky top-24">
          <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center text-xl font-bold text-brand-700">
                  {user?.name.charAt(0)}
              </div>
              <div>
                  <h3 className="font-bold text-gray-900">{user?.name.split(' ')[0]}</h3>
                  <p className="text-xs text-gray-500 truncate max-w-[120px]">{user?.location || 'India'}</p>
              </div>
          </div>

          <div className="space-y-2">
              {[
                  { id: 'jobs', icon: Search, label: t.search_jobs },
                  { id: 'saved', icon: Heart, label: t.saved_jobs },
                  { id: 'learn', icon: BookOpen, label: t.learn },
                  { id: 'profile', icon: UserIcon, label: t.profile },
              ].map((item) => (
                  <button 
                      key={item.id}
                      onClick={() => setActiveTab(item.id as any)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-medium text-sm ${activeTab === item.id ? 'bg-brand-50 text-brand-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                      <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'fill-brand-200' : ''}`} />
                      {item.label}
                  </button>
              ))}
          </div>

          <div className="mt-8 pt-8 border-t border-gray-100">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-4 text-white text-center shadow-lg relative overflow-hidden group cursor-pointer" onClick={startQuiz}>
                  <div className="absolute top-0 right-0 w-16 h-16 bg-white/20 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-150"></div>
                  <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-300 drop-shadow-md" />
                  <p className="text-xs font-bold opacity-90 mb-1">Get Verified</p>
                  <p className="text-[10px] opacity-75">Take skill quiz</p>
              </div>
          </div>
      </div>
  );

  const RightWidgets = () => (
      <div className="space-y-6 h-fit sticky top-24">
          {/* Recent Searches Widget */}
          {recentSearches.length > 0 && (
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-800 text-sm mb-4 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400"/> Recent
                  </h3>
                  <div className="flex flex-wrap gap-2">
                      {recentSearches.map((s, i) => (
                          <button 
                              key={i}
                              onClick={() => { if(s.role || s.location) loadData({role: s.role, location: s.location}); }}
                              className="text-xs bg-gray-50 hover:bg-brand-50 hover:text-brand-600 border border-gray-100 px-3 py-1.5 rounded-full transition-colors text-gray-600"
                          >
                              {s.text}
                          </button>
                      ))}
                  </div>
              </div>
          )}

          {/* Stats / Promo */}
          <div className="bg-brand-50 rounded-3xl p-5 border border-brand-100">
               <h3 className="font-bold text-brand-800 text-sm mb-2">Need Help?</h3>
               <p className="text-xs text-brand-600 mb-3">Call our support helpline for free.</p>
               <button className="w-full bg-white text-brand-700 text-xs font-bold py-2 rounded-xl border border-brand-200 shadow-sm flex items-center justify-center gap-2">
                   <Phone className="w-3 h-3"/> 1800-123-4567
               </button>
          </div>
      </div>
  );

  const JobsFeed = () => (
    <div className="space-y-6">
        {/* Mobile Header / Filters */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 sticky top-0 md:static z-20">
             <div className="flex justify-between items-center mb-4">
                 <h2 className="text-lg font-bold text-gray-900">{viewMode === 'list' ? 'Recommended Jobs' : 'Map View'}</h2>
                 <div className="flex bg-gray-100 rounded-lg p-1">
                     <button onClick={() => setViewMode('list')} className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow text-brand-600' : 'text-gray-500'}`}><List className="w-4 h-4"/></button>
                     <button onClick={() => setViewMode('map')} className={`p-2 rounded-md transition-all ${viewMode === 'map' ? 'bg-white shadow text-brand-600' : 'text-gray-500'}`}><Map className="w-4 h-4"/></button>
                 </div>
             </div>
             
             {/* Radius & Categories */}
             <div className="space-y-4">
                 <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-xl">
                    <div className="bg-white p-2 rounded-lg shadow-sm"><Sliders className="w-4 h-4 text-brand-600"/></div>
                    <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                            <span className="font-bold text-gray-500">Distance</span>
                            <span className="font-bold text-brand-600">{radius} km</span>
                        </div>
                        <input 
                            type="range" min="1" max="20" step="1" 
                            value={radius} onChange={(e) => setRadius(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-600" 
                        />
                    </div>
                 </div>

                 <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                    <button 
                         onClick={() => { setSelectedCategory(null); loadData(); }}
                         className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${!selectedCategory ? 'bg-brand-600 border-brand-600 text-white shadow-md' : 'bg-white border-gray-200 text-gray-600'}`}
                    >
                        All
                    </button>
                    {JOB_CATEGORIES.map(cat => (
                        <button 
                            key={cat.id}
                            onClick={() => { setSelectedCategory(cat.id); loadData({ role: cat.id }); }}
                            className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${selectedCategory === cat.id ? 'bg-brand-600 border-brand-600 text-white shadow-md' : 'bg-white border-gray-200 text-gray-600'}`}
                        >
                            {/* Icon could go here */}
                            {cat.label}
                        </button>
                    ))}
                 </div>
             </div>
        </div>

        {viewMode === 'map' ? (
             <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden h-[60vh] relative z-10">
                 <div ref={mapRef} className="w-full h-full z-0"></div>
                 {jobs.length === 0 && (
                     <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-20">
                         <div className="bg-white p-4 rounded-xl shadow-lg text-center">
                             <p className="text-sm font-bold text-gray-500">No jobs in this area.</p>
                             <p className="text-xs text-gray-400">Try increasing distance.</p>
                         </div>
                     </div>
                 )}
                 <div className="absolute bottom-4 left-4 z-[400]">
                    <div className="bg-white/90 backdrop-blur px-3 py-2 rounded-lg shadow-lg text-xs font-bold text-gray-700 border border-gray-200">
                        {jobs.length} Jobs Found
                    </div>
                 </div>
             </div>
        ) : (
             <div className="space-y-4 pb-24">
                {loading ? (
                    [1,2,3].map(i => <div key={i} className="h-48 bg-white rounded-3xl border border-gray-100 shadow-sm animate-pulse" />)
                ) : jobs.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-gray-900 font-bold mb-1">No Jobs Found</h3>
                        <p className="text-gray-500 text-sm">Try changing filters or distance.</p>
                    </div>
                ) : (
                    jobs.map(job => (
                        <JobCard 
                            key={job.id} job={job} user={user} langCode={language.code}
                            onClickCall={handleCall} onSave={handleSaveJob}
                            isSaved={user?.savedJobIds?.includes(job.id)}
                            onApply={async (id) => {
                                if(!user) return;
                                setJobs(jobs.filter(j => j.id !== id));
                                await applyToJob(id, user);
                                loadData();
                            }}
                        />
                    ))
                )}
             </div>
        )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Sidebar (Desktop Only) */}
              <div className="hidden lg:block lg:col-span-3">
                  <SideNav />
              </div>

              {/* Main Content */}
              <div className="lg:col-span-6">
                  {activeTab === 'jobs' && <JobsFeed />}
                  
                  {activeTab === 'saved' && (
                      <div className="space-y-4 pb-24">
                          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                              <Heart className="w-6 h-6 text-red-500 fill-current" /> {t.saved_jobs}
                          </h2>
                          {jobs.filter(j => user?.savedJobIds?.includes(j.id)).length === 0 ? (
                              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                                  <p className="text-gray-500">No saved jobs yet.</p>
                              </div>
                          ) : (
                              jobs.filter(j => user?.savedJobIds?.includes(j.id)).map(job => (
                                  <JobCard key={job.id} job={job} user={user} langCode={language.code} onClickCall={handleCall} onSave={handleSaveJob} isSaved={true} />
                              ))
                          )}
                      </div>
                  )}

                  {activeTab === 'learn' && (
                      <div className="space-y-6 pb-24">
                          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                              <div className="relative z-10">
                                  <h2 className="text-2xl font-bold mb-2">Boost Your Earnings</h2>
                                  <p className="text-blue-100 mb-6 max-w-sm">Workers with verified badges and skills earn 30% more on average.</p>
                                  <button onClick={startQuiz} className="bg-white text-blue-700 px-6 py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition-transform">
                                      Take Skill Test
                                  </button>
                              </div>
                          </div>
                          
                          <h3 className="font-bold text-gray-900 text-lg">Recommended Videos</h3>
                          <div className="grid sm:grid-cols-2 gap-4">
                              {SKILL_VIDEOS.map(video => (
                                  <div key={video.id} className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group">
                                      <div className="relative h-32 rounded-xl overflow-hidden mb-3">
                                          <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                              <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center pl-1 shadow-lg">
                                                  <Play className="w-4 h-4 text-brand-600 fill-current" />
                                              </div>
                                          </div>
                                      </div>
                                      <h4 className="font-bold text-sm text-gray-800 line-clamp-1">{video.title}</h4>
                                      <div className="flex justify-between mt-2 text-xs text-gray-500">
                                          <span>{video.category}</span>
                                          <span>{video.duration}</span>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}

                  {activeTab === 'profile' && (
                      <div className="pb-24">
                          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center relative overflow-hidden mb-6">
                              <div className="w-28 h-28 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold text-gray-400 border-4 border-white shadow-lg relative">
                                  {user?.name.charAt(0)}
                                  {user?.badges?.includes('Verified Worker') && (
                                      <div className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full border-4 border-white shadow-sm">
                                          <Award className="w-5 h-5" />
                                      </div>
                                  )}
                              </div>
                              <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
                              <p className="text-gray-500 mb-6">{user?.phone}</p>
                              
                              <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                                  <button onClick={() => setIsEditingProfile(true)} className="bg-gray-50 hover:bg-gray-100 text-gray-700 py-3 rounded-xl font-bold text-sm transition-colors border border-gray-200">
                                      Edit Profile
                                  </button>
                                  <button onClick={() => setShowResumeModal(true)} className="bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-brand-100 flex items-center justify-center gap-2">
                                      <Download className="w-4 h-4" /> Download CV
                                  </button>
                              </div>
                          </div>

                          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
                              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                  <Mic className="w-5 h-5 text-brand-500" /> Audio Introduction
                              </h3>
                              {audioUrl ? (
                                  <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4 border border-gray-100">
                                       <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-brand-600 hover:scale-105 transition-transform">
                                           <Play className="w-5 h-5 fill-current" />
                                       </button>
                                       <div className="flex-1">
                                           <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-1">
                                               <div className="w-1/3 h-full bg-brand-500"></div>
                                           </div>
                                           <span className="text-xs text-gray-400">00:12 / 00:30</span>
                                       </div>
                                       <button onClick={() => setAudioUrl(null)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><X className="w-5 h-5"/></button>
                                  </div>
                              ) : (
                                  <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-300 hover:border-brand-300 transition-colors cursor-pointer" onClick={toggleRecording}>
                                      <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 transition-all ${isRecording ? 'bg-red-500 animate-pulse text-white' : 'bg-white shadow-sm text-brand-600'}`}>
                                          {isRecording ? <Square className="w-6 h-6 fill-current"/> : <Mic className="w-6 h-6"/>}
                                      </div>
                                      <p className="text-sm font-bold text-gray-700">{isRecording ? "Recording..." : "Tap to Record Intro"}</p>
                                      <p className="text-xs text-gray-400 mt-1">Employers prefer workers with audio.</p>
                                  </div>
                              )}
                          </div>

                          <button onClick={logout} className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-4 rounded-2xl transition-colors flex items-center justify-center gap-2">
                              <LogOut className="w-5 h-5" /> Logout
                          </button>
                      </div>
                  )}

                  {isEditingProfile && (
                     <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={() => setIsEditingProfile(false)}>
                         <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
                             <h3 className="font-bold text-xl mb-4">Edit Profile</h3>
                             <form onSubmit={handleProfileSave} className="space-y-4">
                                 <div><label className="text-xs font-bold text-gray-500 uppercase">Full Name</label><input className="w-full p-3 bg-gray-50 rounded-xl mt-1 border border-gray-100 focus:border-brand-500 outline-none" value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} /></div>
                                 <div><label className="text-xs font-bold text-gray-500 uppercase">Skills (comma separated)</label><input className="w-full p-3 bg-gray-50 rounded-xl mt-1 border border-gray-100 focus:border-brand-500 outline-none" value={profileData.skills?.join(',')} onChange={e => setProfileData({...profileData, skills: e.target.value.split(',')})} /></div>
                                 <button type="submit" className="w-full py-4 bg-brand-600 text-white rounded-xl font-bold shadow-lg shadow-brand-200">Save Changes</button>
                             </form>
                         </div>
                     </div>
                  )}
              </div>

              {/* Right Sidebar (Desktop Only) */}
              <div className="hidden lg:block lg:col-span-3">
                  <RightWidgets />
              </div>
          </div>
      </div>

      {/* Mic Button Floating (Only show on Jobs tab) */}
      {activeTab === 'jobs' && (
          <div className="fixed bottom-24 left-0 right-0 flex justify-center pointer-events-none z-50">
            <div className="pointer-events-auto shadow-2xl rounded-full scale-110 hover:scale-125 transition-transform duration-300">
                <MicButton onTranscript={handleVoiceCommand} languageCode={language.voiceCode} isProcessing={processingVoice} label={t.find_job_btn} />
            </div>
          </div>
      )}

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-2 pb-5 z-40 flex justify-between items-center shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
          {[
              { id: 'jobs', icon: Search, label: 'Jobs' },
              { id: 'saved', icon: Heart, label: 'Saved' },
              { spacer: true },
              { id: 'learn', icon: BookOpen, label: 'Learn' },
              { id: 'profile', icon: UserIcon, label: 'Profile' },
          ].map((item, idx) => {
              if (item.spacer) return <div key={idx} className="w-12"></div>;
              return (
                  <button 
                      key={idx}
                      onClick={() => setActiveTab(item.id as any)} 
                      className={`flex flex-col items-center p-2 rounded-xl transition-all ${activeTab === item.id ? 'text-brand-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                      {item.icon && <item.icon className={`w-6 h-6 mb-1 ${activeTab === item.id ? 'fill-brand-100' : ''}`} />}
                      <span className="text-[10px] font-bold">{item.label}</span>
                  </button>
              );
          })}
      </div>

      {/* Resume Modal */}
      {showResumeModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setShowResumeModal(false)}>
              <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
                  <div className="bg-brand-600 p-6 text-white text-center">
                      <div className="w-20 h-20 bg-white/20 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl font-bold border-2 border-white/50">{user?.name.charAt(0)}</div>
                      <h2 className="text-2xl font-bold">{user?.name}</h2>
                      <p className="opacity-90">{user?.phone}</p>
                      <div className="mt-2 text-xs bg-white/20 inline-block px-2 py-1 rounded">Generated by RozgarAI</div>
                  </div>
                  <div className="p-6 space-y-4">
                      <div>
                          <p className="text-xs font-bold text-gray-400 uppercase mb-1">Skills</p>
                          <div className="flex flex-wrap gap-2">
                              {user?.skills?.map((s,i) => <span key={i} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm font-medium">{s}</span>)}
                          </div>
                      </div>
                      <div>
                          <p className="text-xs font-bold text-gray-400 uppercase mb-1">Experience</p>
                          <p className="font-medium text-gray-800 flex items-center gap-2"><Briefcase className="w-4 h-4 text-gray-400"/> {user?.experience || "Fresher"}</p>
                      </div>
                      {user?.badges && (
                          <div>
                              <p className="text-xs font-bold text-gray-400 uppercase mb-1">Badges</p>
                              <div className="flex gap-2">
                                  {user.badges.map((b,i) => <span key={i} className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs font-bold border border-blue-100 flex items-center gap-1"><Award className="w-3 h-3"/> {b}</span>)}
                              </div>
                          </div>
                      )}
                      <div className="pt-4 flex gap-3">
                          <button onClick={() => setShowResumeModal(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl">Close</button>
                          <button onClick={() => alert("Downloaded PDF!")} className="flex-1 py-3 bg-brand-600 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2"><Download className="w-4 h-4"/> PDF</button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Quiz Modal */}
      {showQuizModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative">
                   {!quizFinished ? (
                       <div className="p-6">
                           <div className="flex justify-between items-center mb-6">
                               <h3 className="font-bold text-xl text-gray-800">Skill Test</h3>
                               <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded-lg">{currentQuestionIndex + 1}/{SKILL_QUIZ.length}</span>
                           </div>
                           <h4 className="text-lg font-medium text-gray-800 mb-6 leading-relaxed">
                               {SKILL_QUIZ[currentQuestionIndex].question}
                           </h4>
                           <div className="space-y-3">
                               {SKILL_QUIZ[currentQuestionIndex].options.map((opt, idx) => (
                                   <button 
                                      key={idx}
                                      onClick={() => handleQuizAnswer(idx)}
                                      className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-brand-500 hover:bg-brand-50 transition-all font-medium text-gray-700 active:scale-95"
                                   >
                                       {opt}
                                   </button>
                               ))}
                           </div>
                       </div>
                   ) : (
                       <div className="p-8 text-center">
                           <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                               <Trophy className="w-10 h-10 text-yellow-500" />
                           </div>
                           <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Completed!</h2>
                           <p className="text-gray-500 mb-6">You scored {quizScore} out of {SKILL_QUIZ.length}</p>
                           {quizScore > 1 ? (
                               <div className="bg-green-50 text-green-700 p-4 rounded-xl mb-6 text-sm font-bold border border-green-200">
                                   Congratulations! You earned the Verified Worker Badge.
                               </div>
                           ) : (
                               <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 text-sm font-bold border border-red-200">
                                   Keep learning! Watch more videos and try again.
                               </div>
                           )}
                           <button onClick={() => setShowQuizModal(false)} className="w-full bg-brand-600 text-white font-bold py-3 rounded-xl hover:bg-brand-700 transition-colors">
                               Close
                           </button>
                       </div>
                   )}
              </div>
          </div>
      )}
    </div>
  );
};

export default WorkerDashboard;
