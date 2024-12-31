import { Typography } from "@mui/material";
import React from "react";
import { ChatResponse } from "./MainPage";
import { styled } from "styled-components";
import { LogoReact } from "@carbon/icons-react";
import { TypingText } from "./TypingText";

export const ResponsePage = ({
  chatResponses,
}: {
  chatResponses: ChatResponse[];
}) => {
  return (
    <ChatContainer>
      {chatResponses.map((chatResponse, index) => (
        <React.Fragment key={index}>
          <QuestionContainer>
            <Typography color="textPrimary" variant="body1">
              {chatResponse.question}
            </Typography>
          </QuestionContainer>
          <ResponseContainer>
            <div>
              <LogoReact size={32} />
            </div>
            <Typography color="textPrimary" variant="body1">
              <TypingText text={chatResponse.response} />
            </Typography>
          </ResponseContainer>
        </React.Fragment>
      ))}
    </ChatContainer>
  );
};

const ResponseContainer = styled.div`
  display: flex;
  gap: 16px;
  justify-content: flex-start;
  max-width: 600px;
  text-align: left;
`;

const QuestionContainer = styled.div`
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  max-width: 600px;
  text-align: left;
`;

const ChatContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;
