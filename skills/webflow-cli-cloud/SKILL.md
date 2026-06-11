---
name: webflow-cli:cloud
description: Initialize, build, and deploy full-stack Webflow applications to Webflow Cloud hosting. List available templates, initialize projects with cloud init, and deploy with comprehensive validation. Use when creating or deploying Webflow Cloud applications.
---

# Webflow Cloud

Initialize new projects from templates, build applications, and deploy to Webflow Cloud with comprehensive validation and deployment verification.

## Important Note

**ALWAYS use Bash tool for all Webflow CLI operations:**
- Execute `webflow cloud` commands via Bash tool
- Use Read tool to examine configuration files (never modify)
- Use Glob tool to discover project files
- Verify CLI installation: `webflow --version`
- Check authentication: Use `webflow auth login` for site authentication
- DO NOT use Webflow MCP tools for CLI workflows
- All CLI commands require proper descriptions (not context parameters)

**Non-Interactive Deployment (CRITICAL for agents and automation):**
The Webflow CLI is interactive by default (environment selection prompts, mount path prompts, update checks). Since AI agents and CI/CD pipelines cannot interact with interactive prompts, you MUST always use these flags together for deployment:
- `--no-input` — Disables all interactive prompts (environment selection, confirmations, etc.)
- `--mount <MOUNT_PATH>` — REQUIRED with `--no-input` to avoid `ENVIRONMENT_MOUNT_MISMATCH` errors. You MUST determine the correct mount path before deploying — see below.
- `--skip-mount-path-check` — Skips interactive mount path validation
- `--skip-update-check` — Skips the interactive package update check

**Determining the mount path (NEVER assume a default):**
The mount path varies between projects (e.g., `/app`, `/`, `/blog`). Assuming a common default like `/app` WILL cause deployment failures if the project uses a different path. The Webflow CLI does NOT persist the mount path to `webflow.json` after init or deploy, so it is often not available in local config. Follow these steps in order:
1. **Check `webflow.json`** — Read the `cloud` section and look for a `mount` or `mountPath` field. It is usually NOT present, but check anyway.
2. **Ask the user** — If the mount path is not in `webflow.json` (which is the common case), you MUST ask the user before deploying: _"What mount path does this project use? (e.g., /app, /, /blog)"_. Do NOT guess, do NOT assume `/app`, and do NOT proceed without a confirmed mount path.

The canonical non-interactive deploy command is:
```bash
webflow cloud deploy --no-input --mount <MOUNT_PATH> --skip-mount-path-check --skip-update-check
```
Add `--auto-publish` if the user wants changes published immediately.

**Package Manager Detection:**
- Check for lock files: `package-lock.json` (npm), `pnpm-lock.yaml` (pnpm), `yarn.lock` (yarn)
- If no lock file found, ask user which package manager to use (npm/pnpm/yarn)
- Use detected package manager for all install/build commands

## Instructions

### Phase 1: Determine Operation Type
1. **Identify user intent**: What does the user want to do?
   - List available project templates (`cloud list`)
   - Initialize new Cloud project (`cloud init`)
   - Deploy existing Cloud project (`cloud deploy`)
2. **Verify CLI installed**: Run `webflow --version` to confirm CLI is installed
3. **Check project state**: Determine if in existing project or starting new

### Phase 2A: List Templates (if needed)
4. **List available templates**: Run `webflow cloud list`
5. **Show template options**: Display available frameworks (Astro, Next.js, etc.)
6. **Explain templates**: Brief description of each template

### Phase 2B: Initialize New Project (if needed)
7. **Run cloud init**: Execute `webflow cloud init` with options:
   - `--framework` or `-f`: Choose framework (astro, nextjs)
   - `--mount` or `-m`: Mount path (e.g., `/app`)
   - `--site-id` or `-s`: Webflow site ID to connect
8. **Monitor initialization**: Show CLI output
9. **Verify project created**: Check for webflow.json and project structure
10. **Show configuration**: Read and display webflow.json with cloud section

