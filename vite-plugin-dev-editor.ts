import { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';

/**
 * Vite Plugin: Dev Content Editor
 *
 * Provides a dev-only API endpoint that allows the browser to write
 * text content changes back to source files.
 *
 * Only active in development mode for security.
 */

interface EditRequest {
  filePath?: string;
  oldText: string;
  newText: string;
  elementType: string;
  searchInMultipleFiles?: boolean;
}

export default function devContentEditorPlugin(): Plugin {
  return {
    name: 'vite-plugin-dev-editor',
    apply: 'serve', // Only apply in dev mode

    configureServer(server) {
      server.middlewares.use('/api/dev-edit', async (req, res) => {
        // Only allow POST requests
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end('Method not allowed');
          return;
        }

        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });

        req.on('end', async () => {
          try {
            const edit: EditRequest = JSON.parse(body);

            // Validate input
            if (!edit.filePath || !edit.oldText || edit.newText === undefined) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Missing required fields' }));
              return;
            }

            // Security: Only allow editing files in src directory
            const normalizedPath = path.normalize(edit.filePath);
            if (!normalizedPath.startsWith('src/')) {
              res.statusCode = 403;
              res.end(JSON.stringify({ error: 'Can only edit files in src/ directory' }));
              return;
            }

            const fullPath = path.join(process.cwd(), normalizedPath);

            // Check if file exists
            if (!fs.existsSync(fullPath)) {
              res.statusCode = 404;
              res.end(JSON.stringify({ error: 'File not found' }));
              return;
            }

            // Read current file content
            let fileContent = fs.readFileSync(fullPath, 'utf-8');

            // Normalize text for better matching
            const normalizeText = (str: string) => {
              return str
                .replace(/\s+/g, ' ')  // Collapse all whitespace to single space
                .replace(/['']/g, "'")  // Normalize single quotes
                .replace(/[""]/g, '"')  // Normalize double quotes
                .trim();
            };

            // Escape special regex characters
            const escapeRegex = (str: string) => {
              return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            };

            // Try multiple matching strategies
            let newContent: string | null = null;
            const oldTextTrimmed = edit.oldText.trim();
            const newTextTrimmed = edit.newText.trim();

            // Strategy 1: Exact match (fastest, most reliable if text hasn't changed)
            if (fileContent.includes(oldTextTrimmed)) {
              console.log('[DevEditor] Match strategy: Exact');
              newContent = fileContent.replace(oldTextTrimmed, newTextTrimmed);
            }

            // Strategy 2: Normalized whitespace match
            if (!newContent) {
              const normalizedOld = normalizeText(oldTextTrimmed);
              const normalizedFile = normalizeText(fileContent);

              if (normalizedFile.includes(normalizedOld)) {
                console.log('[DevEditor] Match strategy: Normalized');
                // Find the original text in file by searching with normalized comparison
                const lines = fileContent.split('\n');
                let found = false;

                for (let i = 0; i < lines.length; i++) {
                  const lineNormalized = normalizeText(lines[i]);
                  if (lineNormalized.includes(normalizedOld)) {
                    // Replace in the original line
                    const oldInLine = lines[i].match(new RegExp(escapeRegex(oldTextTrimmed).replace(/\s+/g, '\\s+')))?.[0];
                    if (oldInLine) {
                      lines[i] = lines[i].replace(oldInLine, newTextTrimmed);
                      found = true;
                      break;
                    }
                  }
                }

                if (found) {
                  newContent = lines.join('\n');
                }
              }
            }

            // Strategy 3: Regex with flexible whitespace
            if (!newContent) {
              console.log('[DevEditor] Match strategy: Flexible whitespace regex');
              const flexiblePattern = escapeRegex(oldTextTrimmed)
                .replace(/\s+/g, '\\s+');  // Allow any amount of whitespace
              const flexRegex = new RegExp(flexiblePattern, 'g');

              if (flexRegex.test(fileContent)) {
                newContent = fileContent.replace(flexRegex, newTextTrimmed);
              }
            }

            // Strategy 4: Multi-file search (if enabled and still not found)
            if (!newContent && edit.searchInMultipleFiles) {
              console.log('[DevEditor] Searching in multiple files...');

              const searchDirs = ['src/pages', 'src/components/home', 'src/components/layout'];
              const searchResults: { file: string; content: string }[] = [];

              function searchInDirectory(dir: string): void {
                const fullDir = path.join(process.cwd(), dir);
                if (!fs.existsSync(fullDir)) return;

                const files = fs.readdirSync(fullDir);
                for (const file of files) {
                  const fullPath = path.join(fullDir, file);
                  const stat = fs.statSync(fullPath);

                  if (stat.isDirectory()) {
                    searchInDirectory(path.join(dir, file));
                  } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                    const content = fs.readFileSync(fullPath, 'utf-8');
                    if (content.includes(oldTextTrimmed) || normalizeText(content).includes(normalizeText(oldTextTrimmed))) {
                      searchResults.push({ file: fullPath, content });
                    }
                  }
                }
              }

              searchDirs.forEach(searchInDirectory);

              if (searchResults.length > 0) {
                // Use the first match
                const match = searchResults[0];
                const matchContent = match.content.replace(oldTextTrimmed, newTextTrimmed);
                fs.writeFileSync(match.file, matchContent, 'utf-8');

                console.log(`[DevEditor] Found and updated in: ${match.file}`);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  success: true,
                  filePath: path.relative(process.cwd(), match.file),
                  message: 'File updated successfully (found in alternate file)'
                }));
                return;
              }
            }

            // If no strategy worked, return error
            if (!newContent) {
              res.statusCode = 404;
              res.end(JSON.stringify({
                error: 'Text not found in file',
                searched: edit.oldText,
                filePath: normalizedPath,
                hint: 'Try enabling multi-file search or check for text formatting differences'
              }));
              return;
            }

            // Write back to file
            fs.writeFileSync(fullPath, newContent, 'utf-8');

            console.log(`[DevEditor] Updated ${normalizedPath}`);
            console.log(`  Old: "${edit.oldText}"`);
            console.log(`  New: "${edit.newText}"`);

            // Respond with success
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: true,
              filePath: normalizedPath,
              message: 'File updated successfully'
            }));

            // Trigger HMR update
            const module = server.moduleGraph.getModuleById(fullPath);
            if (module) {
              server.moduleGraph.invalidateModule(module);
              server.ws.send({
                type: 'full-reload',
                path: '*'
              });
            }

          } catch (error: any) {
            console.error('[DevEditor] Error:', error);
            res.statusCode = 500;
            res.end(JSON.stringify({
              error: 'Internal server error',
              details: error.message
            }));
          }
        });
      });

      // Add endpoint to search for text in files
      server.middlewares.use('/api/dev-find-text', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end('Method not allowed');
          return;
        }

        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });

        req.on('end', async () => {
          try {
            const { text } = JSON.parse(body);

            // Search in common page files
            const searchDirs = [
              'src/pages',
              'src/components/home',
              'src/components/layout',
            ];

            const results: { file: string; matches: number }[] = [];

            function searchInDirectory(dir: string) {
              const fullDir = path.join(process.cwd(), dir);
              if (!fs.existsSync(fullDir)) return;

              const files = fs.readdirSync(fullDir);

              for (const file of files) {
                const fullPath = path.join(fullDir, file);
                const stat = fs.statSync(fullPath);

                if (stat.isDirectory()) {
                  searchInDirectory(path.join(dir, file));
                } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                  const content = fs.readFileSync(fullPath, 'utf-8');
                  const escapedText = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                  const matches = content.match(new RegExp(escapedText, 'g'));

                  if (matches && matches.length > 0) {
                    results.push({
                      file: path.relative(process.cwd(), fullPath),
                      matches: matches.length
                    });
                  }
                }
              }
            }

            searchDirs.forEach(searchInDirectory);

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ results }));

          } catch (error: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: error.message }));
          }
        });
      });
    }
  };
}
