// Google Docs API Integration
// Uses Google API Client (gapi) for Docs API calls and
// Google Identity Services (GIS) for OAuth 2.0 authentication.

// Import necessary types
declare global {
  interface Window {
    gapi: any;
    google: any;
    tokenClient: any; // To store the GIS token client
  }
}

// API initialization state
let isGapiClientInitialized = false;
let gisTokenClientInitialized = false;
let currentAccessToken: string | null = null;

// --- Initialization ---

// Helper to load scripts dynamically
const loadScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = (error) =>
      reject(`Failed to load script: ${src}. Error: ${error}`);
    document.head.appendChild(script);
  });
};

// Initialize the Google API Client (for Docs API calls)
const initializeGapiClient = async (): Promise<void> => {
  await window.gapi.client.init({
    apiKey: "AIzaSyAFxhkU1iY0msucre7HVt_-N0_-MTCTYYw",
    // No clientId/scope here, GIS handles token acquisition
    discoveryDocs: ["https://docs.googleapis.com/$discovery/rest?version=v1"],
  });
  isGapiClientInitialized = true;
};

// Initialize the Google Identity Services Token Client
const initializeGisTokenClient = (): void => {
  window.tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id:
      "371332690489-2ho37umrd8pgi66d2p7n3jk77n9gfsiq.apps.googleusercontent.com",
    scope: "https://www.googleapis.com/auth/documents",
    callback: (tokenResponse: any) => {
      // This callback handles the token response
      if (tokenResponse && tokenResponse.access_token) {
        currentAccessToken = tokenResponse.access_token;
        window.gapi.client.setToken({ access_token: currentAccessToken }); // Set token for gapi

        // Potentially trigger actions that were waiting for auth
      } else {
        currentAccessToken = null;
        window.gapi.client.setToken(null); // Clear token
        console.error("Failed to get access token from GIS.", tokenResponse);
        // Handle error - maybe prompt user again or show message
      }
    },
    error_callback: (error: any) => {
      // Handle errors during token request
      console.error("GIS Token Client Error:", error);
      currentAccessToken = null;
      window.gapi.client.setToken(null);
      // Handle error appropriately
    },
  });
  gisTokenClientInitialized = true;
};

// Main initialization function called from App.tsx
export const initGoogleDocsApi = async (): Promise<boolean> => {
  // Prevent double initialization
  if (isGapiClientInitialized && gisTokenClientInitialized) {
    return true;
  }

  try {
    // Load gapi first, then initialize client
    await loadScript("https://apis.google.com/js/api.js");
    await new Promise<void>((resolve) => window.gapi.load("client", resolve)); // Load only 'client'
    await initializeGapiClient();

    // Load GIS, then initialize token client
    await loadScript("https://accounts.google.com/gsi/client");
    // GIS initializes automatically after script load, wait a bit or use a more robust check if needed
    await new Promise((resolve) => setTimeout(resolve, 500)); // Small delay to ensure google.accounts is ready
    if (window.google?.accounts?.oauth2) {
      initializeGisTokenClient();
    } else {
      throw new Error("Google Identity Services (GIS) failed to load.");
    }

    return true;
  } catch (error) {
    console.error("Error initializing Google Docs API integration:", error);
    isGapiClientInitialized = false; // Reset flags on failure
    gisTokenClientInitialized = false;
    return false;
  }
};

// --- Authentication ---

