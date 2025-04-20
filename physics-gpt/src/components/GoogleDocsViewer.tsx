import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

interface GoogleDocsViewerProps {
  documentId: string;
  width?: string;
  height?: string;
}

const ViewerContainer = styled.div`
  width: 100%;
  height: 100%;
  min-height: 500px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
`;

const GoogleDocsViewer: React.FC<GoogleDocsViewerProps> = ({ 
  documentId, 
  width = '100%', 
  height = '100%' 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load the Google Docs API script
    const script = document.createElement('script');
    script.src = 'https://docs.google.com/viewer?url=';
    script.async = true;
    script.onload = () => setIsLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  if (!isLoaded) {
    return <div>Loading Google Docs viewer...</div>;
  }

  // Use the edit URL to allow editing
  const embedUrl = `https://docs.google.com/document/d/${documentId}/edit`;

  return (
    <ViewerContainer>
      <iframe
        src={embedUrl}
        width={width}
        height={height}
        frameBorder="0"
        allowFullScreen
        title="Google Docs Viewer"
      />
    </ViewerContainer>
  );
};

export default GoogleDocsViewer; 