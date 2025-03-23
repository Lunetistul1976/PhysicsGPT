import React, {  useEffect, useState } from "react";
import styled from "styled-components";
import {
  Button,
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
  Pdf,
} from "@carbon/icons-react";
import { chatGPT, chatGptApiKey } from "../utils/constants";
import { getPromptMessage } from "../utils/getPromptMessage";
import { ResponsePage } from "./ResponsePage";
import { useUserContext } from "../contexts/UserContext";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export type ChatResponse = {
  question: string;
  response: string;
};

export const MainPage = () => {
  const theme = useTheme();
  const { setHasModelResponse, hasModelResponse } = useUserContext();
  // const [messages, setMessages] = useState<string[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [content, setContent] = useState("");
  // const [chatResponses, setChatResponses] = useState<ChatResponse[] | null>(
  //   null
  // );
  const [isLoading, setIsLoading] = useState(false);
  const [showDownloadButton, setShowDownloadButton] = useState(false);

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
    // setMessages([...messages, currentMessage]);
    setIsLoading(true);
    const response = await fetch(chatGPT, optionsAPIChat);
    const data = await response.json();
    setIsLoading(false);
    // setCurrentMessage("");
    // setChatResponses([
    //   ...(chatResponses || []),
    //   {
    //     question: currentMessage,
    //     response: JSON.parse(data.choices[0].message.content).response,
    //   },
    // ]);
    setContent(JSON.parse(data?.choices?.[0].message.content).response || '');
    setShowDownloadButton(true);
  };

  


  const savePdfInLocalStorage = async ({
    pdfBlob,
    filename,
    query,
  }: {
    pdfBlob: Blob;
    filename: string;
    query: string;
  }) => {
    
    const base64String = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64.split(',')[1]); 
      };
      reader.readAsDataURL(pdfBlob);
    });
  
    const pdfsArray = !!localStorage.getItem("pdfs") 
      ? JSON.parse(localStorage.getItem("pdfs")!) 
      : [];

    const pdfId = pdfsArray.length ? pdfsArray[pdfsArray.length - 1].id + 1 : 1;

    pdfsArray.push({
      id: pdfId,
      filename,
      date: new Date().toISOString(), 
      query,
      pdfData: base64String, 
    });

    localStorage.setItem("pdfs", JSON.stringify(pdfsArray));
  };

  const generatePDF =  async () => {
    const tempDiv = document.createElement("div");

    tempDiv.innerHTML += content;

    // Style for PDF (always use dark text on light background for readability)
    tempDiv.style.padding = "20px";
    tempDiv.style.maxWidth = "800px";
    tempDiv.style.margin = "0 auto";
    tempDiv.style.backgroundColor = "white";
    tempDiv.style.color = "black";

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

      await savePdfInLocalStorage({
        pdfBlob: pdf.output("blob"),
        filename,
        query: currentMessage,
      })

    } catch (error) {
      console.log("Error generating PDF:", error);
    } finally {
      document.body.removeChild(tempDiv);
    }
  }
  

  useEffect(() => {
    if (content) {
      setHasModelResponse(true);
    }
  }, [content, setHasModelResponse]);

  useEffect(() => {
    if (!hasModelResponse) {
      // setChatResponses(null);
      // setMessages([]);
      setCurrentMessage("");
      setContent("");
      setShowDownloadButton(false);
    }
  }, [hasModelResponse]);

  return (
    <Container $hasResponse={!!content}>
      {content ? (
        <ResponsePage content={content} setContent={setContent} />
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

      {showDownloadButton ? (
        <Button
          color="secondary"
          size="medium"
          variant="contained"
          startIcon={<Pdf size={20} />}
          onClick={() => generatePDF()}
        >
          Download
        </Button>
      ) : (
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
