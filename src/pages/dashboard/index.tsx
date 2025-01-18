import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { FileUploader } from "@/components/custom/FileUploader";
import TableList from "@/components/custom/TableList";
import { AppLayout } from "@/components/layout/AppLayout";

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
      }
    };
    checkUser();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <section>
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Nahrát novou tabulku
            </h2>
            <FileUploader />
          </div>
        </section>

        <section>
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Moje tabulky
            </h2>
            <TableList />
          </div>
        </section>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
