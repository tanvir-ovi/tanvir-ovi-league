# tanvir-ovi · eFootball League

**Owner:** tanvir-ovi — tanvirovi6@gmail.com  
**Website:** https://tanvir-ovi.github.io/tanvir-ovi-league/  
**Repository:** https://github.com/tanvir-ovi/tanvir-ovi-league

Eight contenders, 28 league fixtures, automatic standings, seeded semifinals, penalty decisions and a championship final. Public visitors can view results; only the configured owner can change them.

## Owner access

Open the private activation page provided separately and choose a password of at least 12 characters. The activation link works once and is never included in this repository. After activation, use **Owner sign in** with **tanvirovi6@gmail.com** and your password. There is no public registration and no social sign-in requirement.

The password is salted and hashed on the server. Session secrets stay in the owner's current browser tab, are stored only as hashes on the server, and expire after 12 hours. Sign out revokes the current session. Sign-in attempts are rate limited. The configured owner email is checked server-side; editing page controls cannot grant access.

## Manage the competition

- **Owner desk:** change the competition name and announcement; edit participant names, crest identities, symbols and colors; download and restore backups.
- **Fixtures:** record results and schedule matches. Match times use Bangladesh Standard Time, UTC+6.
- **Contenders:** withdraw or reinstate a participant. Withdrawal voids all that participant's league matches and removes them from the table, while preserving their recorded scores for reinstatement. Keep at least four active contenders.
- **Standings:** wins earn three points, draws one. Rank by points, goal difference, goals scored, then head-to-head for a tied pair. Play supervised tiebreakers for remaining tied groups and record the final order in the owner desk.
- **Knockouts:** first plays fourth; second plays third. Drawn knockout games require a penalty winner. League edits and withdrawals clear dependent playoff results and tiebreakers; semifinal edits clear the final.
- **Backups:** export before major changes. Imports accept the current backup and the original Full League version-1 JSON. The original fillable PDF is also available but does not automatically include website scores.

Results refresh for public viewers every 15 seconds while the page is visible, and when the window regains focus. A revision check prevents stale windows overwriting newer results. Every successful update is recorded in private owner activity history.

## Development and publication

The frontend is a static React/Vite application published by `.github/workflows/pages.yml`. The authenticated API and persistent SQL storage are separate from the static frontend. No password, database credential, activation secret or owner session belongs in source control.

Required server environment variables are listed in `.env.example`. `VITE_API_BASE` is the public API endpoint, not a credential. `VITE_BASE_PATH` controls deployment under a repository path. Changing the host also requires updating the allowed public origin on the API.

Run `npm ci`, `npm test` and `npm run build`. `npm run dev` starts the frontend preview. Database initialization is implemented in `scripts/setup-database.ts` and preserves existing records. Browser checks use a separate test database, guarded against resetting a non-test database. They do not activate the production owner or write sample results into the production competition.

Pushes to `main` validate and publish the frontend. Backend changes must be deployed separately. Keep the public API address consistent with the frontend build configuration.

## Artwork

Eight original scalable participant crests, a vector trophy, self-hosted Oswald and Inter fonts, and a short stadium video. The font license files accompany the fonts. The original crest pack can be downloaded from the site.

Video: [Football stadium aerial shot](https://mixkit.co/free-stock-video/football-stadium-aerial-shot-4262/), under its Stock Video Free License. [Stadium poster source](https://images.unsplash.com/photo-1522778119026-d647f0596c20). Motion can be paused; video is not requested for reduced-motion or browser data-saving preferences.

An independent community tournament, unaffiliated with KONAMI.
