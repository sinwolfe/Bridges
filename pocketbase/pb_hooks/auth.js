/// pb_hooks/auth.js
export default function (router, pb) {
    // Example: run after user registration
    pb.onRecordAfterCreateRequest('users', (e) => {
      console.log('New user registered:', e.record.email);
    });
  
    // Example: run after login
    pb.onRecordAfterAuthWithPasswordRequest('users', (e) => {
      console.log('User logged in:', e.record.email);
    });
  
    // Example: run after logout
    pb.onRecordAfterAuthRefreshRequest('users', (e) => {
      console.log('User logged out:', e.record.email);
    });
  }
  