# AI Study Planner

An intelligent PWA that helps users create personalized study plans, track progress, and stay motivated with AI-powered assistance and quizzes.

## Local Development Setup

This guide will help you set up the project for local development.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later is recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js) or another package manager like [Yarn](https://yarnpkg.com/) or [pnpm](https://pnpm.io/).

### Installation & Setup

1.  **Get the code:**
    If you're using git, clone the repository. Otherwise, download and extract the project files.

2.  **Create an environment file:**
    Create a new file named `.env` in the root directory of the project. This file will store your API key.

3.  **Add your API key:**
    Open the `.env` file and add your Google Gemini API key like this:

    ```
    API_KEY=your_gemini_api_key_here
    ```
    Replace `your_gemini_api_key_here` with your actual key.

4.  **Install dependencies:**
    Open your terminal in the project's root directory and run:
    ```bash
    npm install
    ```
    This will download and install all the necessary packages for the project to run.

### Running the Application

1.  **Start the development server:**
    In the same terminal, run the following command:
    ```bash
    npm run dev
    ```

2.  **View the app:**
    The terminal will show a local URL, usually `http://localhost:5173`. Open this URL in your web browser to see the application running.

The server will automatically reload the page whenever you make changes to the source code.
