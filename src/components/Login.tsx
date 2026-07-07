import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, where, getDocs, doc, setDoc } from '../firebase';
import { db } from '../firebase';
import { Router, ShieldCheck, Zap, Lock, User as UserIcon, Key, Loader2, Eye, EyeOff, Fingerprint } from 'lucide-react';
import { User } from '../types';
import { useTranslation } from 'react-i18next';
import { NativeBiometric } from 'capacitor-native-biometric';
import { Device } from '@capacitor/device';

export default function Login({ onLogin }: { onLogin: (user: User) => void }) {
  const { t, i18n } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [hasBiometricCredentials, setHasBiometricCredentials] = useState(false);
  const [showWebBiometricModal, setShowWebBiometricModal] = useState(false);
  const [webBiometricScanning, setWebBiometricScanning] = useState(false);

  useEffect(() => {
    const checkBiometrics = async () => {
      try {
        const info = await Device.getInfo();
        if (info.platform === 'web') {
          setIsBiometricSupported(true);
          setHasBiometricCredentials(localStorage.getItem('snd_has_bio_credentials') === 'true');
        } else {
          const bio = await NativeBiometric.isAvailable();
          setIsBiometricSupported(bio.isAvailable);
          setHasBiometricCredentials(localStorage.getItem('snd_has_bio_credentials') === 'true');
        }
      } catch (e) {
        console.warn("Biometric support check failed:", e);
      }
    };
    checkBiometrics();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    setLoading(true);
    setError(null);
    try {
      const q = query(collection(db, 'users'), where('username', '==', username));
      const snap = await getDocs(q);
      
      let authenticatedUser: User | null = null;

      if (!snap.empty) {
        const userData = snap.docs[0].data() as User;
        const isActiveVal = userData.isActive as any;
        if (isActiveVal === false || isActiveVal === 0 || isActiveVal === 'false') {
          setError("هذا الحساب معطل. يرجى مراجعة المسؤول.");
          setLoading(false);
          return;
        }
        if (userData.password === password) {
          authenticatedUser = { ...userData, id: snap.docs[0].id };
        }
      } else if (username === 'admin' && password === 'admin') {
        // Emergency fallback: Create and login if it's the default admin and not found
        const adminData: User = {
          username: 'admin',
          password: 'admin',
          name: 'المدير العام',
          role: 'admin',
          isPrimary: true
        };
        const docRef = doc(db, 'users', 'primary-admin');
        await setDoc(docRef, adminData);
        authenticatedUser = { ...adminData, id: 'primary-admin' };
      }

      if (authenticatedUser) {
        // Store credentials for biometric quick access
        try {
          const info = await Device.getInfo();
          if (info.platform === 'web') {
            localStorage.setItem('snd_bio_credentials', JSON.stringify({
              username: authenticatedUser.username,
              password: authenticatedUser.password
            }));
            localStorage.setItem('snd_has_bio_credentials', 'true');
          } else {
            await NativeBiometric.setCredentials({
              username: authenticatedUser.username,
              password: authenticatedUser.password,
              server: 'com.snd.maintenance'
            });
            localStorage.setItem('snd_has_bio_credentials', 'true');
          }
        } catch (bioErr) {
          console.warn("Could not save credentials to biometric secure storage", bioErr);
        }

        onLogin(authenticatedUser);
      } else {
        setError(t('login.invalid'));
      }
    } catch (err: any) {
      console.error(err);
      setError(t('login.connError'));
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    setError(null);
    try {
      const info = await Device.getInfo();
      if (info.platform === 'web') {
        const savedCreds = localStorage.getItem('snd_bio_credentials');
        if (!savedCreds && localStorage.getItem('snd_has_bio_credentials') !== 'true') {
          setError(t('login.biometricNoCreds'));
          return;
        }

        setShowWebBiometricModal(true);
        setWebBiometricScanning(true);
        setTimeout(async () => {
          setWebBiometricScanning(false);
          setShowWebBiometricModal(false);

          let userCreds = { username: 'admin', password: 'admin' };
          if (savedCreds) {
            try {
              userCreds = JSON.parse(savedCreds);
            } catch (e) {}
          }

          setLoading(true);
          try {
            const q = query(collection(db, 'users'), where('username', '==', userCreds.username));
            const snap = await getDocs(q);
            let authenticatedUser: User | null = null;
            if (!snap.empty) {
              const userData = snap.docs[0].data() as User;
              const isActiveVal = userData.isActive as any;
              if (isActiveVal === false || isActiveVal === 0 || isActiveVal === 'false') {
                setError("هذا الحساب معطل. يرجى مراجعة المسؤول.");
                setLoading(false);
                return;
              }
              if (userData.password === userCreds.password) {
                authenticatedUser = { ...userData, id: snap.docs[0].id };
              }
            } else if (userCreds.username === 'admin' && userCreds.password === 'admin') {
              const adminData: User = {
                username: 'admin',
                password: 'admin',
                name: 'المدير العام',
                role: 'admin',
                isPrimary: true
              };
              const docRef = doc(db, 'users', 'primary-admin');
              await setDoc(docRef, adminData);
              authenticatedUser = { ...adminData, id: 'primary-admin' };
            }

            if (authenticatedUser) {
              onLogin(authenticatedUser);
            } else {
              setError(t('login.invalid'));
            }
          } catch (err) {
            setError(t('login.connError'));
          } finally {
            setLoading(false);
          }
        }, 1500);
        return;
      }

      // Native platform
      const bio = await NativeBiometric.isAvailable();
      if (!bio.isAvailable) {
        setError(t('login.biometricFailed'));
        return;
      }

      if (localStorage.getItem('snd_has_bio_credentials') !== 'true') {
        setError(t('login.biometricNoCreds'));
        return;
      }

      const credentials = await NativeBiometric.getCredentials({
        server: 'com.snd.maintenance',
      });

      if (credentials && credentials.username && credentials.password) {
        setLoading(true);
        const q = query(collection(db, 'users'), where('username', '==', credentials.username));
        const snap = await getDocs(q);
        let authenticatedUser: User | null = null;
        if (!snap.empty) {
          const userData = snap.docs[0].data() as User;
          const isActiveVal = userData.isActive as any;
          if (isActiveVal === false || isActiveVal === 0 || isActiveVal === 'false') {
            setError("هذا الحساب معطل. يرجى مراجعة المسؤول.");
            setLoading(false);
            return;
          }
          if (userData.password === credentials.password) {
            authenticatedUser = { ...userData, id: snap.docs[0].id };
          }
        }

        if (authenticatedUser) {
          onLogin(authenticatedUser);
        } else {
          setError(t('login.invalid'));
        }
      } else {
        setError(t('login.biometricNoCreds'));
      }
    } catch (err: any) {
      console.error("Biometric login failed:", err);
      setError(t('login.biometricFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="absolute top-6 right-6 z-20">
        <button 
          onClick={() => i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar')}
          className="px-4 py-2 bg-[#1a1a1a] border border-white/5 rounded-xl font-bold hover:bg-white/5 transition-colors"
        >
          {i18n.language === 'ar' ? 'English' : 'العربية'}
        </button>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-[#1a1a1a] border border-white/5 rounded-3xl p-8 shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center shadow-xl shadow-orange-900/40">
             <Router className="text-white w-8 h-8" />
          </div>
          
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">SND System</h1>
            <p className="text-gray-400 text-sm">{t('login.prompt')}</p>
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div className="text-left rtl:text-right space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1 rtl:ml-0 rtl:mr-1">{t('login.username')}</label>
              <div className="relative">
                <UserIcon className="absolute left-4 rtl:left-auto rtl:right-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 rtl:pl-4 rtl:pr-12 py-3.5 focus:border-orange-500 outline-none transition-all"
                  placeholder="admin"
                />
              </div>
            </div>

            <div className="text-left rtl:text-right space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1 rtl:ml-0 rtl:mr-1">{t('login.password')}</label>
              <div className="relative">
                <Key className="absolute left-4 rtl:left-auto rtl:right-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-12 py-3.5 focus:border-orange-500 outline-none transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 rtl:right-auto rtl:left-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-400/10 border border-red-400/20 rounded-xl text-red-500 text-xs font-medium">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button 
                type="submit"
                disabled={loading}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-orange-900/20 flex items-center justify-center gap-2 group"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : t('login.title')}
              </button>
              
              {isBiometricSupported && (
                <button 
                  type="button"
                  onClick={handleBiometricLogin}
                  className="px-5 bg-black/40 hover:bg-orange-600/10 border border-white/10 hover:border-orange-500/30 text-orange-500 rounded-2xl transition-all flex items-center justify-center shadow-lg active:scale-95 group"
                  title={t('login.biometricLogin')}
                >
                  <Fingerprint size={24} className="group-hover:scale-110 transition-transform" />
                </button>
              )}
            </div>
          </form>

          <div className="pt-4 flex items-center gap-4 text-gray-600">
             <div className="w-8 h-[1px] bg-white/5"></div>
             <p className="text-[10px] font-bold uppercase tracking-widest">{t('login.authorized')}</p>
             <div className="w-8 h-[1px] bg-white/5"></div>
          </div>
        </div>
      </motion.div>

      {/* Web Biometric Mock Modal */}
      <AnimatePresence>
        {showWebBiometricModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-8 max-w-sm w-full text-center space-y-6 shadow-2xl relative"
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="relative flex items-center justify-center">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-24 h-24 border-2 border-dashed border-orange-500 rounded-full absolute"
                  />
                  <div className="w-20 h-20 bg-orange-600/10 rounded-full flex items-center justify-center text-orange-500 border border-orange-500/20 relative z-10">
                    <Fingerprint size={40} className={webBiometricScanning ? "animate-pulse" : ""} />
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-white">
                    {t('login.biometricLogin')}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {i18n.language === 'ar' ? 'ضع إصبعك على مستشعر البصمة للمتابعة' : 'Place your finger on the sensor to continue'}
                  </p>
                </div>
              </div>
              
              <button 
                type="button"
                onClick={() => setShowWebBiometricModal(false)}
                className="w-full py-3 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-2xl font-bold transition-all text-sm"
              >
                {i18n.language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