### Phase 2C: Validate Existing Project (if deploying)
11. **Check authentication**: Verify site authentication (created via `webflow auth login`)
12. **Read project configuration**: Examine `webflow.json` cloud section:
    - `projectId`: Cloud project identifier (set automatically on first deploy)
    - `framework`: Either "nextjs" or "astro"
    - `mount` or `mountPath`: Mount path (may or may not be present)
13. **Determine mount path**: Follow the "Determining the mount path" steps above. If the mount path is not in `webflow.json`, ask the user before proceeding. NEVER default to `/app` or any other value.
14. **Validate project structure**:
    - Required files present
    - Build scripts configured
    - webflow.json has cloud configuration

### Phase 3: Build Execution (for deployment)
14. **Run build command**: Execute `npm run build` or configured build script
15. **Monitor build progress**: Show build output and detect errors
16. **Validate build output**:
    - Build artifacts created
    - Output directory exists
    - No critical errors

### Phase 4: Deployment Preview (for deployment)
17. **Show deployment summary**:
    - Project name and framework
    - Build output location
    - Environment configuration (if using --env)
    - Mount path (if specified)
    - Auto-publish setting (if using --auto-publish)
18. **Explain deployment process**: What happens during deployment
19. **Require explicit confirmation**: User must type "deploy" to proceed

### Phase 5: Deployment Execution
20. **Execute deploy command**: Run `webflow cloud deploy` with non-interactive flags:
    - `--no-input`: REQUIRED — disables all interactive prompts
    - `--mount` or `-m`: REQUIRED — mount path (e.g., `/app`). Must match the existing environment's mount path.
    - `--skip-mount-path-check`: REQUIRED — skips interactive mount path validation
    - `--skip-update-check`: RECOMMENDED — skips interactive package update check
    - `--auto-publish`: Optional — publish site after deployment
    - `--project-name` or `-p`: Project name (for new projects only)
    - `-e` or `--environment`: Environment name (defaults to first available with `--no-input`)
21. **Monitor deployment progress**: Show CLI output and deployment stages
22. **Verify deployment success**: Confirm deployment completed
23. **Provide post-deployment information**:
    - Deployment success message
    - Site URL (if published)
    - Next steps

## Examples

### Example 1: List Available Templates

**User prompt:**
```
What Webflow Cloud templates are available?
```

**Response:**
```
📋 Webflow Cloud Templates

Listing available templates...
Executing: webflow cloud list

Output:
Available templates:
1. astro - Astro framework template
2. nextjs - Next.js framework template

Use these templates with:
webflow cloud init -f <template-name>

Example:
webflow cloud init -f astro -m /app
```

### Example 2: Initialize New Cloud Project

**User prompt:**
```
Create a new Webflow Cloud project with Astro
```

**Step 1: Verify CLI**
```
🔍 Webflow CLI Check

Checking CLI installation...
✓ Webflow CLI installed: v1.5.2

Ready to initialize Webflow Cloud project with Astro.

Options needed:
1. Mount path (where project will be accessible, e.g., /app)
2. Site ID (optional - Webflow site to connect to)

Would you like to initialize with default settings (/app mount path)?
```

*User confirms: yes*

**Step 2: Initialize Project**
```
🚀 Initializing Webflow Cloud Project

Executing: webflow cloud init -f astro -m /app

Output:
✓ Creating new Astro project
✓ Installing dependencies
✓ Configuring Webflow Cloud
✓ Creating webflow.json

Project initialized!

📁 Project Structure:
/my-cloud-project/
├── webflow.json (Cloud configuration)
├── package.json
├── src/
│   └── pages/
│       └── index.astro
├── public/
└── astro.config.mjs

📋 Configuration (webflow.json):
{
  "cloud": {
    "projectId": "", // Will be set on first deploy
    "framework": "astro"
  }
}

✅ Project Ready!

Next Steps:
1. Build your application: npm run dev
2. Add your code to src/
3. Deploy: webflow cloud deploy
```

### Example 3: Initialize with Site ID

**User prompt:**
```
Initialize Cloud project with Next.js for site ID abc123
```

