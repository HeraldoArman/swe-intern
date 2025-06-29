# Copilot Learning Assistant Chatbot

This repository contains a Next.js 15 web application that functions as a Copilot Learning Assistant Chatbot. This project was developed as an assignment for the Software Engineer Intern (Summer 2025) position at gradient.academy.

Deployment Link: [https://swe-intern.vercel.app/](https://swe-intern.vercel.app/)

## Technologies Used

  * **Frontend**:
      * [Next.js 15](https://nextjs.org/) (React Framework for production)
      * [React 19](https://react.dev/)
      * [Tailwind CSS 4](https://tailwindcss.com/) (for styling, configured in `postcss.config.mjs` and `tailwind.config.ts`)
      * [Assistant UI](https://assistant-ui.com/) (for chatbot UI components)
      * [Lucide React](https://lucide.dev/icons/) (for icons)
  * **Backend (API)**:
      * [AI SDK](https://sdk.vercel.ai/) (for AI model integration and streaming text)
      * [Google Gemini Model](https://ai.google.dev/models/gemini) (specifically `gemini-2.0-flash-exp` for text generation and `text-embedding-004` for embeddings)
      * [Supabase](https://supabase.com/) (for database and document retrieval via `match_documents` RPC function)
  * **Document Ingestion**:
      * Python script (`scripts/ingest.py`) for processing PDF files and generating embeddings.
      * `pypdf` library for PDF text extraction.
      * `glob` and `dotenv` for file system operations and environment variables.

## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

  * Node.js (LTS version recommended)
  * npm (Node Package Manager), Yarn, or pnpm
  * Git
  * A Google Cloud Project with access to the Gemini API and a valid API Key.
  * A Supabase project with a PostgreSQL database.

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/heraldoarman/swe-intern.git
    cd swe-intern
    ```
2.  **Install dependencies**:
    ```bash
    npm install 
    ```

### Environment Variables

Create a `.env.local` file in the root of the project with the following environment variables:

```
NEXT_PUBLIC_SUPABASE_URL="YOUR_SUPABASE_URL"
SUPABASE_SERVICE_ROLE_KEY="YOUR_SUPABASE_SERVICE_ROLE_KEY"
GOOGLE_API_KEY="YOUR_GOOGLE_API_KEY"
```

  * `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL.
  * `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (found in Project Settings -\> API Keys). This key has elevated privileges, so keep it secure.
  * `GOOGLE_API_KEY`: Your Google Gemini API key.

### Database Setup (Supabase)

1.  **Create a `documents` table**:
    In your Supabase SQL editor, create a table named `documents` with `content`, `embedding` (type `VECTOR`), and `metadata` (type `JSONB`) columns. You will also need to enable the `vector` extension.
    ```sql
    -- Enable the pg_vector extension
    create extension vector;

    -- Create the documents table
    create table documents (
      id bigserial primary key,
      content text, -- corresponds to the chunk of text
      embedding vector(768), -- Use the correct dimension for text-embedding-004
      metadata jsonb -- stores original filename
    );

    -- Create a function for similarity search
    create or replace function match_documents (
      query_embedding vector(768),
      match_threshold float,
      match_count int
    )
    returns table (
      id bigint,
      content text,
      metadata jsonb,
      similarity float
    )
    language plpgsql
    as $$
    begin
      return query
      select
        documents.id,
        documents.content,
        documents.metadata,
        1 - (documents.embedding <=> query_embedding) as similarity
      from documents
      where 1 - (documents.embedding <=> query_embedding) > match_threshold
      order by (documents.embedding <=> query_embedding) asc
      limit match_count;
    end;
    $$;
    ```

### Ingesting Data

The project includes a Python script to ingest PDF documents into your Supabase database.

1.  **Place PDF files**: Put your PDF documents into the `public/materi/` directory.
    (Note: Some PDF files like `aljabar linear.pdf`, `DDP2-2024-2-02c-Recursive-tambahan.pptx.pdf`, `DDP2-2024-2-13-Lambda_NullSafety.pdf` and others are included as examples).
2.  **Run the ingestion script**:
    ```bash
    python scripts/ingest.py
    ```
    This script reads the PDF files, splits them into chunks, generates embeddings using the Google Gemini API, and uploads them to your Supabase `documents` table.

### Running the Application

Once the dependencies are installed and environment variables are set up, and data is ingested, you can run the application:

```bash
npm run dev
```

The application will be accessible at `http://localhost:3000`.

## Project Structure

  * `app/`: Contains the main Next.js application logic, including pages (`page.tsx`), API routes (`api/chat/route.ts`), and the main `Assistant` component (`assistant.tsx`).
  * `components/`: Reusable React components, including UI components (from `shadcn/ui`) and specific Assistant UI components.
  * `public/materi/`: Directory for storing PDF documents that will be ingested into the database.
  * `lib/`: Utility functions (e.g., `utils.ts` for `clsx` and `tailwind-merge`).
  * `hooks/`: Custom React hooks (e.g., `use-mobile.ts`).
  * `scripts/`: Contains the `ingest.py` script for data ingestion.
  * `next.config.ts`: Next.js configuration.
  * `postcss.config.mjs`: PostCSS configuration, including Tailwind CSS.
  * `eslint.config.mjs`: ESLint configuration.
  * `package.json`: Project dependencies and scripts.

## Usage

  * Open the application in your browser (`http://localhost:3000`).
  * Start typing your questions in the message input field.
  * The chatbot will respond based on its general knowledge and the information retrieved from the ingested documents.
  * If the answer is derived from a document, a "Sumber Materi" section will appear with links to the relevant PDF files. Clicking on a link will download the source document.
  * You can also click on the suggested prompts on the welcome screen to get started.
