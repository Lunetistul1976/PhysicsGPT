import React, { Dispatch, SetStateAction } from "react";
import { styled } from "styled-components";
import { RichTextEditor } from "./RichTextEditor";

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
