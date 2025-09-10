# Contributing to Velocity 🤝

Thank you for your interest in contributing to Velocity! This guide helps you get set up and make effective contributions.

## 🌟 Ways to Contribute

- 🐛 Report bugs and issues
- 🎱 Enhancing AI usage to make more accurate scenes 
- 💡 Propose features and improvements
- 📝 Improve documentation and examples
- 🎨 Create new YAML scene templates
- 🔧 Fix bugs and implement enhancements
- 🧪 Add tests and improve quality
- 🎬 Share showcase projects and use cases

## 🚀 Getting Started

### Development Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/0x-boss/velocity.git
   cd velocity
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Start the dev server**:
   ```bash
   npm run dev
   ```
5. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature
   # or
   git checkout -b fix/your-bug
   ```

### Project Structure

```
velocity/
├── src/
│ ├── parser/ # YAML parser and scene builder
│ ├── player/ # Player components
│ ├── components/ # UI components
│ └── App.jsx # App entry
├── public/
│ └── examples/ # Example scenes
├── docs/ # Documentation files
└── package.json
```

## 🎯 Contribution Guidelines

### Code Style
- Use consistent indentation (2 spaces)
- Follow React + hooks best practices
- Prefer small, focused functions
- Use descriptive names; keep components cohesive
- TypeScript welcomed where appropriate

### Commit Messages
Use clear, conventional commits:

```
feat: add new animation easing options
fix: resolve timeline parsing error
docs: update YAML syntax examples
style: refine button hover states
```

### Pull Request Process
1. Test changes locally
2. Update docs if new behavior is introduced
3. Add or update examples when relevant
4. Write a descriptive PR body
5. Link related issues (e.g., fixes #123)

## 🐛 Reporting Issues

Before opening an issue, search existing ones. When filing:

1. Clear reproduction steps
2. Expected vs. actual behavior
3. Environment details
4. Minimal YAML snippet if applicable

Template:
```markdown
**Bug Description**
What happened?

**To Reproduce**
1. Steps...
2. Steps...

**Expected Behavior**
What you expected.

**YAML**
```yaml
# minimal example

**Environment**
- OS: [e.g. Windows 11, macOS 14]
- Browser: [e.g. Chrome 120, Firefox 115]
- Node.js: [e.g. 18.17.0]
```

## 💡 Feature Requests

When proposing features:
1. Describe the use case and value
2. Provide examples or sketches
3. Consider scope (start small, iterate)

## 📚 Documentation

Help by:
- Adding missing examples to `docs/docs.md`
- Improving clarity and flow
- Creating tutorials and guides
- Enhancing inline comments

## 🤔 Questions?

- Issues: https://github.com/0x-boss/velocity/issues
- Discussions: https://github.com/0x-boss/velocity/discussions
- Docs live in `docs/`

## 🏆 Recognition

Contributors may be:
- Listed in acknowledgments
- Mentioned in release notes for notable work
- Invited to deeper collaboration

## 📜 Code of Conduct

By participating, you agree to:
- Be respectful and inclusive
- Provide constructive feedback
- Focus on what’s best for the community
- Show empathy toward others

## 🎉 Thank You!

Every contribution makes Velocity better for everyone. We appreciate your time and effort—happy contributing! 🚀
