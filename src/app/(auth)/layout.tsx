export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#EFF6FF_0%,_transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_#F0FDF4_0%,_transparent_50%)]" />
      <div className="relative w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
