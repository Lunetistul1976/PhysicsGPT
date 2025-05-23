import React, { useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Container, Paper } from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";

const modules = {
  toolbar: [
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "image"],
  ],
};

export const RichTextEditor = ({
  content,
  setContent,
}: {
  content: string;
  setContent: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const quillRef = useRef<ReactQuill>(null);
  const theme = useTheme();

  return (
    <Container maxWidth="md">
      <Paper
        elevation={3}
        style={{
          backgroundColor: theme.palette.background.default,
        }}
      >
        <StyledQuillContainer>
          <ReactQuill
            ref={quillRef}
            value={content}
            onChange={setContent}
            modules={modules}
          />
        </StyledQuillContainer>
      </Paper>
    </Container>
  );
};

const StyledQuillContainer = styled("div")(({ theme }) => ({
  width: "100%",
  height: "100%",

  "& .ql-container": {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    borderBottomLeftRadius: "8px",
    borderBottomRightRadius: "8px",
    border: `1px solid ${theme.palette.divider}`,
    borderTop: "none",
    maxHeight: "600px",
  },

  "& .ql-toolbar": {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    borderTopLeftRadius: "8px",
    borderTopRightRadius: "8px",
    border: `1px solid ${theme.palette.divider}`,
  },

  "& .ql-toolbar button": {
    color: theme.palette.text.primary,
  },

  "& .ql-toolbar button:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },

  "& .ql-editor": {
    maxHeight: "500px",
  },

  // Target all SVG elements and paths in toolbar buttons
  "& .ql-toolbar button svg, & .ql-toolbar button svg *, & .ql-toolbar .ql-stroke":
    {
      color: theme.palette.text.primary + " !important",
    },

  // Fix for stroke-based icons
  "& .ql-toolbar .ql-stroke, & .ql-toolbar .ql-stroke-miter": {
    stroke: theme.palette.text.primary + " !important",
  },

  // Fix for fill-based icons
  "& .ql-toolbar .ql-fill": {
    fill: theme.palette.text.primary + " !important",
  },

  // Add different hover color for dark mode
  ...(theme.palette.mode === "dark" && {
    "& .ql-toolbar button:hover, & .ql-pdf:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
  }),

  // Add different hover color for light mode
  ...(theme.palette.mode === "light" && {
    "& .ql-toolbar button:hover, & .ql-pdf:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.05)",
    },
  }),
}));

export default RichTextEditor;
