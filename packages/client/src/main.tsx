import './styles/index.css';
import './styles/tree.css';
import './styles/editor.css';

import './bootstraps/firebase';
import './bootstraps/blocksuite';

import { createRoot } from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';


// Import the generated route tree
import { routeTree } from './routeTree.gen';

// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}

// Render the app
const rootElement = document.getElementById('root')!;

if (!rootElement.innerHTML) {
    const root = createRoot(rootElement);
    root.render(
        <RouterProvider router={router} />
    );
}