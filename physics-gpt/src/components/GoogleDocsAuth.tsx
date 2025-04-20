import React, { useState, useEffect } from "react";
import { Button, CircularProgress, Typography } from "@mui/material";
import { Document } from "@carbon/icons-react";
import {
  getAuthUrl,
  handleAuthCallback,
  setCredentials,
} from "../services/googleDocsAuthService";
import styled from "styled-components";

interface GoogleDocsAuthProps {
  onAuthenticated: () => void;
}

const GoogleDocsAuth: React.FC<GoogleDocsAuthProps> = ({ onAuthenticated }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Handle the OAuth callback
    const handleMessage = async (event: MessageEvent) => {
      // Check if the message is from our OAuth window
      if (event.origin === window.location.origin) {
        const { code } = event.data;
        if (code) {
          try {
            // Handle the auth callback to get tokens
            const tokens = await handleAuthCallback(code);
            
            // Set the credentials in the backend
            await setCredentials(tokens.accessToken, tokens.refreshToken);
            
            // Notify the parent component that authentication is complete
            onAuthenticated();
          } catch (error) {
            console.error("Error handling auth callback:", error);
            setError("Failed to authenticate with Google");
          } finally {
            setIsLoading(false);
          }
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onAuthenticated]);

  const handleAuthenticate = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get the authentication URL from the backend
      const authUrl = await getAuthUrl();

      // Open the authentication URL in a new window
      const width = 600;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      window.open(
        authUrl,
        "Google Auth",
        `width=${width},height=${height},left=${left},top=${top}`
      );
    } catch (error) {
      console.error("Error starting authentication:", error);
      setError("Failed to start authentication");
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <Typography variant="h6" gutterBottom>
        Google Docs Integration
      </Typography>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <Button
        variant="contained"
        color="primary"
        startIcon={
          isLoading ? <CircularProgress size={20} /> : <Document size={20} />
        }
        onClick={handleAuthenticate}
        disabled={isLoading}
      >
        {isLoading ? "Authenticating..." : "Connect with Google Docs"}
      </Button>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 24px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  max-width: 400px;
  margin: 0 auto;
`;

const ErrorMessage = styled.div`
  color: #d32f2f;
  margin-bottom: 16px;
`;

export default GoogleDocsAuth;
