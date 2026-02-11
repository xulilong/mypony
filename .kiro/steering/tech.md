# Technical Stack

## Core Technologies

- **Frontend**: Vanilla JavaScript (ES6 modules)
- **Rendering**: SVG and Canvas 2D
- **Storage**: localStorage for all persistence
- **Build System**: None - direct file serving

## Architecture

- Module-based architecture with ES6 imports/exports
- No bundler or transpilation required
- No external dependencies or frameworks

## Key Libraries & Frameworks

None - pure vanilla JavaScript implementation

## File Structure

- `index.html` - Single-page application entry point
- `js/` - JavaScript modules
  - `app.js` - Main application controller
  - `horse.js` - Pet state and growth logic
  - `renderer-svg.js` - SVG-based rendering (primary)
  - `renderer.js` - Image-based rendering (legacy)
  - `games/` - Mini-game implementations
  - Feature modules: `interaction.js`, `decoration.js`, `fortune.js`, etc.
- `css/` - Stylesheets organized by feature
- `assets/` - Images and sprite definitions

## Common Commands

### Development
```bash
# Serve locally (any static server)
python -m http.server 8000
# or
npx serve pony-demo
```

### Testing
No automated tests - manual browser testing required

### Deployment
Copy `pony-demo/` directory to web server - no build step needed
