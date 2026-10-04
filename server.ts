import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));

// In-memory chat storage for session persistence across refreshes
const chatSessions: Record<string, any> = {};

// Initialize GoogleGenAI client if API key is present
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    aiConfigured: Boolean(ai),
    timestamp: new Date().toISOString(),
  });
});

// Chat sessions endpoints
app.get('/api/mogsai/sessions', (req, res) => {
  res.json({ sessions: Object.values(chatSessions) });
});

app.post('/api/mogsai/sessions', (req, res) => {
  const session = req.body;
  if (!session || !session.id) {
    return res.status(400).json({ error: 'Session ID required' });
  }
  chatSessions[session.id] = session;
  res.json({ success: true, session });
});

app.delete('/api/mogsai/sessions/:id', (req, res) => {
  const { id } = req.params;
  delete chatSessions[id];
  res.json({ success: true });
});

// Compile endpoint: executes real compiler if available or returns build_environment_unavailable
app.post('/api/mogsai/compile', async (req, res) => {
  try {
    const { files, platform, version, javaVersion = 21 } = req.body;
    const { spawnSync } = await import('child_process');

    // Check if javac is executable
    let javacAvailable = false;
    try {
      const check = spawnSync('javac', ['-version'], { timeout: 2000 });
      javacAvailable = check.status === 0 || (check.stdout && check.stdout.length > 0) || (check.stderr && check.stderr.toString().includes('javac'));
    } catch (e) {
      javacAvailable = false;
    }

    if (!javacAvailable) {
      return res.json({
        compiled: false,
        status: 'build_environment_unavailable',
        message: 'Source generated successfully, but no verified JAR was produced because the build environment could not compile the project.',
        reason: 'Host environment lacks Java compiler (javac).',
      });
    }

    // If javac is available, execute in isolated sandbox directory
    const fs = await import('fs');
    const os = await import('os');
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mogs-compile-'));

    try {
      const javaFiles: string[] = [];
      for (const file of files || []) {
        const fullPath = path.join(tempDir, file.path);
        fs.mkdirSync(path.dirname(fullPath), { recursive: true });
        fs.writeFileSync(fullPath, file.content, 'utf-8');
        if (file.path.endsWith('.java')) {
          javaFiles.push(fullPath);
        }
      }

      if (javaFiles.length === 0) {
        return res.json({
          compiled: false,
          status: 'validation_failed',
          message: 'No .java source files provided to compile.',
        });
      }

      const compileProc = spawnSync('javac', ['-encoding', 'UTF-8', ...javaFiles], {
        cwd: tempDir,
        timeout: 15000,
      });

      if (compileProc.status !== 0) {
        const stderr = compileProc.stderr ? compileProc.stderr.toString() : 'Compilation failed';
        return res.json({
          compiled: false,
          status: 'compiler_error',
          error: stderr,
          message: `Compiler exited with code ${compileProc.status}`,
        });
      }

      // Collect compiled .class files
      const compiledClasses: { path: string; size: number }[] = [];
      function scanDir(dir: string, base: string) {
        for (const item of fs.readdirSync(dir)) {
          const full = path.join(dir, item);
          const rel = path.join(base, item);
          if (fs.statSync(full).isDirectory()) {
            scanDir(full, rel);
          } else if (item.endsWith('.class')) {
            const size = fs.statSync(full).size;
            compiledClasses.push({ path: rel, size });
          }
        }
      }
      scanDir(tempDir, '');

      return res.json({
        compiled: true,
        status: 'build_successful',
        message: `Successfully compiled ${compiledClasses.length} class files with javac.`,
        classes: compiledClasses,
      });
    } finally {
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch (ignored) {}
    }
  } catch (error: any) {
    res.status(500).json({
      compiled: false,
      status: 'compiler_error',
      error: error.message || 'Internal error in compiler sandbox',
    });
  }
});

