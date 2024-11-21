# @writefy/client-shared

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.1.34. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

## Some notes

### About the React Context

- The React Context is used to manage the state of the application, not state of components. It is used to store the user's information and others singleton stuffs.
- React Context is used to avoid prop drilling. So, never pass context data through the props to the children components.
