import React, { Dispatch, SetStateAction } from "react";
import { styled } from "styled-components";
import { RichTextEditor } from "./RichTextEditor";
import { Button } from "@mui/material";
import { Pdf } from "@carbon/icons-react";

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
  return (
    <ChatContainer>
      <RichTextEditor content={content} setContent={setContent} />
      {showDownloadButton && (
        <Button
          color="secondary"
          size="medium"
          variant="contained"
          startIcon={<Pdf size={20} />}
          onClick={() => generatePdf()}
        >
          Download
        </Button>
      )}
    </ChatContainer>
  );
};

const ChatContainer = styled.div`
  align-items: center;
  display: flex;
  gap: 32px;
  flex-direction: column;
`;
