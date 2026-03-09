import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import Overview from "./pages/Overview";
import WalletPage from "./pages/WalletPage";
import DepositPage from "./pages/DepositPage";
import SendPage from "./pages/SendPage";
import BatchesPage from "./pages/BatchesPage";
import MempoolPage from "./pages/MempoolPage";
import GasAnalytics from "./pages/GasAnalytics";
import ChallengePage from "./pages/ChallengePage";
import HistoryPage from "./pages/HistoryPage";
import SponsorshipPage from "./pages/SponsorshipPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <DashboardLayout>
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/deposit" element={<DepositPage />} />
            <Route path="/send" element={<SendPage />} />
            <Route path="/batches" element={<BatchesPage />} />
            <Route path="/mempool" element={<MempoolPage />} />
            <Route path="/gas" element={<GasAnalytics />} />
            <Route path="/challenge" element={<ChallengePage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/sponsorship" element={<SponsorshipPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </DashboardLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
