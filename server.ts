import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { Resend } from "resend";
import fs from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(process.cwd(), "data");
const CHAT_DATA_FILE = path.join(DATA_DIR, "chat_data.json");

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.access(CHAT_DATA_FILE);
    } catch {
      await fs.writeFile(CHAT_DATA_FILE, JSON.stringify({ rooms: [], messages: [], communities: [] }));
    }
  } catch (err) {
    console.error("Error creating data directory:", err);
  }
}

async function startServer() {
  await ensureDataDir();
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // Chat Data Endpoints
  app.get("/api/chat/data", async (req, res) => {
    try {
      const data = await fs.readFile(CHAT_DATA_FILE, "utf-8");
      res.json(JSON.parse(data));
    } catch (err) {
      res.status(500).json({ error: "Failed to read chat data" });
    }
  });

  app.post("/api/chat/data", async (req, res) => {
    try {
      await fs.writeFile(CHAT_DATA_FILE, JSON.stringify(req.body, null, 2));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to save chat data" });
    }
  });

  // API Route for sending confirmation email
  app.post("/api/send-confirmation-email", async (req, res) => {
    const { 
      email, 
      studentName, 
      studentFirstName,
      studentLastName,
      studentPhone,
      guardianName,
      dossierId, 
      instituteName, 
      totalAmount,
      amountPaid,
      balance,
      coursesList,
      template 
    } = req.body;

    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY is not set. Email sending skipped.");
      return res.status(200).json({ 
        success: true, 
        message: "Email sending skipped (API key missing)",
        mocked: true 
      });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    // Replace variables in template
    const replaceVars = (str: string) => {
      return str
        .replace(/{{studentName}}/g, studentName || '')
        .replace(/{{studentFirstName}}/g, studentFirstName || '')
        .replace(/{{studentLastName}}/g, studentLastName || '')
        .replace(/{{studentPhone}}/g, studentPhone || '')
        .replace(/{{guardianName}}/g, guardianName || '')
        .replace(/{{instituteName}}/g, instituteName || '')
        .replace(/{{dossierId}}/g, dossierId || '')
        .replace(/{{totalAmount}}/g, totalAmount || '')
        .replace(/{{amountPaid}}/g, amountPaid || '')
        .replace(/{{balance}}/g, balance || '')
        .replace(/{{coursesList}}/g, coursesList || '');
    };

    const subject = template?.subject ? replaceVars(template.subject) : `Confirmation d'inscription - ${instituteName}`;
    const html = template?.body ? replaceVars(template.body) : `Bonjour ${studentName}, votre inscription est confirmée.`;
    const attachments = template?.attachments || [];

    try {
      const { data, error } = await resend.emails.send({
        from: `${instituteName} <onboarding@resend.dev>`,
        to: [email],
        subject: subject,
        html: html,
        attachments: attachments.map((att: any) => {
          if (att.content) {
            // If it's base64 content, Resend expects the base64 string directly in 'content'
            // The content should be just the base64 part, not the data:application/pdf;base64,... prefix
            const base64Content = att.content.includes('base64,') 
              ? att.content.split('base64,')[1] 
              : att.content;
            return {
              filename: att.filename,
              content: base64Content,
            };
          }
          return {
            filename: att.filename,
            path: att.path,
          };
        }),
      });

      if (error) {
        console.error("Resend Error:", error);
        return res.status(400).json({ success: false, error });
      }

      res.status(200).json({ success: true, data });
    } catch (err) {
      console.error("Server Error:", err);
      res.status(500).json({ success: false, error: "Internal Server Error" });
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
