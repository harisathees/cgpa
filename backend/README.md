## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

# Running with Docker

The Docker dev stack runs **MariaDB** plus the **NestJS API** with hot-reload —
no local Node or database install required. For development only.

### Prerequisites
- [Docker Engine](https://docs.docker.com/engine/install/) (v24+)
- [Docker Compose](https://docs.docker.com/compose/install/) plugin (v2+)

### Steps

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd CGPA/backend
   ```

2. Create the Docker environment file from the example
   ```bash
   cp docker.env.example docker.env
   ```

3. Update `docker.env` with a real JWT secret
   ```bash
   # Generate a secret and paste it into docker.env as JWT_SECRET
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

4. Build and start all services
   ```bash
   docker compose -f docker-compose.dev.yml --env-file docker.env up --build
   ```
   On first run this builds the image. The backend container then automatically
   applies Prisma migrations (`prisma migrate deploy`), seeds the admin user
   (`prisma:seed`), and starts the watcher (`start:dev`). Add `-d` to run
   detached.

5. Verify everything is running
   ```bash
   docker compose -f docker-compose.dev.yml ps
   curl http://localhost:3001
   ```

### Services

| Service  | Container       | Host Port | Description        |
|----------|-----------------|-----------|--------------------|
| API      | cgpa_backend    | 3001      | NestJS API server  |
| MariaDB  | cgpa_db         | 3306      | Database           |

> The DB host **inside** the stack is `db` (the compose service name), not
> `localhost`. `DATABASE_URL` is wired to it automatically in
> `docker-compose.dev.yml`.

### Useful commands
```bash
# Start the stack (build if needed) and stream logs
docker compose -f docker-compose.dev.yml --env-file docker.env up --build

# View logs
docker compose -f docker-compose.dev.yml logs -f backend

# Force a clean rebuild of the backend image
docker compose -f docker-compose.dev.yml build --no-cache

# Stop all services (keeps the database volume)
docker compose -f docker-compose.dev.yml down

# Stop and remove volumes (reset database)
docker compose -f docker-compose.dev.yml down -v
```

> Tip: `./scripts/dev.sh` is an optional helper that wraps these same
> `docker compose` commands (`up` / `build` / `down` / `clean` / `logs`) and
> auto-loads `docker.env`. It's a convenience shortcut, not a requirement.

### Files involved

| File                     | Purpose                                         |
| ------------------------ | ----------------------------------------------- |
| `Dockerfile.dev`         | Dev image (all deps + hot-reload). Dev only.    |
| `docker-compose.dev.yml` | MariaDB + API services for local development.   |
| `docker.env.example`     | Committed template for the Docker env.          |
| `docker.env`             | Your local Docker env (git-ignored).            |
| `scripts/dev.sh`         | Convenience wrapper around `docker compose`.    |

---

# Running with XAMPP (Apache + MySQL)

Prefer [XAMPP](https://www.apachefriends.org/)? You can use its bundled
**MySQL/MariaDB** as the database instead of the Docker one.

> **Note:** This is a NestJS (Node.js) API — it does **not** run on Apache.
> XAMPP is used only for its **MySQL database** and the **phpMyAdmin** GUI; the
> API itself still runs on Node via `npm`. (You can leave Apache stopped; only
> MySQL is required. Start Apache if you want phpMyAdmin.)

### Prerequisites
- [XAMPP](https://www.apachefriends.org/download.html) installed
- [Node.js](https://nodejs.org/) 20+ and npm

### Steps

1. Start MySQL in the **XAMPP Control Panel**
   - Click **Start** next to **MySQL** (and **Apache** if you want phpMyAdmin).
   - XAMPP's MySQL listens on port **3306** with user `root` and **no
     password** by default.

   > ⚠️ Port 3306 is also used by the Docker stack. Run **either** XAMPP **or**
   > the Docker DB, not both at once, or change one of the ports.

2. Create the `cgpa` database — choose one:
   - **phpMyAdmin:** open <http://localhost/phpmyadmin>, click **New**, enter
     `cgpa`, and create it. (Migrations create the tables, so an empty database
     is enough.)
   - **CLI:**
     ```bash
     mysql -u root -e "CREATE DATABASE IF NOT EXISTS cgpa;"
     ```

3. Configure the environment
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` so `DATABASE_URL` points at XAMPP's MySQL. With the default
   XAMPP credentials (user `root`, empty password):
   ```env
   DATABASE_URL="mysql://root:@localhost:3306/cgpa"
   ```
   If you set a root password in XAMPP, include it:
   `mysql://root:YOUR_PASSWORD@localhost:3306/cgpa`.

4. Install dependencies and prepare the database
   ```bash
   npm install                 # also runs `prisma generate` (postinstall)
   npm run prisma:migrate      # create the tables
   npm run prisma:seed         # create the admin user
   ```

5. Start the API (watch mode)
   ```bash
   npm run start:dev
   ```
   The API is available at <http://localhost:3001>. Browse the data anytime in
   phpMyAdmin (<http://localhost/phpmyadmin>) or via `npm run prisma:studio`.

---

## Project setup (without Docker)

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
