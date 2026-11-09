import React, { useState } from 'react';
import {
  X,
  Save,
  Upload,
  Link as LinkIcon,
  User,
  CheckCircle,
  AlertCircle,
  Lock,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Eye,
  LogOut,
  Radio,
  Tv,
  LayoutTemplate,
  Layers,
  Code2,
} from 'lucide-react';
import { CallConfig, PRESET_FEMALE_PROFILES } from '../types';
import { saveCallConfig, loginWithGoogle, logoutAdmin, auth } from '../firebase';

interface AdminPanelProps {
  currentConfig: CallConfig;
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved: (newConfig: CallConfig) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  currentConfig,
  isOpen,
  onClose,
  onConfigSaved,
}) => {
  // Authentication state
  const allowedAdminEmails = ['tanvirmehedi017@gmail.com', 'tanvirmehedi01738@gmail.com'];
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const email = auth.currentUser?.email?.toLowerCase();
    return Boolean(auth.currentUser?.emailVerified && email && allowedAdminEmails.includes(email));
  });
  const [authError, setAuthError] = useState<string | null>(null);

  // Active admin tab: 'profile' or 'ads'
  const [activeTab, setActiveTab] = useState<'profile' | 'ads'>('profile');

  // Form states
  const [profileName, setProfileName] = useState(currentConfig.profileName);
  const [profileImage, setProfileImage] = useState(currentConfig.profileImage);
  const [adsterraLink, setAdsterraLink] = useState(currentConfig.adsterraLink);

  // Ad network units states
  const [headerBannerCode, setHeaderBannerCode] = useState(currentConfig.headerBannerCode || '');
  const [socialBarCode, setSocialBarCode] = useState(currentConfig.socialBarCode || '');
  const [popunderCode, setPopunderCode] = useState(currentConfig.popunderCode || '');
  const [inFeedBannerCode, setInFeedBannerCode] = useState(currentConfig.inFeedBannerCode || '');

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  if (!isOpen) return null;

  // Only explicitly approved, verified Google accounts can access admin settings.
  const handleGoogleLogin = async () => {
    try {
      setAuthError(null);
      const user = await loginWithGoogle();
      const email = user.email?.toLowerCase();
      if (!user.emailVerified || !email || !allowedAdminEmails.includes(email)) {
        await logoutAdmin();
        throw new Error('This Google account is not authorized to access the admin panel.');
      }
      setIsAuthenticated(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Google login error';
      setAuthError(message);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutAdmin();
    } catch {
      // ignore
    }
    setIsAuthenticated(false);
  };

  // Image file upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    setUploadLoading(true);
    setErrorMessage(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 800;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
            setProfileImage(compressedDataUrl);
          } else {
            setProfileImage(result);
          }
          setUploadLoading(false);
        };
        img.onerror = () => {
          setProfileImage(result);
          setUploadLoading(false);
        };
        img.src = result;
      }
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read file.');
      setUploadLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      setErrorMessage('Profile name cannot be empty.');
      return;
    }
    if (!profileImage.trim()) {
      setErrorMessage('Profile image cannot be empty.');
      return;
    }
    if (!adsterraLink.trim()) {
      setErrorMessage('Adsterra Direct Link is required.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setSaveSuccess(false);

    try {
      const updatedConfig: CallConfig = {
        profileName: profileName.trim(),
        profileImage: profileImage.trim(),
        adsterraLink: adsterraLink.trim(),
        headerBannerCode: headerBannerCode.trim(),
        socialBarCode: socialBarCode.trim(),
        popunderCode: popunderCode.trim(),
        inFeedBannerCode: inFeedBannerCode.trim(),
        updatedAt: new Date().toISOString(),
        updatedBy: auth.currentUser?.email || 'admin',
      };

      await saveCallConfig(updatedConfig);
      onConfigSaved(updatedConfig);
      setSaveSuccess(true);

      setTimeout(() => {
        setSaveSuccess(false);
      }, 3500);
    } catch (err: unknown) {
      console.error('Error saving config:', err);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Failed to save changes to Firebase. Check network or permissions.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const testAdsterraLink = () => {
    if (!adsterraLink.trim()) {
      setErrorMessage('Please enter an Adsterra link to test.');
      return;
    }
    window.open(adsterraLink.trim(), '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-zinc-900 border border-white/15 rounded-2xl shadow-2xl overflow-hidden my-auto text-zinc-100 max-h-[94vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-white/10 bg-zinc-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">Admin Control Panel</h2>
              <p className="text-xs text-zinc-400">
                Manage Caller Profile & Ad Networks
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-white/5 rounded-lg transition-colors text-xs flex items-center gap-1 cursor-pointer"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              aria-label="Close Admin Panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab switcher (Visible when logged in) */}
        {isAuthenticated && (
          <div className="flex border-b border-white/10 bg-zinc-950/40 px-5 pt-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`pb-2.5 px-3 font-semibold transition-all cursor-pointer flex items-center gap-1.5 border-b-2 ${
                activeTab === 'profile'
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Profile & Call Link</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ads')}
              className={`pb-2.5 px-3 font-semibold transition-all cursor-pointer flex items-center gap-1.5 border-b-2 ${
                activeTab === 'ads'
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Ad Networks (4 Units)</span>
              {(headerBannerCode || socialBarCode || popunderCode || inFeedBannerCode) && (
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              )}
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {!isAuthenticated ? (
            /* Secure Google Admin Login */
            <div className="space-y-5 py-4">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-white">Admin Sign In</h3>
                <p className="text-xs text-zinc-400">Sign in with an authorized, verified Google account.</p>
              </div>

              {authError && (
                <div className="p-3 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/15 border border-white/15 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>Sign in with Google</span>
              </button>
            </div>
          ) : (
            /* Authenticated Admin Management Form */
            <form onSubmit={handleSave} className="space-y-5">
              
              {/* Status Alert */}
              {saveSuccess && (
                <div className="p-3.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>
                    Changes saved to Firebase! All visitors will see the updated configuration and ads in real time.
                  </span>
                </div>
              )}

              {errorMessage && (
                <div className="p-3 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* TAB 1: Profile & Direct Link */}
              {activeTab === 'profile' && (
                <div className="space-y-5">
                  {/* Live Preview Card */}
                  <div className="p-3.5 rounded-xl bg-zinc-950 border border-white/10 flex items-center gap-3.5">
                    <div className="relative shrink-0">
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-emerald-500 p-0.5 bg-zinc-900">
                        <img
                          src={profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=85'}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-full"
                        />
                      </div>
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-zinc-950" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-sm truncate">
                          {profileName || 'Caller Name'}
                        </h4>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30">
                          Live
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 truncate mt-0.5 font-mono">
                        {adsterraLink || 'No direct link'}
                      </p>
                      <p className="text-[10px] text-emerald-400/80 mt-1 flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>Changes broadcast to all users via Firestore</span>
                      </p>
                    </div>
                  </div>

                  {/* Profile Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Caller Profile Name</span>
                    </label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="e.g. Sophia Miller"
                      maxLength={60}
                      className="w-full px-3.5 py-2.5 bg-zinc-950 border border-white/15 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Profile Picture */}
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Profile Picture</span>
                      </span>
                      <span className="text-[11px] text-zinc-400">Upload or Pick Preset</span>
                    </label>

                    {/* Upload button */}
                    <div className="flex items-center gap-3">
                      <label className="flex-1 cursor-pointer">
                        <div className="px-3.5 py-2.5 bg-white/5 hover:bg-white/10 border border-dashed border-white/20 hover:border-emerald-500/50 rounded-lg text-center transition-colors">
                          <span className="text-xs text-zinc-300 flex items-center justify-center gap-2">
                            <Upload className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{uploadLoading ? 'Processing Image...' : 'Upload from Device (JPG/PNG)'}</span>
                          </span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                          disabled={uploadLoading}
                        />
                      </label>
                    </div>

                    {/* Direct URL */}
                    <div>
                      <input
                        type="url"
                        value={profileImage}
                        onChange={(e) => setProfileImage(e.target.value)}
                        placeholder="Or paste image URL (https://...)"
                        className="w-full px-3.5 py-2 bg-zinc-950 border border-white/15 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {/* Quick Presets */}
                    <div>
                      <p className="text-[11px] text-zinc-400 mb-2 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-yellow-400" />
                        <span>1-Click Female Presets:</span>
                      </p>
                      <div className="grid grid-cols-5 gap-2">
                        {PRESET_FEMALE_PROFILES.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setProfileImage(preset.image);
                              setProfileName(preset.name);
                            }}
                            className={`relative group aspect-square rounded-lg overflow-hidden border-2 transition-all p-0.5 cursor-pointer ${
                              profileImage === preset.image
                                ? 'border-emerald-500 scale-105 shadow-md shadow-emerald-500/30'
                                : 'border-white/10 hover:border-white/30'
                            }`}
                            title={preset.name}
                          >
                            <img
                              src={preset.image}
                              alt={preset.name}
                              className="w-full h-full object-cover rounded-md"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Adsterra Direct Link */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                        <LinkIcon className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Adsterra Direct Link (Green Call Button URL)</span>
                      </label>
                      <button
                        type="button"
                        onClick={testAdsterraLink}
                        className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 underline cursor-pointer"
                      >
                        <span>Test Link</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    </div>
                    <input
                      type="url"
                      value={adsterraLink}
                      onChange={(e) => setAdsterraLink(e.target.value)}
                      placeholder="https://www.profitablecpmrate.com/your-adsterra-smartlink"
                      className="w-full px-3.5 py-2.5 bg-zinc-950 border border-white/15 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono text-xs"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: Ad Networks (Social Bar, Header Banner, Popunder, Video/In-feed) */}
              {activeTab === 'ads' && (
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
                    <Code2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>
                      Paste your Adsterra ad codes (scripts, HTML, or banners). Once saved, they immediately start displaying to all users!
                    </span>
                  </div>

                  {/* 1. Social Bar */}
                  <div className="space-y-1.5 p-3 rounded-xl bg-zinc-950 border border-white/10">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                        <Radio className="w-4 h-4 text-emerald-400" />
                        <span>1. Social Bar Code</span>
                      </label>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">
                        Floating Interactive Widget
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Paste the Adsterra Social Bar script code. It automatically displays interactive notification banners to all visitors.
                    </p>
                    <textarea
                      rows={3}
                      value={socialBarCode}
                      onChange={(e) => setSocialBarCode(e.target.value)}
                      placeholder={`<script type='text/javascript' src='//pl...js'></script>`}
                      className="w-full px-3 py-2 bg-zinc-900 border border-white/15 rounded-lg text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* 2. Header Top Banner */}
                  <div className="space-y-1.5 p-3 rounded-xl bg-zinc-950 border border-white/10">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                        <LayoutTemplate className="w-4 h-4 text-cyan-400" />
                        <span>2. Header Top Banner Code</span>
                      </label>
                      <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded">
                        320x50 / 468x60 / 728x90
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Paste your Header Top Banner script or HTML embed tag. Shows directly at the top of the calling screen.
                    </p>
                    <textarea
                      rows={3}
                      value={headerBannerCode}
                      onChange={(e) => setHeaderBannerCode(e.target.value)}
                      placeholder={`<script type="text/javascript">\n  atOptions = { 'key' : '...', 'format' : 'iframe', 'height' : 50, 'width' : 320, 'params' : {} };\n</script>\n<script type="text/javascript" src="//...js"></script>`}
                      className="w-full px-3 py-2 bg-zinc-900 border border-white/15 rounded-lg text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  {/* 3. Popunder */}
                  <div className="space-y-1.5 p-3 rounded-xl bg-zinc-950 border border-white/10">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-purple-400" />
                        <span>3. Popunder Code</span>
                      </label>
                      <span className="text-[10px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded">
                        Click / Tap Triggered
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Paste your Adsterra Popunder script code. Triggers full sponsor window when users tap on the screen.
                    </p>
                    <textarea
                      rows={3}
                      value={popunderCode}
                      onChange={(e) => setPopunderCode(e.target.value)}
                      placeholder={`<script type='text/javascript' src='//pl...js'></script>`}
                      className="w-full px-3 py-2 bg-zinc-900 border border-white/15 rounded-lg text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  {/* 4. Video & In-Feed Banner */}
                  <div className="space-y-1.5 p-3 rounded-xl bg-zinc-950 border border-white/10">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                        <Tv className="w-4 h-4 text-amber-400" />
                        <span>4. Video & In-Feed Banner Code</span>
                      </label>
                      <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">
                        Native In-Feed / Video Ad
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Paste your Video or In-Feed Native banner script/tag. Displays elegantly inside the calling screen interface.
                    </p>
                    <textarea
                      rows={3}
                      value={inFeedBannerCode}
                      onChange={(e) => setInFeedBannerCode(e.target.value)}
                      placeholder={`<script async="async" data-cfasync="false" src="//...js"></script>\n<div id="container-..."></div>`}
                      className="w-full px-3 py-2 bg-zinc-900 border border-white/15 rounded-lg text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              )}

              {/* Submit / Save Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-600/30 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving to Firebase...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save All Changes to Firebase</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-3 border-t border-white/10 bg-zinc-950/80 text-[11px] text-zinc-500 flex items-center justify-between">
          <span>Real-time Firebase Firestore Sync</span>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            Back to Call Screen
          </button>
        </div>

      </div>
    </div>
  );
};
