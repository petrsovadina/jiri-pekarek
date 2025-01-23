import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
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
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/table/:fileId" element={<Index />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;