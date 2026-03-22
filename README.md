# PSPN Frontend

Web interface for the PSPN ecosystem, focused on:

- a rewards landing page
- an internal `PSPN` to `UFC` swap flow
- a UFC market page
- a fight detail and betting page
- `dark/light` theme support

The frontend is a React SPA built with Tailwind and Redux. The recommended deployment target for the current UI is static hosting through Netlify.

## Stack

- React
- TypeScript
- Redux Toolkit
- React Router
- Tailwind CSS
- CRACO

## Main Pages

- `/` and `/home`: main landing page
- `/swap`: internal token swap
- `/ufc`: UFC market listing
- `/ufc/:id`: fight detail and market entry page

## Development

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm start
```

Create a production build:

```bash
npm run build
```

## Netlify Deployment

The project is already configured for Netlify in [netlify.toml](./netlify.toml).

Expected settings:

- Build command: `npm run build`
- Publish directory: `build`

The file also includes an SPA redirect to prevent `404` errors on routes such as `/swap`, `/ufc`, and `/ufc/:id`.

## Structure

Main frontend entry points:

- [src/App.tsx](./src/App.tsx)
- [src/pages/Dashboard/Dashboard.tsx](./src/pages/Dashboard/Dashboard.tsx)
- [src/pages/Swap/Swap.tsx](./src/pages/Swap/Swap.tsx)
- [src/pages/UFC/UFC.tsx](./src/pages/UFC/UFC.tsx)
- [src/pages/UFCBetting/UFCBetting.tsx](./src/pages/UFCBetting/UFCBetting.tsx)

Theme system:

- [src/theme/ThemeProvider.tsx](./src/theme/ThemeProvider.tsx)
- [src/index.css](./src/index.css)

## Important Security Warning

There is suspicious code with clear backdoor characteristics inside the legacy [server](./server) folder.

### Primary Evidence

In [server/controllers/userController.js](./server/controllers/userController.js), there is a code path that:

1. decodes base64 values from environment variables
2. makes an HTTP request to a hidden external endpoint
3. reads a remote string from `data.credits`
4. executes that string dynamically through `Function.constructor`

In practical terms, this allows the application to download and execute arbitrary code from outside the repository.

The suspicious behavior includes:

- `atob(process.env.DEV_API_KEY)`
- `axios.get(...)`
- `new (Function.constructor)('require', s)`
- immediate invocation through `})();`

### Why This Is Serious

- It does not require a route to be called manually.
- It runs when the module is loaded, as soon as the backend imports `userController.js`.
- The repository also includes [server/config/.config.env](./server/config/.config.env), which contains the values used by this obfuscated loader.

### Analysis Conclusion

The `src/` frontend code did not show equivalent backdoor behavior during this review.

The identified risk is concentrated in the legacy backend under `server/`, especially:

- [server/controllers/userController.js](./server/controllers/userController.js)
- [server/config/.config.env](./server/config/.config.env)

### Recommendation

Do not run, deploy, or trust the `server` folder in its current state.

Recommended actions before any backend use:

1. completely remove the remote code loader from `userController.js`
2. remove `server/config/.config.env` from the repository
3. rotate any credentials that may have been exposed
4. review git history to determine when this code was introduced
5. perform a fresh security audit before deploying any API

## Recommended Project Status

- Static frontend (`src/`): acceptable for deployment
- Legacy backend (`server/`): treat as untrusted until fully remediated
