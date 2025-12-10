# 🎨 UI Design System - Visual Guide

## Color Palette

### Primary Colors
```css
--green-primary: #4CAF50      /* Main actions, success */
--green-dark: #45a049          /* Hover states */
--blue-primary: #3498db        /* Links, info */
--blue-dark: #2980b9          /* Link hover */
--teal: #1abc9c               /* Water tracking */
--red: #e74c3c                /* Exercise, delete */
```

### Neutral Colors
```css
--text-dark: #2c3e50          /* Headings */
--text-body: #64748b          /* Body text */
--text-light: #94a3b8         /* Placeholders */
--border: #e2e8f0             /* Borders, dividers */
--bg-light: #f8fafc           /* Input backgrounds */
--bg-white: #ffffff           /* Cards, modals */
```

## Typography

### Font Family
```css
font-family: 'Outfit', sans-serif;
```

### Font Sizes
```css
--heading-xl: 2.5rem          /* Page titles */
--heading-lg: 2rem            /* Section titles */
--heading-md: 1.5rem          /* Card titles */
--heading-sm: 1.125rem        /* Subsections */
--body: 1rem                  /* Body text */
--small: 0.875rem             /* Labels, meta */
--tiny: 0.75rem               /* Badges, hints */
```

## Spacing System

### Padding Scale
```css
--space-xs: 0.25rem   (4px)
--space-sm: 0.5rem    (8px)
--space-md: 1rem      (16px)
--space-lg: 1.5rem    (24px)
--space-xl: 2rem      (32px)
--space-2xl: 2.5rem   (40px)
--space-3xl: 3rem     (48px)
```

### Gap Scale (Flexbox/Grid)
```css
--gap-xs: 0.5rem
--gap-sm: 0.75rem
--gap-md: 1rem
--gap-lg: 1.5rem
--gap-xl: 2rem
```

## Border Radius

```css
--radius-sm: 0.5rem      /* Small elements */
--radius-md: 0.75rem     /* Inputs, buttons */
--radius-lg: 1rem        /* Cards (inner) */
--radius-xl: 1.25rem     /* Cards (outer) */
--radius-2xl: 1.5rem     /* Main containers */
--radius-pill: 9999px    /* Pills, badges */
```

## Shadows

### Card Shadows
```css
/* Default */
box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
border: 1px solid rgba(0, 0, 0, 0.05);

/* Hover */
box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
```

### Button Shadows
```css
/* Default */
box-shadow: 0 2px 8px rgba(76, 175, 80, 0.2);

/* Hover */
box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
```

## Component Styles

### Cards
```css
.card {
  background: white;
  border-radius: 1.5rem;
  padding: 2.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--color), var(--color-light));
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
}
```

### Buttons
```css
/* Primary Button */
.btn-primary {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
  border: none;
  border-radius: 0.75rem;
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.2);
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

/* Secondary Button */
.btn-secondary {
  background: white;
  color: #4CAF50;
  border: 1px solid #4CAF50;
  border-radius: 0.75rem;
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: rgba(76, 175, 80, 0.05);
}
```

### Form Inputs
```css
.form-input {
  height: 3rem;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  background: #f8fafc;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
  background: white;
}
```

### Progress Bars
```css
.progress-bar-container {
  height: 8px;
  background: #f1f5f9;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color), var(--color-light));
  border-radius: 4px;
  transition: width 0.5s ease;
}

.progress-bar-fill::after {
  content: '';
  position: absolute;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  animation: shimmer 2s infinite;
}
```

### Badges
```css
.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.badge.success {
  background: #e8f5e9;
  color: #4CAF50;
}

.badge.info {
  background: #e3f2fd;
  color: #2196F3;
}

.badge.warning {
  background: #fff3e0;
  color: #ff9800;
}

.badge.error {
  background: #ffebee;
  color: #f44336;
}
```

## Animations

### Hover Effects
```css
/* Card Hover */
@keyframes cardHover {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-4px);
  }
}

/* Button Hover */
.button:hover {
  transform: translateY(-2px);
}

/* Icon Hover */
.icon:hover {
  transform: scale(1.1);
}
```

### Loading Animations
```css
/* Shimmer */
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* Pulse */
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

/* Spin */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

### Page Transitions
```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

## Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 480px) {
  /* Single column layouts */
  /* Larger touch targets */
  /* Simplified navigation */
}

/* Tablet */
@media (max-width: 768px) {
  /* Two column grids */
  /* Hamburger menu */
  /* Adjusted spacing */
}

/* Desktop */
@media (min-width: 1024px) {
  /* Multi-column layouts */
  /* Hover effects enabled */
  /* Full navigation */
}
```

## Icon Usage

### FontAwesome Icons
```html
<!-- Navigation -->
<i class="fas fa-home"></i>
<i class="fas fa-user"></i>
<i class="fas fa-utensils"></i>

<!-- Stats -->
<i class="fas fa-fire"></i>
<i class="fas fa-dumbbell"></i>
<i class="fas fa-tint"></i>
<i class="fas fa-running"></i>

<!-- Actions -->
<i class="fas fa-plus"></i>
<i class="fas fa-edit"></i>
<i class="fas fa-trash"></i>
<i class="fas fa-check"></i>

<!-- UI -->
<i class="fas fa-arrow-right"></i>
<i class="fas fa-chevron-down"></i>
<i class="fas fa-bars"></i>
<i class="fas fa-times"></i>
```

## Layout Patterns

### Container
```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}
```

### Grid Layout
```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}
```

### Flex Layout
```css
.flex {
  display: flex;
  gap: 1rem;
  align-items: center;
}
```

### Card Grid
```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}
```

## Consistency Checklist

When creating new components:

- [ ] Uses color palette from above
- [ ] Uses spacing system (rem units)
- [ ] Has hover states with transitions
- [ ] Has focus states for accessibility
- [ ] Uses consistent border radius
- [ ] Uses consistent shadows
- [ ] Includes mobile responsive styles
- [ ] Uses FontAwesome icons consistently
- [ ] Has smooth animations (0.2-0.3s)
- [ ] Maintains 1.5rem card padding
- [ ] Uses gradient backgrounds for primary actions
- [ ] Includes loading/empty states

## Page Structure Template

```jsx
<div className="page-name-page">
  {/* Header */}
  <div className="page-header">
    <div className="header-icon">🎯</div>
    <h1>Page Title</h1>
    <p className="page-subtitle">Description</p>
  </div>

  {/* Main Card */}
  <div className="main-card">
    {/* Content */}
  </div>

  {/* Secondary Card */}
  <div className="secondary-card">
    {/* Content */}
  </div>
</div>
```

---

**This design system ensures visual consistency across all pages!** 🎨
