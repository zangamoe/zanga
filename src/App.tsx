import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Series from "./pages/Series";
import SeriesDetail from "./pages/SeriesDetail";
import AllChapters from "./pages/AllChapters";
import Reader from "./pages/Reader";
import Authors from "./pages/Authors";
import AuthorDetail from "./pages/AuthorDetail";
import Merchandise from "./pages/Merchandise";
import About from "./pages/About";
import Discord from "./pages/Discord";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import AdminSeriesChapters from "./pages/AdminSeriesChapters";
import ManageChapter from "./pages/ManageChapter";
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
          <Route path="/series" element={<Series />} />
          <Route path="/series/:id" element={<SeriesDetail />} />
          <Route path="/series/:id/chapters" element={<AllChapters />} />
          <Route path="/read/:seriesId/:chapterNumber" element={<Reader />} />
          <Route path="/authors" element={<Authors />} />
          <Route path="/authors/:id" element={<AuthorDetail />} />
          <Route path="/merchandise" element={<Merchandise />} />
          <Route path="/about" element={<About />} />
          <Route path="/discord" element={<Discord />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/series/:seriesId/chapters" element={<AdminSeriesChapters />} />
          <Route path="/admin/chapter/:chapterId" element={<ManageChapter />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
