# VissoftReact

<a alt="Nx logo" href="https://vissoft.vn/" target="_blank" rel="noreferrer"><img src="https://vissoft.vn/upload/images/group-34075.png" width="45"></a>

✨ **This workspace has been created by [Venn](https://github.com/ChuNguyenChuong)** ✨

## Project structure

```
React-Monorepo-Base
 ┣ apps // chứa các app chính
 ┃ ┗ main-app
 ┃ ┃ ┣ public
 ┃ ┃ ┃ ┗ favicon.ico
 ┃ ┃ ┣ src
 ┃ ┃ ┃ ┣ app
 ┃ ┃ ┃ ┃ ┣ app.spec.tsx
 ┃ ┃ ┃ ┃ ┣ app.tsx
 ┃ ┃ ┃ ┃ ┗ nx-welcome.tsx
 ┃ ┃ ┃ ┣ assets
 ┃ ┃ ┃ ┃ ┗ .gitkeep
 ┃ ┃ ┃ ┣ main.tsx
 ┃ ┃ ┃ ┗ styles.css
 ┃ ┃ ┣ .eslintrc.json
 ┃ ┃ ┣ index.html
 ┃ ┃ ┣ jest.config.ts
 ┃ ┃ ┣ postcss.config.js
 ┃ ┃ ┣ project.json
 ┃ ┃ ┣ tailwind.config.js
 ┃ ┃ ┣ tsconfig.app.json
 ┃ ┃ ┣ tsconfig.json
 ┃ ┃ ┣ tsconfig.spec.json
 ┃ ┃ ┗ vite.config.ts
 ┣ libs
 ┃ ┣ common // common compoment
 ┃ ┗ moduleA // other modules
 ┣ .editorconfig
 ┣ .eslintignore
 ┣ .eslintrc.json
 ┣ .gitignore
 ┣ .prettierignore
 ┣ .prettierrc
 ┣ jest.config.ts
 ┣ jest.preset.js
 ┣ nx.json
 ┣ package-lock.json
 ┣ package.json
 ┣ README.md
 ┣ tsconfig.base.json
 ┣ vitest.workspace.ts
 ┗ yarn.lock

```

## Installation

### Install dependencies with yarn (please don't use npm as we save all package versions in yarn's lockfile):

```
yarn
```

### Setup environment

Create local environment file by create a new file `env.local`, then copy content of .env.development into `env.local`

### Run the project

```
yarn dev
```

## Create a new modules in Libs

```
npx nx g @nx/react:library {name} --directory=libs/{name} --unitTestRunner=vitest --bundler=none
```

## Branch prefixes

Define the default prefixes for new branches, to allow automated workflows and make branch types clearer.

1. bugfix/\*
2. feature/\*
3. hotfix/\*
4. release/

## Build for production

Run `npx nx build main-app` to build the application. The build artifacts are stored in the output directory (e.g. `dist/` or `build/`), ready to be deployed.

## Running tasks

To execute tasks with Nx use the following syntax:

```
npx nx <target> <project> <...options>
```

You can also run multiple targets:

```
npx nx run-many -t <target1> <target2>
```

..or add `-p` to filter specific projects

```
npx nx run-many -t <target1> <target2> -p <proj1> <proj2>
```

Targets can be defined in the `package.json` or `projects.json`. Learn more [in the docs](https://nx.dev/features/run-tasks).

## Set up CI!

Nx comes with local caching already built-in (check your `nx.json`). On CI you might want to go a step further.

- [Set up remote caching](https://nx.dev/features/share-your-cache)
- [Set up task distribution across multiple machines](https://nx.dev/nx-cloud/features/distribute-task-execution)
- [Learn more how to setup CI](https://nx.dev/recipes/ci)

## Explore the project graph

Run `npx nx graph` to show the graph of the workspace.
It will show tasks that you can run with Nx.

- [Learn more about Exploring the Project Graph](https://nx.dev/core-features/explore-graph)
