import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2 } from "lucide-react";

const formSchema = z.object({
  anthropic_api_key: z.string().min(1, "API klíč je povinný"),
});

type FormValues = z.infer<typeof formSchema>;

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      anthropic_api_key: "",
    },
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      // Nejdřív zkusíme načíst profil
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("anthropic_api_key")
        .eq("id", session.user.id)
        .maybeSingle();

      // Pokud profil neexistuje, vytvoříme ho
      if (!profile) {
        const { error: insertError } = await supabase
          .from("profiles")
          .insert({ id: session.user.id });

        if (insertError) {
          toast({
            variant: "destructive",
            title: "Chyba",
            description: "Nepodařilo se vytvořit profil",
          });
          return;
        }
      } else if (profileError) {
        toast({
          variant: "destructive",
          title: "Chyba",
          description: "Nepodařilo se načíst API klíč",
        });
        return;
      }

      if (profile?.anthropic_api_key) {
        form.setValue("anthropic_api_key", profile.anthropic_api_key);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [navigate, form, toast]);

  const onSubmit = async (values: FormValues) => {
    const { error } = await supabase
      .from("profiles")
      .update({ anthropic_api_key: values.anthropic_api_key })
      .eq("id", (await supabase.auth.getUser()).data.user?.id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Chyba",
        description: "Nepodařilo se uložit API klíč",
      });
      return;
    }

    toast({
      title: "Úspěch",
      description: "API klíč byl úspěšně uložen",
    });
  };

  const handleDeleteApiKey = async () => {
    setIsDeleting(true);
    const { error } = await supabase
      .from("profiles")
      .update({ anthropic_api_key: null })
      .eq("id", (await supabase.auth.getUser()).data.user?.id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Chyba",
        description: "Nepodařilo se smazat API klíč",
      });
      setIsDeleting(false);
      return;
    }

    form.setValue("anthropic_api_key", "");
    setIsDeleting(false);
    toast({
      title: "Úspěch",
      description: "API klíč byl úspěšně smazán",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-8">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-6">Nastavení</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="anthropic_api_key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API klíč Anthropic Claude</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Zadejte API klíč"
                        {...field}
                      />
                    </FormControl>
                    {field.value && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={handleDeleteApiKey}
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ukládám...
                </>
              ) : (
                "Uložit"
              )}
            </Button>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default Settings;