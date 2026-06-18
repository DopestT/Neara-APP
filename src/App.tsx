import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/store/AppStore";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Onboarding from "./pages/Onboarding";
import AppShell from "./pages/app/AppShell";
import MapScreen from "./pages/app/MapScreen";
import SignalsInbox from "./pages/app/SignalsInbox";
import { MatchesList, MatchScreen } from "./pages/app/Matches";
import { ChatsList, ChatScreen } from "./pages/app/Chat";
import SafeMeet from "./pages/app/SafeMeet";
import ProfileSettings from "./pages/app/ProfileSettings";
import VisibilitySettings from "./pages/app/VisibilitySettings";
import Premium from "./pages/app/Premium";
import SafetyCenter from "./pages/app/SafetyCenter";
import ReportFlow from "./pages/app/ReportFlow";
import Verification from "./pages/app/Verification";
import BuildStatus from "./pages/app/BuildStatus";
import EditProfile from "./pages/app/EditProfile";
import SoundReactions from "./pages/app/SoundReactions";
import Reveal from "./pages/app/Reveal";
import Blocked from "./pages/app/Blocked";
import { LegalIndex, LegalDoc } from "./pages/app/Legal";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Sonner theme="dark" position="top-center" toastOptions={{ className: 'glass-strong !text-foreground' }} />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/app/reveal" element={<Reveal />} />
            <Route path="/app" element={<AppShell />}>
              <Route index element={<Navigate to="/app/map" replace />} />
              <Route path="map" element={<MapScreen />} />
              <Route path="signals" element={<SignalsInbox />} />
              <Route path="matches" element={<MatchesList />} />
              <Route path="match/:id" element={<MatchScreen />} />
              <Route path="chats" element={<ChatsList />} />
              <Route path="chat/:id" element={<ChatScreen />} />
              <Route path="safe-meet/:id" element={<SafeMeet />} />
              <Route path="profile" element={<ProfileSettings />} />
              <Route path="profile/edit" element={<EditProfile />} />
              <Route path="sound-reactions" element={<SoundReactions />} />
              <Route path="visibility" element={<VisibilitySettings />} />
              <Route path="premium" element={<Premium />} />
              <Route path="safety" element={<SafetyCenter />} />
              <Route path="blocked" element={<Blocked />} />
              <Route path="legal" element={<LegalIndex />} />
              <Route path="legal/:slug" element={<LegalDoc />} />
              <Route path="report/:id" element={<ReportFlow />} />
              <Route path="verification" element={<Verification />} />
              <Route path="build-status" element={<BuildStatus />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
