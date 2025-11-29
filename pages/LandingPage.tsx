
import React from 'react';
import { Link } from 'react-router-dom';
import { Mic, Briefcase, ShieldCheck, MapPin, Users, Phone, Star, CheckCircle, ArrowRight, PlayCircle, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const LandingPage: React.FC = () => {
  const { t } = useAuth();

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-brand-100">
      <Navbar />
      
      {/* --- HERO SECTION --- */}
      <div className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white pt-8 pb-16 lg:pt-20 lg:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            
            {/* Left Content */}
            <div className="text-center lg:text-left animate-slide-up">
              <div className="inline-flex items-center gap-2 bg-white border border-brand-100 rounded-full px-3 py-1.5 md:px-4 md:py-2 mb-6 shadow-sm">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-[10px] md:text-xs font-bold text-gray-600 tracking-wide uppercase">Live in 50+ Cities</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-gray-900 mb-4 sm:mb-6 leading-tight tracking-tight">
                {t.home_hero_title.split(',')[0]}, <br className="hidden lg:block" />
                <span className="text-brand-600">{t.home_hero_title.split(',')[1]}</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-gray-600 mb-8 sm:mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed px-2 sm:px-0">
                {t.home_hero_subtitle}. No typing, no resume. 
                Just speak to find daily wage or monthly jobs near you.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 w-full sm:w-auto">
                <Link 
                  to="/login?role=WORKER" 
                  className="w-full sm:w-auto bg-brand-600 hover:bg-brand-700 text-white text-lg font-bold py-4 px-8 rounded-2xl shadow-xl shadow-brand-200 hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
                >
                  <div className="bg-white/20 p-2 rounded-full">
                    <Mic className="w-6 h-6" />
                  </div>
                  <span>{t.find_job_btn}</span>
                </Link>
                <Link 
                  to="/login?role=EMPLOYER" 
                  className="w-full sm:w-auto bg-white border-2 border-gray-200 hover:border-brand-500 text-gray-800 hover:text-brand-700 text-lg font-bold py-4 px-8 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-3"
                >
                  <Briefcase className="w-5 h-5" />
                  <span>{t.post_job_btn}</span>
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-sm font-medium text-gray-500">
                <div className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500"/> Free for Workers</div>
                <div className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500"/> Verified Jobs</div>
                <div className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500"/> Direct Calling</div>
              </div>
            </div>

            {/* Right Graphics (Phone Mockup) */}
            <div className="relative hidden lg:block">
              {/* Abstract Blobs */}
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-brand-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
              <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-secondary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
              
              {/* Phone Container */}
              <div className="relative mx-auto border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[320px] shadow-2xl flex flex-col overflow-hidden transform hover:scale-[1.02] transition-transform duration-500">
                <div className="h-[32px] w-[3px] bg-gray-800 absolute -left-[17px] top-[72px] rounded-l-lg"></div>
                <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[124px] rounded-l-lg"></div>
                <div className="h-[64px] w-[3px] bg-gray-800 absolute -right-[17px] top-[142px] rounded-r-lg"></div>
                
                {/* Screen Content */}
                <div className="flex-1 bg-slate-50 overflow-hidden relative font-sans">
                   {/* Fake App Header */}
                   <div className="bg-white p-4 pt-10 shadow-sm flex justify-between items-center">
                      <div className="h-8 w-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold">R</div>
                      <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                   </div>
                   
                   {/* Fake Voice Interaction */}
                   <div className="p-6 flex flex-col h-full">
                      <div className="mt-8 mb-auto">
                        <div className="bg-white p-4 rounded-xl rounded-tl-none shadow-sm border border-gray-100 mb-4 w-3/4">
                          <p className="text-xs text-gray-400 font-bold uppercase mb-1">Rozgar AI</p>
                          <p className="text-gray-800 text-sm">Namaste! Kaisi naukri dhund rahe hain aaj aap?</p>
                        </div>
                        <div className="bg-brand-600 p-4 rounded-xl rounded-tr-none shadow-md text-white self-end w-3/4 ml-auto">
                          <p className="text-sm">Mujhe Andheri mein driver ki job chahiye. 15,000 salary.</p>
                        </div>
                      </div>

                      {/* Matching Card */}
                      <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100 mb-20 animate-slide-up">
                        <div className="flex justify-between mb-2">
                           <div className="h-4 w-24 bg-gray-200 rounded"></div>
                           <div className="h-4 w-12 bg-green-100 rounded"></div>
                        </div>
                        <div className="h-6 w-3/4 bg-gray-800 rounded mb-3"></div>
                        <div className="flex gap-2">
                           <div className="h-8 flex-1 bg-brand-600 rounded-lg"></div>
                           <div className="h-8 w-10 bg-gray-100 rounded-lg"></div>
                        </div>
                      </div>
                      
                      {/* Mic Button */}
                      <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                         <div className="h-20 w-20 bg-red-500 rounded-full border-4 border-white shadow-xl flex items-center justify-center">
                            <Mic className="w-8 h-8 text-white animate-pulse" />
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- STATS BANNER --- */}
      <div className="bg-gray-900 py-12 text-white">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-gray-800">
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-brand-500 mb-1">5M+</div>
            <div className="text-gray-400 text-xs sm:text-sm font-medium uppercase tracking-wider">Workers</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-brand-500 mb-1">12+</div>
            <div className="text-gray-400 text-xs sm:text-sm font-medium uppercase tracking-wider">Languages</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-brand-500 mb-1">500k</div>
            <div className="text-gray-400 text-xs sm:text-sm font-medium uppercase tracking-wider">Employers</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-brand-500 mb-1">&lt; 60s</div>
            <div className="text-gray-400 text-xs sm:text-sm font-medium uppercase tracking-wider">To Find Job</div>
          </div>
        </div>
      </div>

      {/* --- HOW IT WORKS --- */}
      <div className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <span className="text-brand-600 font-bold tracking-wide uppercase text-sm">Simple Process</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">How Rozgar AI Works</h2>
            <p className="text-gray-500 mt-4 text-base sm:text-lg">We built this for everyone. You don't need to read or write perfectly to get a job.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gray-200 -z-10"></div>

            {/* Step 1 */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm text-center relative hover:-translate-y-2 transition-transform duration-300">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-md">
                <Mic className="w-8 h-8 sm:w-10 sm:h-10 text-brand-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">1. Speak Details</h3>
              <p className="text-sm sm:text-base text-gray-500">Just tap the mic and say "I need a driver job in Pune". Our AI understands 12 Indian languages.</p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm text-center relative hover:-translate-y-2 transition-transform duration-300">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-md">
                <MapPin className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">2. See Nearby Jobs</h3>
              <p className="text-sm sm:text-base text-gray-500">We instantly show you verified jobs within 5-10km of your location. No fake agents.</p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm text-center relative hover:-translate-y-2 transition-transform duration-300">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-md">
                <Phone className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">3. Direct Call</h3>
              <p className="text-sm sm:text-base text-gray-500">Like a job? Call the employer directly. No middleman, no commission to pay.</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- FEATURES GRID --- */}
      <div className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
           <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <ShieldCheck className="w-8 h-8 text-purple-600 mb-4"/>
                    <h4 className="font-bold text-lg mb-2">Verified Jobs</h4>
                    <p className="text-sm text-gray-500">We verify every employer with Aadhaar/GST so you stay safe.</p>
                 </div>
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sm:mt-8">
                    <Globe className="w-8 h-8 text-orange-500 mb-4"/>
                    <h4 className="font-bold text-lg mb-2">12 Languages</h4>
                    <p className="text-sm text-gray-500">App speaks Hindi, Tamil, Telugu, Bengali and more.</p>
                 </div>
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <Users className="w-8 h-8 text-blue-500 mb-4"/>
                    <h4 className="font-bold text-lg mb-2">Smart Matching</h4>
                    <p className="text-sm text-gray-500">AI finds jobs that match your exact skills and expected wage.</p>
                 </div>
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sm:mt-8">
                    <PlayCircle className="w-8 h-8 text-red-500 mb-4"/>
                    <h4 className="font-bold text-lg mb-2">Video Resume</h4>
                    <p className="text-sm text-gray-500">Can't type? Just record a 10s video about yourself.</p>
                 </div>
              </div>
              <div className="order-1 md:order-2">
                 <span className="text-brand-600 font-bold tracking-wide uppercase text-sm">Why Us?</span>
                 <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-6">Designed for the Real India (Bharat)</h2>
                 <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                    Existing job apps are too complicated. They ask for CVs and English typing. 
                    <br/><br/>
                    Rozgar AI is built for the 450 Million blue-collar workforce who power our cities. 
                    We believe finding work should be as easy as making a phone call.
                 </p>
                 <Link to="/login" className="text-brand-700 font-bold flex items-center gap-2 hover:gap-4 transition-all">
                    Get Started Now <ArrowRight className="w-5 h-5"/>
                 </Link>
              </div>
           </div>
        </div>
      </div>

      {/* --- TESTIMONIALS --- */}
      <div className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Success Stories</h2>
          <div className="grid md:grid-cols-3 gap-8">
             {/* Story 1 */}
             <div className="bg-white border border-gray-100 p-8 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                <div className="flex gap-1 text-yellow-400 mb-4">
                   <Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/>
                </div>
                <p className="text-gray-600 italic mb-6">"I don't know how to read English. My son told me to just speak to this app. Within 2 hours, I got a call from a shop nearby for a helper job."</p>
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500">RK</div>
                   <div>
                      <h4 className="font-bold text-sm">Raju Kumar</h4>
                      <p className="text-xs text-gray-500">Shop Helper, Patna</p>
                   </div>
                </div>
             </div>
             {/* Story 2 */}
             <div className="bg-white border border-gray-100 p-8 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                <div className="flex gap-1 text-yellow-400 mb-4">
                   <Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/>
                </div>
                <p className="text-gray-600 italic mb-6">"Urgently needed a delivery boy for my restaurant. Posted a voice note, and got 5 calls in 30 mins. Hired someone the same evening."</p>
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500">AS</div>
                   <div>
                      <h4 className="font-bold text-sm">Anita Singh</h4>
                      <p className="text-xs text-gray-500">Restaurant Owner, Lucknow</p>
                   </div>
                </div>
             </div>
             {/* Story 3 */}
             <div className="bg-white border border-gray-100 p-8 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                <div className="flex gap-1 text-yellow-400 mb-4">
                   <Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/>
                </div>
                <p className="text-gray-600 italic mb-6">"Best app for drivers. I can see jobs near my home in Andheri. Salary is also clearly written. No confusion."</p>
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500">MP</div>
                   <div>
                      <h4 className="font-bold text-sm">Mohan P.</h4>
                      <p className="text-xs text-gray-500">Driver, Mumbai</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* --- CTA --- */}
      <div className="bg-brand-600 py-12 sm:py-16">
         <div className="max-w-4xl mx-auto px-4 text-center text-white">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to find work?</h2>
            <p className="text-brand-100 text-lg mb-10 max-w-2xl mx-auto">
               Join 5 Million+ workers and start earning today. It takes less than 1 minute to setup.
            </p>
            <Link 
               to="/login?role=WORKER"
               className="bg-white text-brand-700 font-bold py-4 px-10 rounded-full text-lg shadow-2xl hover:bg-gray-100 transition-colors inline-block"
            >
               Start Now - It's Free
            </Link>
         </div>
      </div>

      {/* --- FOOTER --- */}
      <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
             <span className="text-2xl font-bold text-white block mb-4">Rozgar AI</span>
             <p className="text-sm max-w-xs leading-relaxed">
               Empowering India's blue-collar workforce with technology that speaks their language.
             </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
               <li><a href="#" className="hover:text-white transition-colors">Find Jobs</a></li>
               <li><a href="#" className="hover:text-white transition-colors">Post Jobs</a></li>
               <li><a href="#" className="hover:text-white transition-colors">Community Guidelines</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
               <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
               <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
               <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-gray-800 text-center text-xs">
           &copy; {new Date().getFullYear()} Rozgar AI Technologies Pvt Ltd. Made for Bharat ❤️
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
