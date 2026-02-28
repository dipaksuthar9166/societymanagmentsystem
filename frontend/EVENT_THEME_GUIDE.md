# STATUS Sharan - Dynamic Event UI/UX Guide 🎨

This project features a sophisticated **Event-Driven UI Engine** that automatically adapts the interface (colors, animations, banners) to celebrate major festivals and national days.

## 🌟 Key Features
- **Auto-Detection**: Theme changes automatically based on the date.
- **Manual Admin Control**: Admins can force-enable any event from the Profile Settings.
- **Global Sync**: Changes update instantly for ALL users (via Socket.IO).
- **Hero Banner Integration**: Dashboard greeting adapts to the event.

---

## 🛠️ How to Add a New Event

All event logic is centralized in:
`frontend/src/config/eventsConfig.js`

To add a new event (e.g., "Navratri"), add a new object to the `EVENTS` array:

```javascript
{
    id: 'navratri',
    name: 'Navratri',
    type: 'festival',
    
    // Date Range (Month is 0-indexed: Jan=0, Oct=9, Dec=11)
    start: { month: 9, day: 15 }, 
    end: { month: 9, day: 24 },
    
    // Visual Theme
    theme: {
        primary: '#FF4500',   // Orange Red (Used for Buttons, Sidebar, Banner)
        secondary: '#800000', // Maroon
        accent: '#FFFF00'     // Yellow
    },
    
    // Animation Type (Must be supported in DynamicEventBackground.jsx)
    animation: 'diyas-sparkle', // or 'fireworks', 'confetti', etc.
    
    // Dashboard Message
    heroBannerText: 'Happy Navratri! 🕉️'
}
```

### Supported Animations
Currently defined in `frontend/src/components/DynamicEventBackground.jsx`:
- `'fireworks'` (New Year)
- `'tricolor-confetti'` (Republic/Independence Day)
- `'snowfall'` (Christmas)
- `'diyas-sparkle'` (Diwali)
- `'color-splash'` (Holi)
- `'peace-symbols'` (Gandhi Jayanti)

---

## 🔧 Technical Details

### 1. The Hook (`useEventTheme`)
- Located in `frontend/src/context/EventThemeContext.jsx`.
- It fetches the active event from config or server state.
- It injects CSS variables into the `document` root.

### 2. Styling (`index.css`)
We use CSS variables that mapped to Tailwind colors:
```css
:root {
  --theme-primary: #4f46e5; /* Default Indigo */
}
```
When an event activates, this variable is overridden.

### 3. Server Sync
- The backend stores a `festiveThemeOverride` in `GlobalConfig`.
- When changed by Admin, it emits a `global_config_updated` socket event.
- All connected clients receive this and update their UI instantly.