// Authenticate the user using GIS Token Client
export const authenticateUser = async (): Promise<boolean> => {
  // Ensure everything is initialized
  if (!isGapiClientInitialized || !gisTokenClientInitialized) {
    const initialized = await initGoogleDocsApi();
    if (!initialized) {
      console.error("Initialization failed during authentication attempt.");
      return false;
    }
    // Add a small delay after re-initialization if needed
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  // Check if we already have a valid token (basic check)
  if (currentAccessToken) {
    // You might add token expiration checks here in a real app
    return true;
  }

  // If no token, request one. The callback in initTokenClient handles the response.
  return new Promise((resolve, reject) => {
    // Declare callbacks here to ensure they are in scope for catch block
    let originalCallback: any;
    let originalErrorCallback: any;

    try {
      // Define a temporary callback to resolve this promise once the token is received (or fails)
      originalCallback = window.tokenClient.callback;
      originalErrorCallback = window.tokenClient.error_callback;

      window.tokenClient.callback = (tokenResponse: any) => {
        originalCallback(tokenResponse); // Call the original handler
        window.tokenClient.callback = originalCallback; // Restore original
        window.tokenClient.error_callback = originalErrorCallback;
        if (tokenResponse && tokenResponse.access_token) {
          resolve(true); // Authentication successful
        } else {
          resolve(false); // Authentication failed (no token)
        }
      };

      window.tokenClient.error_callback = (error: any) => {
        originalErrorCallback(error); // Call the original handler
        window.tokenClient.callback = originalCallback; // Restore original
        window.tokenClient.error_callback = originalErrorCallback;
        resolve(false); // Authentication failed (error)
      };

      // Trigger the GIS token request flow
      window.tokenClient.requestAccessToken({ prompt: "" }); // Use '' for default prompt, or 'consent' if needed
    } catch (error) {
      console.error("Error requesting access token:", error);
      // Restore callbacks in case of immediate error, only if they were assigned
      if (originalCallback) window.tokenClient.callback = originalCallback;
      if (originalErrorCallback)
        window.tokenClient.error_callback = originalErrorCallback;
      reject(error); // Reject the promise
    }
  });
};

// --- API Operations ---

// Helper function to ensure authentication before API calls
const ensureAuthenticated = async (): Promise<boolean> => {
  if (!currentAccessToken) {
    return await authenticateUser();
  }
  // Add token expiry check here if necessary
  return true;
};

// Create a new Google Doc
export const createGoogleDoc = async (
  title: string
): Promise<string | null> => {
  const authenticated = await ensureAuthenticated();
  if (!authenticated) {
    console.error("Authentication required to create document.");
    alert("Authentication failed. Cannot create Google Doc.");
    return null;
  }

  if (!window.gapi?.client?.docs) {
    console.error("gapi.client.docs not available.");
    alert("Google Docs API client is not ready.");
    return null;
  }

  try {
    // Create a new document
    const response = await window.gapi.client.docs.documents.create({
      // The request body goes directly here for gapi.client
      title: title,
    });

    const documentId = response.result.documentId;

    return documentId;
  } catch (error: any) {
    console.error("Error creating Google Doc:", error);
    // Check for specific auth errors (though GIS handles most now)
    if (error.status === 401 || error.status === 403) {
      console.warn("Authentication error during create. Clearing token.");
      currentAccessToken = null;
      window.gapi.client.setToken(null);
      alert("Authentication error. Please try authenticating again.");
    } else {
      alert(
        `Error creating Google Doc: ${
          error.result?.error?.message || error.message || "Unknown error"
        }`
      );
    }
    return null;
  }
};

// Update a Google Doc with content using batchUpdate
export const updateGoogleDoc = async (
  documentId: string,
  content: string
): Promise<boolean> => {
  const authenticated = await ensureAuthenticated(); // Ensure authentication first
  if (!authenticated) {
    console.error("Authentication required to update document.");
    alert("Authentication failed. Cannot update Google Doc.");
    return false;
  }

  if (!window.gapi?.client?.docs) {
    console.error("gapi.client.docs not available.");
    alert("Google Docs API client is not ready.");
    return false;
  }

  try {
    // --- Modification Start: Parse content and build requests ---
    const requests: any[] = [];
    const urlRegex = /(https?:\/\/[^\s]+)/g; // Regex to find URLs
    let lastIndex = 0;
    let currentIndex = 1; // Start index in Google Docs body is 1

    let match;
    while ((match = urlRegex.exec(content)) !== null) {
      const url = match[0];
      const urlStartIndex = match.index;
      const textBefore = content.substring(lastIndex, urlStartIndex);

      // 1. Insert text before the URL
      if (textBefore.length > 0) {
        requests.push({
          insertText: {
            location: { index: currentIndex },
            text: textBefore,
          },
        });
        currentIndex += textBefore.length;
      }

      // 2. Insert the URL text
      const urlLength = url.length;
      requests.push({
        insertText: {
          location: { index: currentIndex },
          text: url,
        },
      });

      // 3. Apply link style to the inserted URL text
      requests.push({
        updateTextStyle: {
          range: {
            startIndex: currentIndex,
            endIndex: currentIndex + urlLength,
          },
          textStyle: {
            link: {
              url: url, // Set the URL for the link
            },
          },
          fields: "link", // Specify that we are updating the link property
        },
      });

      currentIndex += urlLength;
      lastIndex = urlStartIndex + urlLength;
    }

    // 4. Insert any remaining text after the last URL
    const textAfter = content.substring(lastIndex);
    if (textAfter.length > 0) {
      requests.push({
        insertText: {
          location: { index: currentIndex },
          text: textAfter,
        },
      });
    }

    // Update the document if there are requests to process
    if (requests.length > 0) {
      await window.gapi.client.docs.documents.batchUpdate({
        documentId: documentId,
        requests: requests,
      });
      console.log("Google Doc updated with links.");
    } else {
      console.log("No content changes needed for Google Doc.");
    }

    return true;
  } catch (error: any) {
    console.error("Error updating Google Doc:", error);
    if (error.status === 401 || error.status === 403) {
      console.warn("Authentication error during update. Clearing token.");
      currentAccessToken = null;
      window.gapi.client.setToken(null);
      alert(
        "Authentication expired or failed. Please try opening the doc again to re-authenticate."
      );
    } else {
      alert(`Error updating Google Doc: ${error.message || "Unknown error"}`);
    }
    return false;
  }
};

// Create a Google Doc, update it with content, and return the URL
export const createAndUpdateGoogleDoc = async (
  title: string,
  content: string
): Promise<string | null> => {
  const documentId = await createGoogleDoc(title);
  if (!documentId) {
    return null;
  }

  // Update the newly created document with content and links
  const updated = await updateGoogleDoc(documentId, content);

  if (!updated) {
    // Handle update failure - maybe delete the created doc or notify user
    console.error(`Failed to update document ${documentId} after creation.`);
    // Optionally try to delete the empty doc here
    return null; // Indicate failure
  }

  // Return the URL to the updated document
  return `https://docs.google.com/document/d/${documentId}/edit`;
};

// Open a Google Doc URL in a new tab (remains the same)
export const openGoogleDoc = (url: string): void => {
  if (url) {
    window.open(url, "_blank", "noopener,noreferrer");
  } else {
    console.error("Cannot open Google Doc: URL is missing.");
    alert("Could not get the Google Doc URL to open.");
  }
};
