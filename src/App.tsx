import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Index from "@/pages/Index";
import Settings from "@/pages/Settings";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

function App() {
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        console.log('Přihlášený uživatel:', session?.user?.id);
      }
      if (event === 'SIGNED_OUT') {
        console.log('Uživatel odhlášen');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <Router>
      <Routes>
        {/* Veřejné routy */}
        <Route path="/auth" element={<Auth />} />

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