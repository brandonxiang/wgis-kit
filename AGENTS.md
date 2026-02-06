# AGENTS.md - Coding Agent Instructions for wgis-kit

## Project Overview

wgis-kit is a WebGIS toolkit monorepo focused on coordinate transformation and map visualization.
Built with pnpm workspaces, it contains two packages:

- `@wgis/kit` - Core library for coordinate conversion and shapefile I/O
- `@wgis/web` - Leaflet-based web application for map visualization

## Project Structure

```
wgis-kit/
├── packages/
│   ├── kit/                    # Core library
│   │   ├── src/
│   │   │   ├── index.js        # Main exports
│   │   │   ├── utils/          # Coordinate transforms
│   │   │   └── shapefile/      # SHP read/write
│   │   └── types/              # TypeScript declarations
│   └── web/                    # Web application
│       ├── src/
│       │   ├── index.js        # App entry
│       │   ├── components/     # UI components
│       │   ├── config.js       # Leaflet config
│       │   └── background-layer.js  # Tile layers
│       └── demo-data/          # Sample GeoJSON/SHP files
├── package.json                # Root workspace config
└── pnpm-lock.yaml
```

## Build/Dev Commands

```bash
# Install dependencies
pnpm install

# Start development server (web app)
pnpm dev

# Build for production
pnpm build

# Generate TypeScript declarations for @wgis/kit
pnpm --filter @wgis/kit run tsd

# Lint all source files
pnpm lint

# Format all source files
pnpm format

# Fix linting issues automatically
pnpm lint:fix

# Fix formatting issues automatically
pnpm format:fix
```

## Package-specific Commands

```bash
# Run commands in specific package
pnpm --filter @wgis/kit <command>
pnpm --filter @wgis/web <command>
```

## Testing

No test framework is currently configured. When adding tests:
- Consider using Vitest for its Vite integration
- Place tests in `__tests__/` directories or `*.test.js` files

## Code Style Guidelines

### Language & Module System

- **JavaScript (ES Modules)** - All source files use `.js` extension with ESM
- **TypeScript declarations** - Manual `.d.ts` files in `types/` directory
- Target: ESNext

### Imports

```javascript
// External packages first
import { open } from 'shapefile'

// Internal imports (relative paths with .js extension optional)
import { L } from './config'
import { wgs84togcj02, gcj02tobd09 } from '@wgis/kit'

// Named exports preferred over default exports
export { functionA, functionB }
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Functions | camelCase | `readShapefile`, `wgs84togcj02` |
| Constants | UPPER_SNAKE or camelCase | `TRANSFORM_TYPES`, `x_PI` |
| Files | kebab-case | `coord-transform.js`, `file-panel.js` |
| Classes | PascalCase | `L.TileLayer` |

### Coordinate Function Naming

Follow the pattern: `{source}to{target}`
- `wgs84togcj02` - WGS84 to GCJ-02
- `gcj02tobd09` - GCJ-02 to BD-09
- `bd09togcj02` - BD-09 to GCJ-02

### Variable Declarations

```javascript
// Prefer const for immutable values
const PI = 3.1415926535897932384626;
const features = []

// Use let only when reassignment is needed
let dlat = transformlat(lng - 105.0, lat - 35.0);
```

### Function Style

```javascript
// Named function expressions for exports
const functionName = function functionName(param1, param2) {
    // implementation
};

// Or async functions with export
export async function readShapefile(shpBuffer, dbfBuffer) {
    // implementation
}
```

### Documentation (JSDoc)

```javascript
/**
 * Brief description of the function
 * @param {Type} paramName - Parameter description
 * @param {Type} [optionalParam] - Optional parameter
 * @returns {ReturnType} Return value description
 */
```

### Error Handling

```javascript
// Throw descriptive errors
if (!transformFn) {
    throw new Error(`Unknown transform: ${transform}`)
}

// Use try-catch in async operations
try {
    const geojson = await readShapefileFromFiles(shpFile, dbfFile)
} catch (err) {
    console.error(err)
    status.textContent = `加载失败: ${err.message}`
}
```

### TypeScript Declarations

Place in `packages/kit/types/` mirroring `src/` structure:

```typescript
// types/shapefile/reader.d.ts
import type { FeatureCollection } from 'geojson';

export function readShapefile(
  shpBuffer: ArrayBuffer,
  dbfBuffer?: ArrayBuffer
): Promise<FeatureCollection>;
```

### Formatting

- 2-space indentation
- No semicolons at end of statements (in some files) - be consistent with existing file
- Single quotes for strings
- Trailing commas in multi-line arrays/objects

## Dependencies

### @wgis/kit
- `shapefile` - Read SHP files
- `shp-write` - Write SHP files

### @wgis/web  
- `leaflet` - Map rendering
- `vite` - Build tool
- `@wgis/kit` - Workspace dependency

## Important Patterns

### Coordinate Systems

| Code | Name | Usage |
|------|------|-------|
| WGS84 | GPS coordinates | International standard |
| GCJ-02 | Mars coordinates | Gaode, Tencent maps |
| BD-09 | Baidu coordinates | Baidu maps |

### GeoJSON Handling

Always return proper FeatureCollection structure:

```javascript
return {
    type: 'FeatureCollection',
    features: [...]
}
```

### Leaflet Integration

Access Leaflet via config:

```javascript
import { L } from './config'

// Use L.DomUtil, L.DomEvent for DOM operations
L.DomEvent.disableClickPropagation(container)
```

## Common Tasks

### Adding a new coordinate transform

1. Add function in `packages/kit/src/utils/coord-transform.js`
2. Export from `packages/kit/src/index.js`
3. Add type declaration in `packages/kit/types/utils/coord-transform.d.ts`
4. Update `TRANSFORM_TYPES` in `geojson-transform.js` if applicable

### Adding a new tile layer

1. Add in `packages/web/src/background-layer.js`
2. Export and add to layer control in `packages/web/src/index.js`
