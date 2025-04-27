# PhysicsGPT

A React application that helps users generate physics papers and export them to Google Docs.

## Features

- Generate physics papers with AI assistance
- Export papers to PDF
- Export papers to Google Docs with proper formatting
- Rich text editor for editing generated content

## Google Docs API Integration

This application uses the Google Docs API to create and update documents. To use this feature, you need to set up Google API credentials.

### Setting Up Google API Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Docs API for your project
   - Go to "APIs & Services" > "Library"
   - Search for "Google Docs API" and enable it
4. Create OAuth 2.0 credentials
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Select "Web application" as the application type
   - Add your application's domain to the "Authorized JavaScript origins"
   - Add your application's redirect URI to the "Authorized redirect URIs"
   - Click "Create"
5. Create an API key
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API key"
   - Copy the API key

### Environment Variables

Create a `.env` file in the root of the project with the following variables:

```
REACT_APP_GOOGLE_API_KEY=your_google_api_key
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
REACT_APP_CHAT_GPT_API_KEY=your_openai_api_key
```

Replace `your_google_api_key` and `your_google_client_id` with the values from the Google Cloud Console.

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up the environment variables as described above
4. Start the development server:
   ```
   npm start
   ```

## How the Google Docs Integration Works

The application uses the Google Docs API to create and update documents. The process is as follows:

1. When the user clicks "Open in Google Docs", the application:
   - Initializes the Google Docs API
   - Authenticates the user with Google
   - Creates a new Google Doc with the paper title
   - Waits for the document to be fully created
   - Updates the document with the paper content
   - Opens the document in a new tab

2. If the Google Docs API is not available or fails, the application falls back to a simpler approach:
   - Creates a URL with the paper title and content
   - Opens the URL in a new tab, which will prompt the user to create a new Google Doc

## Dependencies

- React
- Material-UI
- Styled Components
- Google API Client Library (gapi)
- Google Identity Services (GIS) 