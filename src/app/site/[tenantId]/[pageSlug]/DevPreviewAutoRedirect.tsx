"use client";

import { useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export function DevPreviewAutoRedirect() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Only redirect in development mode if studio or draft is detected
    if (process.env.NODE_ENV === "development") {
      const isStudio = searchParams.get("studio") === "1";
      const hasDraft = searchParams.has("draft");

      if ((isStudio || hasDraft) && !pathname.endsWith("/preview")) {
        router.replace(`${pathname}/preview?${searchParams.toString()}`);
      }
    }
  }, [pathname, searchParams, router]);

  return null;
}
