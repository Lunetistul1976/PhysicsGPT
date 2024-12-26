import React from "react";
import styled from "styled-components";
import { IconButton, TextField, Typography, useTheme } from "@mui/material";
import {
  Chat,
  DataEnrichment,
  LogoReact,
  Send,
  WarningAlt,
  Image,
} from "@carbon/icons-react";

export const MainPage = () => {
  const theme = useTheme();
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
              <Chat size={24} />
              <Typography color="textPrimary" variant="h6">
                Examples
              </Typography>
            </SectionTitleContainer>
            <MessageContainer bgColor={theme.palette.primary.light}>
              <Typography color="textPrimary" variant="body2">
                What is the difference between classical mechanics and quantum
                mechanics?
              </Typography>
            </MessageContainer>

            <MessageContainer bgColor={theme.palette.primary.light}>
              <Typography color="textPrimary" variant="body2">
                Explain the theory of relativity in simple terms.
              </Typography>
            </MessageContainer>

            <MessageContainer bgColor={theme.palette.primary.light}>
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
            <MessageContainer bgColor={theme.palette.primary.light}>
              <Typography color="textPrimary" variant="body2">
                Able to break down complex physics concepts into simpler
                explanations.
              </Typography>
            </MessageContainer>

            <MessageContainer bgColor={theme.palette.primary.light}>
              <Typography color="textPrimary" variant="body2">
                Provides insights into theoretical and applied physics topics.
              </Typography>
            </MessageContainer>

            <MessageContainer bgColor={theme.palette.primary.light}>
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
            <MessageContainer bgColor={theme.palette.primary.light}>
              <Typography color="textPrimary" variant="body2">
                May not account for the most recent physics research or
                experimental results.
              </Typography>
            </MessageContainer>

            <MessageContainer bgColor={theme.palette.primary.light}>
              <Typography color="textPrimary" variant="body2">
                Cannot perform complex physics calculations or numerical
                simulations.
              </Typography>
            </MessageContainer>

            <MessageContainer bgColor={theme.palette.primary.light}>
              <Typography color="textPrimary" variant="body2">
                Responses may not fully address niche or controversial physics
                topics.
              </Typography>
            </MessageContainer>
          </Section>
        </ExamplesAndCapabilitiesContainer>
      </TitleAndExamplesContainer>
      <InputContainer>
        <StyledTextField
          fullWidth
          autoComplete="off"
          color="secondary"
          bgColor={theme.palette.primary.light}
          slotProps={{
            input: {
              endAdornment: (
                <IconButton>
                  <Send size={20} />
                </IconButton>
              ),
              startAdornment: (
                <IconButton>
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

const Container = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 232px;
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

const MessageContainer = styled.div<{ bgColor: string }>`
  background-color: ${({ bgColor }) => bgColor};
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

const StyledTextField = styled(TextField)<{ bgColor: string }>`
  max-width: 760px;
  & .MuiOutlinedInput-root {
    border-radius: 16px;
    background-color: ${({ bgColor }) => bgColor};
  }
`;
