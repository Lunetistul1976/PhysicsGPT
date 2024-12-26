import React from "react";
import styled from "styled-components";
import { Typography } from "@mui/material";
import { Chat, LogoReact } from "@carbon/icons-react";

export const MainPage = () => {
  return (
    <Container>
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
              <Chat />
              <Typography color="textPrimary" variant="subtitle1">
                Examples
              </Typography>
            </SectionTitleContainer>
            <MessageContainer>
              <Typography color="textPrimary" variant="body2">
                "Explain quantum computing in simple terms"
              </Typography>
            </MessageContainer>

            <MessageContainer>
              <Typography color="textPrimary" variant="body2">
                "Explain quantum computing in simple terms"
              </Typography>
            </MessageContainer>

            <MessageContainer>
              <Typography color="textPrimary" variant="body2">
                "Explain quantum computing in simple terms"
              </Typography>
            </MessageContainer>
          </Section>

          <Section>
            <SectionTitleContainer>
              <Chat />
              <Typography color="textPrimary" variant="subtitle1">
                Capabilities
              </Typography>
            </SectionTitleContainer>
            <MessageContainer>
              <Typography color="textPrimary" variant="body2">
                "Explain quantum computing in simple terms"
              </Typography>
            </MessageContainer>

            <MessageContainer>
              <Typography color="textPrimary" variant="body2">
                "Explain quantum computing in simple terms"
              </Typography>
            </MessageContainer>

            <MessageContainer>
              <Typography color="textPrimary" variant="body2">
                "Explain quantum computing in simple terms"
              </Typography>
            </MessageContainer>
          </Section>

          <Section>
            <SectionTitleContainer>
              <Chat />
              <Typography color="textPrimary" variant="subtitle1">
                Limitations
              </Typography>
            </SectionTitleContainer>
            <MessageContainer>
              <Typography color="textPrimary" variant="body2">
                "Explain quantum computing in simple terms"
              </Typography>
            </MessageContainer>

            <MessageContainer>
              <Typography color="textPrimary" variant="body2">
                "Explain quantum computing in simple terms"
              </Typography>
            </MessageContainer>

            <MessageContainer>
              <Typography color="textPrimary" variant="body2">
                "Explain quantum computing in simple terms"
              </Typography>
            </MessageContainer>
          </Section>
        </ExamplesAndCapabilitiesContainer>
      </TitleAndExamplesContainer>
    </Container>
  );
};

const Container = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 200px;
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
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const MessageContainer = styled.div`
  background-color: ${({ theme }) => theme.palette?.grey[100]};
  padding: 4px 8px;
  max-width: 280px;
  width: 100%;
`;
