import React from 'react';
import { auth } from '../utils/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useStore } from '../store';
import { LogIn } from 'lucide-react';

export default function Auth() {
  const { userId, setUserId } = useStore();

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      setUserId(result.user.uid);
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setUserId(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="absolute top-4 right-4">
      {userId ? (
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          Sign Out
        </button>
      ) : (
        <button
          onClick={handleLogin}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <LogIn className="w-5 h-5" />
          <span>Sign In with Google</span>
        </button>
      )}
    </div>
  );
}
