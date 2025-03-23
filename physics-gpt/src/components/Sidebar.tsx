import { Add, Awake, Moon } from "@carbon/icons-react";
import { Button, Divider, Theme, Typography, useTheme } from "@mui/material";
import React from "react";
import { styled } from "styled-components";
import { useThemeContext } from "../contexts/ThemeContext";
import { useUserContext } from "../contexts/UserContext";

export const Sidebar = () => {
  const theme = useTheme();
  const { toggleTheme, isDarkMode } = useThemeContext();
  const { hasModelResponse, setHasModelResponse } = useUserContext();

  return (
    <Container theme={theme}>
      <ResultsContainer>
        <Button
          size="medium"
          variant="contained"
          color="secondary"
          startIcon={<Add size={26} />}
          fullWidth
          disabled={!hasModelResponse}
          onClick={() => {
            setHasModelResponse(false);
          }}
        >
          New chat
        </Button>
        <Typography variant="subtitle2" color="textSecondary">
          Previous Results
        </Typography>
      </ResultsContainer>

      <AdditionalButtonsContainer>
        <Divider />
        <Button
          size="medium"
          color="secondary"
          variant="contained"
          startIcon={isDarkMode ? <Awake /> : <Moon />}
          onClick={toggleTheme}
        >
          {isDarkMode ? "Light Mode" : "Dark Mode"}
        </Button>
      </AdditionalButtonsContainer>
    </Container>
  );
};

const Container = styled.div<{ theme: Theme }>`
  align-items: center;
  border-right: 1px solid ${(props) => props.theme.palette.divider};
  display: flex;
  padding: 32px;
  gap: 8px;
  flex-direction: column;
  overflow-y: auto;
  max-width: 282px;
  height: 100%;
  width: 100%;
`;

const ResultsContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 5;
  gap: 16px;
  width: 100%;
`;

const AdditionalButtonsContainer = styled.div`
  display: flex;
  gap: 16px;
  flex-direction: column;
  flex: 1;
  width: 100%;
`;
