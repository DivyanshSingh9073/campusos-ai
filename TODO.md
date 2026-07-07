# TODO
- [ ] Understand why `npm run db:setup` prompts for a password for the wrong user.
- [ ] Update the `db:setup` script in `Backend/package.json` so it uses PostgreSQL authentication configured for the *postgres* server user (or a non-interactive method), instead of prompting for the app `User`.
- [ ] Prefer using `PGPASSWORD`/`password`less options where appropriate, or explicitly set `-U postgres`.
- [ ] Verify the updated command with a local dry run / by running `npm run db:setup`.

