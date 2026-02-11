# Project Structure

## Directory Organization

```
pony-demo/
├── index.html              # Single-page app entry
├── assets/
│   ├── images/            # Pony sprites, decorations, backgrounds
│   └── ui-sprites.css     # CSS sprite definitions
├── css/
│   ├── style.css          # Main styles and layout
│   ├── main-screen.css    # Main game screen styles
│   ├── game-style.css     # Mini-game UI styles
│   └── modals.css         # Modal dialog styles
└── js/
    ├── app.js             # Main controller, orchestrates all systems
    ├── horse.js           # Pet state, growth logic, persistence
    ├── renderer-svg.js    # Primary SVG renderer
    ├── renderer.js        # Legacy image-based renderer
    ├── interaction.js     # User interaction cooldowns
    ├── decoration.js      # Decoration drops and inventory
    ├── fortune.js         # Onboarding fortune-telling system
    ├── assist.js          # Friend assist/boost mechanics
    ├── checkin.js         # Daily check-in rewards
    ├── fragment.js        # Crafting currency system
    ├── achievement.js     # Achievement tracking
    ├── sharecard.js       # Social share card generation
    ├── phrases.js         # Random pet dialogue
    └── games/
        ├── race.js        # Horse racing game
        ├── match.js       # Match-3 puzzle
        ├── jump.js        # Flappy-bird style
        ├── catch.js       # Falling object catcher
        └── rhythm.js      # Rhythm timing game
```

## Module Responsibilities

### Core Systems
- `app.js` - Application lifecycle, UI coordination, modal management
- `horse.js` - Pet attributes, growth thresholds, decay mechanics
- `renderer-svg.js` - Visual representation of pet and decorations

### Feature Modules
Each feature module is self-contained with its own state management and localStorage persistence:
- Prefix localStorage keys with `pony_` (e.g., `pony_horse`, `pony_checkin`)
- Export class with clear public API
- Handle own data serialization/deserialization

### Game Modules
All games follow consistent pattern:
- Constructor: `(canvas, onEnd, ...extraParams)`
- `onEnd` callback: `{ score, fragments, ...extraData }`
- Canvas-based rendering with 2D context
- Self-contained game loop and cleanup

## Naming Conventions

- **Files**: kebab-case (e.g., `renderer-svg.js`)
- **Classes**: PascalCase (e.g., `HorseRenderer`)
- **Functions/Variables**: camelCase (e.g., `showToast`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `GROWTH_THRESHOLDS`)
- **CSS Classes**: kebab-case with BEM-like patterns (e.g., `.btn-action`, `.modal-overlay`)

## State Management

All state persists to localStorage with JSON serialization. No global state object - each module manages its own persistence.
