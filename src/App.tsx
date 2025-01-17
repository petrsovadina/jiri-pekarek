import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import Settings from "./pages/Settings";
import Dashboard from "./pages/dashboard";
import TableEditorPage from "./pages/editor/[tableId]";
import Prompts from "./pages/prompts";
import NewPrompt from "./pages/prompts/new";
import NotFoundPage from "./pages/404";
import InternalErrorPage from "./pages/500";
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/" element={<Index />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/editor/:tableId" element={<TableEditorPage />} />
        <Route path="/prompts" element={<Prompts />} />
        <Route path="/prompts/new" element={<NewPrompt />} />
         <Route path="/prompts/:promptId/edit" element={<NewPrompt />} />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="/500" element={<InternalErrorPage />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
