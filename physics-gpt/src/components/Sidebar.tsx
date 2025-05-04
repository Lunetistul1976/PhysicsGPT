import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  Button,
  Divider,
  Typography,
  CircularProgress,
  List,
  Box,
  useTheme,
  MenuItem,
} from "@mui/material";
import { Add, Awake, Moon } from "@carbon/icons-react";
import { useThemeContext } from "../contexts/ThemeContext";
import { useUserContext } from "../contexts/UserContext";
import { getAllHistory, HistoryRecord } from "../utils/indexedDbUtils";
import { openGoogleDoc } from "../utils/googleDocsApi";

export const Sidebar = () => {
  const theme = useTheme();
  const { toggleTheme, isDarkMode } = useThemeContext();
  const { hasModelResponse, setHasModelResponse } = useUserContext();
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [errorHistory, setErrorHistory] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoadingHistory(true);
      setErrorHistory(null);
      try {
        const records = await getAllHistory();
        setHistory(records);
      } catch (error) {
        console.error("Failed to fetch history:", error);
        setErrorHistory("Could not load history.");
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchHistory();
  }, [hasModelResponse]);

  const handleNewChat = () => {
    setHasModelResponse(false);
  };

  const handleHistoryItemClick = (docId: string) => {
    console.log("Opening Google Doc with ID:", docId);
    const docUrl = `https://docs.google.com/document/d/${docId}/edit`;
    openGoogleDoc(docUrl);
  };

  return (
    <Container theme={theme}>
      <Button
        size="medium"
        variant="contained"
        color="secondary"
        startIcon={<Add size={26} />}
        fullWidth
        disabled={!hasModelResponse}
        onClick={handleNewChat}
      >
        New chat
      </Button>
      <Divider sx={{ my: 1 }} />
      <Typography variant="overline">History</Typography>
      <HistoryList>
        {isLoadingHistory ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : errorHistory ? (
          <Typography color="error" sx={{ p: 2 }}>
            {errorHistory}
          </Typography>
        ) : history.length === 0 ? (
          <Typography
            sx={{ p: 2, textAlign: "center", color: "text.secondary" }}
          >
            No history yet.
          </Typography>
        ) : (
          history.map((item) => (
            <StyledMenuItem
              onClick={() => handleHistoryItemClick(item.docId)}
              title={item.title}
              key={item.docId}
            >
              <Typography variant="body2" noWrap>
                {item.title}
              </Typography>
            </StyledMenuItem>
          ))
        )}
      </HistoryList>
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
    </Container>
  );
};

const Container = styled.div`
  align-items: center;
  border-right: 1px solid ${(props) => props.theme.palette.divider};
  display: flex;
  padding: 32px;
  gap: 8px;
  flex-direction: column;
  max-width: 282px;
  height: 100%;
  width: 100%;
`;

const HistoryList = styled(List)`
  flex-grow: 1;
  overflow-y: auto;
`;

const StyledMenuItem = styled(MenuItem)`
  align-items: center;
  display: flex;
  max-width: 282px;
  gap: 8px;
  width: 100%;
`;
