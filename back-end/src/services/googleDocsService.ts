import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import dotenv from "dotenv";

dotenv.config();

class GoogleDocsService {
  private oauth2Client: OAuth2Client;
  private docs: any;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    this.docs = google.docs({ version: "v1", auth: this.oauth2Client });
  }

  // Generate OAuth URL for user authentication
  getAuthUrl(): string {
    const scopes = [
      "https://www.googleapis.com/auth/documents",
      "https://www.googleapis.com/auth/drive.file",
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
      prompt: "consent",
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    });
  }

  // Handle OAuth callback and get tokens
  async handleAuthCallback(
    code: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);

      if (tokens.access_token) {
        this.accessToken = tokens.access_token;
      }

      if (tokens.refresh_token) {
        this.refreshToken = tokens.refresh_token;
      }

      this.oauth2Client.setCredentials(tokens);

      return {
        accessToken: tokens.access_token || "",
        refreshToken: tokens.refresh_token || "",
      };
    } catch (error) {
      console.error("Error getting tokens");
      throw error;
    }
  }

  // Set credentials directly (for testing or when tokens are already available)
  setCredentials(accessToken: string, refreshToken?: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken || null;

    this.oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  }

  async createDocument(content: string, title: string): Promise<string> {
    try {
      if (!this.accessToken) {
        throw new Error(
          "No access token available. Please authenticate first."
        );
      }

      // Create a new document
      const response = await this.docs.documents.create({
        requestBody: {
          title: title,
        },
      });

      const documentId = response.data.documentId;

      if (!documentId) {
        throw new Error("Failed to create document: No document ID returned");
      }

      // Insert content into the document
      await this.docs.documents.batchUpdate({
        documentId: documentId,
        requestBody: {
          requests: [
            {
              insertText: {
                location: {
                  index: 1,
                },
                text: content,
              },
            },
          ],
        },
      });

      return documentId;
    } catch (error) {
      console.error("Error creating Google Doc");
      throw error;
    }
  }

  async getDocument(documentId: string) {
    try {
      if (!this.accessToken) {
        throw new Error(
          "No access token available. Please authenticate first."
        );
      }

      const response = await this.docs.documents.get({
        documentId: documentId,
      });
      return response.data;
    } catch (error) {
      console.error("Error getting Google Doc");
      throw error;
    }
  }
}
export default new GoogleDocsService();
