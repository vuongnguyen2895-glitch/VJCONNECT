import Link from "next/link";
import Logo from "@/components/brand/Logo";

export default function SignLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-start justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-2xl">
        <Link href="/" className="mb-8 flex justify-center">
          <Logo />
        </Link>
        {children}
      </div>
    </div>
  );
}
