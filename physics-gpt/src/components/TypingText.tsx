import React, { useEffect, useState } from "react";
import styled from "styled-components";

export const TypingText = ({
  text,
  speed = 30,
}: {
  text: string;
  speed?: number;
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    setShowCursor(true);

    let i = 0;
    const stringResponse = text;

    const intervalId = setInterval(() => {
      setDisplayedText(stringResponse.slice(0, i));

      i++;

      if (i > stringResponse.length) {
        clearInterval(intervalId);
        setShowCursor(false);
      }
    }, speed);

    return () => clearInterval(intervalId);
  }, [speed, text]);

  console.log(showCursor);

  return (
    <span>
      {displayedText}
      {showCursor && <Cursor>|</Cursor>}
    </span>
  );
};

const Cursor = styled.span`
  display: inline-block;
  width: 1px;
  background-color: black;
  animation: blink 1s step-end infinite;
  margin-left: 2px;

  @keyframes blink {
    from,
    to {
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
  }
`;
