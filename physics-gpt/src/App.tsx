import React from "react";
import styled from "styled-components";
import { MainPage } from "./components/MainPage";

export const App = () => {
  return (
    <Container>
      <MainPage />
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
