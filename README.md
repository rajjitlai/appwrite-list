# Appwrite Storage Files List# React + TypeScript + Vite

A React application built with Vite and TypeScript that fetches and displays all files from an Appwrite Storage bucket with individual download functionality.This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## FeaturesCurrently, two official plugins are available:

- ✅ **Fetch ALL files** from Appwrite Storage (not limited to 25)- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh

- ✅ **Cursor-based pagination** to load files in batches of 100- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

- ✅ **Individual download buttons** for each file

- ✅ **Responsive grid layout**## React Compiler

- ✅ **File metadata display** (size, type, upload date)

- ✅ **Loading states** and error handlingThe React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Setup Instructions## Expanding the ESLint configuration

### 1. Configure AppwriteIf you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

1. Create an account at [Appwrite Cloud](https://cloud.appwrite.io) or use your self-hosted instance```js

2. Create a new projectexport default defineConfig([

3. Create a storage bucket globalIgnores(['dist']),

4. Set appropriate permissions on your bucket (read access for your users) {

   files: ['**/*.{ts,tsx}'],

### 2. Environment Variables extends: [

      // Other configs...

Copy `.env.local` and update with your Appwrite credentials:

      // Remove tseslint.configs.recommended and replace with this

````env tseslint.configs.recommendedTypeChecked,

VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1      // Alternatively, use this for stricter rules

VITE_APPWRITE_PROJECT_ID=your-project-id-here      tseslint.configs.strictTypeChecked,

VITE_APPWRITE_BUCKET_ID=your-bucket-id-here      // Optionally, add this for stylistic rules

```      tseslint.configs.stylisticTypeChecked,



**Important:** Replace the placeholder values:      // Other configs...

- `VITE_APPWRITE_PROJECT_ID`: Your Appwrite project ID    ],

- `VITE_APPWRITE_BUCKET_ID`: Your storage bucket ID    languageOptions: {

      parserOptions: {

### 3. Install Dependencies        project: ['./tsconfig.node.json', './tsconfig.app.json'],

        tsconfigRootDir: import.meta.dirname,

```bash      },

npm install      // other options...

```    },

  },

### 4. Run the Development Server])

````

```bash

npm run devYou can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```

````js

The app will be available at `http://localhost:5173`// eslint.config.js

import reactX from 'eslint-plugin-react-x'

## How It Worksimport reactDom from 'eslint-plugin-react-dom'



### Fetching ALL Filesexport default defineConfig([

  globalIgnores(['dist']),

The app uses cursor-based pagination to fetch all files:  {

    files: ['**/*.{ts,tsx}'],

```typescript    extends: [

// Fetches files in batches of 100 until all files are retrieved      // Other configs...

while (hasMore) {      // Enable lint rules for React

  const queries = lastId ? [`cursorAfter("${lastId}")`] : [];      reactX.configs['recommended-typescript'],

  const response = await storage.listFiles(BUCKET_ID, queries);      // Enable lint rules for React DOM

  allFiles.push(...response.files);      reactDom.configs.recommended,

      ],

  if (response.files.length < limit) {    languageOptions: {

    hasMore = false;      parserOptions: {

  } else {        project: ['./tsconfig.node.json', './tsconfig.app.json'],

    lastId = response.files[response.files.length - 1].$id;        tsconfigRootDir: import.meta.dirname,

  }      },

}      // other options...

```    },

  },

### Downloading Files])

````

Each file has a download button that:

1. Gets the download URL from Appwrite
2. Creates a temporary anchor element
3. Triggers the browser's download mechanism

```typescript
const result = storage.getFileDownload(BUCKET_ID, fileId);
const link = document.createElement("a");
link.href = result.toString();
link.download = fileName;
link.click();
```

## Storage vs Database Approach

**✅ We used Storage API directly** because:

- Simpler implementation
- No need to maintain duplicate metadata
- Direct file access using file IDs
- Automatic pagination support

**Alternative approach** (Database with file links):

- Would require creating a database collection
- Storing file metadata and links in documents
- Keeping documents in sync with storage
- More complexity but offers additional query capabilities

## Project Structure

```
src/
├── lib/
│   └── appwrite.ts          # Appwrite client configuration
├── components/
│   ├── FilesList.tsx        # Main component with file listing & download
│   └── FilesList.css        # Component styles
├── App.tsx                  # Root component
└── main.tsx                 # Entry point
```

## Tech Stack

- **Vite** - Fast build tool and dev server
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Appwrite SDK** - Backend services
- **CSS3** - Styling with responsive grid

## Troubleshooting

### Files not loading?

- Check your `.env.local` file has correct credentials
- Verify bucket permissions allow read access
- Check browser console for error messages

### Downloads not working?

- Ensure your Appwrite bucket has public read access
- Check if browser is blocking downloads (popup blocker)
- Verify the file still exists in storage

## License

MIT
