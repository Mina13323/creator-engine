import { GeneratedProjectModel, BuildLogModel } from '@creator/database';
import { runWebsiteBuilderAgent, runBugFixAgent, GeneratedFile, analyzeBuildError, applyAutoFix } from '@creator/agents';
import path from 'path';
import fs from 'fs/promises';
import { exec, spawn } from 'child_process';
import util from 'util';
import crypto from 'crypto';

const execAsync = util.promisify(exec);

export class AIToolRegistry {
  private workspacePath: string;

  constructor(projectId: string) {
    // Assuming api runs from apps/api
    this.workspacePath = path.join(process.cwd(), '..', 'builder-runtime', 'workspaces', projectId);
  }

  async readFile(filePath: string) {
    const fullPath = path.join(this.workspacePath, filePath);
    return await fs.readFile(fullPath, 'utf8');
  }

  async writeFile(filePath: string, content: string) {
    const fullPath = path.join(this.workspacePath, filePath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content, 'utf8');
  }

  async updateFile(filePath: string, content: string) {
    return this.writeFile(filePath, content);
  }

  async searchFiles(query: string) {
    return [];
  }

  async installPackage(packageName: string) {
    const { stdout, stderr } = await execAsync(`pnpm install ${packageName} --ignore-scripts --no-frozen-lockfile`, { cwd: this.workspacePath });
    return { stdout, stderr };
  }

  async runBuild() {
    try {
      // If it's a vanilla project, skip build
      const pkgPath = path.join(this.workspacePath, 'package.json');
      try {
        await fs.access(pkgPath);
      } catch {
        return { stdout: 'Vanilla project detected. Build skipped.', stderr: '', error: null };
      }
      
      const { stdout, stderr } = await execAsync(`pnpm build`, { cwd: this.workspacePath });
      return { stdout, stderr, error: null };
    } catch (error: any) {
      return { stdout: error.stdout, stderr: error.stderr, error: error.message };
    }
  }

  async getErrors() {
    return [];
  }

  async restartPreview() {
    // Preview restarts handled automatically by Next.js dev server
  }
}

export class BuilderService {
  static async generateProject(userId: string, ventureId: string, name: string, input: any) {
    const project = await GeneratedProjectModel.create({
      id: `proj_${Date.now()}`,
      userId,
      ventureId,
      name,
      status: 'planning',
      files: []
    });

    const buildLog = await BuildLogModel.create({
      projectId: project.id,
      logs: ['Starting generation...'],
      buildErrors: [],
      buildStatus: 'in_progress'
    });

    // Run pipeline asynchronously
    this.runPipeline(project, buildLog, input).catch(console.error);

    return project;
  }

