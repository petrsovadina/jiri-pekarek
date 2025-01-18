import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import PromptList from "@/components/custom/PromptList";

const Prompts = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Správa promptů</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <section>
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Seznam promptů
                </h2>
                <Link to="/prompts/new">
                  <Button size="sm">Vytvořit prompt</Button>
                </Link>
              </div>
              <PromptList />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Prompts;
