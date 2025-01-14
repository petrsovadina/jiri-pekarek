import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";

const Auth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold">Vítejte v DataCraft AI</h1>
          <p className="text-muted-foreground mt-2">
            Přihlaste se nebo si vytvořte nový účet
          </p>
        </div>
        <SupabaseAuth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'rgb(var(--primary))',
                  brandAccent: 'rgb(var(--primary))',
                },
              },
            },
          }}
          localization={{
            variables: {
              sign_in: {
                email_label: "E-mailová adresa",
                password_label: "Heslo",
                button_label: "Přihlásit se",
              },
              sign_up: {
                email_label: "E-mailová adresa",
                password_label: "Heslo",
                button_label: "Registrovat se",
              },
            },
          }}
        />
      </Card>
    </div>
  );
};

export default Auth;