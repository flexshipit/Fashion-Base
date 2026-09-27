"use client";

import { createContext, useContext } from "react";
import { DEFAULT_SITE_SETTINGS } from "@/lib/site/defaults";

const SiteBrandContext = createContext(DEFAULT_SITE_SETTINGS);

export function SiteBrandProvider({ value, children }) {
  return (
    <SiteBrandContext.Provider value={value || DEFAULT_SITE_SETTINGS}>
      {children}
    </SiteBrandContext.Provider>
  );
}

export function useSiteBrand() {
  return useContext(SiteBrandContext);
}
