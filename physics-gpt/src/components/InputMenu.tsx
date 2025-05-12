import { DocumentAdd } from "@carbon/icons-react";
import { Menu, MenuItem, Slider, Typography } from "@mui/material";
import { useRef } from "react";
import { styled } from "styled-components";
import { uploadFileAndAddToVectorStore } from "../utils/fileUploadToOpenAi";

export const InputMenu = ({
  isOpen,
  onClose,
  temperature,
  setTemperature,
  anchorEl,
}: {
  isOpen: boolean;
  onClose: () => void;
  temperature: number;
  setTemperature: React.Dispatch<React.SetStateAction<number>>;
  anchorEl: HTMLElement | null;
  setSelectedFile?: React.Dispatch<React.SetStateAction<File | null>>;
}) => {
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  return (
    <Menu
      open={isOpen}
      onClose={onClose}
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      transformOrigin={{ vertical: "bottom", horizontal: "right" }}
    >
      <StyledMenuItem
        sx={{
          padding: "8px",
        }}
        onClick={() => {
          if (hiddenInputRef.current) {
            hiddenInputRef.current.click();
          }
        }}
      >
        <DocumentAdd />

        <Typography variant="body2" color="textPrimary">
          Upload file
        </Typography>
      </StyledMenuItem>
      <TemperatureSlider>
        <Typography variant="body2" sx={{ mr: 1 }} whiteSpace={"nowrap"}>
          Weight: {temperature.toFixed(1)}
        </Typography>
        <Slider
          aria-label="Temperature"
          value={temperature}
          onChange={(event, newValue) => setTemperature(newValue as number)}
          step={0.1}
          min={0.1}
          max={1.0}
          size="small"
          sx={{ width: 50, mr: 1 }}
        />
      </TemperatureSlider>
      <HiddenInput
        type="file"
        id="file-upload"
        ref={hiddenInputRef}
        onChange={async (event) => {
          const file = event.target.files?.[0];
          if (file) {
            const result = await uploadFileAndAddToVectorStore(
              file,
              "deep_research_knowledge"
            );
            console.log("File uploaded successfully:", result);
          }
          onClose();
        }}
      />
    </Menu>
  );
};

const StyledMenuItem = styled(MenuItem)`
  gap: 8px;
`;

const TemperatureSlider = styled.div`
  align-items: center;
  display: flex;
  gap: 8px;
  padding: 8px;
`;

const HiddenInput = styled.input`
  display: none;
`;
