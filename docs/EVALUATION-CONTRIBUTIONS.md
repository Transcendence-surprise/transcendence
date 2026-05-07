# Project Contribution Summary

This file is a git-history-based summary of who implemented which parts of the project.

It is intended for the evaluation sheet and is based on:
- commit authors
- commit messages
- the main subsystems touched by those commits

## Notes

- Some teammates used multiple git identities. They are grouped below under one person.
- This is a practical summary, not a strict legal attribution list.
- One additional contributor appears in the repository history for CI/deployment support:
  - `Mykhailo Litvinov <106635805+mlitvino@users.noreply.github.com>`
  - those commits are listed separately at the end because the core team appears to be 5 people.

## 1. Misha

Aliases seen in git history:
- `Misha <darkrabbit240@gmail.com>`

Main implemented areas:
- Backend authentication architecture
- Auth microservice extraction
- API gateway initialization and structure
- Core/backend auth integration
- Users resource validation and service logic
- Docker, Makefile, env setup, local/dev/prod infrastructure
- Nginx routing and auth proxying
- CI/test maintenance and backend docs

Representative work from commit history:
- `feat(back): add auth module`
- `feat(auth): separate auth to microservice`
- `feat(api-gateway): initialize API gateway service`
- `feat(gateway): enhance functionality, add auth service`
- `feat(gateway): add public users module`
- `feat(users): add endpoint for credentials validation for auth`
- `feat(users): forbid password selection from service`
- `feat(auth): add signup, dto, docs, update login dto`
- `feat(nginx): add nginx.conf for prod and dev`
- `feat: add auth-service and parallel execution for backend`
- `feat(ci-cd): add development.yml to run backend and frontend tests`
- multiple Docker / Makefile / env / test / docs fixes

Summary:
Misha’s work is concentrated around backend platform architecture: auth, gateway, service separation, infra, environment setup, routing, and test/CI stability.

## 2. Mariia Zhytnikova

Aliases seen in git history:
- `Mariia Zhytnikova <allusio@gmail.com>`
- `mzhitnik <119492493+MariiaZhytnikova@users.noreply.github.com>`

Main implemented areas:
- Core game logic and multiplayer flow
- Game setup, routes, state models, and level registry integration
- Lobby lifecycle: create, join, start, leave
- WebSocket game/lobby updates and later WS refactor to gateway
- Player availability checks and anti-duplicate-join logic
- Game chat extraction and realtime game/lobby synchronization
- Badge progression integration
- Presence / online status / friend status live updates
- Rate-limit, throttling, backoff, and realtime stability fixes
- New levels, exit tile, objectives, and gameplay balancing

Representative work from commit history:
- `create game with settings resieved from front, tests for functions`
- `add screen for game mode and settings`
- `websocket for Lobby Game`
- `join API endpoint`
- `start game API endpoint`
- `leave lobby/game feature`
- `add user and game validation in websocket channels and game engine service`
- `add check player's game to avoid join to more tha one game at same time`
- `refactor: WS in gateway`
- `feat: add new function to increase badge progress`
- `feat: add external API to unlock badges`
- `feat: online status tracking`
- `fix: 429, changed emit only to current game room, add guard against spam availibility`
- `fix: add throttling/debouncing for game:updated`
- `feat: add exit tile drawing, add exit tile to private game state`
- `update: map registry for new levels`

Summary:
Mariia’s work covers the gameplay-heavy part of the project: multiplayer engine behavior, lobby/game synchronization, websocket flows, badges, presence, and many of the core realtime/gameplay fixes.

## 3. Marina Zhivotova

Aliases seen in git history:
- `marinezh <mazhivotova@gmail.com>`
- `Marina Zhivotova <78799773+marinezh@users.noreply.github.com>`
- `Marina Zhivotova <mazhivotova@gmail.com>`

Main implemented areas:
- Frontend UI foundation and layout
- Auth forms and frontend auth UX
- Shared component extraction and design consistency
- Lobby, join, single-player and multiplayer setup UI polishing
- Leaderboard UI and real ranking integration
- Chat presentation and reusable chat UI
- Avatar rendering and frontend avatar integration
- Header, navigation, responsive fixes, and overall frontend polish
- Admin panel UX refinements
- Password reset frontend flow

