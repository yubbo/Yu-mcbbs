export default function InstallLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #fce4ec, #f3e5f5, #e8eaf6)", backgroundSize: "400% 400%", animation: "bg-shift 20s ease infinite" }}>
      <style>{`@keyframes bg-shift{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}`}</style>
      {children}
    </div>
  )
}
