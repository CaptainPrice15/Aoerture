import React from 'react';
import { X, Cloud, CheckCircle2, Copy, ExternalLink } from 'lucide-react';

export const ImageKitGuideModal = ({ isOpen, onClose }) => {
  const [copiedEnv, setCopiedEnv] = React.useState(false);

  if (!isOpen) return null;

  const envSnippet = 'VITE_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/fm5abuzok';

  const handleCopyEnv = () => {
    navigator.clipboard.writeText(envSnippet);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl max-h-[92vh] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl sm:rounded-3xl text-zinc-900 dark:text-zinc-100 shadow-2xl overflow-hidden flex flex-col z-10 my-4 sm:my-8 transition-colors duration-300">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white">ImageKit Cloud Setup</h2>
              <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400">20 GB/month Free CDN, auto-format & transformations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps List */}
        <div className="p-4 sm:p-6 space-y-5 sm:space-y-6 flex-1 overflow-y-auto">
          {/* Step 1 */}
          <div className="flex gap-4">
            <div className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
              1
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Sign up for Free ImageKit</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                Go to <a href="https://imagekit.io" target="_blank" rel="noreferrer" className="text-purple-600 dark:text-purple-400 underline inline-flex items-center gap-0.5 font-medium">imagekit.io <ExternalLink className="w-3 h-3" /></a> and register a free account. No credit card is required.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-4">
            <div className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
              2
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Find your URL-Endpoint</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                In your ImageKit dashboard, open the <strong>Developer Options</strong> tab. Copy your <strong>URL-endpoint</strong> (it looks like <code className="text-purple-600 dark:text-purple-300 bg-zinc-100 dark:bg-zinc-900 px-1 py-0.5 rounded font-mono">https://ik.imagekit.io/your_id</code>).
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-4">
            <div className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
              3
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Update your .env file</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                Add your endpoint to the <code className="text-purple-600 dark:text-purple-300 bg-zinc-100 dark:bg-zinc-900 px-1 py-0.5 rounded font-mono">.env</code> file in this project:
              </p>
              <div className="mt-2.5 p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <code className="text-xs font-mono text-zinc-800 dark:text-zinc-200 truncate">{envSnippet}</code>
                <button
                  onClick={handleCopyEnv}
                  className="p-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-colors shrink-0 ml-2"
                  title="Copy snippet"
                >
                  {copiedEnv ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex gap-4">
            <div className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
              4
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Show Your ImageKit Photos & Videos</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                You have two seamless options to display newly uploaded media:
              </p>
              <ul className="mt-2 space-y-2 text-xs text-zinc-700 dark:text-zinc-300">
                <li className="flex items-start gap-2 bg-purple-50 dark:bg-purple-950/30 p-2.5 rounded-xl border border-purple-200 dark:border-purple-900/50">
                  <span className="text-purple-600 dark:text-purple-400 font-bold">A.</span>
                  <div>
                    <strong className="text-purple-950 dark:text-purple-200">Automatic Sync (Recommended):</strong>
                    <p className="mt-0.5 text-zinc-600 dark:text-zinc-400">
                      In ImageKit Dashboard &gt; <strong>Developer Options</strong> &gt; <strong>API Keys</strong>, copy your <strong>Private Key</strong> and add it to <code className="text-purple-600 dark:text-purple-300 bg-zinc-100 dark:bg-zinc-900 px-1 py-0.5 rounded font-mono">IMAGEKIT_PRIVATE_KEY</code> in <code className="font-mono">.env</code> (and in Vercel settings if deployed). <strong>All photos and videos in your account will sync and show up automatically!</strong>
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-2 bg-zinc-50 dark:bg-zinc-900/40 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <span className="text-purple-600 dark:text-purple-400 font-bold">B.</span>
                  <div>
                    <strong className="text-zinc-900 dark:text-white">Manual Catalogue:</strong>
                    <p className="mt-0.5 text-zinc-600 dark:text-zinc-400">
                      Add individual photo and video entries directly into <code className="text-purple-600 dark:text-purple-300 bg-zinc-100 dark:bg-zinc-900 px-1 py-0.5 rounded font-mono">src/data/photos.js</code> with their relative paths (e.g. <code className="font-mono">/Pics/photo.png</code> or <code className="font-mono">/Pics/video.mp4</code>).
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Callout box */}
          <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300">
            <span className="font-semibold text-purple-600 dark:text-purple-400">✨ Automatic Video & Photo Magic: </span>
            Photos get automated WebP conversion and blur-up loading. Videos automatically generate instant poster frames and stream directly through ImageKit's global CDN!
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 active:scale-95 text-white transition-all shadow-lg shadow-purple-600/30 text-center"
          >
            Got it, Let's Browse!
          </button>
        </div>
      </div>
    </div>
  );
};
