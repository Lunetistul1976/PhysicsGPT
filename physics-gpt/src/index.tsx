import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import "./index.css";
import { CssBaseline, ThemeProvider as MuiThemeProvider } from "@mui/material";
import { ThemeProvider, useThemeContext } from "./contexts/ThemeContext";
import { UserProvider } from "./contexts/UserContext";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

const ThemedApp = () => {
  const { theme } = useThemeContext();
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </MuiThemeProvider>
  );
};
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <UserProvider>
        <ThemedApp />
      </UserProvider>
    </ThemeProvider>
  </React.StrictMode>
);
