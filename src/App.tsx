import { useState } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { TaskProvider } from "@/lib/task-context";
import { ToastProvider } from "@/components/ToastContainer";
import AppShell from "@/components/AppShell";
import LoginPage from "@/pages/LoginPage";
import OnboardingPage from "@/pages/OnboardingPage";
import DashboardPage from "@/pages/DashboardPage";
import AddTaskPage from "@/pages/AddTaskPage";
import TrackPage from "@/pages/TrackPage";
import AllTasksPage from "@/pages/AllTasksPage";
import FilteredPage from "@/pages/FilteredPage";
import TableViewPage from "@/pages/TableViewPage";
import ProfilePage from "@/pages/ProfilePage";

const queryClient = new QueryClient();

function AuthedRoutes({ onLogout, onOpenOnboarding }: { onLogout: () => void; onOpenOnboarding: () => void }) {
  return (
    <AppShell onLogout={onLogout} onOpenOnboarding={onOpenOnboarding}>
      <Switch>
        <Route path="/" component={DashboardPage} />
        <Route path="/add" component={AddTaskPage} />
        <Route path="/profile" component={ProfilePage} />
        <Route path="/settings" component={ProfilePage} />
        <Route path="/track/shared">
          {() => <TrackPage owner="Shared" />}
        </Route>
        <Route path="/track/:owner">
          {(params) => <TrackPage owner={decodeURIComponent(params.owner)} />}
        </Route>
        <Route path="/all" component={AllTasksPage} />
        <Route path="/in-progress">
          {() => <FilteredPage filter="progress" />}
        </Route>
        <Route path="/blocked">
          {() => <FilteredPage filter="blocked" />}
        </Route>
        <Route path="/done">
          {() => <FilteredPage filter="done" />}
        </Route>
        <Route path="/table" component={TableViewPage} />
        <Route>
          {() => <DashboardPage />}
        </Route>
      </Switch>
    </AppShell>
  );
}

function MainApp() {
  const { user, currentWorkspace, workspaces, loading, logout } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check URL query param for join code
  const isJoinUrl = window.location.pathname === "/join" || window.location.search.includes("code=");

  if (loading) {
    return (
      <div
        className="w-screen h-screen flex flex-col items-center justify-center font-heading font-black"
        style={{ backgroundColor: "#F5F0E8" }}
      >
        <div className="w-10 h-10 border-4 border-black border-t-[#FFE600] animate-spin mb-4" />
        <div className="text-base tracking-widest text-black">CONNECTING TO BLOC...</div>
      </div>
    );
  }

  // Not logged in -> Auth Page
  if (!user) {
    return <LoginPage />;
  }

  // User logged in but has no workspace or clicked Create/Join -> Onboarding
  if (!currentWorkspace || workspaces.length === 0 || showOnboarding || isJoinUrl) {
    return <OnboardingPage onComplete={() => setShowOnboarding(false)} />;
  }

  return (
    <AuthedRoutes
      onLogout={logout}
      onOpenOnboarding={() => setShowOnboarding(true)}
    />
  );
}

function App() {
  const routerBase =
    import.meta.env.BASE_URL && import.meta.env.BASE_URL !== "/"
      ? import.meta.env.BASE_URL.replace(/\/$/, "")
      : undefined;

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TaskProvider>
          <ToastProvider>
            <WouterRouter base={routerBase}>
              <MainApp />
            </WouterRouter>
          </ToastProvider>
        </TaskProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