**Response:**
```
🚀 Initializing Webflow Cloud Project

Framework: Next.js
Mount Path: /app
Site ID: abc123

Executing: webflow cloud init -f nextjs -m /app -s abc123

Output:
✓ Creating new Next.js project
✓ Connecting to site: abc123
✓ Installing dependencies
✓ Configuring Webflow Cloud
✓ Creating webflow.json
✓ Authenticating with site

Project initialized and connected to site!

📋 Configuration (webflow.json):
{
  "cloud": {
    "projectId": "",
    "framework": "nextjs"
  }
}

📁 Environment (.env):
WEBFLOW_SITE_ID=abc123
WEBFLOW_SITE_API_TOKEN=************

⚠️ Important: Add .env to your .gitignore file!

✅ Ready to develop and deploy!
```

### Example 4: First Deployment

**User prompt:**
```
Deploy my Webflow Cloud app
```

**Step 1: Environment Verification**
```
🔍 Webflow Cloud Deployment Check

Checking CLI installation...
✓ Webflow CLI installed: v1.5.2

Checking project configuration...
✓ webflow.json found
✓ Cloud configuration present

Configuration:
- Framework: astro
- Project ID: (will be set on first deploy)
- Mount path: /app

Checking authentication...
⚠️ No authentication found - will authenticate during deploy

Checking build...
```

**Step 2: Build**
```
🔨 Building Application

Executing: npm run build

Output:
✓ Building for production
✓ Compiling pages
✓ Optimizing assets
✓ Build complete

Build output: ./dist (1.2 MB)
```

**Step 3: Deployment Preview**
```
📋 Deployment Preview

Project: Acme Cloud App (new deployment)
Framework: Astro
Mount Path: /app

First Deployment:
⚠️ This is your first deployment. The CLI will:
1. Authenticate with your Webflow site
2. Create project in Webflow Cloud
3. Set projectId in webflow.json
4. Deploy application

⚠️ Type "deploy" to proceed with deployment.
```

*User confirms: deploy*

**Step 4: Deployment**
```
🚀 Deploying to Webflow Cloud

Executing: webflow cloud deploy --no-input --mount <MOUNT_PATH> --skip-mount-path-check --skip-update-check

Output:
✓ Authenticating with Webflow...
✓ Site authenticated
✓ Creating Cloud project
✓ Uploading build artifacts (1.2 MB)
✓ Deploying to Webflow Cloud
✓ Deployment complete

✅ Deployment Successful!

Project ID: proj_abc123xyz (added to webflow.json)
Deployment: https://acme-site.webflow.io/app

📋 Next Steps:
1. Visit your deployed app at the URL above
2. Future deploys will use saved project ID
3. Use: webflow cloud deploy (no re-auth needed)
4. Publish your site to make changes live

Updated webflow.json:
{
  "cloud": {
    "projectId": "proj_abc123xyz",
    "framework": "astro"
  }
}
```

### Example 5: Update Existing Deployment

**User prompt:**
```
Deploy updates to my Cloud app
```

**Verification & Build:**
```
🔍 Cloud Project Check

✓ webflow.json found
✓ Project ID: proj_abc123xyz
✓ Framework: astro
✓ Authentication: Valid

Building application...
Executing: npm run build
✓ Build complete (1.3 MB)
```

**Preview:**
```
📋 Deployment Preview

Project: proj_abc123xyz
Framework: Astro
Mount Path: /app

Deployment Type: Update existing project
Authentication: Using saved credentials

⚠️ Type "deploy" to proceed.
```

*User confirms: deploy*

**Deployment:**
```
🚀 Updating Cloud Deployment

Executing: webflow cloud deploy --no-input --mount <MOUNT_PATH> --skip-mount-path-check --skip-update-check

Output:
✓ Using project: proj_abc123xyz
✓ Uploading build artifacts (1.3 MB)
✓ Deploying to Webflow Cloud
✓ Deployment complete

✅ Deployment Updated!

Live at: https://acme-site.webflow.io/app
Changes deployed successfully!

💡 Publish your site to make updates live.
```

### Example 6: CI/CD Deployment

**User prompt:**
```
How do I deploy in CI/CD pipeline?
```

