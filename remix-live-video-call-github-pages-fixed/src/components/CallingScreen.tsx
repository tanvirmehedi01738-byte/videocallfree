import React, { useState, useEffect } from 'react';
import {
  Phone,
  PhoneOff,
  Video,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  MessageSquare,
  Shield,
  Wifi,
  Battery,
  Lock,
  Sparkles,
} from 'lucide-react';
import { CallConfig } from '../types';
import { soundManager } from '../utils/audio';
import { AdContainer, GlobalAdScriptInjector } from './AdContainer';

interface CallingScreenProps {
  config: CallConfig;
  onOpenAdmin: () => void;
}

export const CallingScreen: React.FC<CallingScreenProps> = ({ config, onOpenAdmin }) => {
  const [currentTime, setCurrentTime] = useState<string>('09:41');
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callStatus, setCallStatus] = useState<'incoming' | 'declined' | 'connecting'>('incoming');
  const [isAudioRinging, setIsAudioRinging] = useState(false);
  const [cameraFlipped, setCameraFlipped] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleSoundRingtone = () => {
    if (isAudioRinging) {
      soundManager.stopRingingLoop();
      setIsAudioRinging(false);
      showToast('Ringtone muted');
    } else {
      soundManager.startRingingLoop();
      setIsAudioRinging(true);
      showToast('Ringing sound enabled');
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  // Unified function: Opens the Adsterra Direct Link immediately
  const handleOpenDirectLink = () => {
    soundManager.stopRingingLoop();
    setIsAudioRinging(false);

    const targetUrl = config.adsterraLink && config.adsterraLink.trim().length > 0
      ? config.adsterraLink.trim()
      : 'https://www.profitablecpmrate.com/example-adsterra-direct-link';

    try {
      const win = window.open(targetUrl, '_blank', 'noopener,noreferrer');
      if (!win || win.closed || typeof win.closed === 'undefined') {
        window.location.href = targetUrl;
      }
    } catch {
      window.location.href = targetUrl;
    }
  };

  // Button 1: Answer Call (Big Green)
  const handleAcceptCall = () => {
    setCallStatus('connecting');
    handleOpenDirectLink();

    setTimeout(() => {
      setCallStatus('incoming');
    }, 1500);
  };

  // Button 2: Decline Call (Red)
  const handleDeclineCall = () => {
    setCallStatus('declined');
    soundManager.playDeclineTone();
    handleOpenDirectLink();

    setTimeout(() => {
      setCallStatus('incoming');
    }, 2000);
  };

  // Button 3: Mic toggle
  const handleMicClick = () => {
    setIsMicMuted((prev) => !prev);
    handleOpenDirectLink();
  };

  // Button 4: Camera / Flip Camera
  const handleCameraClick = () => {
    setCameraFlipped((prev) => !prev);
    handleOpenDirectLink();
  };

  // Button 5: Speaker toggle
  const handleSpeakerClick = () => {
    setIsSpeakerOn((prev) => !prev);
    handleOpenDirectLink();
  };

  // Button 6: Message
  const handleMessageClick = () => {
    handleOpenDirectLink();
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-black overflow-x-hidden select-none font-sans py-2 sm:py-4">
      {/* Global Ad Scripts Injection: Social Bar & Popunder */}
      <GlobalAdScriptInjector
        socialBarCode={config.socialBarCode}
        popunderCode={config.popunderCode}
      />

      {/* Dynamic Ambient Background Blur */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-110 filter blur-3xl opacity-35 transition-all duration-1000 pointer-events-none"
        style={{ backgroundImage: `url(${config.profileImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/95 pointer-events-none" />

      {/* Floating subtle grid pattern for modern calling app texture */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))] pointer-events-none" />

      {/* Header Top Banner Ad (If configured) */}
      {config.headerBannerCode && config.headerBannerCode.trim() && (
        <div className="relative z-20 w-full max-w-md px-3 mb-2 flex justify-center">
          <AdContainer htmlCode={config.headerBannerCode} type="banner" />
        </div>
      )}

      {/* Main Container - Centered and optimized for mobile screens */}
      <div className="relative z-10 w-full max-w-md min-h-[85vh] max-h-[920px] flex flex-col justify-between p-5 sm:p-6 md:rounded-3xl md:border md:border-white/10 md:shadow-2xl md:bg-zinc-950/85 backdrop-blur-xl">
        
        {/* Top Header - Mobile Status Bar & Secure Call Badge */}
        <div className="w-full flex flex-col gap-2.5">
          {/* Status bar */}
          <div className="flex items-center justify-between text-xs text-white/80 px-1 pt-1">
            <span className="font-semibold tracking-tight">{currentTime}</span>
            <div className="flex items-center gap-2">
              {/* Sound Ringing toggle */}
              <button
                onClick={toggleSoundRingtone}
                className="flex items-center gap-1 bg-white/10 hover:bg-white/20 active:scale-95 text-xs text-emerald-400 px-2 py-0.5 rounded-full transition-all cursor-pointer"
                title="Toggle Ringing Sound"
              >
                {isAudioRinging ? (
                  <>
                    <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                    <span>Ringing</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-white/60" />
                    <span className="text-white/60">Sound Off</span>
                  </>
                )}
              </button>

              <Wifi className="w-3.5 h-3.5 text-white/80" />
              <div className="flex items-center gap-1">
                <span className="text-[10px]">5G</span>
                <Battery className="w-4 h-4 text-emerald-400" />
              </div>

              {/* Discreet Admin Lock Button */}
              <button
                onClick={onOpenAdmin}
                className="ml-1 p-1 rounded-full text-white/40 hover:text-white/90 hover:bg-white/10 transition-colors cursor-pointer"
                title="Admin Settings"
                aria-label="Admin Settings"
              >
                <Lock className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* WhatsApp / Messenger Encrypted Badge */}
          <div className="flex items-center justify-center gap-1.5 text-center text-xs text-white/60 pt-1">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span className="tracking-wide text-[11px] uppercase font-medium text-emerald-400/90">
              End-to-End Encrypted Call
            </span>
          </div>

          {/* Subtitle Call Status */}
          <div className="text-center">
            {callStatus === 'incoming' && (
              <p className="text-sm font-medium text-emerald-400 animate-pulse tracking-wide flex items-center justify-center gap-1.5">
                <Video className="w-4 h-4 inline-block text-emerald-400" />
                <span>Incoming Video Call...</span>
              </p>
            )}
            {callStatus === 'declined' && (
              <p className="text-sm font-medium text-rose-400 tracking-wide">
                Call Declined
              </p>
            )}
            {callStatus === 'connecting' && (
              <p className="text-sm font-medium text-cyan-400 animate-pulse tracking-wide">
                Connecting Call...
              </p>
            )}
          </div>
        </div>

        {/* Center Section: Large Profile Picture, Name, and Online Indicator */}
        <div className="flex flex-col items-center justify-center my-auto py-2">
          {/* Avatar with pulsing wave effect */}
          <div
            onClick={handleAcceptCall}
            className="relative group cursor-pointer"
            title="Tap to answer"
          >
            {/* Animated Ring 1 */}
            <div className="absolute -inset-4 rounded-full bg-emerald-500/20 blur-md animate-ping opacity-75 pointer-events-none" />
            
            {/* Animated Ring 2 */}
            <div className="absolute -inset-2 rounded-full border-2 border-emerald-400/50 animate-pulse pointer-events-none" />

            {/* Profile Image Container */}
            <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full p-1.5 bg-gradient-to-tr from-emerald-500 via-teal-400 to-green-500 shadow-2xl shadow-emerald-500/25">
              <img
                src={config.profileImage}
                alt={config.profileName}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=85';
                }}
                className={`w-full h-full object-cover rounded-full border-4 border-zinc-900 shadow-inner transition-transform duration-500 ${
                  cameraFlipped ? 'scale-x-[-1]' : ''
                }`}
              />

              {/* Green Online Status Badge with Pulse */}
              <div className="absolute bottom-2 right-3 flex items-center justify-center">
                <span className="relative flex h-5 w-5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-5 w-5 bg-emerald-500 border-2 border-zinc-950 shadow-md" />
                </span>
              </div>
            </div>
          </div>

          {/* Profile Name & Status Details */}
          <div className="mt-4 text-center flex flex-col items-center">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white drop-shadow-md flex items-center gap-2">
              <span>{config.profileName}</span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                HD
              </span>
            </h1>

            {/* Online pill indicator */}
            <div className="mt-2 flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-medium text-emerald-400 tracking-wide">
                Available Online Now
              </span>
            </div>

            {/* Audio Wave Visualizer Simulation */}
            <div className="flex items-center justify-center gap-1 mt-3 h-4">
              <div className="w-1 bg-emerald-400 rounded-full h-2 animate-[bounce_0.8s_infinite_100ms]" />
              <div className="w-1 bg-emerald-400 rounded-full h-4 animate-[bounce_0.8s_infinite_200ms]" />
              <div className="w-1 bg-emerald-400 rounded-full h-5 animate-[bounce_0.8s_infinite_300ms]" />
              <div className="w-1 bg-emerald-400 rounded-full h-3 animate-[bounce_0.8s_infinite_400ms]" />
              <div className="w-1 bg-emerald-400 rounded-full h-1.5 animate-[bounce_0.8s_infinite_500ms]" />
            </div>
          </div>

          {/* Quick interactive calling actions (all open direct link on click) */}
          <div className="flex items-center gap-3 sm:gap-4 mt-5">
            {/* Mic button */}
            <button
              onClick={handleMicClick}
              className={`p-3 rounded-full border transition-all cursor-pointer active:scale-95 ${
                isMicMuted
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                  : 'bg-white/10 hover:bg-white/20 border-white/15 text-white/80'
              }`}
              title="Toggle Mic"
            >
              {isMicMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Flip Camera button */}
            <button
              onClick={handleCameraClick}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white/80 transition-all cursor-pointer active:scale-95"
              title="Flip Camera"
            >
              <Video className="w-5 h-5" />
            </button>

            {/* Speaker button */}
            <button
              onClick={handleSpeakerClick}
              className={`p-3 rounded-full border transition-all cursor-pointer active:scale-95 ${
                isSpeakerOn
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                  : 'bg-white/10 hover:bg-white/20 border-white/15 text-white/80'
              }`}
              title="Speaker"
            >
              {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>

            {/* Message button */}
            <button
              onClick={handleMessageClick}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white/80 transition-all cursor-pointer active:scale-95"
              title="Send Message"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
          </div>

          {/* Video & In-Feed Banner Ad (If configured) */}
          {config.inFeedBannerCode && config.inFeedBannerCode.trim() && (
            <div className="w-full mt-3 px-2 flex justify-center">
              <AdContainer htmlCode={config.inFeedBannerCode} type="infeed" />
            </div>
          )}
        </div>

        {/* Bottom Calling Action Controls */}
        <div className="w-full flex flex-col items-center gap-3 pb-2 pt-2">
          
          {/* Main Action Buttons: Big Green CALL Button + Red Decline Button */}
          <div className="w-full flex items-center justify-center gap-6 sm:gap-8 px-2">
            
            {/* Red Decline Button (opens direct link) */}
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={handleDeclineCall}
                className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-gradient-to-tr from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white flex items-center justify-center shadow-lg shadow-rose-600/30 active:scale-95 transition-all duration-200 border-2 border-rose-400/40 cursor-pointer"
                aria-label="Decline Call"
              >
                <PhoneOff className="w-7 h-7 sm:w-8 sm:h-8" />
              </button>
              <span className="text-xs font-semibold text-rose-300 tracking-wider">
                DECLINE
              </span>
            </div>

            {/* Big Green CALL Button (opens direct link) */}
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={handleAcceptCall}
                className="relative group w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-gradient-to-tr from-emerald-600 via-green-500 to-emerald-400 hover:from-emerald-500 hover:to-green-400 text-white flex items-center justify-center shadow-2xl shadow-emerald-500/50 active:scale-95 transition-all duration-200 border-3 border-emerald-300/50 cursor-pointer animate-bounce"
                aria-label="Answer Call"
              >
                {/* Glowing ring */}
                <div className="absolute -inset-1.5 rounded-full bg-emerald-400/30 blur-sm group-hover:bg-emerald-400/50 transition-all" />
                <Phone className="relative w-9 h-9 sm:w-10 sm:h-10 fill-current animate-pulse" />
              </button>
              <span className="text-sm font-bold text-emerald-400 tracking-wider flex items-center gap-1">
                <span>ANSWER CALL</span>
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              </span>
            </div>

          </div>

          {/* Discreet footer trigger */}
          <div className="flex items-center justify-center gap-2 text-[11px] text-white/40 pt-1">
            <span>Live Calling Screen</span>
            <span>•</span>
            <button
              onClick={onOpenAdmin}
              className="hover:text-emerald-400 transition-colors underline cursor-pointer"
            >
              Admin Settings
            </button>
          </div>
        </div>

      </div>

      {/* Floating Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-zinc-900/95 text-white border border-white/15 px-4 py-2 rounded-full text-xs shadow-2xl flex items-center gap-2 backdrop-blur-md animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
