import React from "react";
import styled from "styled-components";
import { Typography } from "@mui/material";
import { LogoReact } from "@carbon/icons-react";

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
      </TitleAndExamplesContainer>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 200px;
  padding: 32px;
  height: 100%;
`;

const TitleAndExamplesContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 80px;
`;

const TitleAndLogoContainer = styled.div`
  align-items: center;
  display: flex;
  gap: 16px;
`;
