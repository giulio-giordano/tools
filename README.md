# Tools

A collection of browser-based PDF and DOCX utilities. Document files are processed locally in the browser; their contents are not uploaded to a conversion service.

## Development

Requires Bun and a supported Node.js version (see `package.json`).

```sh
bun install
bun run dev
```

Build and verify:

```sh
bun run build
bun run test:unit
bun run test:e2e
```

The production build is deployed to GitHub Pages by `.github/workflows/deploy.yml`. Vite copies files from `public/` into `dist/`, so the third-party license files there are included in the Pages artifact.

## Licensing and third-party notices

The original source code in this repository is licensed under the MIT License. See [`LICENSE`](LICENSE).

The application also uses third-party software. These components retain their own licenses and are not relicensed by this project's MIT License:

| Component | License | Copyright notice |
| --- | --- | --- |
| ReamKit | MIT | Copyright (c) 2026 Alex Krassavin |
| pdf-lib | MIT | Copyright (c) 2019 Andrew Dillon |
| fflate | MIT | Copyright (c) 2026 Arjun Barrett |
| Pinia | MIT | Copyright (c) 2019-present Eduardo San Martin Morote |
| Vue | MIT | Copyright (c) 2018-present, Yuxi (Evan) You |
| Vue Router | MIT | Copyright (c) 2019-present Eduardo San Martin Morote |

The application bundles the **Carlito** fonts. They are licensed separately under the **SIL Open Font License, Version 1.1** and are not covered by this project's MIT License.

> Copyright 2013 The Carlito Project Authors (https://github.com/googlefonts/carlito), with Reserved Font Name "Carlito"

The full Carlito license text is available at [`public/licenses/Carlito-OFL.txt`](public/licenses/Carlito-OFL.txt). It is copied into the GitHub Pages build at `licenses/Carlito-OFL.txt` (under the site's `/tools/` base path).

Other transitive dependencies retain the licenses declared by their respective authors and package metadata. The resolved dependency versions are recorded in [`bun.lock`](bun.lock).
