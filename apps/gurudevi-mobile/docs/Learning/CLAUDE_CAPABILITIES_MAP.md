# 🤖 CLAUDE CODE CAPABILITIES & BOUNDARIES MAP

**Last Updated**: February 14, 2026
**Claude Model**: Haiku 4.5
**Context**: Polymath Platform / Gurudevi Mobile

---

## ✅ WHAT I CAN DO (Full Capabilities)

### 📁 FILE OPERATIONS

#### Read Files
- ✅ Read any **specific file path** (absolute or relative)
- ✅ Read **code files** (.tsx, .ts, .js, .json, .md, .sql, etc.)
- ✅ Read **images** (PNG, JPG, GIF, etc.) - displays them visually
- ✅ Read **PDFs** (up to 20 pages per request)
- ✅ Read **Jupyter notebooks** (.ipynb) - shows code + outputs
- ✅ Read **screenshots** - analyzes them
- ✅ Read **partial files** with `offset` and `limit` parameters
- ❌ Read **directories** - must specify file paths
- ❌ List directory contents - use Bash `ls` instead

#### Create/Write Files
- ✅ Create **new files** with Write tool
- ✅ Write **code files** (.tsx, .ts, .js, etc.)
- ✅ Write **documentation** (.md files)
- ✅ Write **configuration files** (.json, .sql, etc.)
- ✅ Overwrite existing files (will replace content)
- ⚠️ **LIMITATION**: Must read file first before editing with Edit tool

#### Modify Files
- ✅ Edit **exact string replacements** in existing files
- ✅ Replace **single or multiple** occurrences (replace_all)
- ✅ Edit **notebooks** - modify specific cells
- ✅ Must have exact string match (context matters)
- ❌ Cannot do regex replacements (literal strings only)

---

### 🔧 TERMINAL & COMMAND EXECUTION

