import React, { useEffect, useState } from "react";
import styled from "styled-components";
import {
  CircularProgress,
  IconButton,
  Slider, // Import Slider
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
} from "@carbon/icons-react";
import { ResponsePage } from "./ResponsePage";
import { useUserContext } from "../contexts/UserContext";

import { getPromptMessage } from "../utils/getPromptMessage";
import { chatGptResponse } from "../utils/constants";

export type ChatResponse = {
  question: string;
  response: string;
};

export const MainPage = () => {
  const theme = useTheme();
  const { setHasModelResponse, hasModelResponse } = useUserContext();
  const [currentMessage, setCurrentMessage] = useState("");
  const [content, setContent] = useState("");
  const [temperature, setTemperature] = useState(0.1);
  const [isLoading, setIsLoading] = useState(false);
  const [lastResponseId, setLastResponseId] = useState<string | null>(null);
  const [paperTitle, setPaperTitle] = useState("");
  const [previousFullContent, setPreviousFullContent] = useState<
    string | undefined
  >(undefined);

  const generateApiBody = () => {
    return JSON.stringify({
      model: "gpt-4.1",
      input: getPromptMessage(currentMessage, previousFullContent),
      previous_response_id: lastResponseId,
      temperature: temperature,
      text: {
        format: {
          type: "json_schema",
          name: "research",
          schema: {
            type: "object",
            properties: {
              content: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  content: { type: "string" },
                },
                required: ["title", "content"],
                additionalProperties: false,
              },
              citations: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    url: { type: "string" },
                  },
                  required: ["title", "url"],
                  additionalProperties: false,
                },
                description:
                  "A list of citations or references used in the research paper (biography section).",
              },
              assets: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    url: { type: "string" },
                    description: { type: "string" },
                  },
                  required: ["url", "description"],
                  additionalProperties: false,
                },
                description:
                  "A list of assets or images related to the research paper.",
              },
            },
            required: ["content", "citations", "assets"],
            additionalProperties: false,
          },
        },
      },
      tools: [
        {
          type: "web_search_preview",
          search_context_size: "high",
        },
      ],
      stream: false,
    });
  };

  const getChatResponse = async () => {
    setIsLoading(true);
    try {
      const researchApi = {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_CHAT_GPT_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: generateApiBody(),
      };

      const response = await fetch(chatGptResponse, researchApi);
      const data = await response.json();

      setIsLoading(false);

      const parsedContent = JSON.parse(data?.output?.[0]?.content[0].text);
      const mainTextContent = parsedContent.content.content || "";
      const title = parsedContent.content.title || "Research Paper";

      setPreviousFullContent(mainTextContent);

      setLastResponseId(data.id?.toString() || null);

      setPaperTitle(title);
      setContent(mainTextContent);
    } catch (error) {
      console.error(error);
      // --- Modification Start ---
      // Clear previous content on error? Or keep it? Decide based on desired UX.
      // setPreviousFullContent(undefined);
      // --- Modification End ---
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (content) {
      setHasModelResponse(true);
    }
  }, [content, setHasModelResponse]);

  useEffect(() => {
    if (!hasModelResponse) {
      setCurrentMessage("");
      setContent("");
      setPreviousFullContent(undefined); // Also clear previous content state
      setLastResponseId(null); // Reset Cohere ID
    }
  }, [hasModelResponse]);

  // Reset previous content when the main content is cleared (e.g., new session)
  useEffect(() => {
    if (!content) {
      setPreviousFullContent(undefined);
    }
  }, [content]);

  return (
    <Container $hasResponse={!!content}>
      {content ? (
        <ResponsePage
          content={content}
          paperTitle={paperTitle}
          isLoading={isLoading}
        />
      ) : (
        <TitleAndExamplesContainer>
          <TitleAndLogoContainer>
            <LogoReact size={64} />
            <Typography color="textPrimary" variant="h4">
              Deep Research
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
                  What are the latest advancements in quantum computing and
                  their potential applications in healthcare?
                </Typography>
              </MessageContainer>

              <MessageContainer $bgColor={theme.palette.primary.light}>
                <Typography color="textPrimary" variant="body2">
                  Analyze socioeconomic drivers of climate change and propose
                  mitigation strategies.
                </Typography>
              </MessageContainer>

              <MessageContainer $bgColor={theme.palette.primary.light}>
                <Typography color="textPrimary" variant="body2">
                  Synthesize current research on neuroplasticity and its
                  implications for learning and recovery from brain injury.
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
                  Able to synthesize complex research across multiple academic
                  disciplines and provide nuanced analysis.
                </Typography>
              </MessageContainer>

              <MessageContainer $bgColor={theme.palette.primary.light}>
                <Typography color="textPrimary" variant="body2">
                  Generates downloadable PDF research documents that can be
                  saved and shared.
                </Typography>
              </MessageContainer>

              <MessageContainer $bgColor={theme.palette.primary.light}>
                <Typography color="textPrimary" variant="body2">
                  Supports interactive editing of generated research content for
                  refinement and customization.
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
                  May not incorporate the most recent research published in
                  specialized journals.
                </Typography>
              </MessageContainer>

              <MessageContainer $bgColor={theme.palette.primary.light}>
                <Typography color="textPrimary" variant="body2">
                  Cannot access proprietary databases, subscription journals, or
                  perform real-time data analysis and processing.
                </Typography>
              </MessageContainer>

              <MessageContainer $bgColor={theme.palette.primary.light}>
                <Typography color="textPrimary" variant="body2">
                  May provide simplified explanations for highly technical or
                  emerging research topics.
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
          placeholder="Ask a question..."
          disabled={isLoading}
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
              endAdornment: (
                <ButtonContainer>
                  {isLoading ? (
                    <CircularProgress size={20} />
                  ) : (
                    <IconButton
                      onClick={getChatResponse}
                      disabled={!currentMessage}
                    >
                      <Send size={20} />
                    </IconButton>
                  )}
                </ButtonContainer>
              ),
              startAdornment: (
                <SliderContainer>
                  <Typography
                    variant="caption"
                    sx={{ mr: 1 }}
                    whiteSpace={"nowrap"}
                  >
                    Weight: {temperature.toFixed(1)}
                  </Typography>
                  <Slider
                    aria-label="Temperature"
                    value={temperature}
                    onChange={(event, newValue) =>
                      setTemperature(newValue as number)
                    }
                    step={0.1}
                    min={0.1}
                    max={1.0}
                    size="small"
                    sx={{ width: 50, mr: 1 }}
                  />
                </SliderContainer>
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
  gap: ${({ $hasResponse }) => ($hasResponse ? "32px" : "232px")};
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

const SliderContainer = styled.div`
  display: flex;
  align-items: center;
  padding-left: 12px;
`;

const ButtonContainer = styled.div`
  padding-left: 12px;
`;

const StyledTextField = styled(TextField)<{ $bgColor: string }>`
  max-width: 760px;
  & .MuiOutlinedInput-root {
    border-radius: 16px;
    background-color: ${({ $bgColor }) => $bgColor};
  }
`;
