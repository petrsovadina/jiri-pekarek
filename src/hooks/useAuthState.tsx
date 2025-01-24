import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useAuthState = () => {
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

  return { isAuthenticated };
};