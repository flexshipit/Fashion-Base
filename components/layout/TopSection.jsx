"use client";

import { usePathname } from "next/navigation";
import { useSiteBrand } from "@/components/layout/SiteBrand";

const TopSection = () => {
  const pathname = usePathname();
  const { announcement } = useSiteBrand();

  if (pathname?.startsWith("/admin") || !announcement) {
    return null;
  }

  return (
    <div className="bg-neutral px-4 py-2 text-center text-[10px] font-medium uppercase leading-snug tracking-[0.12em] text-neutral-content sm:px-6 sm:py-2.5 sm:text-[11px] sm:tracking-[0.28em]">
      {announcement}
    </div>
  );
};

export default TopSection;
