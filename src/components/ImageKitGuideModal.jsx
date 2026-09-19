import React from 'react';
import { X, Cloud, ArrowRight, CheckCircle2, Copy, ExternalLink } from 'lucide-react';

export const ImageKitGuideModal = ({ isOpen, onClose }) => {
  const [copiedEnv, setCopiedEnv] = React.useState(false);

  if (!isOpen) return null;

  const envSnippet = 'VITE_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id';

  const handleCopyEnv = () => {
    navigator.clipboard.writeText(envSnippet);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl text-zinc-100 shadow-2xl overflow-hidden z-10 my-8">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">ImageKit.io Free Cloud Storage Setup</h2>
              <p className="text-xs text-zinc-400">20 GB/month Free CDN, auto-format & on-the-fly transformations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps List */}
        <div className="p-6 space-y-6">
          {/* Step 1 */}
          <div className="flex gap-4">
            <div className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
              1
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Sign up for Free ImageKit</h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Go to <a href="https://imagekit.io" target="_blank" rel="noreferrer" className="text-purple-400 underline inline-flex items-center gap-0.5">imagekit.io <ExternalLink className="w-3 h-3" /></a> and register a free account. No credit card is required.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-4">
            <div className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
              2
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Find your URL-Endpoint</h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                In your ImageKit dashboard, open the <strong>Developer Options</strong> tab. Copy your <strong>URL-endpoint</strong> (it looks like <code className="text-purple-300 bg-zinc-900 px-1 py-0.5 rounded font-mono">https://ik.imagekit.io/your_id</code>).
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-4">
            <div className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
              3
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Update your .env file</h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Add your endpoint to the <code className="text-purple-300 bg-zinc-900 px-1 py-0.5 rounded font-mono">.env</code> file in this project:
              </p>
              <div className="mt-2.5 p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                <code className="text-xs font-mono text-zinc-200 truncate">{envSnippet}</code>
                <button
                  onClick={handleCopyEnv}
                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors shrink-0 ml-2"
                  title="Copy snippet"
                >
                  {copiedEnv ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
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
              <h3 className="text-sm font-semibold text-white">Upload Photos & Add to catalogue</h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Upload your photos into your ImageKit <strong>Media Library</strong>. Then add their relative paths (e.g. <code className="text-purple-300 bg-zinc-900 px-1 py-0.5 rounded font-mono">/photos/my-sunset.jpg</code>) to <code className="text-purple-300 bg-zinc-900 px-1 py-0.5 rounded font-mono">src/data/photos.js</code>.
              </p>
            </div>
          </div>

          {/* Callout box */}
          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-300">
            <span className="font-semibold text-purple-400">✨ Automatic Magic: </span>
            The website automatically asks ImageKit to convert your photos to modern WebP format, generates 600px cards for the grid, and generates 25px blur-up placeholders—saving 80%+ of bandwidth!
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-zinc-800 bg-zinc-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-lg shadow-purple-600/30"
          >
            Got it, Let's Browse!
          </button>
        </div>
      </div>
    </div>
  );
};
