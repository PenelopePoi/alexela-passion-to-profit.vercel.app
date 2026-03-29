# Customer Branding Templates

Pre-built intake forms for different business types. Each template pre-fills
the InputForm with industry-specific defaults so customers can get started
faster.

## Available Templates

- **restaurant.json** — Restaurants, cafes, food trucks, catering
- **contractor.json** — General contractors, remodeling, roofing, plumbing
- **beauty.json** — Salons, barbershops, spas, nail studios
- **fitness.json** — Personal training, gyms, yoga, martial arts
- **tech.json** — Software, IT services, web development, SaaS
- **creative.json** — Photography, videography, graphic design, music
- **auto.json** — Detailing, mechanics, dealerships, towing
- **realestate.json** — Agents, brokers, property management, staging
- **cleaning.json** — Residential, commercial, pressure washing, junk removal
- **legal.json** — Attorneys, paralegals, notaries, mediation

## Usage

Import a template and spread it into the InputForm's initial state:
```tsx
import restaurantTemplate from './templates/restaurant.json';
// Then use as default values for the form
```
