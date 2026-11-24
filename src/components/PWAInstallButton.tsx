import React, { useEffect, useState } from 'react';
import { Download, Share, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    if (!showIOSGuide) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowIOSGuide(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showIOSGuide]);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={() => void install()}
        className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-[#1E293B] px-3 py-1.5 text-xs font-semibold text-white whitespace-nowrap shrink-0 transition-colors hover:bg-[#0F172A]"
      >
        <Download className="h-3.5 w-3.5" aria-hidden="true" />
        Install App
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[#E7E2D8] bg-white px-3 py-1.5 text-xs font-semibold text-[#1E293B] whitespace-nowrap shrink-0 transition-colors hover:bg-[#F4F1EA]"
        >
          <Share className="h-3.5 w-3.5" aria-hidden="true" />
          Install
        </button>

        {showIOSGuide && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/50 p-4 backdrop-blur-xs"
            onClick={() => setShowIOSGuide(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="ios-install-title"
              className="w-full max-w-sm rounded-2xl border border-[#E7E2D8] bg-[#FAF9F6] p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <h2
                  id="ios-install-title"
                  className="text-xl font-semibold text-[#1E293B]"
                >
                  Add to Home Screen
                </h2>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  aria-label="Close installation instructions"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-[#64748B] hover:bg-[#F4F1EA] hover:text-[#1E293B]"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              <ol className="mt-4 space-y-3 text-[15px] leading-relaxed text-[#475569]">
                <li>
                  1. Tap the <strong className="text-[#1E293B]">Share</strong>{' '}
                  icon in Safari&apos;s bottom toolbar.
                </li>
                <li>
                  2. Scroll down and choose{' '}
                  <strong className="text-[#1E293B]">Add to Home Screen</strong>.
                </li>
                <li>
                  3. Tap <strong className="text-[#1E293B]">Add</strong> to keep
                  this 7-day study guide ready offline.
                </li>
              </ol>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full min-h-[44px] rounded-xl bg-[#1E293B] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0F172A]"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
