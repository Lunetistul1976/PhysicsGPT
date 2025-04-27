import React, { useEffect, useState } from "react";
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
import { ResponsePage } from "./ResponsePage";
import { useUserContext } from "../contexts/UserContext";

import { getPromptMessage } from "../utils/getPromptMessage";
import { savePdf } from "../utils/indexedDb";
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

  const [isLoading, setIsLoading] = useState(false);
  const [showDownloadButton, setShowDownloadButton] = useState(false);
  const [paperTitle, setPaperTitle] = useState("");

  const researchApi = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.REACT_APP_CHAT_GPT_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4.1",
      input: getPromptMessage(currentMessage),
      max_output_tokens: 1000000,
      temperature: 1,
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
                  "A list of citations or references used in the research paper.",
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
              pdf: {
                type: "string",
                description: "The PDF file of the research paper.",
                additionalProperties: false,
              },
            },
            required: ["content", "citations", "assets", "pdf"],
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
    }),
  };

  const getChatResponse = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(chatGptResponse, researchApi);
      const data = await response.json();

      setIsLoading(false);
      const content = JSON.parse(data?.output[0]?.content[0].text);

      const title = content.content.title || "Research Paper";

      console.log("data", content);

      setPaperTitle(title);
      setContent(content.content.content || "");
      setShowDownloadButton(true);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  const savePdfInIndexedDb = async ({
    pdfBlob,
    filename,
    query,
    title,
  }: {
    pdfBlob: Blob;
    filename: string;
    query: string;
    title: string;
  }) => {
    try {
      await savePdf({
        pdfBlob,
        filename,
        query,
        title,
      });
    } catch (error) {
      console.error("Error saving PDF to IndexedDB:", error);
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
      setShowDownloadButton(false);
    }
  }, [hasModelResponse]);

  return (
    <Container $hasResponse={!!content}>
      {content ? (
        <ResponsePage
          content={content}
          setContent={setContent}
          showDownloadButton={showDownloadButton}
          paperTitle={paperTitle}
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

      {!showDownloadButton && (
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
                  <IconButton
                    onClick={getChatResponse}
                    disabled={!currentMessage}
                  >
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
      )}
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
