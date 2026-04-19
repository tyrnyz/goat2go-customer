import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background px-4">
      <img
        src="/other_images/tatuns_logo.png"
        alt="Tatuns Kambingan"
        className="h-20 w-auto object-contain mb-6 opacity-80"
      />
      <h1 className="text-6xl font-black text-primary mb-2 font-sans">404</h1>
      <h2 className="text-xl font-bold text-foreground mb-3 font-sans">Page Not Found</h2>
      <p className="text-muted-foreground text-center mb-8 leading-relaxed font-sans max-w-sm">
        Sorry, the page you're looking for doesn't exist. It may have been moved or deleted.
      </p>
      <Button
        onClick={() => setLocation("/")}
        className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 py-3 rounded-lg shadow-md font-sans"
      >
        <Home className="w-4 h-4 mr-2" />
        Go Home
      </Button>
    </div>
  );
}
