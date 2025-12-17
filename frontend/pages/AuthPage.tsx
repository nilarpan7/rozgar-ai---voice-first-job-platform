
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { UserRole } from '../types';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';

const AuthPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, user, t } = useAuth();
  
  // Default to Worker if not specified, but check URL param
  const initialRole = searchParams.get('role') === 'EMPLOYER' ? UserRole.EMPLOYER : UserRole.WORKER;
  const [role, setRole] = useState<UserRole>(initialRole);
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === UserRole.EMPLOYER) navigate('/employer/dashboard');
      else navigate('/worker/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      alert("Please enter a valid 10-digit number");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await login(phone, role);
      // Navigation happens in useEffect
    } catch (err: any) {
      alert(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
          <div className="flex border-b">
            <button 
              className={`flex-1 py-4 text-center font-bold text-sm ${role === UserRole.WORKER ? 'bg-brand-50 text-brand-600 border-b-2 border-brand-600' : 'text-gray-500'}`}
              onClick={() => setRole(UserRole.WORKER)}
            >
              {t.worker_mode}
            </button>
            <button 
              className={`flex-1 py-4 text-center font-bold text-sm ${role === UserRole.EMPLOYER ? 'bg-brand-50 text-brand-600 border-b-2 border-brand-600' : 'text-gray-500'}`}
              onClick={() => setRole(UserRole.EMPLOYER)}
            >
              {t.employer_mode}
            </button>
          </div>

          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{t.login_title}</h2>
              <p className="text-gray-500 text-sm">
                {role === UserRole.WORKER ? 'Find jobs near you instantly' : 'Hire staff in minutes'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.enter_phone}</label>
                <div className="relative">
                  <span className="absolute left-3 top-3.5 text-gray-500 font-bold">+91</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="99999 99999"
                    maxLength={10}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-lg tracking-wide"
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-md flex items-center justify-center gap-2
                  ${isSubmitting ? 'bg-gray-400 cursor-wait' : 'bg-brand-600 hover:bg-brand-700 active:scale-95 transition-all'}
                `}
              >
                {isSubmitting ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                   t.get_otp
                )}
              </button>
              
              <p className="text-xs text-center text-gray-400 mt-4">
                By continuing, you agree to our Terms & Privacy Policy.
                <br/>(Demo: Use any 10 digit number)
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
