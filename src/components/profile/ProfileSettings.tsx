import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Save } from "lucide-react";

export const ProfileSettings = () => {
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Uživatel není přihlášen");
      }

      const { error } = await supabase
        .from("profiles")
        .update({ anthropic_api_key: apiKey })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Nastavení uloženo",
        description: "Váš Anthropic API klíč byl úspěšně uložen",
      });
    } catch (error) {
      console.error("Error saving API key:", error);
      toast({
        variant: "destructive",
        title: "Chyba při ukládání",
        description: "Nepodařilo se uložit API klíč",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Nastavení profilu</h2>
          <p className="text-muted-foreground">
            Zde můžete spravovat nastavení vašeho profilu a API klíče
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="apiKey" className="text-sm font-medium">
            Anthropic API Klíč
          </label>
          <Input
            id="apiKey"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-ant-api03-..."
            className="max-w-lg"
          />
          <p className="text-sm text-muted-foreground">
            Zadejte váš Anthropic API klíč pro generování dat pomocí Claude modelu
          </p>
        </div>

        <Button 
          onClick={handleSave} 
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Uložit nastavení
        </Button>
      </div>
    </Card>
  );
};