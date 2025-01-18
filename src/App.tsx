import { Routes, Route, Navigate } from "react-router-dom";
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import Settings from "./pages/Settings";
import Dashboard from "./pages/dashboard";
import TableEditorPage from "./pages/editor/[tableId]";
import Prompts from "./pages/prompts";
import NewPrompt from "./pages/prompts/new";
import NotFoundPage from "./pages/404";
import InternalErrorPage from "./pages/500";
import { Toaster } from "@/components/ui/toaster";
import ErrorBoundary from "./components/ErrorBoundary";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setIsAuthenticated(!!user);
      } catch (error) {
        console.error('Chyba při kontrole přihlášení:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Načítání...</div>;
  }

  return (
    <ErrorBoundary>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />
        
        {/* Veřejné routy */}
        <Route path="/auth" element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Auth />
          )
        } />

        {/* Chráněné routy */}
        <Route path="/dashboard" element={
          isAuthenticated ? (
            <Dashboard />
          ) : (
            <Navigate to="/auth" replace />
          )
        } />
        <Route path="/settings" element={
          isAuthenticated ? (
            <Settings />
          ) : (
            <Navigate to="/auth" replace />
          )
        } />
        <Route path="/editor/:tableId" element={
          isAuthenticated ? (
            <TableEditorPage />
          ) : (
            <Navigate to="/auth" replace />
          )
        } />
        <Route path="/prompts" element={
          isAuthenticated ? (
            <Prompts />
          ) : (
            <Navigate to="/auth" replace />
          )
        } />
        <Route path="/prompts/new" element={
          isAuthenticated ? (
            <NewPrompt />
          ) : (
            <Navigate to="/auth" replace />
          )
        } />
        <Route path="/prompts/:promptId/edit" element={
          isAuthenticated ? (
            <NewPrompt />
          ) : (
            <Navigate to="/auth" replace />
          )
        } />

        {/* Chybové stránky */}
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="/500" element={<InternalErrorPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
      <Toaster />
    </ErrorBoundary>
  );
}

export default App;
