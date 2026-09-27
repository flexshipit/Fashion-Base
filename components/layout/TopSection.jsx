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
    <div className="bg-neutral text-neutral-content text-center py-2.5 text-[11px] font-medium uppercase tracking-[0.28em]">
      {announcement}
    </div>
  );
};

export default TopSection;
