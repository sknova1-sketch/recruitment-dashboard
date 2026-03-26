export default function Footer() {
  return (
    <footer className="w-full mt-10 pb-8 pt-10 border-t border-gray-200/60 text-center flex flex-col items-center justify-center gap-3">
      <img src="/gc-logo.png" alt="GC" className="h-6 object-contain opacity-40 grayscale mix-blend-multiply" />
      <p className="text-[12px] text-gray-400 font-medium leading-relaxed">
        © 2026 GC Care. All rights reserved.<br/>
        Recruitment Operations & AI Copilot System
      </p>
    </footer>
  );
}
