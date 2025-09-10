# AI Video Editor 🎬✨

> **Create stunning motion graphics and animations using AI-powered YAML scene descriptions**

![Demo](docs/demo.gif)

A revolutionary video editor that lets you create professional motion graphics by simply describing your vision in natural language or structured YAML. Built with React, Remotion, and powered by advanced AI scene parsing.

## 🌟 Features

- **🤖 AI-Powered Scene Generation** - Describe your video in natural language and watch it come to life
- **📝 YAML-Based Scene Authoring** - Write scenes using intuitive YAML syntax with powerful animation controls
- **🎨 Rich Visual Elements** - Support for text, images, shapes, paths, and complex layouts
- **⚡ Real-time Preview** - Instant feedback with live preview and hot-reload
- **🎭 Advanced Animations** - Sophisticated animation system with easing, staggering, and timeline control
- **📱 Responsive Design** - Adaptive layouts that work across different screen sizes
- **🎯 3D Transforms** - Built-in 3D perspective and depth controls
- **🎬 Professional Export** - Export to high-quality video formats using Remotion

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/ai-video-editor.git
cd ai-video-editor/aivideo

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see the editor in action!

## 📖 Usage

### Basic Example

Create a simple scene by describing it in YAML:

```yaml
scene:
  name: "Hello World"
  width: 1280
  height: 720
  background: "#101214"
  elements:
    - type: text
      txt: "Hello, AI Video!"
      fs: 64
      color: "#fff"
      center: true
      animations:
        - steps:
            - type: anime
              duration: 1.0
              props:
                opacity: {from: 0, to: 1}
                y: {from: 20, to: 0}
```

### Advanced Features

- **Text Animations**: Character and word-level reveals with staggering
- **Path Motion**: Animate elements along custom paths
- **3D Effects**: Depth, perspective, and parallax
- **Timeline Control**: Precise timing and sequencing
- **Responsive Layouts**: Flexbox-based positioning system

## 🎯 Examples

The project includes several example scenes demonstrating different capabilities:

- **Enhanced Bank Hack** - Cybersecurity terminal simulation
- **Bank Hacking Simulation** - Advanced hacking interface
- **Google Search → Website Transition** - Realistic web browsing flow

Load any example from the UI or check the [`/public/examples`](public/examples) directory.

## 📚 Documentation

- **[Complete YAML Syntax Guide](docs/docs.md)** - Comprehensive reference for scene authoring
- **[AI Prompt Guide](docs/prompt.md)** - How to work with AI-generated scenes
- **[API Reference](#)** - Coming soon

## 🛠️ Architecture

```
aivideo/
├── src/
│   ├── parser/          # YAML to React component parser
│   ├── player/          # Video player component
│   └── components/      # UI components
├── public/
│   └── examples/        # Example scene files
└── docs/               # Documentation
```

## 🎨 Creating Your First Scene

1. **Start Simple**: Begin with basic text and shapes
2. **Add Motion**: Use the animation system to bring elements to life
3. **Layer Effects**: Combine multiple elements and animations
4. **Fine-tune Timing**: Use the timeline system for precise control
5. **Export**: Render your creation to video

## ⚠️ Current Status

**🚧 This project is in active development** and may have some limitations:

- **Motion Variation**: Limited variety in animation presets and effects
- **AI Understanding**: The AI may occasionally misinterpret complex prompts
- **Control Granularity**: Some fine-grained controls are still being developed

We're continuously improving these aspects and welcome your feedback!

## 🤝 Contributing

We welcome contributions from the community! Whether you're fixing bugs, adding features, or improving documentation, your help makes this project better.

**See our [Contributing Guide](CONTRIBUTING.md) for detailed information on:**
- How to set up the development environment
- Code style and conventions
- Submitting pull requests
- Reporting issues

## 🗺️ Roadmap

- [ ] Enhanced AI prompt understanding
- [ ] More animation presets and effects
- [ ] Advanced 3D capabilities
- [ ] Audio synchronization
- [ ] Plugin system for custom elements
- [ ] Cloud rendering service
- [ ] Collaborative editing

## 🛡️ License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Remotion](https://remotion.dev) for video rendering
- Powered by [Anime.js](https://animejs.com) for smooth animations
- UI components built with React

## 📞 Support

- 📧 **Issues**: [GitHub Issues](https://github.com/yourusername/ai-video-editor/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/yourusername/ai-video-editor/discussions)
- 📖 **Documentation**: [docs/docs.md](docs/docs.md)

---

**Made with ❤️ by the AI Video Editor team**

*Transform your ideas into stunning visuals with the power of AI and modern web technologies.*