**Response:**
```
🤖 CI/CD Deployment for Webflow Cloud

For automated deployments, use non-interactive mode with options.

### Setup Steps:

1. **Authenticate Locally First**
   Run once to create .env file:
   ```bash
   webflow auth login
   ```

2. **Add Credentials to CI/CD**
   Add these environment variables from .env:
   - WEBFLOW_SITE_ID
   - WEBFLOW_SITE_API_TOKEN

3. **Deployment Command**
   ```bash
   webflow cloud deploy --no-input --mount <MOUNT_PATH> --skip-mount-path-check --skip-update-check --auto-publish
   ```

### Example: GitHub Actions

```yaml
name: Deploy to Webflow Cloud
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm install

      - name: Install Webflow CLI
        run: npm install -g @webflow/webflow-cli

      - name: Build application
        run: npm run build

      - name: Deploy to Webflow Cloud
        run: |
          webflow cloud deploy \
            --no-input \
            --mount /app \
            --skip-mount-path-check \
            --skip-update-check \
            --auto-publish
        env:
          WEBFLOW_SITE_ID: ${{ secrets.WEBFLOW_SITE_ID }}
          WEBFLOW_SITE_API_TOKEN: ${{ secrets.WEBFLOW_SITE_API_TOKEN }}
```

### Deploy Options:

**Environment Management:**
```bash
# Deploy to specific environment
webflow cloud deploy --no-input -e staging -m <MOUNT_PATH> --skip-mount-path-check --skip-update-check

# Deploy to production with auto-publish
webflow cloud deploy --no-input -e production -m <MOUNT_PATH> --skip-mount-path-check --skip-update-check --auto-publish
```

**New Project Deployment:**
```bash
# Deploy new project with name and description
webflow cloud deploy --no-input \
  --project-name "Acme App" \
  --description "Production deployment" \
  --mount <MOUNT_PATH> \
  --skip-mount-path-check \
  --skip-update-check \
  --auto-publish
```

### Key Options:
- `--env` / `-e` - Environment name
- `--mount` / `-m` - Mount path (e.g., /app)
- `--project-name` / `-p` - Project name (new projects)
- `--directory` / `-d` - Project directory path
- `--description` - Project description
- `--skip-mount-path-check` - No prompts
- `--auto-publish` - Publish after deploy

⚠️ Security:
- Never commit .env files
- Use CI/CD secrets for credentials
- Rotate tokens regularly
```

## Guidelines

### Phase 1: Operation Detection

**Determine User Intent:**
Ask clarifying questions if unclear:
- "Do you want to create a new Cloud project or deploy an existing one?"
- "Which framework would you like to use? (Run 'webflow cloud list' to see options)"

**CLI Verification:**
```bash
# Check CLI installed
webflow --version

# If not installed:
npm install -g @webflow/webflow-cli
```

### Phase 2A: Template Listing

**List Templates Command:**
```bash
# Show available templates
webflow cloud list

# Output shows available frameworks (astro, nextjs)
```

**Template Information:**
- **Astro**: Static site generator, great for content-focused sites
- **Next.js**: React framework, supports SSR and SSG

### Phase 2B: Project Initialization

**Init Command Structure:**
```bash
# Basic init with framework
webflow cloud init -f <framework>

# With mount path
webflow cloud init -f astro -m /app

# With site ID (connects to specific site)
webflow cloud init -f nextjs -m /app -s <site-id>
```

**Init Options:**
- `--framework` / `-f` (required): astro or nextjs
- `--mount` / `-m`: Mount path (default prompts)
- `--site-id` / `-s`: Connect to specific site

**After Init:**
1. Verify webflow.json created
2. Check cloud configuration
3. Show project structure
4. Guide user to next steps (build, develop, deploy)

### Phase 2C: Project Validation

**webflow.json Cloud Schema:**
```json
{
  "cloud": {
    "projectId": "<Project ID>",  // Auto-set on first deploy
    "framework": "astro"           // or "nextjs"
  }
}
```

**Configuration Fields:**
- **projectId**: Cloud project identifier (automatically set by CLI on first deploy)
- **framework**: Framework preset - either "nextjs" or "astro"
- **mount path**: NOT stored in webflow.json by the CLI. You must ask the user for it if deploying an existing project.

**Authentication Check:**
```bash
# Site authentication creates .env file
# Check for:
cat .env

# Should contain:
# WEBFLOW_SITE_ID=your-site-id
# WEBFLOW_SITE_API_TOKEN=your-token

# If missing, authenticate:
webflow auth login
```