  static async runPipeline(project: any, buildLog: any, input: any) {
    try {
      project.status = 'generating';
      // 2. Initial Generation
      buildLog.logs.push('Initializing AI Generation Pipeline...');
      await buildLog.save();
      
      let generatedFiles = await runWebsiteBuilderAgent(input, async (msg) => {
        buildLog.logs.push(msg);
        await buildLog.save();
      });
      
      project.files = generatedFiles;
      project.status = 'building';
      await project.save();

      buildLog.logs.push(`AI generated ${generatedFiles.length} files. Setting up sandbox...`);
      await buildLog.save();

      // Setup Workspace in apps/builder-runtime
      const workspacePath = path.join(process.cwd(), '..', 'builder-runtime', 'workspaces', project.id);
      const templatePath = path.join(process.cwd(), '..', '..', 'templates', 'nextjs-saas-template');

      // Ensure directory exists
      await fs.mkdir(workspacePath, { recursive: true });

      // We no longer clone the Next.js template. It's a clean slate Vanilla HTML project.
      const tools = new AIToolRegistry(project.id);
      
      buildLog.logs.push('Files generated. Writing to workspace...');
      await buildLog.save();

      // Skip install since it's vanilla
      buildLog.logs.push('Vanilla project detected. Skipping dependency installation.');
      await buildLog.save();

      // Self Healing Loop (Max 3 Attempts)
      const MAX_ATTEMPTS = 3;
      let buildSuccess = false;

      let previousAttempts: any[] = [];
      
      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        // Write current files
        for (const file of generatedFiles) {
          await tools.writeFile(file.path, file.content);
        }

        buildLog.logs.push(`Running build (Attempt ${attempt}/${MAX_ATTEMPTS})...`);
        await buildLog.save();

        const buildResult = await tools.runBuild();

        if (!buildResult.error) {
          buildLog.logs.push('Build passed successfully!');
          buildSuccess = true;
          break;
        }

        buildLog.logs.push(`Build failed. Capturing errors and running BugFixAgent...`);
        buildLog.buildErrors.push(buildResult.error);
        await buildLog.save();

        if (attempt < MAX_ATTEMPTS) {
          // Phase 5: Prevent AI Loops
          const errorText = buildResult.error + '\n' + buildResult.stderr;
          const errorHash = crypto.createHash('md5').update(errorText).digest('hex');
          const isDuplicate = previousAttempts.some(a => a.hash === errorHash);
          if (isDuplicate) {
             buildLog.logs.push(`AI Loop detected: Same error occurred twice. Stopping repair.`);
             await buildLog.save();
             break;
          }

          // Phase 1 & 2: BuildErrorAnalyzer and Smart Context Selection
          const diagnostic = analyzeBuildError(errorText);
          buildLog.logs.push(`Diagnostic: ${diagnostic.message} (Strategy: ${diagnostic.fixStrategy})`);

          // Phase 3 & 4: Automatic Fixers before AI
          const autoFixResult = applyAutoFix(diagnostic, generatedFiles);
          if (autoFixResult.patched) {
            buildLog.logs.push(`Applied automatic fix for ${diagnostic.type}. Retrying build...`);
            if (autoFixResult.pkgToInstall) {
               await tools.installPackage(autoFixResult.pkgToInstall);
            }
            if (autoFixResult.newFiles) {
               generatedFiles.push(...autoFixResult.newFiles);
            }
            project.files = generatedFiles;
            await project.save();
            continue; // Skip AI, go to next build attempt
          }

          buildLog.logs.push(`No auto-fix available. Falling back to BugFixAgent...`);

          const affectedPaths = diagnostic.file ? [diagnostic.file] : [];
          let contextFiles = generatedFiles;
          if (affectedPaths.length > 0) {
              contextFiles = generatedFiles.filter(f => affectedPaths.includes(f.path));
              if (contextFiles.length === 0) contextFiles = generatedFiles; // Fallback
          }

          let patchOperations = await runBugFixAgent({
            error: errorText,
            files: contextFiles,
            previousAttempts
          }, async (msg) => {
            buildLog.logs.push(msg);
            await buildLog.save();
          });
          
          previousAttempts.push({ hash: errorHash, error: errorText, fix: patchOperations });

          // Phase 3: Apply Patches Locally
          for (const op of patchOperations) {
            if (op.type === 'replace') {
              const file = generatedFiles.find(f => f.path === op.file);
              if (file) {
                file.content = file.content.replace(op.old, op.new);
              }
            }
          }
          project.files = generatedFiles;
          await project.save();
        }
      }

      if (!buildSuccess) {
        throw new Error('Failed to build application after 3 attempts.');
      }

      // Start dev server
      const port = Math.floor(Math.random() * (4000 - 3000 + 1) + 3000);
      // workspacePath is already defined earlier in the function
      
      const pkgPath = path.join(workspacePath, 'package.json');
      let isVanilla = false;
      try {
        await fs.access(pkgPath);
      } catch {
        isVanilla = true;
      }

      if (isVanilla) {
        spawn('npx', ['-y', 'serve', '.', '-l', port.toString()], { cwd: workspacePath, detached: true, stdio: 'ignore', shell: true }).unref();
      } else {
        spawn('npx', ['-y', 'next', 'dev', '--port', port.toString()], { cwd: workspacePath, detached: true, stdio: 'ignore', shell: true }).unref();
      }
      
      project.previewUrl = `http://localhost:${port}`;
      project.status = 'running';
      await project.save();

      buildLog.buildStatus = 'success';
      buildLog.logs.push(`Preview available at ${project.previewUrl}`);
      await buildLog.save();

    } catch (err: any) {
      console.error(err);
      project.status = 'failed';
      await project.save();

      buildLog.buildStatus = 'failed';
      buildLog.buildErrors.push(err.message);
      await buildLog.save();
    }
  }

  static async getProjectStatus(projectId: string) {
    const project = await GeneratedProjectModel.findOne({ id: projectId });
    const buildLog = await BuildLogModel.findOne({ projectId });
    return { project, buildLog };
  }
}

