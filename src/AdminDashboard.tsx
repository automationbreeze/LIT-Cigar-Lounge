import React, { useState, useEffect, useRef } from 'react';
import { Upload, Trash2, UserPlus, LogOut, Image as ImageIcon, Shield, Loader2, Home, Play } from 'lucide-react';
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
  const [deletingEmail, setDeletingEmail] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Upload State
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error', message: string, details?: string } | null>(null);
  const [gallery, setGallery] = useState<any[]>([]);
  const [isGalleryLoading, setIsGalleryLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [healthStatus, setHealthStatus] = useState<{ status: string; env: string; cloudinary: boolean; admin: boolean } | null>(null);

  const fetchHealth = async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setHealthStatus(data);
      }
    } catch (error) {
      console.error('Health check failed:', error);
    }
  };

  useEffect(() => {
    checkAuth();
    fetchGallery();
    fetchHealth();
  }, []);

  const fetchGallery = async () => {
    setIsGalleryLoading(true);
    try {
      const res = await fetch('/api/gallery', {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setGallery(data);
      }
    } catch (error) {
      console.error('Failed to fetch gallery:', error);
    } finally {
      setIsGalleryLoading(false);
    }
  };

  const handleDeleteMedia = async (publicId: string, resourceType: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const res = await fetch(`/api/gallery/${encodeURIComponent(publicId)}?type=${resourceType}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (res.ok) {
        setUploadStatus({ type: 'success', message: 'Item deleted successfully' });
        setTimeout(() => {
          fetchGallery();
          setUploadStatus(null);
        }, 1500);
      } else {
        const data = await res.json();
        setUploadStatus({ type: 'error', message: data.error || 'Failed to delete media' });
        setTimeout(() => setUploadStatus(null), 3000);
      }
    } catch (error) {
      console.error('Delete error:', error);
      setUploadStatus({ type: 'error', message: 'An error occurred' });
      setTimeout(() => setUploadStatus(null), 3000);
    }
  };

  const [configStatus, setConfigStatus] = useState<{ cloudinary: boolean; admin: boolean } | null>(null);

  const [isTestingCloudinary, setIsTestingCloudinary] = useState(false);

  const testCloudinary = async () => {
    setIsTestingCloudinary(true);
    try {
      const res = await fetch('/api/test-cloudinary', { credentials: 'include' });
      const data = await res.json();
      if (res.ok) {
        setUploadStatus({ 
          type: 'success', 
          message: data.message || 'Cloudinary connection successful!',
          details: data.details
        });
      } else {
        setUploadStatus({ 
          type: 'error', 
          message: `Cloudinary test failed: ${data.error}`,
          details: `${data.details || ''} ${data.http_code ? `(HTTP ${data.http_code})` : ''} ${data.help || ''}`.trim()
        });
      }
    } catch (error: any) {
      setUploadStatus({ type: 'error', message: `Connection error: ${error.message}` });
    } finally {
      setIsTestingCloudinary(false);
      setTimeout(() => setUploadStatus(null), 5000);
    }
  };

  const checkConfig = async () => {
    try {
      const res = await fetch('/api/config-status', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setConfigStatus(data);
      }
    } catch (error) {
      console.error('Failed to check config status:', error);
    }
  };

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/check-auth', {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setIsAuthenticated(true);
        setCurrentUser(data.user);
        fetchAdmins();
        checkConfig(); // Check config status after login
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
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });
      
      const contentType = res.headers.get('content-type');
      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        console.error('Non-JSON response:', text);
        setLoginError(`Server error: Received non-JSON response (${res.status})`);
        setIsLoading(false);
        return;
      }

      if (res.ok) {
        setIsAuthenticated(true);
        setCurrentUser({ email: data.email });
        fetchAdmins();
      } else {
        setLoginError(data.error || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login fetch error:', error);
      setLoginError(`Connection error: ${error.message || 'An error occurred'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const fetchAdmins = async () => {
    const res = await fetch('/api/admins', {
      credentials: 'include'
    });
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
        credentials: 'include',
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
    
    // If they haven't clicked once to confirm, set the confirm state
    if (confirmDelete !== adminEmail) {
      setConfirmDelete(adminEmail);
      // Reset confirmation after 3 seconds if they don't click again
      setTimeout(() => setConfirmDelete(null), 3000);
      return;
    }
    
    setDeletingEmail(adminEmail);
    setAdminError('');
    try {
      const res = await fetch('/api/admins/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: adminEmail })
      });
      
      if (res.ok) {
        setUploadStatus({ type: 'success', message: `Admin ${adminEmail} removed` });
        setConfirmDelete(null);
        fetchAdmins();
        setTimeout(() => setUploadStatus(null), 3000);
      } else {
        const data = await res.json();
        setAdminError(data.error || 'Failed to remove admin');
      }
    } catch (error) {
      setAdminError('An error occurred while removing admin');
    } finally {
      setDeletingEmail(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      const contentType = res.headers.get('content-type');
      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(`Server returned non-JSON response (${res.status}): ${text.substring(0, 100)}`);
      }

      if (res.ok) {
        setUploadStatus({ type: 'success', message: 'Upload successful!' });
        setTimeout(() => {
          fetchGallery();
          setUploadStatus(null);
        }, 2000);
      } else {
        setUploadStatus({ 
          type: 'error', 
          message: data.error || 'Upload failed',
          details: data.details
        });
        setTimeout(() => setUploadStatus(null), 10000);
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadStatus({ 
        type: 'error', 
        message: 'Upload failed: Server error',
        details: error.message
      });
      setTimeout(() => setUploadStatus(null), 15000);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
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

          {healthStatus && (
            <div className="mb-6 p-3 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${healthStatus.cloudinary ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">Cloudinary</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${healthStatus.admin ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">Admin Env</span>
                </div>
              </div>
              <span className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">{healthStatus.env}</span>
            </div>
          )}

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
            <div className="flex items-center gap-2 sm:gap-4">
              <Link to="/" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600 hover:text-gray-900">
                <Home className="w-4 h-4" />
                <span className="hidden xs:inline">Home</span>
              </Link>
              <span className="hidden md:inline text-sm text-gray-500">{currentUser?.email}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600 hover:text-gray-900"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Config Status */}
        {configStatus && (
          <div className="mb-8 p-4 bg-white rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${configStatus.cloudinary ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Cloudinary</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${configStatus.admin ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Admin Auth</span>
              </div>
            </div>
            {!configStatus.cloudinary && (
              <div className="flex items-center gap-4">
                <p className="text-[10px] text-red-600 font-bold uppercase tracking-widest">Action Required: Configure Cloudinary in Settings</p>
                <button 
                  onClick={testCloudinary}
                  disabled={isTestingCloudinary}
                  className="text-[10px] bg-red-600 text-white px-2 py-1 rounded-sm hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isTestingCloudinary ? 'Testing...' : 'Test Connection'}
                </button>
              </div>
            )}
            {configStatus.cloudinary && (
              <button 
                onClick={testCloudinary}
                disabled={isTestingCloudinary}
                className="text-[10px] bg-gray-900 text-white px-2 py-1 rounded-sm hover:bg-black transition-colors disabled:opacity-50"
              >
                {isTestingCloudinary ? 'Testing...' : 'Test Connection'}
              </button>
            )}
          </div>
        )}

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
              <p className="text-gray-400 text-xs mt-2">
                Images (JPG, PNG, WEBP) & Videos (MP4, MOV)<br />
                Max 100MB per file
              </p>
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

            {uploadStatus && (
              <div className={`mt-4 p-3 rounded-lg text-sm font-medium ${
                uploadStatus.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
              }`}>
                <div className="flex flex-col gap-1">
                  <span>{uploadStatus.message}</span>
                  {uploadStatus.details && (
                    <span className="text-[10px] font-mono opacity-80 break-all">{uploadStatus.details}</span>
                  )}
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
                        disabled={deletingEmail === admin.email}
                        className={`flex items-center gap-2 px-2 py-1 rounded transition-all ${
                          confirmDelete === admin.email 
                            ? 'bg-red-500 text-white text-[10px] uppercase font-bold tracking-tighter' 
                            : 'text-red-500 hover:bg-red-50'
                        }`}
                        title={confirmDelete === admin.email ? "Click again to confirm" : "Remove Admin"}
                      >
                        {deletingEmail === admin.email ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : confirmDelete === admin.email ? (
                          "Confirm?"
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900"
                  />
                </div>
                <div>
                  <input
                    type="password"
                    placeholder="Initial password"
                    required
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900"
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

        {/* Gallery Preview Section */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-gray-900" />
              <h2 className="text-lg font-bold text-gray-900">Gallery Preview</h2>
            </div>
            <button 
              onClick={fetchGallery}
              className="text-sm text-gray-500 hover:text-gray-900 underline"
            >
              Refresh
            </button>
          </div>

          {isGalleryLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {gallery.length > 0 ? (
                gallery.map((item, i) => (
                  <div key={item.public_id || i} className="aspect-square rounded-lg overflow-hidden bg-gray-100 relative group">
                    {item.resource_type === 'video' ? (
                      <div className="w-full h-full flex items-center justify-center bg-gray-900">
                        <Play className="w-8 h-8 text-white/20" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <Play className="w-4 h-4 text-white fill-white" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <img 
                        src={item.secure_url} 
                        alt="Gallery preview" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    )}

                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMedia(item.public_id, item.resource_type);
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10 shadow-lg"
                      title="Delete Media"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-12 text-center text-gray-400 font-serif italic">
                  No media found in gallery.
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
