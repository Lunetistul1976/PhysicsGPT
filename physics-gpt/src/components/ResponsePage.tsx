import React, { useEffect, useState } from "react";
import { styled } from "styled-components";
// Removed RichTextEditor import
import {
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Skeleton,
} from "@mui/material";
import {
  createAndUpdateGoogleDoc,
  initGoogleDocsApi,
  openGoogleDoc,
} from "../utils/googleDocsApi";
import { addOrUpdateHistory } from "../utils/indexedDbUtils"; // Import DB utility

export const ResponsePage = ({
  content,
  paperTitle,
  isLoading,
}: {
  content: string;
  paperTitle: string;
  isLoading: boolean;
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

  const processContent = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    return text.replace(urlRegex, (match, url) => {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    });
  };

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

            // --- Modification Start: Extract ID and save to IndexedDB ---
            const docIdMatch = docUrl.match(/document\/d\/([a-zA-Z0-9_-]+)\//);
            const docId = docIdMatch ? docIdMatch[1] : null;

            if (docId && paperTitle) {
              try {
                await addOrUpdateHistory({
                  title: paperTitle, // Use title as the key
                  docId: docId,
                  timestamp: Date.now(),
                });
                setNotification((prev) => ({
                  ...prev,
                  message: "Google Doc created & saved to history! Opening...",
                }));
              } catch (dbError) {
                console.error("Failed to save history to IndexedDB:", dbError);
                // Optionally update notification to indicate save failure but still open doc
                setNotification((prev) => ({
                  ...prev,
                  message: "Doc created (history save failed). Opening...",
                  severity: "warning",
                }));
              }
            } else {
              console.warn(
                "Could not extract Doc ID or missing title, history not saved."
              );
              setNotification((prev) => ({
                ...prev,
                message: "Doc created (ID extract failed). Opening...",
                severity: "warning",
              }));
            }
            // --- Modification End ---

            openGoogleDoc(docUrl); // Open the doc regardless of save status
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
      {isLoading ? (
        <StyledSkeleton
          variant="rectangular"
          width={800}
          height={600}
          animation="wave"
        />
      ) : (
        <ResponseContainer>
          <pre dangerouslySetInnerHTML={{ __html: processContent(content) }} />
        </ResponseContainer>
      )}

      <ButtonContainer>
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
`;

const ResponseContainer = styled.div`
  background-color: ${(props) => props.theme.palette?.background?.paper};
  border: 1px solid ${(props) => props.theme.palette?.divider};
  border-radius: 8px;
  padding: 24px;
  max-width: 800px;
  width: 100%;
  max-height: 600px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  color: ${(props) => props.theme.palette?.text?.primary};
  font-family: Arial, sans-serif;
  font-size: 11pt;
  line-height: 1.5;
  overflow-y: auto;
  flex-grow: 1;
  margin-bottom: 16px;

  pre {
    white-space: pre-wrap;
    word-wrap: break-word;
    font-family: inherit;
    font-size: inherit;
    margin: 0;

    a {
      color: ${(props) => props.theme.palette?.primary?.main};
      text-decoration: none;
      &:hover {
        text-decoration: underline;
      }
    }
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 16px;
`;

const StyledButton = styled(Button)`
  min-width: 150px;
`;

const StyledSkeleton = styled(Skeleton)`
  border-radius: 8px;
`;
