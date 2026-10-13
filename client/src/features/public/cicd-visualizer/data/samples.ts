import deployment from './alibaba-vm.yml?raw';
export const samples = [
  { id: 'deployment', filename: 'deploy-to-vm.yml', name: ['Deploy lên VM', 'Deploy to a VM'], text: deployment },
  { id: 'parallel', filename: 'parallel-ci.yml', name: ['Build, test & deploy', 'Build, test & deploy'], text: `name: Build, test & deploy
on:
  push:
    branches: [main]
  pull_request:
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Lint source
        run: npm ci && npm run lint
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node: [20, 22]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: \${{ matrix.node }}
      - name: Run tests
        run: npm ci && npm test
  build:
    needs: [lint, test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build artifacts
        run: npm ci && npm run build
  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    uses: org/project/.github/workflows/deploy.yml@main
` },
  { id: 'matrix', filename: 'matrix.yml', name: ['Matrix nhiều môi trường', 'Multiple environments'], text: `name: Compatibility checks
on: [push, pull_request]
jobs:
  compatibility:
    runs-on: \${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest]
        node: [20, 22]
        exclude:
          - os: windows-latest
            node: 20
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: \${{ matrix.node }}
      - name: Test compatibility
        run: npm ci && npm test
` },
];
