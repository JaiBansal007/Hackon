# 🔧 Firebase Email/Password Authentication Setup

## 🚨 Error: `auth/operation-not-allowed`

This error occurs because **Email/Password authentication is not enabled** in your Firebase project. Here's how to fix it:

## ✅ **Step-by-Step Fix**

### 1. **Open Firebase Console**
- Go to: https://console.firebase.google.com/
- Sign in with your Google account

### 2. **Select Your Project**
- Click on your project: `firestream-e8465`

### 3. **Navigate to Authentication**
- In the left sidebar, click **"Authentication"**
- Click on the **"Sign-in method"** tab

### 4. **Enable Email/Password**
- Scroll down to find **"Email/Password"** in the providers list
- Click on **"Email/Password"**
- Toggle the **"Enable"** switch to **ON**
- Click **"Save"**

### 5. **Optional: Enable Email Link (Passwordless)**
- In the same Email/Password settings
- You can also enable **"Email link (passwordless sign-in)"** if desired
- This allows users to sign in with just an email link

## 🎯 **What You Should See**

After enabling, you should see:
- ✅ **Email/Password**: Enabled
- ✅ **Google**: Enabled (already working)

## 🧪 **Test the Fix**

1. **Refresh your app**: `http://localhost:5173`
2. **Try signing up** with email/password
3. **Should work without the error**

## 📋 **Additional Settings (Optional)**

While you're in the Firebase Console, you might want to configure:

### **Email Templates**
- Go to Authentication → Templates
- Customize verification emails, password reset emails, etc.

### **Authorized Domains**
- Go to Authentication → Settings → Authorized domains
- Add your production domain when you deploy

### **User Management**
- Go to Authentication → Users
- Here you'll see all registered users

## 🔒 **Security Rules (Already Configured)**

Your Firestore security rules should allow authenticated users:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🎉 **Expected Result**

After enabling Email/Password authentication:
- ✅ **Sign up with email/password** - Works
- ✅ **Sign in with email/password** - Works  
- ✅ **Google sign-in** - Already works
- ✅ **User data stored in Firestore** - Works
- ✅ **Password validation** - Works
- ✅ **reCAPTCHA protection** - Works

## 🆘 **Still Having Issues?**

If you're still experiencing problems:

1. **Check the browser console** for detailed error messages
2. **Verify your Firebase config** - Make sure all credentials are correct
3. **Check Firebase quotas** - Ensure you haven't exceeded free tier limits
4. **Clear browser cache** - Sometimes helps with authentication issues

## 📞 **Firebase Support Resources**

- Firebase Documentation: https://firebase.google.com/docs/auth
- Firebase Community: https://firebase.google.com/community
- Stack Overflow: Tag your questions with `firebase` and `firebase-authentication`

---

**Note**: This is a one-time setup. Once enabled, all users will be able to create accounts with email/password! 🚀
