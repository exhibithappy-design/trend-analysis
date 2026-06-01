import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";

import ScrollToTop from "./components/ScrollToTop";
import { AdminAuthProvider } from "@/hooks/admin/useAdminAuth";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminLogin from "@/pages/admin/Login";
import EditionsIndex from "@/pages/admin/EditionsIndex";
import EditionDetail from "@/pages/admin/EditionDetail";
import Distribution from "@/pages/admin/Distribution";
import AdminSettings from "@/pages/admin/Settings";
import ContentLibrary from "@/pages/admin/ContentLibrary";
import AeoHealth from "@/pages/admin/AeoHealth";
import { Navigate } from "react-router-dom";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <AdminAuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/editions" replace />} />
              <Route path="editions" element={<EditionsIndex />} />
              <Route path="editions/:id" element={<EditionDetail />} />
              <Route path="distribution" element={<Distribution />} />
              <Route path="content" element={<ContentLibrary />} />
              <Route path="aeo" element={<AeoHealth />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AdminAuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
