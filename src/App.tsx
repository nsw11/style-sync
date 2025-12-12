import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import OutfitBuilder from "./pages/OutfitBuilder";
import MyOutfits from "./pages/MyOutfits";
import Stats from "./pages/Stats";
import OutfitWrapped from "./pages/OutfitWrapped";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/outfit-builder" element={<OutfitBuilder />} />
          <Route path="/my-outfits" element={<MyOutfits />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/wrapped" element={<OutfitWrapped />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
