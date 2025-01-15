import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";
import { AuthError, AuthApiError } from "@supabase/supabase-js";

const Auth = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/");
      }
      if (event === 'USER_UPDATED') {
        const checkSession = async () => {
          const { error } = await supabase.auth.getSession();
          if (error) {
            setErrorMessage(getErrorMessage(error));
          }
        };
        checkSession();
      }
      if (event === 'SIGNED_OUT') {
        setErrorMessage("");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const getErrorMessage = (error: AuthError) => {
    if (error instanceof AuthApiError) {
      switch (error.code) {
        case 'invalid_credentials':
          return 'Neplatný email nebo heslo. Zkontrolujte prosím své přihlašovací údaje.';
        case 'email_not_confirmed':
          return 'Prosím potvrďte svůj email před přihlášením.';
        case 'user_not_found':
          return 'Uživatel s těmito údaji nebyl nalezen.';
        case 'invalid_grant':
          return 'Neplatné přihlašovací údaje.';
        default:
          return 'Nastala chyba při přihlašování. Zkuste to prosím znovu.';
      }
    }
    return error.message;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">DataCraft AI</h1>
          <p className="text-muted-foreground mt-2">
            Přihlaste se nebo si vytvořte nový účet
          </p>
        </div>

        {errorMessage && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <SupabaseAuth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'rgb(59 130 246)',
                  brandAccent: 'rgb(37 99 235)',
                  inputBackground: 'white',
                  inputText: 'black',
                },
                borderWidths: {
                  buttonBorderWidth: '1px',
                  inputBorderWidth: '1px',
                },
                radii: {
                  borderRadiusButton: '0.5rem',
                  buttonBorderRadius: '0.5rem',
                  inputBorderRadius: '0.5rem',
                },
              },
            },
            className: {
              container: 'w-full',
              button: 'w-full px-4 py-2 rounded-lg',
              input: 'w-full px-4 py-2 rounded-lg border border-gray-300',
              label: 'text-sm font-medium text-gray-700',
            },
          }}
          localization={{
            variables: {
              sign_in: {
                email_label: "E-mailová adresa",
                password_label: "Heslo",
                button_label: "Přihlásit se",
                loading_button_label: "Přihlašování...",
                email_input_placeholder: "vase@email.cz",
                password_input_placeholder: "Vaše heslo",
              },
              sign_up: {
                email_label: "E-mailová adresa",
                password_label: "Heslo",
                button_label: "Registrovat se",
                loading_button_label: "Registrace...",
                email_input_placeholder: "vase@email.cz",
                password_input_placeholder: "Silné heslo",
              },
              forgotten_password: {
                button_label: "Obnovit heslo",
                loading_button_label: "Odesílání...",
                email_input_placeholder: "vase@email.cz",
              },
            },
          }}
        />
      </Card>
    </div>
  );
};

export default Auth;