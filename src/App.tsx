import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Index from "@/pages/Index";
import Settings from "@/pages/Settings";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);

      if (event === 'SIGNED_IN') {
        console.log('Přihlášený uživatel:', session?.user?.id);
        toast({
          title: "Přihlášení úspěšné",
          description: "Byli jste úspěšně přihlášeni",
        });
      }
      if (event === 'SIGNED_OUT') {
        console.log('Uživatel odhlášen');
        toast({
          title: "Odhlášení úspěšné",
          description: "Byli jste úspěšně odhlášeni",
        });
      }
      if (event === 'TOKEN_REFRESHED') {
        console.log('Token obnoven');
      }
    });

    // Kontrola počátečního stavu autentizace
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  // Zobrazení loading stavu během inicializace
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Veřejné routy */}
        <Route 
          path="/auth" 
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Auth />
            )
          } 
        />

        {/* Chráněné routy */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />
        <Route path="/table/:fileId" element={
          <ProtectedRoute>
            <Index />
          </ProtectedRoute>
        } />

        {/* Výchozí a chybové routy */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={
          <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-4xl font-bold mb-4">404</h1>
            <p className="text-gray-600 mb-4">Stránka nebyla nalezena</p>
            <a href="/dashboard" className="text-primary hover:underline">
              Zpět na dashboard
            </a>
          </div>
        } />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;