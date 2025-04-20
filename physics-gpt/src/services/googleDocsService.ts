const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const createGoogleDoc = async (content: string, title: string) => {
  try {
    console.log('Creating Google Doc with content:', content.substring(0, 100) + '...');
    
    const response = await fetch(`${API_URL}/google-docs/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content, title }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error response:', errorData);
      throw new Error(errorData.error || 'Failed to create Google Doc');
    }

    const data = await response.json();
    console.log('Google Doc created with ID:', data.documentId);
    
    return data.documentId;
  } catch (error) {
    console.error('Error creating Google Doc:', error);
    throw error;
  }
};

export const getGoogleDoc = async (documentId: string) => {
  try {
    const response = await fetch(`${API_URL}/google-docs/${documentId}`);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error response:', errorData);
      throw new Error(errorData.error || 'Failed to get Google Doc');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting Google Doc:', error);
    throw error;
  }
}; 