import { Add, Awake, Moon, Pdf } from "@carbon/icons-react";
import {
  Button,
  Divider,
  Theme,
  Typography,
  useTheme,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { styled } from "styled-components";
import { useThemeContext } from "../contexts/ThemeContext";
import { useUserContext } from "../contexts/UserContext";
import { getAllPdfs } from "../utils/indexedDb";

interface StoredPdf {
  id: number;
  filename: string;
  date: Date;
  query: string;
  pdfData: Blob;
}

export const Sidebar = () => {
  const theme = useTheme();
  const { toggleTheme, isDarkMode } = useThemeContext();
  const { hasModelResponse, setHasModelResponse } = useUserContext();
  const [savedPdfs, setSavedPdfs] = useState<StoredPdf[]>([]);

  useEffect(() => {
    fetchSavedPdfs();
  }, [hasModelResponse]);

  const fetchSavedPdfs = async () => {
    try {
      const pdfs = await getAllPdfs();
      setSavedPdfs(
        pdfs.map((pdf) => ({
          ...pdf,
          date: new Date(pdf.date),
        }))
      );
    } catch (error) {
      console.error("Error fetching PDFs from IndexedDB:", error);
      setSavedPdfs([]);
    }
  };

  const openPdf = (pdf: StoredPdf) => {
    const url = URL.createObjectURL(pdf.pdfData);
    window.open(url, "_blank");
  };

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

        {savedPdfs.length > 0 ? (
          <List sx={{ width: "100%", padding: 0 }}>
            {savedPdfs.map((pdf) => (
              <ListItem
                key={pdf.id}
                onClick={() => openPdf(pdf)}
                sx={{
                  cursor: "pointer",
                  borderRadius: "8px",
                  "&:hover": {
                    backgroundColor: theme.palette.action.hover,
                  },
                }}
                title={pdf.query}
              >
                <ListItemIcon sx={{ minWidth: "36px" }}>
                  <Pdf size={20} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography noWrap variant="body2">
                      {pdf.query.length > 25
                        ? pdf.query.substring(0, 25) + "..."
                        : pdf.query}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="caption" color="textSecondary">
                      {new Date(pdf.date).toLocaleDateString()}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{ fontStyle: "italic" }}
          >
            No saved research yet
          </Typography>
        )}
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
  max-width: 282px;
  height: 100%;
  width: 100%;
`;

const ResultsContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 5;
  overflow-y: auto;
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
