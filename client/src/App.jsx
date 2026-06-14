import { AuthProvider, useAuth } from "./context/AuthContext";
import { StockProvider } from "./context/StockContext";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";

function AppContent() {
  const { user } = useAuth();

  if (!user) return <Login />;

  return (
    <StockProvider>
      <Dashboard />
    </StockProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
