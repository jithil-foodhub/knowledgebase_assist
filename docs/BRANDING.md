# Foodhub Brand Implementation 🎨

This document outlines how the Foodhub brand guidelines have been implemented throughout the Knowledge Base Assistant application.

## Brand Guidelines Reference

Based on [Foodhub Brand Guidelines](https://brand.foodhub.com/), we've implemented:

---

## 🎨 **Color Palette**

### Primary Color
- **Foodhub Red**: `#D82927`
  - RGB: 216, 41, 39
  - CMYK: 9, 97, 100, 1
  - Usage: Primary buttons, headers, accents, CTAs

### Secondary Colors (Available for promotions)
- **Orange**: `#EF901C` (RGB: 239, 144, 28)
- **Yellow**: `#FEBE1B` (RGB: 254, 190, 27)
- **Teal**: `#009A90` (RGB: 0, 154, 144)
- **Purple**: `#745CA8` (RGB: 116, 92, 168)
- **Dark Purple**: `#2B0E3A` (RGB: 43, 14, 58)

### Common Colors
- **Black**: `#111111` (RGB: 17, 17, 17)
- **White**: `#FFFFFF` (RGB: 255, 255, 255)

### Hyperlinks
- **Link Blue**: `#198EBC` (RGB: 25, 142, 188)

---

## 🔤 **Typography**

### Primary Font Family
- **Lato** (Sans-serif)
  - Weights: 300 (Light), 400 (Regular), 700 (Bold), 900 (Black)
  - Implementation: Google Fonts via Next.js
  - Location: `src/app/layout.tsx`

```typescript
import { Lato } from "next/font/google";

const lato = Lato({
  weight: ['300', '400', '700', '900'],
  subsets: ['latin'],
  display: 'swap',
});
```

---

## 🎯 **Implementation Details**

### Tailwind Configuration

**File**: `tailwind.config.ts`

```typescript
colors: {
  foodhub: {
    primary: '#D82927',      // Primary Red
    orange: '#EF901C',       // Secondary Orange
    yellow: '#FEBE1B',       // Secondary Yellow
    teal: '#009A90',         // Secondary Teal
    purple: '#745CA8',       // Secondary Purple
    darkpurple: '#2B0E3A',   // Secondary Dark Purple
    black: '#111111',        // Common Black
    link: '#198EBC',         // Hyperlink Blue
  },
}
```

### Usage Classes

```css
/* Primary Color */
bg-foodhub-primary    → Background: Foodhub Red
text-foodhub-primary  → Text: Foodhub Red
border-foodhub-primary → Border: Foodhub Red

/* Text Colors */
text-foodhub-black    → Text: #111111
text-foodhub-link     → Text: Link Blue

/* Hover States */
hover:bg-red-700      → Darker red on hover
hover:text-foodhub-primary → Red text on hover
```

---

## 📄 **Page-by-Page Implementation**

### Landing Page (`/`)

**Brand Elements**:
- ✅ Foodhub Red (`#D82927`) primary color
- ✅ Lato font throughout
- ✅ Professional, enterprise-grade design
- ✅ Clean white backgrounds
- ✅ Foodhub copyright in footer

**Key Components**:
- Logo badge (KB) with red background
- "Foodhub" subtitle under title
- Red hover states on cards
- Professional card-based layout
- Status indicators with brand colors

### Knowledge Base Page (`/knowledge-base`)

**Brand Elements**:
- ✅ Red primary buttons
- ✅ Consistent Lato typography
- ✅ Professional forms with red focus rings
- ✅ Status badges with appropriate colors:
  - ✓ Completed: Green
  - ⟳ Processing: Blue
  - ✗ Error: Red
- ✅ Red accents in instructions

**Interactive Elements**:
- Red "Add to Knowledge Base" button
- Red hover states on navigation
- Red focus rings on inputs
- Professional borders and shadows

### Conversation Page (`/conversation`)

**Brand Elements**:
- ✅ Red mode toggle (active state)
- ✅ Red send button
- ✅ Red animated loading dots
- ✅ Professional chat interface
- ✅ Link blue for source URLs

**Chat UI**:
- User messages: Red background (`#D82927`)
- Assistant messages: White with borders
- Red accents throughout
- Professional, clean design

---

## 🎨 **Design Principles**

### From Foodhub Brand Guidelines:

> "A brand is built and not just created - it means sustained efforts and initiatives over a period of time is what establishes a brand and its characteristics."

### Our Implementation:

1. **Consistency**
   - Foodhub Red used consistently for all primary actions
   - Lato font across all pages
   - Unified spacing and layout patterns

2. **Professionalism**
   - Clean, minimal design
   - Enterprise-grade appearance
   - No unnecessary decorations
   - Focus on functionality

3. **Brand Identity**
   - Red signifies: Assertive, determined, energetic, powerful
   - Professional color usage
   - Clear visual hierarchy

---

## 🔧 **Technical Implementation**

### Font Loading
```typescript
// src/app/layout.tsx
import { Lato } from "next/font/google";

const lato = Lato({
  weight: ['300', '400', '700', '900'],
  subsets: ['latin'],
  display: 'swap',
});
```

### Color Usage Examples
```tsx
// Primary Button
<button className="bg-foodhub-primary text-white hover:bg-red-700">
  Click Me
</button>

// Header Text
<h1 className="text-foodhub-black font-bold">
  Title
</h1>

// Link
<a className="text-foodhub-link hover:underline">
  Learn More
</a>

// Input Focus
<input className="focus:ring-2 focus:ring-foodhub-primary" />
```

---

## 📋 **Brand Compliance Checklist**

### ✅ Implemented

- [x] Primary color (#D82927) used for all primary actions
- [x] Lato font family throughout application
- [x] Professional, enterprise-grade design
- [x] Consistent spacing and layouts
- [x] Appropriate use of brand colors
- [x] Clean, unobstructed design
- [x] Foodhub branding in metadata
- [x] Professional status indicators
- [x] Link blue for hyperlinks
- [x] Black (#111111) for primary text

### 🎯 Brand Guidelines Adherence

**Color Usage**:
- ✅ Primary Red for business communications
- ✅ Secondary colors available but not overused
- ✅ Consistent brand identity

**Typography**:
- ✅ Lato font across all interfaces
- ✅ Appropriate font weights
- ✅ Clear hierarchy

**Design Philosophy**:
- ✅ Clean and professional
- ✅ Functionality-focused
- ✅ Enterprise-appropriate

---

## 🚫 **What We Avoided**

Per Foodhub guidelines, we avoided:

- ❌ Gradient backgrounds (kept professional)
- ❌ Overly decorative elements
- ❌ Inconsistent color usage
- ❌ Non-brand fonts
- ❌ Cluttered interfaces
- ❌ Consumer-focused designs

---

## 📱 **Responsive Design**

All pages maintain brand consistency across:
- **Desktop**: Full layouts with proper spacing
- **Tablet**: Optimized grids
- **Mobile**: Single-column, stacked elements

Brand colors and fonts remain consistent across all breakpoints.

---

## 🔄 **Future Enhancements**

Potential brand-aligned additions:
- [ ] Foodhub logo integration (if approved)
- [ ] Dark mode with brand-appropriate colors
- [ ] Additional secondary color usage for categories
- [ ] Custom icons matching brand style
- [ ] Loading animations with brand colors

---

## 📞 **Brand Permissions**

**Note**: This application uses Foodhub brand colors and typography for internal/enterprise use. Per Foodhub brand guidelines:

- Internal employees may use brand identity for business usage
- Third parties require written permission
- Brand identity must not be altered
- Usage must comply with brand guidelines

---

## 📖 **References**

- [Foodhub Brand Guidelines](https://brand.foodhub.com/)
- Tailwind Config: `tailwind.config.ts`
- Layout: `src/app/layout.tsx`
- Pages: `src/app/*/page.tsx`

---

**Brand Implementation Status**: ✅ **Complete**

All pages now follow Foodhub brand guidelines with:
- Primary red (#D82927)
- Lato font family
- Professional, enterprise-grade design
- Consistent brand identity

---

Built with ❤️ for Foodhub


