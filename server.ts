import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");
import fileUpload from "express-fileupload";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(fileUpload());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // REST API: Extract text from PDF Resume
  app.post("/api/extract-text", async (req, res) => {
    try {
      if (!req.files || !req.files.resume) {
        return res.status(400).json({ error: "No resume file uploaded" });
      }

      const resumeFile = req.files.resume as any;
      const data = await pdf(resumeFile.data);
      
      res.json({ 
        text: data.text,
        info: data.info,
        metadata: data.metadata,
        version: data.version
      });
    } catch (error) {
      console.error("PDF Extraction Error:", error);
      res.status(500).json({ error: "Failed to extract text from PDF" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
