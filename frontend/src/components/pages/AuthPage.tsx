import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Mail, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import PageWrapper from '../layout/PageWrapper';
import AuthInput from '../common/AuthInput';
import MagicText from '../common/MagicText';
import AnimatedButton from '../common/AnimatedButton';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // Get location object
  const { login, register } = useAuth();

  // This effect checks if we should default to the register page
  useEffect(() => {
    if (location.state?.defaultToRegister) {
      setIsLogin(false);
    }
  }, [location.state]);

  const handleInputChange = (id, value) => {
    setFormData(prev => ({ ...prev, [id]: value }));
    setError('');
  };

  const toggleAuthMode = (mode) => {
    setIsLogin(mode);
    setFormData({ fullName: '', email: '', password: '', confirmPassword: '' });
    setError('');
  };

  const handleAuthAction = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isLogin) {
        await toast.promise(
          login(formData.email, formData.password),
          {
            loading: 'Signing in...',
            success: <b>Login successful!</b>,
            error: (err) => err.response?.data?.detail || err.message || 'Login failed.',
          }
        );
      } else {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match.');
        }
        await toast.promise(
          register({ fullName: formData.fullName, email: formData.email, password: formData.password, role: 'student' }),
          {
            loading: 'Creating account...',
            success: <b>Registration successful!</b>,
            error: (err) => err.response?.data?.detail || err.message || 'Registration failed.',
          }
        );
      }
      navigate('/dashboard');
    } catch (err) {
      // The toast promise handles showing the error, so we just need to catch it.
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut', staggerChildren: 0.1 } },
    exit: { opacity: 0, y: -50, transition: { duration: 0.3, ease: 'easeIn' } },
  };

  return (
    <PageWrapper>
      <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden background-emblem-dim">
        <motion.div
          className="w-full max-w-md glass-card"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="p-8 md:p-10">
            <MagicText text={isLogin ? "Welcome Back" : "Create Your Account"} className="text-center text-3xl font-bold mb-4" />
            <div className="flex justify-center mb-6">
              <div className="flex bg-neutral-900/50 p-1 rounded-full">
                <button onClick={() => toggleAuthMode(true)} className={`px-6 py-2 text-sm font-semibold rounded-full relative transition-colors ${ isLogin ? 'text-white' : 'text-slate-400 hover:text-white' }`}>
                  {isLogin && <motion.div layoutId="auth-pill" className="absolute inset-0 bg-primary rounded-full z-0" />}
                  <span className="relative z-10">Login</span>
                </button>
                <button onClick={() => toggleAuthMode(false)} className={`px-6 py-2 text-sm font-semibold rounded-full relative transition-colors ${ !isLogin ? 'text-white' : 'text-slate-400 hover:text-white' }`}>
                  {!isLogin && <motion.div layoutId="auth-pill" className="absolute inset-0 bg-primary rounded-full z-0" />}
                  <span className="relative z-10">Register</span>
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.form key={isLogin ? 'login' : 'register'} variants={formVariants} initial="hidden" animate="visible" exit="exit" onSubmit={handleAuthAction}>
                {!isLogin && <AuthInput id="fullName" type="text" placeholder="Full Name" icon={<User />} value={formData.fullName} onChange={handleInputChange}/>}
                <AuthInput id="email" type="email" placeholder="Email Address" icon={<Mail />} value={formData.email} onChange={handleInputChange}/>
                <AuthInput id="password" type="password" placeholder="Password" icon={<Lock />} value={formData.password} onChange={handleInputChange}/>
                {!isLogin && <AuthInput id="confirmPassword" type="password" placeholder="Confirm Password" icon={<Lock />} value={formData.confirmPassword} onChange={handleInputChange}/>}

                
                <AnimatedButton type="submit" disabled={isLoading} className="w-full mt-4">
                  {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : (isLogin ? 'Sign In' : 'Create Account')}
                  {!isLoading && <ArrowRight className="ml-2 w-5 h-5" />}
                </AnimatedButton>
              </motion.form>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  );
};
export default AuthPage;