// Autonomous Multi-Agent Minecraft Development & Chat Pipeline Endpoint
app.post('/api/mogsai/pipeline', async (req, res) => {
  try {
    const {
      prompt,
      mode = 'generate',
      platform = 'paper',
      version = '1.21.4',
      buildTool = 'gradle',
      javaVersion = 21,
      existingProject = null,
      errorLog = '',
      integrations = [],
      history = [],
      attachments = [],
      providerConfig = null,
    } = req.body;

    if (!prompt && !errorLog && !existingProject && (!attachments || attachments.length === 0)) {
      return res.status(400).json({ error: 'Prompt, existing project, or error log is required.' });
    }

    // Call Gemini if available, or fall back to client dynamic generator
    if (ai) {
      try {
        const systemPrompt = `You are MogsAI, an autonomous senior Minecraft software architect and compiler engine.
You design, generate, debug, and validate production-ready Minecraft software:
- Target Platform: ${platform}
- Target Minecraft Version: ${version}
- Java Target: Java ${javaVersion}
- Build Tool: ${buildTool}
- Mode: ${mode}

CRITICAL RULES FOR REQUIREMENT FIDELITY:
1. THE USER'S PROMPT IS THE SOLE SOURCE OF TRUTH.
   - Implement EVERY explicit requirement (commands, permissions, events, configurations, cooldowns).
   - DO NOT invent unrelated functionality. If the user asks for "/spawn", generate ONLY a spawn plugin.
   - If the user asks for a Skript starter kit on join, generate ONLY that Skript script.
   - If the user asks for a prison plugin with mines, generate that.
   - DO NOT add kits, swords, or unrelated commands unless explicitly requested by the user.

2. FOR EXISTING PROJECT MODIFICATIONS:
   - When existing files are provided, SURGICALLY MODIFY or add ONLY the necessary files.
   - Preserve all existing commands, classes, and configurations (e.g. if adding a 30s cooldown or a /heal command, DO NOT delete previously created /spawn code).
   - Set "isModified": true on updated or newly added files.

3. MINECRAFT API BEST PRACTICES:
   - Modern Paper 1.20+ / 1.21+: Use Adventure Component & MiniMessage (<color>, <gradient>), NOT legacy ChatColor.
   - Use NamespacedKey and PersistentDataContainer (PDC) for custom item/entity NBT data.
   - For custom GUI inventories: create custom InventoryHolder and cancel clicks safely in Listener.
   - Thread Safety: Never call Bukkit world or inventory methods from async tasks. Use Bukkit.getScheduler().runTask(plugin, ...) or Folia RegionScheduler.
   - Skript: generate clean, modern .sk scripts with options, triggers (e.g. on join), and permissions.
   - Fabric: generate valid fabric.mod.json, ModInitializer, and Fabric 1.21.x API registration.

4. RESPONSE FORMAT:
Provide a strictly valid JSON object matching this schema:
{
  "plan": {
    "summary": "Brief summary of what was implemented",
    "architecture": "Architecture overview",
    "detectedVersion": "${version}",
    "detectedPlatform": "${platform}",
    "targetJava": ${javaVersion}
  },
  "projectMap": {
    "entryPoint": "Main class name or script file",
    "commands": [{"name": "cmd", "permission": "perm", "description": "desc", "usage": "/cmd"}],
    "permissions": [{"node": "perm", "description": "desc", "default": "true|false|op"}],
    "listeners": [{"name": "ListenerClass", "events": ["EventName"], "description": "desc"}],
    "managers": [{"name": "ManagerClass", "responsibility": "desc"}],
    "storage": {"type": "YAML/PDC/Database", "details": "Storage details"},
    "integrations": ["APIs used"]
  },
  "files": [
    {
      "path": "src/main/resources/paper-plugin.yml",
      "content": "Full source code",
      "language": "yaml|java|json|groovy|skript|markdown",
      "isModified": false
    }
  ],
  "validation": {
    "passed": true,
    "checks": [
      { "name": "Descriptor & Commands", "status": "passed", "message": "All commands mapped" },
      { "name": "Java ${javaVersion} Compatibility", "status": "passed", "message": "Bytecode target verified" }
    ],
    "warnings": []
  },
  "diagnostics": {
    "fixedErrors": [],
    "notes": "Validation notes"
  }
}`;

        // Construct multi-turn context
        let contextMessage = '';
        if (history && history.length > 0) {
          contextMessage += `Previous conversation history:\n`;
          for (const msg of history.slice(-6)) {
            contextMessage += `${msg.role.toUpperCase()}: ${msg.content.slice(0, 1000)}\n`;
          }
          contextMessage += `\n---\n`;
        }

        contextMessage += `CURRENT REQUEST: ${prompt}\nMode: ${mode}\nPlatform: ${platform} ${version}\nJava: ${javaVersion}`;

        if (errorLog) {
          contextMessage += `\n\nERROR LOG / STACK TRACE TO DIAGNOSE AND REPAIR:\n${errorLog}`;
        }

        if (attachments && attachments.length > 0) {
          contextMessage += `\n\nUPLOADED ATTACHMENTS:\n`;
          for (const att of attachments) {
            contextMessage += `File: ${att.name} (${att.type}):\n${att.content?.slice(0, 2000)}\n---\n`;
          }
        }

        if (existingProject && existingProject.files) {
          contextMessage += `\n\nEXISTING PROJECT TO MODIFY:\n${JSON.stringify(
            existingProject.files.map((f: any) => ({
              path: f.path,
              content: f.content?.slice(0, 1500),
            }))
          )}`;
        }

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: contextMessage,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        });

        const text = response.text;
        if (text) {
          try {
            const parsed = JSON.parse(text);
            return res.json(parsed);
          } catch (e) {
            console.warn('Failed to parse Gemini JSON output:', e);
          }
        }
      } catch (err) {
        console.error('Gemini API call failed, falling back to local dynamic engine:', err);
      }
    }

    // Return fallback structured response if Gemini is not configured or failed
    return res.json({ fallback: true, message: 'Use client-side dynamic engine' });
  } catch (error: any) {
    console.error('Pipeline error:', error);
    res.status(500).json({ error: error.message || 'Internal server error in MogsAI pipeline' });
  }
});

// Setup Vite middleware for local development or static file serving for production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MogsAI Dev Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
