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

const formSchema = z.object({
  anthropic_api_key: z.string().min(1, "API klíč je povinný"),
});

type FormValues = z.infer<typeof formSchema>;

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

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

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("anthropic_api_key")
        .single();

      if (error) {
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
    const key = process.env.ENCRYPTION_KEY || 'default-encryption-key';
    const iv = crypto.getRandomValues(new Uint8Array(16));
    const cipher = crypto.createCipheriv('aes-256-cbc', key, Buffer.from(iv.buffer));
    let encrypted = cipher.update(values.anthropic_api_key, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const encryptedApiKey = `${iv.toString('hex')}:${encrypted}`;

    const { error } = await supabase
      .from("profiles")
      .update({ anthropic_api_key: encryptedApiKey })
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Zadejte API klíč"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
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