Representative work from commit history:
- `setup typescript and tailwindcss`
- `add basic frontend layout`
- `update auth forms`
- `refactor(layout): unify page shell styling across sidebar pages`
- `feat(leaderboard): load real rankings and improve responsive layout`
- `refactor(chat): reuse chat components in lobby and polish lobby UI`
- `refactor(ui): polish lobby, chat, and leaderboard styling`
- `feat(multiplayer): polish lobby setup form and add turn time limit`
- `feat(shared): add custom select for multiplayer settings`
- `refactor(game): improve join lobby responsiveness and structure`
- `refactor(lobby): reorganize lobby components and host start state`
- `feat(avatars): unify frontend avatar rendering across social and game views`
- `front(ui): update user and status dot in header`
- `feat(auth): Extract password reset modals and hook`
- `docs(rules): add fixed tile reference card`

Summary:
Marina’s work is mainly frontend product/UI implementation: shared components, page structure, responsive screens, chat/lobby/join presentation, avatar rendering, rules visualization, and general UX polish across the app.

## 4. Ilia Munaev

Aliases seen in git history:
- `Ilia Munaev <ilyamunaev@gmail.com>`
- `BackerStreetZero <ilyamunaev@gmail.com>`

Main implemented areas:
- Database foundation, migrations, and schema changes
- Users and games DB entities/tables
- DB docs and backend DB folder restructuring
- Docker/DB connectivity fixes
- Nginx ModSecurity / WAF setup and documentation

Representative work from commit history:
- `Feat: add migrations, add get_all endpoint, add user table`
- `Add: database, users, endpoints, tests, docs`
- `Add: table games`
- `Add: user_type to db table users`
- `Fix: migrations`
- `Refactor: move db from backend/ to root/ dir`
- `Refactor: move bd under 'backend/'`
- `feat(nginx): build ModSecurity from source in multi-stage Dockerfile`
- `feat(nginx): add strict ModSecurity WAF rules`
- `feat(nginx): enable ModSecurity on /api/ in dev and prod configs`
- `docs: add MODSECURITY-DEV.md`

Summary:
Ilia’s work is focused on backend persistence and security infrastructure: DB schema/migrations plus Nginx/ModSecurity hardening.

## 5. Evgeniia Kashirskaia

Aliases seen in git history:
- `Jane Years <janeletoxx@gmail.com>`
- `Evgeniia Kashirskaia <94862708+janeyears@users.noreply.github.com>`

Main implemented areas:
- Reusable alert/notification component
- Replacing raw alerts across frontend flows
- Login/signup success/error UX cleanup
- Admin/game/auth alert consistency fixes

Representative work from commit history:
- `add reusable component for alerts`
- `replace alerts in authentification with new componnent`
- `change alertts in UseGameActions with component`
- `change alerts in Board.tsx with component Alert.tsx`
- `change alerts in GameEntryRoute.tsx with component Alert.tsx`
- `change alerts in AdminPanel.tsx with component Alert.tsx`
- `fix login/signin form success to close form`
- `fix mismatched style for login requiered on friends list`
- `fix UseGameAction alert issue`

Summary:
Evgeniia’s work is centered on frontend feedback and messaging UX, especially reusable alerts and replacing inconsistent alert handling across several screens.

## Additional contributor visible in git history

### Mykhailo Litvinov

Alias seen in git history:
- `Mykhailo Litvinov <106635805+mlitvino@users.noreply.github.com>`

Visible implemented areas:
- GitHub Actions / deployment workflow support
- CI trigger updates
- deployment script fixes
- several merge commits

Representative work from commit history:
- `Add GitHub Actions workflow for production deployment`
- `Fix directory name in deployment script`
- `Add push trigger to CI workflow`

If your evaluation sheet must list only the 5 main teammates, this section can be omitted.

## Short version for evaluation sheet

- **Misha**: auth, gateway, backend service architecture, Docker/Makefile/env, nginx, CI/tests/docs
- **Mariia Zhytnikova**: game engine, multiplayer/lobby/websockets, badges, presence, levels, gameplay fixes
- **Marina Zhivotova**: frontend UI/UX, shared components, chat/lobby/join/leaderboard/avatar presentation
- **Ilia Munaev**: database schema/migrations, DB structure, nginx ModSecurity/WAF
- **Evgeniia Kashirskaia**: reusable alert system and frontend feedback/error UX
