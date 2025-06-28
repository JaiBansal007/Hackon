import React, { useEffect, useState } from 'react';
import { auth, googleProvider } from '../firebase/config';

export default function FirebaseTest() {
  const [status, setStatus] = useState('Checking...');
  const [details, setDetails] = useState([]);

  useEffect(() => {
    const checkFirebase = async () => {
      const checks = [];
      
      try {
        // Check if Firebase Auth is initialized
        if (auth) {
          checks.push('✅ Firebase Auth initialized');
          
          // Check current user
          if (auth.currentUser) {
            checks.push(`✅ User authenticated: ${auth.currentUser.email}`);
          } else {
            checks.push('ℹ️ No user currently authenticated');
          }
        } else {
          checks.push('❌ Firebase Auth not initialized');
        }
        
        // Check Google Provider
        if (googleProvider) {
          checks.push('✅ Google Auth Provider ready');
        } else {
          checks.push('❌ Google Auth Provider not ready');
        }
        
        setStatus('✅ Firebase Ready');
        setDetails(checks);
        
      } catch (error) {
        console.error('Firebase check failed:', error);
        setStatus('❌ Firebase Error');
        setDetails([`Error: ${error.message}`]);
      }
    };
    
    checkFirebase();
  }, []);

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'rgba(0,0,0,0.8)', 
      color: 'white', 
      padding: '10px', 
      borderRadius: '8px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <div><strong>Firebase Status:</strong> {status}</div>
      {details.map((detail, index) => (
        <div key={index}>{detail}</div>
      ))}
    </div>
  );
}
