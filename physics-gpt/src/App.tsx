import React, { useEffect } from "react";

import { initGoogleDocsApi } from "./utils/googleDocsApi";
import { Sidebar } from "./components/Sidebar";
import styled from "styled-components";
import { MainPage } from "./components/MainPage";

export const App = () => {
  // Initialize the Google Docs API when the application starts
  useEffect(() => {
    const initializeGoogleDocsApi = async () => {
      try {
        const initialized = await initGoogleDocsApi();
        if (initialized) {
          console.log("Google Docs API initialized successfully in App.tsx");
        } else {
          console.warn("Failed to initialize Google Docs API in App.tsx");
        }
      } catch (error) {
        console.error("Error initializing Google Docs API in App.tsx:", error);
      }
    };

    initializeGoogleDocsApi();
  }, []);

  return (
    <Container>
      <SidebarAndMainPageContainer>
        <Sidebar />
        <MainPage />
      </SidebarAndMainPageContainer>
    </Container>
  );
};

const Container = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
`;

const SidebarAndMainPageContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  height: 100%;
  width: 100%;
`;
