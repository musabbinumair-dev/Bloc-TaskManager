import { useState, useEffect } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TaskProvider } from "@/lib/task-context";
import { ToastProvider } from "@/components/ToastContainer";
import AppShell from "@/components/AppShell";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import AddTaskPage from "@/pages/AddTaskPage";
import TrackPage from "@/pages/TrackPage";
import AllTasksPage from "@/pages/AllTasksPage";
import FilteredPage from "@/pages/FilteredPage";
import TableViewPage from "@/pages/TableViewPage";
import { auth, onAuthStateChanged, signOut } from "@/lib/firebase";

const queryClient = new QueryClient();

function AuthedApp({ onLogout }: { onLogout: () => void }) {
  return (
    <AppShell onLogout={onLogout}>
      <Switch>
        <Route path="/" component={DashboardPage} />
        <Route path="/add" component={AddTaskPage} />
        <Route path="/track/musab">
          {() => <TrackPage owner="Musab" />}
        </Route>
        <Route path="/track/yusha">
          {() => <TrackPage owner="Yusha" />}
        </Route>
        <Route path="/track/shared">
          {() => <TrackPage owner="Shared" />}
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

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsub();
  }, []);

  if (isLoggedIn === null) {
    return <div style={{ width: "100vw", height: "100vh", backgroundColor: "#F5F0E8" }} />
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TaskProvider>
        <ToastProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            {isLoggedIn ? (
              <AuthedApp onLogout={() => signOut(auth)} />
            ) : (
              <LoginPage />
            )}
          </WouterRouter>
        </ToastProvider>
      </TaskProvider>
    </QueryClientProvider>
  );
}

export default App;

