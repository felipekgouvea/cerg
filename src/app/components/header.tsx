import Image from "next/image";
import Link from "next/link";
import PreEnrollmentDialog from "./pre-enrollment-form";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 flex h-[70px] items-center justify-between border-b border-red-100 bg-white/70 p-5 shadow-sm backdrop-blur-sm">
      <Link href="/">
        <Image src="/logo.png" alt="CERG" width={200} height={100} />
      </Link>

      <div className="flex items-center gap-3">
        <PreEnrollmentDialog />
      </div>
    </header>
  );
};
