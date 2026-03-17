import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { GuestSession } from "@shared/types";

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
    // Try to get existing session from localStorage
    const savedSession = localStorage.getItem("guestSession");

    if (savedSession) {
      try {
        const session: GuestSession = JSON.parse(savedSession);
        setSessionId(session.sessionId);
      } catch {
        // Invalid JSON, create new session
        createNewSession();
      }
    } else {
      createNewSession();
    }

    setIsLoading(false);
  }, []);

  const createNewSession = () => {
    const newSessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const session: GuestSession = {
      sessionId: newSessionId,
      createdAt: Date.now(),
      orderType: null,
      isActive: true,
    };

    localStorage.setItem("guestSession", JSON.stringify(session));
    setSessionId(newSessionId);
  };

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
