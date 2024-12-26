import { createTheme } from "@mui/material/styles";

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#007bff",
      light: "#f7f9fb",
    },
    secondary: {
      main: "#6c757d",
    },
    grey: {
      100: "#9e9e9e",
    },
    background: {
      default: "#ffffff",
      paper: "#f5f5f5",
    },
    text: {
      primary: "#000000",
      secondary: "#6c757d",
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#1e90ff",
      light: "rgba(255, 255, 255, 0.05)",
    },
    secondary: {
      main: "#bbbbbb",
    },
    background: {
      default: "#121212",
      paper: "#1e1e1e",
    },
    text: {
      primary: "#ffffff",
      secondary: "#bbbbbb",
    },
    grey: {
      100: "#9e9e9e",
    },
  },
});
