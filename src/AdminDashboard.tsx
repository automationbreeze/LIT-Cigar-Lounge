import React, { useState, useEffect, useRef } from 'react';
import { Upload, Trash2, UserPlus, LogOut, Image as ImageIcon, Shield, Loader2, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authCheckError, setAuthCheckError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{ email: string } | null>(null);

  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Admin Management State
  const [admins, setAdmins] = useState<{ email: string }[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');

  // Upload State
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/check-auth');
      if (res.ok) {
        const data = await res.json();
        setIsAuthenticated(true);
        setCurrentUser(data.user);
        fetchAdmins();
      } else {
        setIsAuthenticated(false);
      }
    } catch (error: any) {
      setAuthCheckError(error.message || 'Unknown error');
      setIsAuthenticated(false);
    }
    // Guarantee this runs even if something weird happens in finally
    setIsLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        const data = await res.json();
        setIsAuthenticated(true);
        setCurrentUser({ email: data.email });
        fetchAdmins();
      } else {
        const data = await res.json();
        setLoginError(data.error || 'Login failed');
      }
    } catch (error) {
      setLoginError('An error occurred');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const fetchAdmins = async () => {
    const res = await fetch('/api/admins');
    if (res.ok) {
      const data = await res.json();
      setAdmins(data);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    try {
      const res = await fetch('/api/admins/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newAdminEmail, password: newAdminPassword })
      });
      if (res.ok) {
        setNewAdminEmail('');
        setNewAdminPassword('');
        fetchAdmins();
      } else {
        const data = await res.json();
        setAdminError(data.error || 'Failed to add admin');
      }
    } catch (error) {
      setAdminError('An error occurred');
    }
  };

  const handleRemoveAdmin = async (adminEmail: string) => {
    if (adminEmail === currentUser?.email) return;
    if (!confirm(`Are you sure you want to remove ${adminEmail}?`)) return;
    
    try {
      const res = await fetch('/api/admins/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail })
      });
      if (res.ok) {
        fetchAdmins();
      } else {
        alert('Failed to remove admin');
      }
    } catch (error) {
      alert('An error occurred');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(e.target.files);
    }
  };

  const uploadFiles = async (files: FileList) => {
    setIsUploading(true);
    setUploadProgress(0);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      // Using XMLHttpRequest to track progress
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/upload', true);
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          alert('Upload successful!');
        } else {
          alert('Upload failed');
        }
        setIsUploading(false);
        setUploadProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = '';
      };

      xhr.onerror = () => {
        alert('Upload failed');
        setIsUploading(false);
        setUploadProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = '';
      };

      xhr.send(formData);
    } catch (error) {
      alert('An error occurred during upload');
      setIsUploading(false);
    }
  };

  if (authCheckError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <p className="text-red-500 mb-4">Error: {authCheckError}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-gray-900 text-white rounded">Retry</button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Admin Login</h2>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900"
              />
            </div>
            {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
            <button
              type="submit"
              className="w-full bg-gray-900 text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Sign In
            </button>
            <div className="mt-4 text-center">
              <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                <Home className="w-4 h-4" />
                Return to Home
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-gray-900" />
              <span className="font-bold text-xl text-gray-900">Admin Dashboard</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                <Home className="w-4 h-4" />
                Home
              </Link>
              <span className="text-sm text-gray-500">{currentUser?.email}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Media Upload Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <ImageIcon className="w-5 h-5 text-gray-900" />
              <h2 className="text-lg font-bold text-gray-900">Media Upload</h2>
            </div>
            
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
                isDragging ? 'border-gray-900 bg-gray-50' : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input
                type="file"
                multiple
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*,video/*"
              />
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Click or drag files to upload</p>
              <p className="text-gray-400 text-sm mt-2">Supports multiple images and videos</p>
            </div>

            {isUploading && (
              <div className="mt-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gray-900 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Manage Admins Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Shield className="w-5 h-5 text-gray-900" />
              <h2 className="text-lg font-bold text-gray-900">Manage Admins</h2>
            </div>

            <div className="mb-8">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Current Admins</h3>
              <div className="space-y-3">
                {admins.map((admin) => (
                  <div key={admin.email} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <span className="text-gray-700">{admin.email}</span>
                    {admin.email !== currentUser?.email && (
                      <button
                        onClick={() => handleRemoveAdmin(admin.email)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Remove Admin"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-4">Add New Admin</h3>
              <form onSubmit={handleAddAdmin} className="space-y-4">
                <div>
                  <input
                    type="email"
                    placeholder="Email address"
                    required
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>
                <div>
                  <input
                    type="password"
                    placeholder="Initial password"
                    required
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>
                {adminError && <p className="text-red-500 text-sm">{adminError}</p>}
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-900 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium border border-gray-200"
                >
                  <UserPlus className="w-4 h-4" />
                  Add Admin
                </button>
              </form>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
