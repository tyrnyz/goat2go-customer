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
        // Verify session via RPC (anon cannot SELECT guest_sessions directly)
        const { data } = await supabase.rpc('verify_guest_session', {
          p_session_id: savedId,
        });

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
