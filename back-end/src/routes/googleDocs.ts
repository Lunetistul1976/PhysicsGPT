import express, { Request, Response, Router, RequestHandler } from "express";
import googleDocsService from "../services/googleDocsService";

const router: Router = express.Router();

// Get authentication URL
router.get("/auth/url", ((req: Request, res: Response) => {
  try {
    const authUrl = googleDocsService.getAuthUrl();
    res.setHeader('Content-Type', 'application/json');
    res.json({ authUrl });
  } catch (error) {
    console.error("Error generating auth URL:", error);
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({ error: "Failed to generate authentication URL" });
  }
}) as RequestHandler);

// Handle OAuth callback
router.get("/auth/callback", (async (req: Request, res: Response) => {
  try {
    const { code } = req.query;

    if (!code || typeof code !== "string") {
      res.setHeader('Content-Type', 'application/json');
      return res.status(400).json({ error: "Authorization code is required" });
    }

    const tokens = await googleDocsService.handleAuthCallback(code);

    // Send an HTML response that will post the message to the opener window
    res.setHeader('Content-Type', 'text/html');
    res.send(`
      <html>
        <body>
          <script>
            window.opener.postMessage({ code: "${code}" }, "${req.headers.origin}");
            window.close();
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Error handling auth callback:", error);
    res.setHeader('Content-Type', 'text/html');
    res.status(500).send(`
      <html>
        <body>
          <script>
            window.opener.postMessage({ error: "Authentication failed" }, "${req.headers.origin}");
            window.close();
          </script>
        </body>
      </html>
    `);
  }
}) as RequestHandler);

// Set credentials
router.post("/auth/set-credentials", ((req: Request, res: Response) => {
  try {
    const { accessToken, refreshToken } = req.body;

    if (!accessToken) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(400).json({ error: "Access token is required" });
    }

    googleDocsService.setCredentials(accessToken, refreshToken);
    res.setHeader('Content-Type', 'application/json');
    res.json({ message: "Credentials set successfully" });
  } catch (error) {
    console.error("Error setting credentials:", error);
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({ error: "Failed to set credentials" });
  }
}) as RequestHandler);

// Create a new Google Doc
router.post("/create", (async (req: Request, res: Response) => {
  try {
    const { content, title } = req.body;

    const documentId = await googleDocsService.createDocument(content, title);
    res.setHeader('Content-Type', 'application/json');
    res.json({ documentId });
  } catch (error) {
    console.error("Error creating Google Doc:", error);
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({ error: "Failed to create Google Doc" });
  }
}) as RequestHandler);

// Get a Google Doc
router.get("/:documentId", (async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    const document = await googleDocsService.getDocument(documentId);
    res.setHeader('Content-Type', 'application/json');
    res.json(document);
  } catch (error) {
    console.error("Error getting Google Doc:", error);
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({ error: "Failed to get Google Doc" });
  }
}) as RequestHandler);

export default router;
