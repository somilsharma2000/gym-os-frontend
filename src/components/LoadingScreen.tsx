export default function LoadingScreen({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-96 gap-4">
      <div className="relative">
        <img
          src={`${import.meta.env.BASE_URL}brand/beyond-pixells-logo.png`}
          alt="Beyond Pixells"
          className="w-16 h-16 rounded-full object-cover animate-pulse"
        />
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-brand-300 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-400">{message}</p>
      </div>
      <p className="text-[10px] text-slate-300 font-medium">Powered by Beyond Pixells</p>
    </div>
  )
}
