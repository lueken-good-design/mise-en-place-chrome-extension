# Extension Icons

This folder should contain the following icon files:

- `icon16.png` - 16x16 pixels (toolbar icon)
- `icon48.png` - 48x48 pixels (extension management page)
- `icon128.png` - 128x128 pixels (Chrome Web Store listing)
- `logo.png` - Optional larger logo for branding in popup

## Requirements

- All icons must be PNG format
- Use Mise en Place brand colors (terracotta/cream)
- Keep designs simple and recognizable at small sizes
- Transparent background recommended

## Design Tips

- Use the main Mise en Place logo as a starting point
- Resize appropriately for each size
- Test how they look in Chrome's toolbar (dark and light themes)
- Ensure 16x16 icon is still recognizable

## Tools for Creating Icons

- **Figma** - Free design tool, great for icons
- **Canva** - Has icon templates
- **Favicon Generator** - [favicon-generator.org](https://www.favicon-generator.org/)
- **AI Tools** - DALL-E, Midjourney (for initial concepts)
- **Hire Designer** - Fiverr ($10-50 for professional icons)

## Brand Colors

- **Terracotta:** `#d4704c` (primary brand color)
- **Cream:** `#fffaf0` (background)
- **Dark Gray:** `#2d3748` (text)

## Examples

Good icon characteristics:
- Simple, bold shapes
- High contrast
- Recognizable at 16x16
- Matches Mise en Place brand

Avoid:
- Too much detail at small sizes
- Low contrast colors
- Complex gradients that don't scale well
- Text (won't be readable at 16x16)

## Testing

After creating icons:
1. Replace placeholder references in `manifest.json`
2. Load extension in Chrome (unpacked)
3. Check how icon looks in:
   - Browser toolbar
   - Extensions page
   - During installation flow

Make adjustments based on how they actually appear in the browser.
