export default function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-slate-200"></div>
        <div className="w-12 h-12 rounded-full border-4 border-transparent border-t-indigo-500 animate-spin absolute inset-0"></div>
      </div>
    </div>
  );
}
