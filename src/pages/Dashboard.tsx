import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { FileGrid } from "@/components/dashboard/FileGrid";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ProfileSettings } from "@/components/profile/ProfileSettings";
import { useDashboardFiles } from "@/hooks/useDashboardFiles";
import { useFileUpload } from "@/hooks/useFileUpload";

const Dashboard = () => {
  const navigate = useNavigate();
  const { files, isLoading, fetchFiles } = useDashboardFiles();
  const { isUploading, handleFileUpload } = useFileUpload(fetchFiles);

  useEffect(() => {
    const initializeAuth = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        navigate("/auth");
        return;
      }

      console.log("Authenticated user ID:", session.user.id);
      await fetchFiles();
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);
      if (event === 'SIGNED_IN' && session) {
        console.log("User signed in:", session.user.id);
        await fetchFiles();
      } else if (event === 'SIGNED_OUT') {
        console.log("User signed out");
        navigate("/auth");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, fetchFiles]);

  const handleFileClick = (fileId: string) => {
    navigate(`/table/${fileId}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <DashboardHeader 
          onFileUpload={handleFileUpload}
          isUploading={isUploading}
        />
        <FileGrid 
          files={files}
          onFileClick={handleFileClick}
          isLoading={isLoading}
        />
        <ProfileSettings />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;