### Phase 3: Build Process

**Build Command:**
```bash
# Use project's build script
npm run build
# or
yarn build
# or
pnpm build

# Check for errors
echo $?  # 0 = success
```

**Build Validation:**
- Check build output directory exists
- Verify no critical errors
- Confirm assets generated

### Phase 4: Deployment Preview

**Preview Format:**
```
📋 Deployment Preview

Project: [Name or "New Project"]
Framework: [astro/nextjs]
Mount Path: [Path if specified]
Environment: [Name if specified]

[First time: Explain authentication flow]
[Subsequent: Show project ID]

Options:
- Auto-publish: [Yes/No]
- Environment: [Name or default]

⚠️ Type "deploy" to proceed
```

**First-Time Deployment:**
Explain clearly:
1. Browser will open for authentication
2. Select your Webflow site
3. Project ID will be created and saved
4. Future deploys use saved project ID

### Phase 5: Deployment Execution

**Deploy Command:**

IMPORTANT: The Webflow CLI is interactive by default. Always use `--no-input` and `--mount` together to avoid interactive prompts that agents cannot handle.

```bash
# Standard non-interactive deploy (use this by default)
webflow cloud deploy --no-input --mount <MOUNT_PATH> --skip-mount-path-check --skip-update-check

# With auto-publish (publishes site after deploy)
webflow cloud deploy --no-input --mount <MOUNT_PATH> --skip-mount-path-check --skip-update-check --auto-publish

# New project with name (first deploy)
webflow cloud deploy --no-input \
  --project-name "My App" \
  --mount <MOUNT_PATH> \
  --skip-mount-path-check \
  --skip-update-check

# With specific environment
webflow cloud deploy --no-input \
  -e production \
  --mount <MOUNT_PATH> \
  --skip-mount-path-check \
  --skip-update-check \
  --auto-publish
```

**Deploy Options:**
- `--no-input`: REQUIRED for agents — disables all interactive prompts
- `--mount` / `-m`: REQUIRED — path to mount project. Must match the existing environment's mount path.
- `--skip-mount-path-check`: REQUIRED for agents — skips interactive mount path validation
- `--skip-update-check`: RECOMMENDED — skips interactive package update check
- `--auto-publish`: Publish the site after deployment
- `-e` / `--environment`: Environment name to deploy to
- `--project-name` / `-p`: Project name (for new projects)
- `--directory` / `-d`: Project directory if not in root
- `--description`: Project description (for new projects)

**Success Indicators:**
- Build artifacts uploaded
- Deployment completed
- Project ID saved (first time)
- Site URL available

**Verification:**
1. Check CLI output for success
2. Verify project ID added to webflow.json (first time)
3. Confirm deployment URL works
4. Note if site needs to be published

### Error Handling

**CLI Not Installed:**
```
❌ Webflow CLI Not Found

The Webflow CLI is required for Webflow Cloud.

Installation:
npm install -g @webflow/webflow-cli

After installation, verify:
webflow --version

Documentation: https://developers.webflow.com/cli
```

**Not Authenticated:**
```
❌ Not Authenticated

You must authenticate with Webflow to deploy to Cloud.

Steps:
1. Run: webflow auth login
2. Follow authentication prompts in browser
3. Select your site when prompted
4. Verify: .env file created with WEBFLOW_SITE_ID and WEBFLOW_SITE_API_TOKEN
5. Retry deployment

Need help? https://developers.webflow.com/cli/authentication
```

**Not a Cloud Project:**
```
❌ Not a Webflow Cloud Project

This directory doesn't appear to be a Cloud project.

Initialize Cloud Project:
1. List templates: webflow cloud list
2. Initialize: webflow cloud init -f <framework>
   Example: webflow cloud init -f astro -m /app

Or check webflow.json for cloud configuration:
{
  "cloud": {
    "framework": "astro" or "nextjs"
  }
}
```

**Build Failures:**
```
❌ Build Failed

Error: [Specific error message]

Common Fixes:
- Missing dependencies: Run npm install
- Build script errors: Check package.json build script
- Framework errors: Review framework documentation
- Path issues: Verify file paths and imports

Show build output for details.
```

