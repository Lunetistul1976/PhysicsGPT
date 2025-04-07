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
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { processCitationsInContent } from "../utils/processCitations";
import { getPromptMessage } from "../utils/getPromptMessage";
import { savePdf } from "../utils/indexedDb";
import { getResponseObject } from "../utils/getResponseObject";

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

  const optionsPerplexityApi = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "sonar-deep-research",
      messages: [{ role: "user", content: getPromptMessage(currentMessage) }],
      max_tokens: 10000,
      temperature: 0.2,
      top_p: 0.9,
      return_images: false,
      return_related_questions: false,
      top_k: 0,
      stream: false,
      presence_penalty: 0,
      frequency_penalty: 1,
      web_search_options: { search_context_size: "medium" },
    }),
  };

  const getChatResponse = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "http://localhost:5002/api/research",
        optionsPerplexityApi
      );
      const data = await response.json();

      setIsLoading(false);
      const content = data?.choices?.[0].message.content;
      const citations = data?.citations;

      const contentWithCitations = processCitationsInContent(
        content,
        citations
      );

      const responseObject = getResponseObject(contentWithCitations);

      console.log("response", responseObject);

      setContent(responseObject?.content || "");
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
  }: {
    pdfBlob: Blob;
    filename: string;
    query: string;
  }) => {
    try {
      await savePdf({
        pdfBlob,
        filename,
        query,
      });
    } catch (error) {
      console.error("Error saving PDF to IndexedDB:", error);
    }
  };
  const generatePDF = async () => {
    const tempDiv = document.createElement("div");

    tempDiv.innerHTML += content;

    // Style for PDF (always use dark text on light background for readability)
    tempDiv.style.padding = "20px";
    tempDiv.style.maxWidth = "800px";
    tempDiv.style.margin = "0 auto";
    tempDiv.style.backgroundColor = "white";
    tempDiv.style.color = "black";

    // Ensure links have proper formatting for PDF conversion
    const links = tempDiv.querySelectorAll("a");
    links.forEach((link) => {
      // Make sure links have proper attributes for PDF conversion
      link.style.color = "#0000FF";
      link.style.textDecoration = "none";
      // Ensure href attribute has quotes
      const href = link.getAttribute("href");
      if (href) {
        link.setAttribute("href", href);
      }
    });

    const images = tempDiv.querySelectorAll("img");
    images.forEach((img) => {
      if (img.width > 700) {
        img.style.width = "700px";
        img.style.height = "auto";
      }
    });

    document.body.appendChild(tempDiv);
    tempDiv.style.position = "absolute";
    tempDiv.style.left = "-9999px";

    try {
      tempDiv.style.width = "800px";
      tempDiv.style.height = "auto";
      tempDiv.style.overflow = "visible";

      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        logging: true,
        backgroundColor: "white",
        allowTaint: true, // Allow images from other domains
      });

      // Create PDF
      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if content extends beyond one page
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Add metadata
      pdf.setProperties({
        title: "Research test",
        subject: "Research",
        author: "Deep Research",
        keywords: "research, AI",
        creator: "Deep Research",
      });

      // Generate filename with date
      const date = new Date().toISOString().slice(0, 10);
      const filename = `research_${date}.pdf`;

      pdf.save(filename);

      await savePdfInIndexedDb({
        pdfBlob: pdf.output("blob"),
        filename,
        query: currentMessage,
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      document.body.removeChild(tempDiv);
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
          generatePdf={generatePDF}
          showDownloadButton={showDownloadButton}
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
