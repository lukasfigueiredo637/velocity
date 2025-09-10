# Contributing to AI Video Editor 🤝

Thank you for your interest in contributing to AI Video Editor! We're excited to have you as part of our community. This guide will help you get started with contributing to the project.

## 🌟 Ways to Contribute

There are many ways you can help make AI Video Editor better:

- 🐛 **Report bugs** and issues
- 💡 **Suggest new features** or improvements
- 📝 **Improve documentation** and examples
- 🎨 **Create new scene templates** and examples
- 🔧 **Fix bugs** and implement features
- 🧪 **Write tests** and improve code quality
- 🎬 **Share your creations** and use cases

## 🚀 Getting Started

### Development Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/yourusername/ai-video-editor.git
   cd ai-video-editor/aivideo
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Create a new branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

### Project Structure

```
aivideo/
├── src/
│   ├── parser/          # YAML parser and scene builder
│   ├── player/          # Video player components
│   ├── components/      # UI components
│   └── App.jsx         # Main application
├── public/
│   └── examples/        # Example scene files
├── docs/               # Documentation files
└── package.json        # Dependencies and scripts
```

## 🎯 Contribution Guidelines

### Code Style

- Use **consistent indentation** (2 spaces)
- Follow **React best practices** and hooks patterns
- Write **descriptive variable names** and comments
- Keep functions **small and focused**
- Use **TypeScript** where applicable

### Commit Messages

Use clear, descriptive commit messages:

```
feat: add new animation easing options
fix: resolve timeline parsing error
docs: update YAML syntax examples
style: improve button hover states
```

### Pull Request Process

1. **Ensure your code works** by testing locally
2. **Update documentation** if you're adding new features
3. **Add examples** for new YAML syntax or features
4. **Write descriptive PR description** explaining your changes
5. **Link related issues** using keywords like "fixes #123"

## 🐛 Reporting Issues

When reporting bugs or issues:

1. **Check existing issues** first to avoid duplicates
2. **Use the issue template** if available
3. **Provide clear reproduction steps**
4. **Include your environment details** (OS, browser, Node version)
5. **Add relevant YAML code** that demonstrates the issue

### Issue Template

```markdown
**Bug Description**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Create scene with '...'
2. Add animation '....'
3. See error

**Expected Behavior**
What you expected to happen.

**YAML Code**
```yaml
# Your YAML scene code here
```

**Environment**
- OS: [e.g. Windows 11, macOS 14]
- Browser: [e.g. Chrome 120, Firefox 115]
- Node.js: [e.g. 18.17.0]
```

## 💡 Feature Requests

We love hearing your ideas! When suggesting new features:

1. **Check if it already exists** in issues or roadmap
2. **Describe the use case** - why would this be useful?
3. **Provide examples** of how it would work
4. **Consider the scope** - start with smaller, focused features

## 🎨 Contributing Examples

New scene examples are always welcome! To add an example:

1. **Create a new YAML file** in `public/examples/`
2. **Follow naming convention**: `descriptive-name.yaml`
3. **Add comprehensive comments** explaining techniques used
4. **Test thoroughly** to ensure it works correctly
5. **Update the examples list** in `src/App.jsx`

### Example Guidelines

- **Keep scenes focused** on demonstrating specific features
- **Use realistic content** that showcases practical use cases  
- **Include comments** explaining complex animations or layouts
- **Optimize performance** - avoid overly complex scenes that might lag
- **Follow YAML best practices** from the documentation

## 🧪 Testing

Currently, we primarily rely on manual testing. You can help by:

- **Testing your changes** across different browsers
- **Verifying examples work** correctly
- **Checking performance** with complex scenes
- **Testing edge cases** and error conditions

Future contributions to automated testing are highly welcome!

## 📚 Documentation

Documentation improvements are incredibly valuable:

- **Add missing examples** to the syntax guide
- **Clarify confusing sections** 
- **Create tutorials** for common use cases
- **Improve code comments** and inline documentation

## 🎯 Areas Needing Help

We especially welcome contributions in these areas:

### High Priority
- 🎨 **More animation presets** and easing functions
- 🤖 **Improved AI prompt understanding** and parsing
- 🎬 **Additional visual effects** and filters
- 📱 **Mobile responsiveness** improvements

### Medium Priority  
- 🧪 **Automated testing** setup and test cases
- 🎵 **Audio synchronization** features
- 🔧 **Performance optimizations** for complex scenes
- 📖 **Interactive tutorials** and guides

### Lower Priority
- 🌐 **Internationalization** support
- 🔌 **Plugin system** architecture
- ☁️ **Cloud rendering** integration
- 👥 **Collaborative editing** features

## 🤔 Questions?

If you have questions about contributing:

- 💬 **Start a discussion** on GitHub Discussions
- 📧 **Open an issue** with the "question" label
- 📖 **Check the documentation** in the `docs/` folder

## 🏆 Recognition

Contributors will be:
- **Listed in our contributors** section
- **Mentioned in release notes** for significant contributions
- **Invited to join** our contributor community

## 📜 Code of Conduct

Please note that this project follows a Code of Conduct. By participating, you agree to:

- **Be respectful** and inclusive of all contributors
- **Provide constructive feedback** and criticism
- **Focus on what's best** for the community and project
- **Show empathy** towards other community members

## 🎉 Thank You!

Every contribution, no matter how small, helps make AI Video Editor better for everyone. We appreciate your time and effort in helping us build something amazing together!

---

**Happy Contributing! 🚀**

*Let's create the future of AI-powered video editing together.*
