
# Reflecto Premium Car Protection - Admin & Client Suite

A high-fidelity automotive service platform featuring a luxury customer experience and a technical administrative dashboard.

## 🚀 Quick Start (Local)

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start the Development Server**:
   ```bash
   npm run dev
   ```

3. **Open the App**:
   Navigate to `http://localhost:3000`

## 🛠 Features

- **Customer UI**: Premium landing page, pricing tiers, and 5 detailed technical service breakdowns (Thermal Defense, Tint, Polishing, etc.).
- **Admin Dashboard**:
  - **Overview**: Revenue analytics, project efficiency, and client activity.
  - **Scheduling**: Daily time-grid with bay capacity and technician status.
  - **CRM**: Client management with VIP tracking and historical service data.
- **Tech Stack**: React 19, JavaScript, Tailwind CSS, Vite.

## 🔑 Login Access
To access the Admin Panel:
1. Click **Dashboard** in the top navigation.
2. Enter any phone number.
3. Enter any 6-digit OTP.
# Icon System

This project uses [Google Material Symbols (Outlined)](https://fonts.google.com/icons) for all iconography, replacing legacy emojis for improved accessibility, visual consistency, and responsive styling.

## Integration
The Material Symbols font is loaded via Google Fonts in `index.html`.
A reusable `<Icon />` component is available at `views/components/Icon.jsx` to render these icons cleanly.

### Usage
```jsx
import Icon from '../components/Icon';

// Renders the shield icon
<Icon name="shield" className="text-[#FF5C35] text-2xl" ariaLabel="Protection Guarantee" />
```

## Legacy Emoji to Icon Mapping
If you need to migrate an old component or text containing emojis, refer to the following map (also available programmatically in `views/utils/emojiMap.js`):

| Legacy Emoji | Material Symbol Name | Visual Meaning |
|--------------|----------------------|----------------|
| 🛡️          | `shield`             | Protection, warranty, ISO standards |
| 💧          | `water_drop`         | Hydrophobic properties, liquids |
| ⭐          | `star`               | Premium quality, rating |
| ☀️          | `light_mode`         | UV resistance, heat, sun |
| 📹          | `videocam`           | Dash cam, recording |
| 🚗          | `directions_car`     | Vehicle, exterior services |
| 🪑          | `chair`              | Interior services, seats |
| ✨          | `auto_awesome`       | Full detail, shine, sparkling |
| 🎁          | `redeem`             | Rewards, loyalty points |
| 📈          | `trending_up`        | Analytics, total spent, stats |
| 🏆          | `emoji_events`       | Trophies, total services |
| ⏱️          | `timer`              | Warranty duration, time |
| 🇺🇸          | `public`             | American materials (regional) |
| ✅          | `check_circle`       | Certified, verified |
| 💎          | `diamond`            | Diamond tier, premium |
| ⚡          | `bolt`               | Ultra tier, energy |
| ♾️          | `all_inclusive`      | Elite/lifetime tier, infinity |

## Guidelines
1. **Accessibility**: Always use `ariaLabel` on the `<Icon />` component if the icon conveys meaning not present in adjacent text.
2. **Styling**: Do not hardcode colors in the `style` attribute. Use Tailwind utility classes (`text-[#FF5C35]`) on the `className` prop to ensure theme consistency.
3. **No Emojis**: Do not commit new emojis to the codebase (`.jsx` or `.json` locales). Always find the appropriate Material Symbol instead.
