import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Stránka nenalezena</h1>
      <p className="text-gray-500 mb-8">Omlouváme se, ale požadovaná stránka neexistuje.</p>
      <Link to="/dashboard">
        <Button>Zpět na Dashboard</Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;
