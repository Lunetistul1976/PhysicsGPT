import { createTheme } from "@mui/material/styles";

const commonComponents = {
  MuiButton: {
    styleOverrides: {
      // Override the sizeLarge variant specifically
      sizeLarge: {
        borderRadius: "6px",
      },
      sizeMedium: {
        borderRadius: "6px",
      },
    },
  },
};

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
    divider: "#e0e0e0",
  },
  typography: {
    button: {
      textTransform: "none",
    },
  },
  components: {
    ...commonComponents,
    MuiButton: {
      ...commonComponents.MuiButton,
      styleOverrides: {
        ...commonComponents.MuiButton.styleOverrides,

        containedSecondary: {
          backgroundColor: "#212529", // Black color for secondary
          color: "#ffffff",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          "&:hover": {
            backgroundColor: "#343a40", // Dark gray with slight hint of blue on hover
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
          },
        },
      },
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
    divider: "#424242",
  },
  typography: {
    button: {
      textTransform: "none",
    },
  },
  components: {
    ...commonComponents,
    MuiButton: {
      ...commonComponents.MuiButton,
      styleOverrides: {
        ...commonComponents.MuiButton.styleOverrides,

        containedSecondary: {
          backgroundColor: "#ffffff",
          color: "#121212",
          "&:hover": {
            backgroundColor: "#e0e0e0",
          },
        },
      },
    },
  },
});
