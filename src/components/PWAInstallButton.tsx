import React, { useState } from "react";
import { Download, X } from "lucide-react";
import { usePWAInstall } from "../hooks/usePWAInstall";

interface PWAInstallButtonProps {
  variant?: "nav" | "compact" | "full";
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = "nav", className = "" }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA / standalone, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    if (variant === "compact") {
      return (
        <button
          type="button"
          onClick={install}
          title="Install Bloc App"
          aria-label="Install Bloc App"
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-[#FFE600] text-black border-2 border-black hover:bg-[#FFD000] active:translate-y-0.5 cursor-pointer shadow-[2px_2px_0_#000] transition-colors ${className}`}
        >
          <Download size={13} strokeWidth={2.5} />
          <span>INSTALL</span>
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={install}
        className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-[#FFE600] text-black border-2 border-black hover:bg-[#FFD000] active:translate-y-0.5 cursor-pointer shadow-[2px_2px_0_#000] transition-colors ${className}`}
      >
        <Download size={14} strokeWidth={2.5} />
        <span>INSTALL APP</span>
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          title="Add Bloc to Home Screen"
          aria-label="Add Bloc to Home Screen"
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-white text-black border-2 border-black hover:bg-[#F5F0E8] active:translate-y-0.5 cursor-pointer shadow-[2px_2px_0_#000] transition-colors ${className}`}
        >
          <Download size={13} strokeWidth={2.5} />
          <span>INSTALL</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div
              className="w-full max-w-sm bg-[#F5F0E8] border-3 border-black p-6 shadow-[6px_6px_0_#000] relative"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-3 right-3 p-1 border-2 border-black bg-white hover:bg-gray-100 cursor-pointer shadow-[2px_2px_0_#000]"
                aria-label="Close"
              >
                <X size={16} strokeWidth={2.5} />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <img src="/bloc-favicon.png" alt="Bloc" className="w-9 h-9 object-contain border-2 border-black shadow-[2px_2px_0_#000]" />
                <div>
                  <h3 className="text-base font-extrabold uppercase tracking-wide text-black">INSTALL BLOC</h3>
                  <p className="text-xs text-gray-600 font-mono">APPLE IOS WEB APP</p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-black border-2 border-black bg-white p-3 shadow-[2px_2px_0_#000] mb-5">
                <div className="flex items-start gap-2">
                  <span className="font-bold bg-black text-white px-1.5 py-0.5 rounded-none text-[10px]">1</span>
                  <span>Tap the <strong>Share</strong> button (box with upward arrow) in the Safari toolbar.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold bg-black text-white px-1.5 py-0.5 rounded-none text-[10px]">2</span>
                  <span>Scroll down and tap <strong>Add to Home Screen</strong>.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold bg-black text-white px-1.5 py-0.5 rounded-none text-[10px]">3</span>
                  <span>Tap <strong>Add</strong> in the top-right corner to launch Bloc like a native app.</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2 bg-black text-white font-bold text-xs uppercase tracking-wider hover:bg-neutral-800 cursor-pointer shadow-[3px_3px_0_#FFE600] active:translate-y-0.5"
              >
                GOT IT
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
