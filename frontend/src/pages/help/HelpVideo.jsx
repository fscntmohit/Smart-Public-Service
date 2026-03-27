import Footer from '../../components/ui/footer';

export default function HelpVideo() {
  return (
    <>
      <div className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="max-w-4xl mx-auto card p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">How to Use the Platform</h1>
          <p className="text-sm text-slate-500 mb-6">Watch this quick walkthrough for citizens.</p>

          <div className="aspect-video rounded-xl overflow-hidden border border-slate-200 bg-black">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              title="How to Use the Platform"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
