import React, { Dispatch, SetStateAction } from "react";
import { styled } from "styled-components";
import { RichTextEditor } from "./RichTextEditor";

export const ResponsePage = ({
  content,
  setContent,
}: {
  content: string;
  setContent: Dispatch<SetStateAction<string>>;
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
  flex-direction: column;
`;
