import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase";

interface GuestSessionContextType {
  sessionId: string;
  isLoading: boolean;
}

const GuestSessionContext = createContext<GuestSessionContextType | undefined>(
  undefined
);

export function GuestSessionProvider({ children }: { children: ReactNode }) {
  const [sessionId, setSessionId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const init = async () => {
      const savedId = localStorage.getItem("goat2go_session_id");

      if (savedId) {
        const { data } = await supabase
          .from("guest_sessions")
          .select("id")
          .eq("id", savedId)
          .single();

        if (data) {
          setSessionId(savedId);
          setIsLoading(false);
          return;
        }
      }

      // Generate UUID client-side and insert
      const newId = crypto.randomUUID();

      const { error } = await supabase
        .from("guest_sessions")
        .insert({ id: newId });

      if (!error) {
        localStorage.setItem("goat2go_session_id", newId);
        setSessionId(newId);
      }

      setIsLoading(false);
    };

    init();
  }, []);

  return (
    <GuestSessionContext.Provider value={{ sessionId, isLoading }}>
      {children}
    </GuestSessionContext.Provider>
  );
}

export function useGuestSession() {
  const context = useContext(GuestSessionContext);
  if (!context) {
    throw new Error(
      "useGuestSession must be used within GuestSessionProvider"
    );
  }
  return context;
}
