import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { useToast } from "@/hooks/use-toast";
import { Lock, Mail } from "lucide-react";

const signUpSchema = z.object({
  email: z.string().email("Zadejte platnou emailovou adresu"),
  password: z
    .string()
    .min(6, "Heslo musí obsahovat alespoň 6 znaků")
    .max(72, "Heslo nesmí být delší než 72 znaků"),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

export const SignUpForm = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: SignUpFormValues) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
      });
      if (error) throw error;
      toast({
        title: "Registrace úspěšná",
        description: "Zkontrolujte svůj email pro potvrzení registrace.",
      });
    } catch (error: any) {
      toast({
        title: "Chyba registrace",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <FormControl>
                  <Input
                    type="email"
                    placeholder="vas@email.cz"
                    className="pl-10"
                    {...field}
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Heslo</FormLabel>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    {...field}
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Registrace...
            </span>
          ) : (
            "Registrovat"
          )}
        </Button>
      </form>
    </Form>
  );
};