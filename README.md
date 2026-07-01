# HADashboard Card

A custom Lovelace card for Home Assistant that displays the status of all services from the [HADashboard integration](https://github.com/tzer0m/HADashboard) in a grid layout, with a click-through popout for full service detail.

## Requirements

This card requires the [HADashboard integration](https://github.com/tzer0m/HADashboard) to be installed and configured first. The card automatically discovers all HADashboard entities — no manual entity configuration needed.

## Installation

### Via HACS (recommended)

1. In Home Assistant, go to HACS → three-dot menu → **Custom repositories**.
2. Add `https://github.com/tzer0m/HADashboardCard`, category **Dashboard**.
3. Find **HADashboard Card** in HACS and install it.
4. Go to Settings → Dashboards → three-dot menu → **Resources**.
5. Add `/hacsfiles/HADashboardCard/hadashboard-card.js` as a **JavaScript module**.
6. Hard reload the browser (**Ctrl+Shift+R**).

### Manual

1. Copy `hadashboard-card.js` to `www/community/HADashboardCard/` in your Home Assistant config directory.
2. Add `/hacsfiles/HADashboardCard/hadashboard-card.js` as a JavaScript module resource.
3. Hard reload the browser.

## Usage

Add the card to any dashboard using the manual card editor:

```yaml
type: custom:hadashboard-card
```

## License

Personal project, provided as-is.
