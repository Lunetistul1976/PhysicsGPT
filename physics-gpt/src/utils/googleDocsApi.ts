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
  console.log("gapi.client initialized for Docs API.");
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
        console.log("Access token obtained and set for gapi.client.");
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
  console.log("GIS Token Client initialized.");
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

    console.log("Google Docs API integration fully initialized.");
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
    console.log("API not fully initialized. Attempting initialization...");
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
    console.log("User already has an access token.");
    // You might add token expiration checks here in a real app
    return true;
  }

  // If no token, request one. The callback in initTokenClient handles the response.
  return new Promise((resolve, reject) => {
    // Declare callbacks here to ensure they are in scope for catch block
    let originalCallback: any;
    let originalErrorCallback: any;

    try {
      console.log("Requesting access token via GIS...");
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
    console.log("Not authenticated, attempting to authenticate...");
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
    console.log("Creating Google Doc via API...");
    // Create a new document
    const response = await window.gapi.client.docs.documents.create({
      // The request body goes directly here for gapi.client
      title: title,
    });

    const documentId = response.result.documentId;
    console.log("Created Google Doc with ID:", documentId);
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
  content: string // Assuming plain text for simplicity now
): Promise<boolean> => {
  const authenticated = await ensureAuthenticated();
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
    console.log(`Updating Google Doc (ID: ${documentId}) via batchUpdate...`);
    // Basic request to insert text at the beginning
    const requests = [
      {
        insertText: {
          location: {
            index: 1, // Start of the document body
          },
          text: content,
        },
      },
      // Add more requests here for formatting if needed
    ];

    // Update the document
    await window.gapi.client.docs.documents.batchUpdate({
      documentId: documentId,
      // The request body goes directly here for gapi.client
      requests: requests,
    });

    console.log("Updated Google Doc with content successfully.");
    return true;
  } catch (error: any) {
    console.error("Error updating Google Doc:", error);
    if (error.status === 401 || error.status === 403) {
      console.warn("Authentication error during update. Clearing token.");
      currentAccessToken = null;
      window.gapi.client.setToken(null);
      alert("Authentication error. Please try authenticating again.");
    } else {
      alert(
        `Error updating Google Doc: ${
          error.result?.error?.message || error.message || "Unknown error"
        }`
      );
    }
    return false;
  }
};

// --- Combined Operation & Opening ---

// Helper function to strip HTML tags (remains the same)
const stripHtmlTags = (html: string): string => {
  try {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  } catch (e) {
    console.error("Error stripping HTML:", e);
    return html; // Fallback to original if parsing fails
  }
};

// Create a Google Doc, update it with content, and return the URL
export const createAndUpdateGoogleDoc = async (
  title: string,
  htmlContent: string // Accept HTML content
): Promise<string | null> => {
  // Authentication is handled within createGoogleDoc and updateGoogleDoc

  // Create the document
  const documentId = await createGoogleDoc(title);
  if (!documentId) {
    console.error("Failed to create the document initially.");
    return null; // Error already alerted in createGoogleDoc
  }

  // Convert HTML to plain text for insertion
  // TODO: Implement proper HTML to Google Docs format conversion for rich text
  const plainTextContent = stripHtmlTags(htmlContent);

  if (!plainTextContent) {
    console.warn(
      "No text content found after stripping HTML. Document created but not updated."
    );
    // Return the URL even if content is empty, as the doc exists
    return `https://docs.google.com/document/d/${documentId}/edit`;
  }

  // Wait a moment for the document to be fully ready on Google's side (optional but sometimes helpful)
  // await new Promise((resolve) => setTimeout(resolve, 1500));

  // Update the document with content
  const updated = await updateGoogleDoc(documentId, plainTextContent);
  if (!updated) {
    console.error("Failed to update the document with content.");
    // Document was created, but update failed. Still return URL? Or null?
    // Let's return the URL so the user can access the empty doc.
    // Error was already alerted in updateGoogleDoc.
    return `https://docs.google.com/document/d/${documentId}/edit`;
  }

  console.log("Document created and updated successfully.");
  // Return the document URL
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
