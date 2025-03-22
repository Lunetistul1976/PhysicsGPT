import React from "react";
import { ChatResponse } from "./MainPage";
import { styled } from "styled-components";
import { RichTextEditor } from "./RichTextEditor";

export const ResponsePage = ({
  chatResponses,
}: {
  chatResponses: ChatResponse[];
}) => {
  return (
    <ChatContainer>
      <RichTextEditor
        question={chatResponses[0].question}
        response={chatResponses[0].response}
      />
    </ChatContainer>
  );
};

const ChatContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;
