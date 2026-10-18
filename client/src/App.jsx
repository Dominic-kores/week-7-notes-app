
import { useState } from "react";

import { useAuth } from "./context/AuthContext";

import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import NotesDashboard from "./components/NotesDashboard";

import "./App.css";

export default function App() {
  const { loading, isAuthenticated } = useAuth();

  // Toggle between login and registration.
  const [showRegister, setShowRegister] = useState(false);

  if (loading) {
    return (
      <div className="page-loader">
        Loading SecureNotes...
      </div>
    );
  }

  // Only authenticated users see the dashboard.
  if (isAuthenticated) {
    return <NotesDashboard />;
  }

  if (showRegister) {
    return (
      <RegisterForm
        onSwitch={() => setShowRegister(false)}
      />
    );
  }

  return (
    <LoginForm
      onSwitch={() => setShowRegister(true)}
    />
  );
}