**Deployment Failures:**
```
❌ Deployment Failed

Error: [Specific error from CLI]

Possible Causes:
- Network connection issues
- Authentication expired
- Build artifacts missing or invalid
- Insufficient permissions

Solutions:
1. Check internet connection
2. Re-authenticate: webflow auth login
3. Rebuild: npm run build
4. Verify webflow.json configuration
5. Check site permissions in Webflow dashboard

Retry deployment? (yes/no)
```

**Invalid Framework:**
```
❌ Invalid Framework

Framework must be either "astro" or "nextjs".

Available templates:
Run: webflow cloud list

Initialize with valid framework:
webflow cloud init -f astro
webflow cloud init -f nextjs
```

### File Operations

**Reading Files:**
Always use Read tool (never modify):
```
# View Cloud configuration
Read: webflow.json

# View package configuration
Read: package.json

# View environment (if exists)
Read: .env

# View build output
Read: dist/ or .next/ or .output/
```

**Discovering Files:**
Use Glob tool to find files:
```
# Find configuration files
Glob: *.json

# Find build output
Glob: dist/**/*

# Find source files
Glob: src/**/*
```

**Never Use Write/Edit Tools:**
- Don't create webflow.json with Write (show user the structure)
- Don't modify configuration files
- Let CLI handle file creation
- Only read files to show content

### Progress Indicators

**For Build:**
```
🔨 Building Application...

Compiling pages... ✓
Optimizing assets... ✓
Generating build... ⏳

Elapsed: 15s
```

**For Deployment:**
```
🚀 Deploying to Webflow Cloud...

Uploading artifacts... ✓
Deploying application... ⏳
Configuring routes... ⏳

Uploaded: 1.2 MB
Elapsed: 25s
```

### Best Practices

**Project Setup:**
- Use `cloud list` to see available templates before init
- Choose framework based on project needs
- Specify mount path during init
- Connect to site ID if already created

**Development:**
- Build locally before deploying
- Test thoroughly in dev environment
- Use environment variables for configuration

**Deployment:**
- Always build before deploying
- Always use `--no-input --mount <MOUNT_PATH> --skip-mount-path-check --skip-update-check` for non-interactive deploys
- Use `--auto-publish` for production deployments
- Test deployment before publishing site

**CI/CD:**
- Store credentials in secrets
- Always use `--no-input` to disable all interactive prompts
- Always specify `--mount` with the correct path
- Enable auto-publish for production
- Use `--skip-mount-path-check` and `--skip-update-check`

**Environment Management:**
- Use .env for local development
- Add .env to .gitignore
- Use CI/CD secrets for production
- Rotate tokens regularly

## Quick Reference

**Workflow:** list templates → init project → build → deploy

**Key Commands:**
- `webflow cloud list` - List available templates
- `webflow cloud init` - Initialize new project
- `webflow cloud deploy` - Deploy application

**Init Options:**
- `-f` / `--framework` - Framework (astro, nextjs)
- `-m` / `--mount` - Mount path
- `-s` / `--site-id` - Site ID

**Deploy Options (for agents/automation, always include first 4):**
- `--no-input` - REQUIRED: disable interactive prompts
- `-m` / `--mount` - REQUIRED: mount path (must match existing environment)
- `--skip-mount-path-check` - REQUIRED: skip mount path validation prompt
- `--skip-update-check` - RECOMMENDED: skip update check prompt
- `--auto-publish` - Publish after deploy
- `-e` / `--environment` - Environment name
- `-p` / `--project-name` - Project name (new projects)

**Configuration:** webflow.json with cloud section

**Schema:**
```json
{
  "cloud": {
    "projectId": "proj_xxx", // auto-set
    "framework": "astro"      // or "nextjs"
  }
}
```

**Authentication:** Site authentication via `webflow auth login`

**Environment:** WEBFLOW_SITE_ID and WEBFLOW_SITE_API_TOKEN in .env

**Verification:** Check `webflow --version` and site authentication first

**Confirmation:** Require "deploy" keyword before deployment

**Documentation:** https://developers.webflow.com/webflow-cloud/intro
