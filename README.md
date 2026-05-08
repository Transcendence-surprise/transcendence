*This project has been created as part of the 42 curriculum by mzhivoto, mzhitnik, ekashirs, mlitvino, and imunaev-.*

# ft_transcendence — Maze is Lava

**A multiplayer real-time web game** built as part of the 42 curriculum by Marina Zhivotova, Mariia Zhytnikova, Evgeniia Kashirskaia, Mykhailo Litvinov, and Ilia Munaev.

---

## Description

Maze is Lava is a browser-based multiplayer puzzle game where players navigate tile-based boards, collect items, and compete for the top spot on the global leaderboard. The game supports both single-player and real-time multiplayer modes.

**Key features:**

- Real-time multiplayer gameplay over WebSockets (Socket.IO)
- Single-player puzzle levels with move and time limits
- User profiles with avatars, stats, and achievement badges
- Global leaderboard and friend system
- Authentication via local credentials, Google OAuth, and 42 Intra OAuth
- Two-factor authentication (2FA)
- Role-based access control (RBAC) with `user` and `admin` roles
- Microservices architecture with independent scaling
- Secrets management via HashiCorp Vault
- Web Application Firewall (ModSecurity) via Nginx
- REST API with full Swagger/OpenAPI documentation

Live application: **[https://valinor.ink/](https://valinor.ink/)**<br>
API documentation: **[https://valinor.ink/api/docs](https://valinor.ink/api/docs)**<br>
Architecture diagram: **[https://s.icepanel.io/GVOJBUo15pQ7B3/lvV5](https://s.icepanel.io/GVOJBUo15pQ7B3/lvV5)**<br>

---

## Instructions

### Prerequisites

- Docker and Docker Compose v5+
- A `.env` file with secrets (see `.env.example`)

### Environment setup

Copy the example environment

```bash
cp .env.example .env
```

### Install dependencies

```bash
make dev-install
```

### Run application in development mode

```bash
make dev
```

Required secrets include:

- `POSTGRES_PASSWORD` — database password
- `JWT_SECRET`, `API_KEY_SECRET` — auth secrets
- `INTRA_CLIENT_ID`, `INTRA_CLIENT_SECRET` — 42 Intra OAuth credentials
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` — Google OAuth credentials
- `MAIL_*` — SMTP credentials (Brevo relay)
- `ADMIN_PASSWORD` — initial admin account password

### Useful commands

| Command              | Description                                                                             |
| -------------------- | --------------------------------------------------------------------------------------- |
| `make dev-build`     | Build and start the development stack                                                    |
| `make dev-fclean`    | Stop and remove all production volumes                                                  |
| `make logs`          | Stream logs from all services                                                           |
| `make log-<service>` | Stream logs for one service (`core`, `auth`, `gateway`, `game`, `nginx`, `db`, `vault`) |
| `make down`          | Stop containers, keep volumes                                                           |
| `make fclean`        | Stop containers and remove volumes                                                      |
| `make prune`         | Remove dangling images                                                                  |

---

## Technical Stack

### Frontend


| Technology       | Purpose                           |
| ---------------- | --------------------------------- |
| React            | UI component framework            |
| Vite             | Build tool and dev server         |
| Tailwind CSS     | Utility-first styling             |
| React Router DOM | Client-side routing               |
| Socket.io-client | Real-time WebSocket communication |
| TypeScript       | Type safety                       |
| Vitest           | Unit and e2e tests                |


### Backend


| Technology      | Purpose                                         |
| --------------- | ----------------------------------------------- |
| NestJS          | Server framework                                |
| Fastify         | HTTP adapter (replaces Express for performance) |
| TypeORM         | ORM and schema migrations                       |
| Socket.IO       | WebSocket server                                |
| JWT             | Stateless authentication tokens                 |
| Swagger/OpenAPI | API documentation                               |
| Jest / ts-jest  | Backend testing                                 |


### Database

**PostgreSQL 17** — chosen for its reliability, JSONB support (used to store in-progress game state), and strong TypeORM integration. A single shared database is used across all backend services; schema changes are managed via TypeORM migrations.

### Database Schema

<details><summary>Screenshot</summary>
<img width="943" height="713" alt="image" src="https://github.com/user-attachments/assets/b5875e10-9f22-41be-81b5-d22262aca35a" />
</details>

<details><summary>Mermaid Schema</summary>

```mermaid
erDiagram
	API_KEYS {
		uuid id
		string hash
		timestamptz created_at
		timestamptz expires_at
	}

	USERS {
		int id
		string username
		string email
		string password
		int avatar_image_id
		string[] roles
		boolean two_factor_enabled
		int rank_number
		int win_streak
		int total_games
		int total_wins
		timestamptz created_at
		timestamptz updated_at
	}

	IMAGES {
		int id
		string url
		string filename
		string mime_type
		int size
		timestamptz created_at
	}

	BADGES {
		int id
		string key
		string name
		string condition_type
		int condition_value
		string image_url
		string description
		timestamptz created_at
	}

	USER_BADGES {
		int id
		int user_id
		int badge_id
		int progress
		boolean completed
		timestamptz unlocked_at
		timestamptz created_at
	}

	FRIENDSHIPS {
		int id
		int requester_id
		int receiver_id
		int requested_by
		string status
		timestamptz created_at
		timestamptz updated_at
	}

	GAMES {
		uuid id
		string type
		string phase
		string host_user_id
		jsonb state
		string winner_user_id
		string completion_status
		timestamptz created_at
		timestamptz ended_at
		timestamptz updated_at
	}

	GAME_PLAYERS {
		int id
		uuid game_id
		string user_id
		int registered_user_id
		string role
		string user_type
		timestamptz joined_at
	}

	USERS ||--o{ USER_BADGES : "user_id to users.id"
	BADGES ||--o{ USER_BADGES : "badge_id to badges.id"
	USERS ||--o{ FRIENDSHIPS : "requester_id to users.id"
	USERS ||--o{ FRIENDSHIPS : "receiver_id to users.id"
	USERS ||--o{ FRIENDSHIPS : "requested_by to users.id"
	IMAGES ||--o{ USERS : "avatar_image_id to images.id"
	GAMES ||--o{ GAME_PLAYERS : "game_id to games.id"
	USERS ||--o{ GAME_PLAYERS : "registered_user_id to users.id (nullable)"
```

</details>


### Infrastructure


| Technology              | Purpose                                             |
| ----------------------- | --------------------------------------------------- |
| Docker & Docker Compose | Container orchestration                             |
| Nginx                   | Reverse proxy, TLS termination, static file serving |
| ModSecurity (WAF)       | Web Application Firewall integrated with Nginx      |
| HashiCorp Vault         | Secrets management (AppRole auth in production)     |
| Hetzner VPS             | Production hosting                                  |


### Technical justifications

- **Microservices**: Each domain (auth, users, game) is independently deployable and can be scaled separately. The gateway service provides a single entry point for clients.
- **NestJS + Fastify**: NestJS offers a structured, Angular-inspired framework suited for large TypeScript backends. Fastify provides higher throughput than Express with near-identical API.
- **PostgreSQL + TypeORM**: JSONB columns allow storing complex game state without normalizing every field, while relational tables handle users, matches, and leaderboard data cleanly.
- **Vault**: Prevents secrets from being committed to version control. In production all credentials are injected at container startup via Vault's AppRole method.
- **In-memory game state**: Active game state lives in `EngineService`'s `Map<string, GameState>` for zero-latency reads during play; it is persisted to the database only when a game ends.

---

## Features List


| Feature                    | Description                                                                                               | Team member(s) |
| -------------------------- | --------------------------------------------------------------------------------------------------------- | -------------- |
| Single-player puzzle mode  | Navigate a tile-based board, collect items within move/time limits across multiple levels                 | Mariia, Marina, Evgeniia |
| Real-time multiplayer game | Up to N players on a shared board with turn-based board actions (shift, rotate, swap) and player movement | Mariia, Marina, Evgeniia |
| Multiplayer lobby          | Pre-game chat room and player ready system before match starts                                            | Mariia, Marina, Evgeniia |
| User profiles              | Avatar upload, stats display (games played, wins, rank, win streak)                                       | Marina, Mikhail, Evgeniia |
| Global leaderboard         | Ranked list of all users by win count and streak                                                          | Mikhail, Evgeniia  |
| Achievement badges         | Unlockable badges for reaching milestones (first game, 20 games, etc.)                                    | Mariia |
| Friend system              | Send/accept/reject/block friend requests; view friends list                                               | Mariia, Marina|
| Local authentication       | Register and log in with email + password (bcrypt-hashed)                                                 | Marina, Mikhail |
| Google OAuth               | Sign in with Google account                                                                               | Mikhail |
| 42 Intra OAuth             | Sign in with 42 school account                                                                            | Mikhail  |
| Two-factor authentication  | TOTP-based 2FA support for registered users                                                               | Mariia, Marina, Mikhail |
| Role-based access control  | `user`, `guest` and `admin` roles with decorator-based guards on all protected endpoints                           | Mariia, Marina, Mikhail |
| API key authentication     | Machine-to-machine authentication via `x-api-key` header                                                  | Mikhail  |
| REST API with Swagger      | Full OpenAPI documentation aggregated from all services, available at `/api/docs`                         | Mikhail  |
| WAF (ModSecurity)          | Web Application Firewall integrated with Nginx to filter malicious requests                               | Ilia  |
| Secrets management (Vault) | HashiCorp Vault manages all credentials with AppRole auth in production                                   | Ilia, Mikhail  |


---

# Evaluation Modules Summary

| Section | Type | Module Name | Points | Notes |
|---|---|---|---:|---|
| Web | Minor | Use a frontend framework | 1 | React frontend |
| Web | Minor | Use a backend framework | 1 | NestJS / Fastify-based backend services |
| Web | Major | Implement real-time features using WebSockets or similar technology | 2 | Real-time updates across clients<br>Handle connection/disconnection gracefully<br>Efficient message broadcasting |
| Web | Major | Allow users to interact with other users | 2 | Basic chat system (send/receive messages between users)<br>Profile system (view user information)<br>Friends system (add/remove friends, see friends list) |
| Web | Major | Public API to interact with the database with secured API key, rate limiting, documentation, and at least 5 endpoints | 2 | GET `/api/{something}`<br>POST `/api/{something}`<br>PUT `/api/{something}`<br>DELETE `/api/{something} |
| Web | Minor | Use an ORM for the database | 1 | ORM-based database layer |
| Web | Minor | Custom-made design system with reusable components | 1 | Reusable components<br>Consistent color palette<br>Typography and icons<br>At least 10 reusable components |
| Accessibility and Internationalization | Minor | Support for additional browsers | 1 | Full compatibility with at least 2 additional browsers (Firefox, Safari, Edge, etc.)<br>Test and fix all features in each browser<br>Document browser-specific limitations<br>Consistent UI/UX across supported browsers |
| User Management | Major | Standard user management and authentication | 2 | Users can update profile information<br>Users can upload an avatar with default fallback<br>Users can add friends and see online status<br>Users have a profile page |
| User Management | Minor | Game statistics and match history | 1 | Track game statistics (wins, losses, ranking, streaks, etc.)<br>Display match history with dates, results, opponents<br>Show achievements and progression<br>Leaderboard integration |
| User Management | Minor | Remote authentication with OAuth 2.0 | 1 | OAuth authentication implemented |
| User Management | Major | Advanced permissions system | 2 | View, edit, and delete users (CRUD)<br>Roles management (admin, user, guest, etc.)<br>Different views and actions based on user role |
| User Management | Minor | Complete 2FA system | 1 | Two-factor authentication for users |
| Cybersecurity | Major | Implement WAF/ModSecurity + HashiCorp Vault for secrets | 2 | Strict ModSecurity/WAF configuration<br>Secrets managed in Vault (API keys, credentials, environment variables) |
| Gaming and User Experience | Major | Implement a complete web-based game where users can play against each other | 2 | Real-time multiplayer gameplay<br>Live matches<br>Clear rules and win/loss conditions<br>2D game implementation |
| Gaming and User Experience | Major | Remote players on separate computers can play the same game in real-time | 2 | Handle network latency and disconnections gracefully<br>Smooth remote gameplay experience<br>Reconnection logic implemented |
| Gaming and User Experience | Major | Multiplayer game (more than two players) | 2 | Support for 3 or more players<br>Fair gameplay mechanics<br>Proper synchronization across clients |
| Gaming and User Experience | Minor | Game customization options | 1 | Different maps/themes<br>Customizable game settings<br>Default options available |
| Gaming and User Experience | Minor | Gamification system to reward users | 1 | Achievements / badges / leaderboards implemented<br>Persistent in database<br>Visual feedback for users<br>Clear progression mechanics |
| Gaming and User Experience | Minor | Spectator mode for games | 1 | Users can watch ongoing games<br>Real-time updates for spectators<br>Spectator chat supported |
| DevOps | Major | Backend as microservices | 2 | Loosely-coupled services with clear interfaces<br>REST-based communication between services<br>Each service has a single responsibility |
| Modules of Choice | Major | Swagger / OpenAPI integration as a cross-service API platform | 2 | Chosen because the project uses multiple backend services and a public API surface, so navigation and verification of endpoints would otherwise be fragmented<br>Addresses the technical challenge of documenting a distributed architecture with multiple services, DTOs, guards, auth flows, and internal/public endpoints<br>Adds value by giving evaluators and developers a single, structured interface to inspect endpoints, payloads, auth requirements, and service contracts<br>Deserves Major status because it is not just “docs”: it required systematic endpoint annotation, DTO integration, auth-aware API exposure, and continuous maintenance as the backend evolved |
| Modules of Choice | Minor | Single-player mode for the game | 1 | Adds a meaningful standalone gameplay path beyond multiplayer<br>Required dedicated level design, solo rules, objective handling, move/time constraints, and separate UX flows<br>Brings value by making the project playable and testable even without multiple connected users |
| Modules of Choice | Minor | Backend testing with Jest | 1 | Jest / ts-jest test coverage for backend services and APIs<br>Used to validate DTOs, auth/user flows, game logic, and service behavior<br>Adds technical value by improving stability and regression safety during a multi-service project |


## Total
**35 points claimed**

> Minimum required to pass: 14 pts.

### Responsive Support Note

The project UI is optimized for desktop and tablet gameplay.  
Tablet-responsive layouts were specifically tested for the following viewports:

- `768 × 1024`
- `810 × 1080`
- `820 × 1180`
- `1280 × 800`

> Because the game board, controls, and in-game sidebar require substantial interactive space, full gameplay responsiveness for phone-sized screens is not an official target of the project. On smaller mobile devices, some game views may be limited compared to the supported desktop and tablet experience.
---

## Team Information


| Member               | Login    | Role(s)       | Responsibilities |
| -------------------- | -------- | ------------- | ---------------- |
| Marina Zhivotova     | mzhivoto | Product Owner / Developer  | Defines the product vision, prioritizes features, and ensures the project meets user needs. Implement features and modules.|
| Mariia Zhytnikova    | mzhitnik | Product Owner / Developer | Defines the product vision, prioritizes features, and ensures the project meets user needs. Implement features and modules.|
| Evgeniia Kashirskaia | ekashirs | Product Owner / Developer | Defines the product vision, prioritizes features, and ensures the project meets user needs. Implement features and modules.|
| Mykhailo Litvinov    | mlitvino | Technical Lead / Developer | Oversees technical decisions and architecture. Implement features and modules.|
| Ilia Munaev          | imunaev- | Project Manager / Developer | Organizes team meetings, tracks progress and deadlines, ensures team communication. Implement features and modules.|

---

## Individual Contributions

## Marina Zhivotova (`mzhivoto`)
**Role:** Product Owner / Developer

### Responsibilities
- Defined product vision and participated in feature prioritization
- Implemented core gameplay and backend functionality
- Contributed to authentication and security modules
- Participated in multiplayer systems and social features development

### Implemented Features
- Single-player puzzle mode
- Real-time multiplayer game
- Multiplayer lobby
- User profiles
- Friend system
- Local authentication
- Two-factor authentication
- Role-based access control

---

## Mariia Zhytnikova (`mzhitnik`)
**Role:** Product Owner / Developer

### Responsibilities
- Defined product vision and participated in feature prioritization
- Developed gameplay mechanics and multiplayer interaction systems
- Implemented user progression and security-related features
- Contributed to social systems and access control

### Implemented Features
- Single-player puzzle mode
- Real-time multiplayer game
- Multiplayer lobby
- Achievement badges
- Friend system
- Two-factor authentication
- Role-based access control

---

## Evgeniia Kashirskaia (`ekashirs`)
**Role:** Product Owner / Developer

### Responsibilities
- Defined product vision and participated in feature prioritization
- Developed gameplay systems and multiplayer functionality
- Implemented profile and ranking-related modules
- Contributed to API integration and frontend/backend interaction

### Implemented Features
- Single-player puzzle mode
- Real-time multiplayer game
- Multiplayer lobby
- User profiles
- Global leaderboard

---

## Mykhailo Litvinov (`mlitvino`)
**Role:** Technical Lead / Developer

### Responsibilities
- Oversaw technical architecture and engineering decisions
- Implemented authentication and API infrastructure
- Developed security-related modules and service integrations
- Managed backend documentation and production integrations

### Implemented Features
- User profiles
- Global leaderboard
- Local authentication
- Google OAuth
- 42 Intra OAuth
- Two-factor authentication
- Role-based access control
- API key authentication
- REST API with Swagger
- Secrets management with HashiCorp Vault

---

## Ilia Munaev (`imunaev-`)
**Role:** Project Manager / Developer

### Responsibilities
- Organized team meetings and coordinated development workflow
- Tracked progress, deadlines, and communication between team members

### Implemented Features
- WAF (ModSecurity)
- Secrets management with HashiCorp Vault

---

## Project Management

**Task distribution:** Tasks were distributed by feature domain. Each team member owned one or more modules end-to-end (frontend + backend). Assignments are detailed in the Features List and Individual Contributions sections above. 

**Project management tools:** GitHub Issues and GitHub Projects — used to track tasks, bugs, and feature progress. Pull requests to the `development` branch required review before merge. CI runs automatically on every PR via GitHub Actions.

**Communication channels:** Discord — primary channel for daily communication, code reviews, and async updates. In-person meetings at Hive Helsinki campus for planning and unblocking sessions.

**Meeting cadence:** Weekly planning meetings to set goals and review progress. Ad-hoc syncs as needed when blockers arose. Final integration and testing sessions held in the last week before evaluation.

---

## Resources

### Documentation & References

- [NestJS Documentation](https://docs.nestjs.com/)
- [React Documentation](https://react.dev/)
- [TypeORM Documentation](https://typeorm.io/)
- [Socket.IO Documentation](https://socket.io/docs/)
- [HashiCorp Vault Documentation](https://developer.hashicorp.com/vault/docs)
- [PostgreSQL 17 Documentation](https://www.postgresql.org/docs/17/)
- [ModSecurity Reference Manual](https://github.com/owasp-modsecurity/ModSecurity/wiki/Reference-Manual)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Vite Documentation](https://vite.dev/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

### AI Usage

AI assistants (Claude, ChatGPT, Copilot ) were used during development for:

- Debugging complex TypeScript type errors and NestJS module configuration issues
- Drafting boilerplate for new NestJS modules, guards, and decorators
- Suggesting approaches for WebSocket event handling and game state synchronization
- Reviewing Vault AppRole configuration and Docker Compose service wiring
- Generating initial Swagger annotations for REST endpoints
- Assisting with Tailwind CSS layout questions on the frontend

All AI-generated code was reviewed, tested, and integrated by the team.

---

## Known Limitations

- Vault data is in-memory in dev mode and lost on container restart — re-seed before each dev session.
  
---

## License

- This project has been created as part of the 42 curriculum. It is intended for educational use.
- MIT.
