import React, { Dispatch, SetStateAction, useState } from "react";
import { styled } from "styled-components";
import { RichTextEditor } from "./RichTextEditor";
import { Button, ButtonGroup, Snackbar, Alert } from "@mui/material";
import { Pdf, Document } from "@carbon/icons-react";
import GoogleDocsViewer from "./GoogleDocsViewer";
import { createGoogleDoc } from "../services/googleDocsService";
import GoogleDocsAuth from "./GoogleDocsAuth";

export const ResponsePage = ({
  content,
  setContent,
  showDownloadButton,
  generatePdf,
}: {
  content: string;
  setContent: Dispatch<SetStateAction<string>>;
  showDownloadButton: boolean;
  generatePdf: () => Promise<void>;
}) => {
  const [showGoogleDocs, setShowGoogleDocs] = useState(false);
  const [googleDocId, setGoogleDocId] = useState<string>("");
  const [isCreatingDoc, setIsCreatingDoc] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuth, setShowAuth] = useState(!isAuthenticated);
  const [error, setError] = useState<string | null>(null);

  const handleCreateGoogleDoc = async () => {
    try {
      setIsCreatingDoc(true);
      setError(null);

      const docId = await createGoogleDoc(content, "PhysicsGPT Response");
      setGoogleDocId(docId);
      setShowGoogleDocs(true);
    } catch (error) {
      console.error("Error creating Google Doc:", error);
      setError(
        error instanceof Error ? error.message : "Failed to create Google Doc"
      );

      // If the error is related to authentication, show the auth component
      if (
        error instanceof Error &&
        error.message.includes("Authentication required")
      ) {
        setShowAuth(true);
      }
    } finally {
      setIsCreatingDoc(false);
    }
  };

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
    setShowAuth(false);
    // Try creating the Google Doc again
    handleCreateGoogleDoc();
  };

  const handleCloseError = () => {
    setError(null);
  };

  return (
    <ChatContainer>
      {showAuth ? (
        <GoogleDocsAuth onAuthenticated={handleAuthenticated} />
      ) : showGoogleDocs ? (
        <GoogleDocsViewer documentId={googleDocId} />
      ) : (
        <RichTextEditor content={content} setContent={setContent} />
      )}
      {showDownloadButton && !showAuth && (
        <ButtonGroup variant="contained" color="secondary">
          <Button
            size="medium"
            startIcon={<Pdf size={20} />}
            onClick={() => generatePdf()}
          >
            Download PDF
          </Button>
          <Button
            size="medium"
            startIcon={<Document size={20} />}
            onClick={handleCreateGoogleDoc}
            disabled={isCreatingDoc}
          >
            {isCreatingDoc ? "Creating..." : "Open in Google Docs"}
          </Button>
        </ButtonGroup>
      )}

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseError}
          severity="error"
          sx={{ width: "100%" }}
        >
          {error}
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
