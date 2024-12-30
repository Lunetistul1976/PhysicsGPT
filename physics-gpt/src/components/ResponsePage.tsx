import { Typography } from "@mui/material";
import React from "react";
import { ChatResponse } from "./MainPage";
import { styled } from "styled-components";
import { LogoReact } from "@carbon/icons-react";

export const ResponsePage = ({
  chatResponses,
}: {
  chatResponses: ChatResponse[];
}) => {
  return (
    <ChatContainer>
      {chatResponses.map((chatResponse, index) => (
        <React.Fragment key={index}>
          <ResponseContainer>
            <Typography color="textPrimary" variant="body1">
              {chatResponse.question}
            </Typography>
          </ResponseContainer>
          <ResponseContainer>
            <div>
              <LogoReact size={32} />
            </div>
            <Typography color="textPrimary" variant="body1">
              {chatResponse.response}
            </Typography>
          </ResponseContainer>
        </React.Fragment>
      ))}
    </ChatContainer>
  );
};

const ResponseContainer = styled.div`
  align-items: flex-start;
  display: flex;
  gap: 16px;
  max-width: 600px;
  text-align: left;
`;

const ChatContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;
