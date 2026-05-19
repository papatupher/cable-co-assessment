# Connecting to GitLab

This guide covers how to connect this project to a GitLab repository — either as a primary remote or alongside an existing GitHub remote.

---

## 1. Create a GitLab Project

1. Sign in to [gitlab.com](https://gitlab.com) (or your self-hosted GitLab instance).
2. Click **New project → Create blank project**.
3. Set the project name (e.g. `cable-co-assessment`) and visibility.
4. **Uncheck** "Initialize repository with a README" — the repo already has content.
5. Click **Create project** and copy the repository URL shown on the next screen.

---

## 2. Add GitLab as a Remote

### Option A — GitLab as the only remote

Replace the existing `origin` remote:

```bash
git remote set-url origin https://gitlab.com/<your-username>/cable-co-assessment.git
```

### Option B — GitLab alongside GitHub (dual remote)

Keep `origin` pointing at GitHub and add a separate `gitlab` remote:

```bash
git remote add gitlab https://gitlab.com/<your-username>/cable-co-assessment.git
```

Push to GitLab with:

```bash
git push gitlab main
```

---

## 3. Authenticate

### HTTPS (username + token)

Generate a **Personal Access Token** in GitLab under **User Settings → Access Tokens** with `read_repository` and `write_repository` scopes, then either:

- Enter it when Git prompts for a password, or
- Store it in Git's credential helper:

```bash
git config --global credential.helper store
# Next push will prompt once; credentials are then cached
```

### SSH (recommended for daily use)

```bash
# Generate a key if you don't have one
ssh-keygen -t ed25519 -C "your@email.com"

# Copy the public key
cat ~/.ssh/id_ed25519.pub
```

Paste the public key into **GitLab → User Settings → SSH Keys**, then use the SSH remote URL:

```bash
git remote set-url origin git@gitlab.com:<your-username>/cable-co-assessment.git
# or for a second remote:
git remote add gitlab git@gitlab.com:<your-username>/cable-co-assessment.git
```

---

## 4. Push the Repository

```bash
# Push all branches and tags
git push -u origin --all
git push -u origin --tags
```

---

## 5. GitLab CI/CD (optional)

Add a `.gitlab-ci.yml` file at the project root to run tests and type-checks automatically on every push:

```yaml
# .gitlab-ci.yml
image: node:22

stages:
  - install
  - check

variables:
  PNPM_VERSION: "9"

before_script:
  - corepack enable
  - corepack prepare pnpm@${PNPM_VERSION} --activate
  - pnpm install --frozen-lockfile

typecheck:
  stage: check
  script:
    - pnpm check

test:
  stage: check
  script:
    - pnpm test
```

Commit and push this file; GitLab will pick it up automatically and run the pipeline on the next push.

---

## 6. Mirroring from GitHub to GitLab (optional)

If the authoritative source stays on GitHub but you want a GitLab mirror:

1. In your GitLab project go to **Settings → Repository → Mirroring repositories**.
2. Set the **Git repository URL** to your GitHub HTTPS URL.
3. Set **Mirror direction** to **Pull**.
4. Provide a GitHub Personal Access Token with `repo` scope as the password.
5. Click **Mirror repository** — GitLab will poll GitHub and keep the mirror in sync.
