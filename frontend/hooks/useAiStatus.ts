"use client";

import { useEffect, useState } from "react";
import { assistService } from "@/services";

/** Whether the server has the optional AI assist configured (false until known). */
export function useAiStatus(): boolean {
  const [ai, setAi] = useState(false);
  useEffect(() => {
    assistService
      .status()
      .then((s) => setAi(s.ai))
      .catch(() => setAi(false));
  }, []);
  return ai;
}
