import React from "react";
import styled from "styled-components";
import { MainPage } from "./components/MainPage";
import { Sidebar } from "./components/Sidebar";

export const App = () => {
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
