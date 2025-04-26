// Use the backend API URL for requests
const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://physics-gpt-backend.vercel.app/api';

// Get the authentication URL from the backend
export const getAuthUrl = async (): Promise<string> => {
  try {
    console.log("Fetching auth URL from:", `${API_URL}/google-docs/auth/url`);
    
    const response = await fetch(`${API_URL}/google-docs/auth/url`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Error response:", errorData);
      throw new Error("Failed to get authentication URL");
    }

    // Check if the response is JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error("Received non-JSON response:", text);
      throw new Error("Server returned non-JSON response");
    }

    const data = await response.json();
    console.log("Auth URL response:", data);
    return data.authUrl;
  } catch (error) {
    console.error("Error getting auth URL:", error);
    throw error;
  }
};

// Set credentials for the backend
export const setCredentials = async (
  accessToken: string,
  refreshToken?: string
): Promise<void> => {
  try {
    const response = await fetch(
      `${API_URL}/google-docs/auth/set-credentials`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ accessToken, refreshToken }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Error setting credentials:", errorData);
      throw new Error("Failed to set credentials");
    }
  } catch (error) {
    console.error("Error setting credentials:", error);
    throw error;
  }
};

// Handle the OAuth callback
export const handleAuthCallback = async (
  code: string
): Promise<{ accessToken: string; refreshToken: string }> => {
  try {
    const response = await fetch(
      `${API_URL}/google-docs/auth/callback?code=${code}`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Error handling auth callback:", errorData);
      throw new Error("Authentication failed");
    }

    const data = await response.json();
    return data.tokens;
  } catch (error) {
    console.error("Error handling auth callback:", error);
    throw error;
  }
};
