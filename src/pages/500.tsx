import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const InternalErrorPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Interní chyba serveru</h1>
      <p className="text-gray-500 mb-8">Omlouváme se, ale došlo k interní chybě serveru.</p>
      <p className="text-gray-500 mb-8">Prosím, kontaktujte podporu.</p>
      <Link to="/dashboard">
        <Button>Zpět na Dashboard</Button>
      </Link>
    </div>
  );
};

export default InternalErrorPage;
