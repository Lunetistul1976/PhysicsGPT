import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { styled } from "styled-components";
import { RichTextEditor } from "./RichTextEditor";
import { Button, CircularProgress, Snackbar, Alert } from "@mui/material";
import {
  createAndUpdateGoogleDoc,
  initGoogleDocsApi,
  openGoogleDoc,
} from "../utils/googleDocsApi";

export const ResponsePage = ({
  content,
  setContent,
  showDownloadButton,
  paperTitle,
}: {
  content: string;
  setContent: Dispatch<SetStateAction<string>>;
  showDownloadButton: boolean;
  paperTitle: string;
}) => {
  const [isGoogleDocsLoading, setIsGoogleDocsLoading] = useState(false);
  const [googleDocsApiInitialized, setGoogleDocsApiInitialized] =
    useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({
    open: false,
    message: "",
    severity: "info",
  });

  // Initialize the Google Docs API when the component mounts
  useEffect(() => {
    const initializeApi = async () => {
      try {
        const initialized = await initGoogleDocsApi();
        setGoogleDocsApiInitialized(initialized);
        if (initialized) {
          setNotification({
            open: true,
            message: "Google Docs API initialized successfully",
            severity: "success",
          });
        } else {
          setNotification({
            open: true,
            message:
              "Failed to initialize Google Docs API. Will use fallback method.",
            severity: "warning",
          });
        }
      } catch (error) {
        console.error("Error initializing Google Docs API:", error);
        setNotification({
          open: true,
          message:
            "Error initializing Google Docs API. Will use fallback method.",
          severity: "error",
        });
      }
    };

    initializeApi();
  }, []);

  const handleOpenInGoogleDocs = async () => {
    try {
      setIsGoogleDocsLoading(true);
      setNotification({
        open: false,
        message: "",
        severity: "info",
      });

      // Try to use the Google Docs API if it's initialized
      if (googleDocsApiInitialized) {
        try {
          setNotification({
            open: true,
            message: "Creating Google Doc...",
            severity: "info",
          });

          const docUrl = await createAndUpdateGoogleDoc(paperTitle, content);

          if (docUrl) {
            setNotification({
              open: true,
              message: "Google Doc created successfully! Opening...",
              severity: "success",
            });

            // Open the document in a new tab
            openGoogleDoc(docUrl);
          } else {
            throw new Error("Failed to create Google Doc");
          }
        } catch (apiError) {
          console.error("Error using Google Docs API:", apiError);
          setNotification({
            open: true,
            message:
              "Failed to use Google Docs API. Falling back to alternative method...",
            severity: "warning",
          });
        }
      } else {
        setNotification({
          open: true,
          message:
            "Google Docs API not initialized. Using alternative method...",
          severity: "info",
        });
      }
    } catch (error) {
      console.error("Error opening in Google Docs:", error);
      setNotification({
        open: true,
        message: "Failed to open in Google Docs. Please try again.",
        severity: "error",
      });
    } finally {
      setIsGoogleDocsLoading(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false,
    });
  };

  return (
    <ChatContainer>
      <RichTextEditor content={content} setContent={setContent} />
      <ButtonContainer>
        {showDownloadButton && (
          <>
            <StyledButton
              variant="contained"
              color="secondary"
              onClick={handleOpenInGoogleDocs}
              disabled={isGoogleDocsLoading}
            >
              {isGoogleDocsLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Open in Google Docs"
              )}
            </StyledButton>
          </>
        )}
      </ButtonContainer>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </ChatContainer>
  );
};

const ChatContainer = styled.div`
  align-items: center;
  display: flex;
  gap: 32px;
  flex-direction: column;
  width: 100%;
  height: 100%;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 16px;
`;

const StyledButton = styled(Button)`
  min-width: 150px;
`;
