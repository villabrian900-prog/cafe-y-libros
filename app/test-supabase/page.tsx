"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function TestSupabase() {
  useEffect(() => {
    const test = async () => {
      const { data, error } = await supabase
        .from("members")
        .select("*");

      console.log("DATA:", data);
      console.log("ERROR:", error);
    };

    test();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      Testing Supabase... check console (F12)
    </div>
  );
}