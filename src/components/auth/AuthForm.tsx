import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoginForm } from "./LoginForm";
import { SignUpForm } from "./SignUpForm";

export const AuthForm = () => {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md space-y-8 p-8 animate-fade-in">
        <div className="text-center">
          <h2 className="text-3xl font-bold">
            {isSignUp ? "Vytvořit účet" : "Přihlášení"}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isSignUp
              ? "Vytvořte si nový účet pro přístup k aplikaci"
              : "Přihlaste se ke svému účtu"}
          </p>
        </div>

        {isSignUp ? <SignUpForm /> : <LoginForm />}

        <div className="text-center">
          <Button
            type="button"
            variant="link"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm"
          >
            {isSignUp
              ? "Již máte účet? Přihlaste se"
              : "Nemáte účet? Zaregistrujte se"}
          </Button>
        </div>
      </Card>
    </div>
  );
};