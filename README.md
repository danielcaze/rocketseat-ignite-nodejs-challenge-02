# Daily Diet — Ignite Node.js Challenge 02

This application is a **meal tracking** system where users can sign up, log in, and register their meals. It was built as part of Rocketseat's Ignite Node.js Challenge #2.

## Features

- **User registration**
- **User login** (with Session-based auth)
- **Meal registration** (track whether each meal is within the diet or not)
- **Meal management** (CRUD)
- **Metrics** (e.g., total meals, best streak within diet, etc.)

## Getting Started

### 1. Clone this repository

```bash
git clone https://github.com/danielcaze/rocketseat-ignite-nodejs-challenge-02.git
cd rocketseat-ignite-nodejs-challenge-02
```

### 2. Install dependencies

```bash
npm install
# or yarn
```

### 3. Run MySQL in Docker (Optional)

If you want to run MySQL in a local Docker container, use the command below:

```bash
docker run --name daily_diet_mysql \
  -e MYSQL_ROOT_PASSWORD=123123 \
  -e MYSQL_DATABASE=rocketseat_ignite_nodejs_challenge_02 \
  -p 3306:3306 \
  -d mysql:latest
```

> Make sure the database name matches what you expect in your `.env` file.

### 4. Environment variables

Create a `.env` file at the root of the project (if you haven't already) and set:

```
DATABASE_URL=mysql2://root:123123@localhost:3306/rocketseat_ignite_nodejs_challenge_02
NODE_ENV=development
EMAIL_SENDER_USER=your_email@gmail.com
EMAIL_SENDER_PASSWORD=some_password
```

> Adjust values according to your local/production environment.

### 5. Migrations

Run the Knex migrations to create your tables:

```bash
npx knex migrate:latest --knexfile knexfile.ts
```

### 6. Seeds (Optional)

If you have seeds:

```bash
npx knex seed:run --knexfile knexfile.ts
```

### 7. Start the server

```bash
npm run start
```

This will run the application in **development** mode (watch mode using `tsx`). By default, the server should be listening on `http://localhost:3333`.

---

## Endpoints

Your application provides endpoints for:

- **User Registration**
- **User Login**
- **Meals** (create, read, update, delete)
- **Metrics** (e.g., total meals, best streak in diet, etc.)

---

## Scripts in `package.json`

- **`npm run start`** — Starts the application in development mode (with `cross-env NODE_ENV=development npx tsx watch`).
- **`npm run lint`** — Runs the Biome linter to check and fix code style issues in `./src/**/*.ts`.

---

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b my-feature`
3. Commit your changes: `git commit -m 'feat: My new feature'`
4. Push to the branch: `git push origin my-feature`
5. Open a Pull Request

---

**Enjoy building your Daily Diet app!** If you have any questions or issues, feel free to open an issue or submit a pull request.