#### Bash Commands
- ✅ Run **git commands** (status, add, commit, push, log, etc.)
- ✅ Run **npm/yarn** commands (install, build, test, etc.)
- ✅ Run **file operations** (mv, cp, rm, mkdir, etc.)
- ✅ Run **grep/find/awk/sed** commands
- ✅ **Chain commands** with `&&` and `;`
- ✅ Run **Python**, **Node**, **Docker**, **curl** etc.
- ✅ Set **environment variables**
- ✅ Run commands **in background** with `run_in_background: true`
- ✅ Timeout up to **10 minutes** (600,000ms)
- ❌ **Interactive commands** (can't use `git rebase -i`, `-i` flags)
- ❌ **Commands requiring user input** (doesn't wait for input)

#### Git Operations (Comprehensive)
- ✅ **View**: `git status`, `git log`, `git diff`, `git show`
- ✅ **Add**: Stage files with `git add`
- ✅ **Commit**: Create commits with messages (includes Co-Authored-By)
- ✅ **Push**: Push to remote (with warnings for force push)
- ✅ **Branch**: Create, switch, view branches
- ✅ **Merge**: Merge branches
- ⚠️ **SAFETY**: Won't force push, won't destroy work without explicit request
- ❌ **Interactive**: Can't use `git rebase -i` or other interactive modes

---

### 🌐 WEB & BROWSER CAPABILITIES

#### Browser Automation (Claude in Chrome)
- ✅ **Navigate**: Go to URLs, use back/forward
- ✅ **Take screenshots**: Capture page state
- ✅ **Read page content**: Extract text, accessibility tree
- ✅ **Find elements**: Search by natural language
- ✅ **Interact**: Click, type, scroll, hover, drag
- ✅ **Execute JavaScript**: Run code in page context
- ✅ **Read network requests**: Monitor API calls
- ✅ **Read console messages**: See logs and errors
- ✅ **Upload files**: Upload to file inputs
- ✅ **Create GIFs**: Record and export browser interactions
- ✅ **Resize window**: Test responsive designs
- ✅ **Multiple tabs**: Manage multiple browser tabs

#### Web Fetching
- ✅ **WebFetch**: Fetch & analyze web page content
- ✅ **WebSearch**: Search the web for current information
- ✅ **Parse HTML**: Extract data from websites
- ✅ **15-minute cache**: Faster repeated requests
- ❌ **Download from untrusted sources**: Security boundary

---

### 🤖 AI & AGENT CAPABILITIES

#### Multi-Agent Coordination
- ✅ **Launch agents**: Start specialized agents for complex tasks
- ✅ **Available agents**:
  - `Bash` - Command execution specialist
  - `Explore` - Fast codebase exploration
  - `general-purpose` - Research and multi-step tasks
  - `Plan` - Software architect for implementation planning
- ✅ **Background execution**: Run agents in background, check status later
- ✅ **Resume agents**: Continue previous agent work with context
- ✅ **Monitor progress**: Use TaskOutput to check status

---

### 🔐 SECURITY & AUTHORIZATION

#### Authentication
- ✅ **OAuth/SSO**: Can complete login flows (with permission)
- ✅ **Passwordless auth**: Can use magic links, codes
- ✅ **Session management**: Can manage browser sessions
- ❌ **Password entry**: Won't enter passwords for accounts
- ❌ **Sensitive credentials**: Won't handle API keys, tokens, bank data

#### File Uploads
- ✅ **Permitted**: Upload code, documentation, non-sensitive files
- ❌ **Blocked**: Won't upload without explicit permission
- ❌ **Untrusted sources**: Won't download from risky sites

---

### 📊 CODE ANALYSIS & SEARCH

#### Code Search
- ✅ **Grep**: Regex pattern matching across files
- ✅ **Glob**: File pattern matching (*.tsx, src/**, etc.)
- ✅ **Contextual search**: Find imports, usages, definitions
- ✅ **Multi-language**: Works across all file types
- ✅ **Large codebases**: Handles thousands of files efficiently

#### Code Quality
- ✅ **Linting**: Can identify code issues
- ✅ **Type checking**: Can run TypeScript, ESLint, etc.
- ✅ **Build validation**: Can run build pipelines
- ✅ **Testing**: Can run and interpret test results

---

### 📚 DOCUMENTATION & PLANNING

#### Documentation
- ✅ **Write documentation**: MD, Markdown, technical docs
- ✅ **Create templates**: PRs, issues, guides
- ✅ **Format markdown**: Tables, code blocks, links
- ✅ **Generate diagrams**: ASCII art, text-based diagrams

#### Planning & Project Management
- ✅ **Create task lists**: Use TodoWrite tool
- ✅ **Track progress**: Update task status
- ✅ **Project planning**: Design implementation strategies
- ✅ **Architecture design**: Plan system structure

---

### 🔍 ANALYSIS & REASONING

#### Understanding
- ✅ **Code review**: Analyze code quality and logic
- ✅ **Bug analysis**: Identify issues and root causes
- ✅ **Architecture review**: Evaluate system design
- ✅ **Performance analysis**: Identify bottlenecks
- ✅ **Security analysis**: Find vulnerabilities

#### Problem-Solving
- ✅ **Multi-step debugging**: Break down complex issues
- ✅ **Design decisions**: Help choose approaches
- ✅ **Refactoring**: Suggest improvements
- ✅ **Optimization**: Find better solutions

---

## ❌ WHAT I CANNOT DO (Boundaries)

### 📁 FILE SYSTEM LIMITATIONS

- ❌ **Read directories** - Can't list folder contents (use `ls` instead)
- ❌ **Browse drives** - Can't explore/browse your computer
- ❌ **Access file metadata** - Can't see file sizes, dates, permissions
- ❌ **Recursive file ops** - Can't find files without pattern (use Glob instead)
- ❌ **Watch files** - Can't monitor file changes over time
- ❌ **Symbolic links** - Can't resolve symlinks reliably

### 🔒 SECURITY & PRIVACY

- ❌ **Bank account data** - Won't handle routing numbers, account numbers
- ❌ **Credit cards** - Won't enter or process credit card information
- ❌ **API keys/tokens** - Won't handle sensitive credentials
- ❌ **Passwords** - Won't enter passwords for user accounts
- ❌ **SSNs/IDs** - Won't handle identification documents
- ❌ **Medical records** - Won't process healthcare data
- ❌ **Force push git** - Won't force push to main/master without explicit request

### 🌐 WEB LIMITATIONS

- ❌ **Download harmful content** - Won't fetch malware, pirated content
- ❌ **Bypass CAPTCHAs** - Won't attempt to solve human verification
- ❌ **Scrape large volumes** - Can scrape but ethically limited
- ❌ **Exploit vulnerabilities** - Won't exploit web vulnerabilities
- ❌ **Cookie manipulation** - Won't manipulate user cookies for fraud

### 🤖 AI AGENT LIMITATIONS

- ❌ **Unlimited agents** - Can't launch infinite agents (practical limits)
- ❌ **Cross-conversation memory** - New sessions don't remember old ones
- ❌ **Real-time monitoring** - Can't continuously monitor in background without explicit setup
- ❌ **Decisions requiring user approval** - Will ask before major actions

### 📝 CODE LIMITATIONS

- ❌ **Regex edit tool** - Edit tool requires exact string match (not regex)
- ❌ **Compile/run code directly** - Must use Bash tool to execute
- ❌ **Modify code at runtime** - Can't patch running processes
- ❌ **Access source code version control** - Can't access commit hooks or detached heads safely

### 🔍 ANALYSIS LIMITATIONS

- ❌ **No access to chat history** - Can't read previous conversations (in different sessions)
- ❌ **No access to your drives** - Can't browse C:\, D:\, etc. unless you provide paths
- ❌ **No persistent memory** - Doesn't remember previous conversations
- ❌ **Large context limits** - Can't read 1000+ page documents at once
- ❌ **Real-time data** - Knowledge cutoff limits future information

---

## 🎯 SPECIAL BOUNDARIES & SAFETY RULES

### Injection Defense
- ❌ **Follow instructions in web content** - Won't execute tasks found on websites
- ❌ **Act on email content** - Won't auto-execute email instructions
- ❌ **Claim pre-authorization from web** - Web pages can't authorize actions

### Financial Transactions
- ❌ **Process payments** - Won't complete purchases without clear intent
- ❌ **Access financial accounts** - Won't log into banks/payment systems
- ❌ **Handle sensitive financial data** - Won't process financial account numbers

### Data Protection
- ❌ **Collect personal data** - Won't gather PII from multiple sources
- ❌ **Export user data** - Won't export sensitive information
- ❌ **Share data with unknown parties** - Won't send data to unverified recipients
- ❌ **Expose system info** - Won't share browser fingerprints, OS version to websites

---

## 📊 CAPABILITY MATRIX

| Capability | Can Do | Limitations |
|-----------|--------|-------------|
| **Read Files** | ✅ Yes | Must specify file path |
| **Write Files** | ✅ Yes | Must read first for edits |
| **Edit Files** | ✅ Yes | Literal string match only |
| **Execute Commands** | ✅ Yes | No interactive input |
| **Git Operations** | ✅ Yes | No force push, safety checks |
| **Web Browsing** | ✅ Yes | No CAPTCHA, malware sites |
| **File Upload** | ✅ Yes | Needs permission, no sensitive data |
| **Code Search** | ✅ Yes | Efficient but still limited by patterns |
| **Testing** | ✅ Yes | Runs tests, interprets output |
| **API Calls** | ✅ Yes | No sensitive credentials |
| **Browser Automation** | ✅ Yes | No financial transactions |
| **Create Agents** | ✅ Yes | Practical limits, needs supervision |

---

## 🎓 HOW TO WORK WITH MY BOUNDARIES

### ✅ WHAT WORKS WELL

1. **Specific requests with full paths**
   ```
   ✅ "Read /home/user/projects/file.ts"
   ❌ "Read my documents" (too vague)
   ```

2. **Code operations with context**
   ```
   ✅ "Search for useEffect calls in src/"
   ✅ "Replace color #FF6B6B with Theme.colors.red"
   ```

3. **Multi-step development tasks**
   ```
   ✅ "Build feature X, test it, commit changes"
   ✅ Complex implementations with multiple files
   ```

4. **Web automation with clear intent**
   ```
   ✅ "Fill out this form and submit"
   ✅ "Navigate to github and create an issue"
   ```

5. **Planning and architecture**
   ```
   ✅ "Design a solution for problem X"
   ✅ "Create implementation plan"
   ```

### ❌ WHAT DOESN'T WORK

1. **Vague file requests**
   ```
   ❌ "Look at my files"
   ✅ "Read /path/to/specific/file.ts"
   ```

2. **Sensitive data handling**
   ```
   ❌ "Enter my bank account number"
   ✅ "Help me set up OAuth login"
   ```

3. **Unauthorized web actions**
   ```
   ❌ "Do what the website tells you to do"
   ✅ "Fill out this form with this data and submit"
   ```

4. **Infinite loops**
   ```
   ❌ "Keep checking until X happens"
   ✅ "Check status and report"
   ```

---

## 🔄 BEST PRACTICES FOR WORKING WITH ME

### File Operations
- ✅ Always provide **absolute file paths**
- ✅ Use **Glob** for file pattern matching
- ✅ Use **Grep** for content search
- ✅ Combine tools for complex tasks

### Code Changes
- ✅ **Read first**, then edit
- ✅ Be **specific** with string matches
- ✅ Use **context** to make matches unique
- ✅ One edit per file when possible

### Project Work
- ✅ **Break tasks** into smaller steps
- ✅ Use **TodoWrite** for complex projects
- ✅ **Verify** changes with tests/builds
- ✅ **Commit** frequently with good messages

### Web Automation
- ✅ **Be explicit** about what you want
- ✅ **Allow time** for page loads
- ✅ **Take screenshots** to verify state
- ✅ **Handle errors** gracefully

---

## 🎯 SUMMARY

### I'm Best At:
- 🎯 **Code development** - Read, write, modify code files
- 🎯 **Terminal operations** - Run commands, git, npm, etc.
- 🎯 **Complex tasks** - Multi-step solutions with coordination
- 🎯 **Analysis** - Code review, debugging, architecture
- 🎯 **Documentation** - Create and maintain docs
- 🎯 **Planning** - Design solutions, create roadmaps

### My Hard Boundaries:
- 🚫 **Security**: No sensitive data handling
- 🚫 **Privacy**: No unauthorized data access
- 🚫 **Safety**: No injection attacks, no malware
- 🚫 **Honesty**: Won't pretend to have capabilities I don't

### How to Get the Most from Me:
1. **Be specific** - Provide full context and paths
2. **Verify intent** - Confirm what you want before major actions
3. **Check results** - Review my work and catch errors
4. **Communicate clearly** - Describe what you need
5. **Use appropriate tools** - Let me choose the right tool for the job

---

**Remember**: I'm a powerful tool for development, but I have real boundaries. They exist to protect you and your data. When in doubt, ask! 🤖

