import React, { useState } from "react";
import styled from "styled-components";
import {
  CircularProgress,
  IconButton,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import {
  Chat,
  DataEnrichment,
  LogoReact,
  Send,
  WarningAlt,
  Image,
} from "@carbon/icons-react";
import { chatGPT, chatGptApiKey } from "../utils/constants";
import { getPromptMessage } from "../utils/getPromptMessage";
import { ResponsePage } from "./ResponsePage";

export type ChatResponse = {
  question: string;
  response: string;
};

export const MainPage = () => {
  const theme = useTheme();
  const [messages, setMessages] = useState<string[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [chatResponses, setChatResponses] = useState<ChatResponse[] | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  const optionsAPIChat = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${chatGptApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      store: true,
      messages: [
        {
          role: "user",
          content: getPromptMessage(currentMessage),
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 500,
    }),
  };

  const getChatResponse = async () => {
    setMessages([...messages, currentMessage]);
    setIsLoading(true);
    const response = await fetch(chatGPT, optionsAPIChat);
    const data = await response.json();
    setIsLoading(false);
    setCurrentMessage("");
    setChatResponses([
      ...(chatResponses || []),
      {
        question: currentMessage,
        response: JSON.parse(data.choices[0].message.content).response,
      },
    ]);
  };

  console.log(messages);

  return (
    <Container $hasResponse={!!chatResponses}>
      {chatResponses ? (
        <ResponsePage chatResponses={chatResponses} />
      ) : (
        <TitleAndExamplesContainer>
          <TitleAndLogoContainer>
            <LogoReact size={64} />
            <Typography color="textPrimary" variant="h4">
              PhysicsGPT
            </Typography>
          </TitleAndLogoContainer>
          <ExamplesAndCapabilitiesContainer>
            <Section>
              <SectionTitleContainer>
                <Chat size={24} />
                <Typography color="textPrimary" variant="h6">
                  Examples
                </Typography>
              </SectionTitleContainer>
              <MessageContainer $bgColor={theme.palette.primary.light}>
                <Typography color="textPrimary" variant="body2">
                  What is the difference between classical mechanics and quantum
                  mechanics?
                </Typography>
              </MessageContainer>

              <MessageContainer $bgColor={theme.palette.primary.light}>
                <Typography color="textPrimary" variant="body2">
                  Explain the theory of relativity in simple terms.
                </Typography>
              </MessageContainer>

              <MessageContainer $bgColor={theme.palette.primary.light}>
                <Typography color="textPrimary" variant="body2">
                  How does a black hole form and what are its properties?
                </Typography>
              </MessageContainer>
            </Section>

            <Section>
              <SectionTitleContainer>
                <DataEnrichment size={24} />
                <Typography color="textPrimary" variant="h6">
                  Capabilities
                </Typography>
              </SectionTitleContainer>
              <MessageContainer $bgColor={theme.palette.primary.light}>
                <Typography color="textPrimary" variant="body2">
                  Able to break down complex physics concepts into simpler
                  explanations.
                </Typography>
              </MessageContainer>

              <MessageContainer $bgColor={theme.palette.primary.light}>
                <Typography color="textPrimary" variant="body2">
                  Provides insights into theoretical and applied physics topics.
                </Typography>
              </MessageContainer>

              <MessageContainer $bgColor={theme.palette.primary.light}>
                <Typography color="textPrimary" variant="body2">
                  Explains phenomena across classical, quantum, and astrophysics
                  domains.
                </Typography>
              </MessageContainer>
            </Section>

            <Section>
              <SectionTitleContainer>
                <WarningAlt size={24} />
                <Typography color="textPrimary" variant="h6">
                  Limitations
                </Typography>
              </SectionTitleContainer>
              <MessageContainer $bgColor={theme.palette.primary.light}>
                <Typography color="textPrimary" variant="body2">
                  May not account for the most recent physics research or
                  experimental results.
                </Typography>
              </MessageContainer>

              <MessageContainer $bgColor={theme.palette.primary.light}>
                <Typography color="textPrimary" variant="body2">
                  Cannot perform complex physics calculations or numerical
                  simulations.
                </Typography>
              </MessageContainer>

              <MessageContainer $bgColor={theme.palette.primary.light}>
                <Typography color="textPrimary" variant="body2">
                  Responses may not fully address niche or controversial physics
                  topics.
                </Typography>
              </MessageContainer>
            </Section>
          </ExamplesAndCapabilitiesContainer>
        </TitleAndExamplesContainer>
      )}

      <InputContainer>
        <StyledTextField
          fullWidth
          autoComplete="off"
          onChange={(event) => setCurrentMessage(event.target.value)}
          placeholder="Ask a question about physics..."
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              getChatResponse();
            }
          }}
          value={currentMessage}
          color="secondary"
          $bgColor={theme.palette.primary.light}
          slotProps={{
            input: {
              endAdornment: isLoading ? (
                <CircularProgress size={20} />
              ) : (
                <IconButton onClick={getChatResponse}>
                  <Send size={20} />
                </IconButton>
              ),
              startAdornment: (
                <IconButton disabled>
                  <Image size={20} />
                </IconButton>
              ),
            },
          }}
        />
      </InputContainer>
    </Container>
  );
};

const Container = styled.div<{ $hasResponse: boolean }>`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${({ $hasResponse }) => ($hasResponse ? "120px" : "232px")};
  padding: 32px;
  height: 100%;
  justify-content: center;
  width: 100%;
`;

const TitleAndExamplesContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 80px;
  max-width: 920px;
  width: 100%;
`;

const TitleAndLogoContainer = styled.div`
  align-items: center;
  display: flex;
  gap: 16px;
`;

const ExamplesAndCapabilitiesContainer = styled.div`
  display: flex;
  gap: 40px;
`;

const Section = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 16px;
`;

const SectionTitleContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const MessageContainer = styled.div<{ $bgColor: string }>`
  background-color: ${({ $bgColor }) => $bgColor};
  border-radius: 8px;
  padding: 4px 8px;
  max-width: 280px;
  width: 100%;
`;

const InputContainer = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
`;

const StyledTextField = styled(TextField)<{ $bgColor: string }>`
  max-width: 760px;
  & .MuiOutlinedInput-root {
    border-radius: 16px;
    background-color: ${({ $bgColor }) => $bgColor};
  }
`;
