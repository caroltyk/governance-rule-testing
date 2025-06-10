# Governance Rule Testing - Admin Panel

A comprehensive admin webpage for managing rulesets and running rule evaluations against discovered APIs. This application provides a user-friendly interface for API governance operations.

This is a prototype for testing Tyk default Governance rule creation and application.

INTERNAL USE only.

## Features

### 🔧 Ruleset Management
- **Create Rulesets**: Add new governance rulesets with name, description, and JSON rules
- **List Rulesets**: View all rulesets with status indicators (Active/Inactive)
- **Edit Rulesets**: Update existing rulesets with Monaco code editor
- **Delete Rulesets**: Remove rulesets with confirmation dialogs
- **Monaco Editor**: Built-in JSON editor with syntax highlighting for rule definitions

### 📊 Rule Evaluation
- **Ruleset Selection**: Choose from active rulesets for evaluation
- **API Discovery**: Browse and filter discovered APIs by:
  - Provider (Tyk, AWS, etc.)
  - Authentication type (JWT, OAuth, Basic, etc.)
  - Criticality level (Tier 1, 2, 3)
  - Business domain
- **Multi-select APIs**: Select multiple APIs for batch evaluation
- **Evaluation Results**: Comprehensive results table showing:
  - Severity levels (Error, Warning, Info, Hint)
  - API details and rule violations
  - File paths and line numbers
  - Sortable and filterable results

### ⚙️ Settings Management
- **API Configuration**: View Governance Hub API URL and authentication status
- **Connection Testing**: Test connectivity to your Governance Hub instance
- **Environment Variables**: Secure configuration via environment variables
- **No Local Storage**: API keys no longer stored in browser for security

### 🎨 User Interface
- **Responsive Design**: Works on desktop and tablet devices
- **Tab Navigation**: Switch between Rulesets, Evaluation, and Settings views
- **Loading States**: Visual feedback during API operations
- **Error Handling**: Graceful error messages and retry options
- **Success Notifications**: Toast messages for successful operations

## Technology Stack

- **React 18** - Modern React with hooks and functional components
- **Vite** - Fast development server and build tool
- **React Query** - Data fetching, caching, and synchronization
- **Monaco Editor** - VS Code-style code editor for JSON/YAML
- **Axios** - HTTP client for API communication
- **CSS3** - Custom styling with responsive design

## Project Structure

```
governance-rule-demo/
├── src/
│   ├── components/           # React components
│   │   ├── Layout.jsx       # Main layout wrapper
│   │   ├── TabNavigation.jsx # Tab switching
│   │   ├── RulesetList.jsx  # Ruleset management
│   │   ├── RulesetCard.jsx  # Individual ruleset display
│   │   ├── RulesetForm.jsx  # Create/edit ruleset modal
│   │   ├── RuleEvaluation.jsx # Evaluation orchestration
│   │   ├── APISelector.jsx  # API selection interface
│   │   ├── EvaluationResults.jsx # Results table
│   │   └── Settings.jsx     # API configuration
│   ├── hooks/               # Custom React hooks
│   │   ├── useRulesets.js   # Ruleset data management
│   │   └── useAPIs.js       # API data management
│   ├── services/            # API service layer
│   │   ├── api.js           # Axios configuration
│   │   └── rulesets.js      # Ruleset API calls
│   ├── styles/              # CSS styling
│   │   └── main.css         # Main stylesheet
│   ├── App.jsx              # Root component
│   └── main.jsx             # Application entry point
├── package.json             # Dependencies and scripts
├── vite.config.js           # Vite configuration
└── index.html               # HTML template
```

## API Integration

The application integrates with the Governance Hub API endpoints:

- `GET /api/rulesets` - List all rulesets
- `POST /api/rulesets` - Create new ruleset
- `PUT /api/rulesets/{id}` - Update ruleset
- `DELETE /api/rulesets/{id}` - Delete ruleset
- `GET /api/apis` - List discovered APIs with filtering
- `POST /api/rulesets/evaluate` - Run evaluation

## Getting Started

### Prerequisites
- Node.js 16+ and npm
- Tyk Governance Hub API server running (default: `http://localhost:8080`)

### Installation

1. **Install dependencies:**
   ```bash
   cd governance-rule-demo
   npm install
   ```

2. **Configure environment (REQUIRED):**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env and set your configuration
   # VITE_GOVERNANCE_URL=http://localhost:8081
   # VITE_API_KEY=your-api-key-here
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open the application:**
   Navigate to `http://localhost:3001` in your browser

### Initial Configuration

**⚠️ Important: Before using the application, you must configure your environment variables.**

1. **Configure your `.env` file** (Required):
   ```bash
   # Copy the example file
   cp .env.example .env
   
   # Edit the .env file with your settings
   VITE_GOVERNANCE_URL=http://localhost:8081
   VITE_API_KEY=your-api-key-here
   ```

2. **Start your Governance Hub API server** (if not already running)
3. **Start the development server:**
   ```bash
   npm run dev
   ```
4. **Open the application** in your browser at `http://localhost:3001`
5. **Navigate to the Settings tab** to verify your configuration
6. **Test the connection** using the "Test Connection" button

### Backend Setup

The application is designed to work with the Tyk Governance Hub API. The API URL and authentication are configured via environment variables for security.

To set up the backend:

1. **Start the Governance Hub API server** (default port 8081)
2. **Obtain an API key** from your Governance Hub instance
3. **Configure the environment variables** in your `.env` file
4. **Restart the development server** to pick up the new configuration

The application uses a Vite proxy for local development to avoid CORS issues.

## Usage Guide

### Initial Setup

1. **Configure Environment Variables** (Required before first use):
   - Set `VITE_GOVERNANCE_URL` to your API server URL
   - Set `VITE_API_KEY` to your authentication key
   - Restart the development server
   - Verify configuration in the Settings tab

### Managing Rulesets

1. **Create a Ruleset:**
   - Click "Create New Ruleset" button
   - Fill in name and description
   - Add rules in JSON format using the Monaco editor
   - Set active status and save

2. **Edit a Ruleset:**
   - Click "Edit" on any ruleset card
   - Modify fields as needed
   - Update rules in the code editor
   - Save changes

3. **Delete a Ruleset:**
   - Click "Delete" on any ruleset card
   - Confirm deletion in the dialog

### Running Evaluations

1. **Select a Ruleset:**
   - Choose from active rulesets in the dropdown
   - View ruleset details and rule count

2. **Select APIs:**
   - Use filters to narrow down API list
   - Select individual APIs or use "Select All"
   - View API details including authentication and labels

3. **Run Evaluation:**
   - Click "Run Evaluation" button
   - View results in the comprehensive table
   - Sort and filter results by severity
   - Examine violation details and locations

## Configuration

### Environment Variables

The application supports environment-based configuration for secure API access:

- **VITE_GOVERNANCE_URL**: Sets the Governance Hub API URL
  - Used for both the Vite proxy target and displayed in the Settings page
  - Defaults to `http://localhost:8080` if not set
  - Examples:
    - Development: `VITE_GOVERNANCE_URL=http://localhost:8081`
    - Staging: `VITE_GOVERNANCE_URL=https://governance-staging.example.com`
    - Production: `VITE_GOVERNANCE_URL=https://governance.example.com`

- **VITE_API_KEY**: Sets the API authentication key (Required)
  - Used for authenticating with the Governance Hub API
  - No default value - must be configured for the application to work
  - Should be kept secure and not committed to version control
  - Examples:
    - Development: `VITE_API_KEY=40f7439c-487c-4ac3-83d2-a388aff4e3d9`
    - Staging: `VITE_API_KEY=staging-api-key-here`
    - Production: `VITE_API_KEY=production-api-key-here`

**Setting up environment variables:**

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit the .env file:**
   ```bash
   # Set your Governance API URL
   VITE_GOVERNANCE_URL=http://localhost:8081
   
   # Set your API authentication key (REQUIRED)
   VITE_API_KEY=your-api-key-here
   ```

3. **Restart the development server** for changes to take effect

**⚠️ Security Note:** Never commit your `.env` file with real API keys to version control. The `.env` file should be included in your `.gitignore`.

**Important Note:** The vite.config.js uses Vite's `loadEnv` function to properly load environment variables. This ensures that your .env file is correctly read during development.

### API Settings
The application now uses secure environment variable configuration:
- **API URL**: Automatically configured from `VITE_GOVERNANCE_URL` environment variable
- **API Key**: Configured from `VITE_API_KEY` environment variable (no longer stored in browser)
- **Read-only Settings**: The Settings page displays configuration status rather than editable fields

### Development Configuration
The Vite development server is configured to:
- Run on port 3001
- Proxy API requests to the URL specified in `VITE_GOVERNANCE_URL` (default: `http://localhost:8080`)
- Automatically update proxy configuration based on environment variable

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Local Development Setup

1. **Clone or extract the project**
2. **Install dependencies**: `npm install`
3. **Configure environment variables**: `cp .env.example .env` and edit with your settings
4. **Start your Governance Hub API** on the configured port
5. **Start the development server**: `npm run dev`
6. **Verify configuration** in the Settings tab
7. **Begin using the application**

## Features in Detail

### Monaco Editor Integration
- Syntax highlighting for JSON
- Auto-completion and error detection
- Configurable editor options
- Seamless integration with form validation

### React Query Integration
- Automatic caching and background updates
- Optimistic updates for better UX
- Error handling and retry logic
- Loading state management

### Responsive Design
- Mobile-friendly interface
- Flexible grid layouts
- Adaptive navigation
- Touch-friendly controls

### Settings Management
- Persistent configuration storage
- Real-time connection testing
- Validation and error handling
- Easy reset to defaults

## Troubleshooting

### Common Issues

1. **"Network error" or connection failures**:
   - Ensure your Governance Hub API is running
   - Check the API URL in Settings
   - Verify your API key is correct
   - Use "Test Connection" to diagnose issues

2. **Empty API or ruleset lists**:
   - Verify your API key has proper permissions
   - Check that your Governance Hub has data
   - Look at browser console for error messages

3. **CORS errors in development**:
   - The application uses Vite proxy for `localhost:8080`
   - For other URLs, ensure your API server allows CORS
   - Check browser developer tools for specific errors

4. **Environment variable not working**:
   - Ensure your .env file is in the project root directory
   - Verify the .env file contains `VITE_GOVERNANCE_URL=your-url-here`
   - Restart the development server after changing .env files
   - Check that vite.config.js uses `loadEnv` to load environment variables
   - The Settings page should display the URL from your environment variable

### Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Security Considerations

- **API keys are configured via environment variables** (no longer stored in browser storage)
- **No API keys are hardcoded** in the application
- **Environment variables are build-time only** - compiled into the JavaScript bundle
- **All API communication uses HTTPS** in production
- **Secure configuration management** - sensitive data managed at deployment level
- **No localStorage exposure** - API keys cannot be accessed via browser developer tools

## Contributing

1. Follow the existing code structure and patterns
2. Use functional components with hooks
3. Implement proper error handling
4. Add loading states for async operations
5. Ensure responsive design compatibility
6. Test API configuration changes thoroughly

## Deployment

### Production Build

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

### Environment Configuration

For production deployment:

1. **Configure environment variables** for your deployment environment:
   ```bash
   # Production environment variables
   VITE_GOVERNANCE_URL=https://your-governance-api.example.com
   VITE_API_KEY=your-production-api-key
   ```

2. **Build the application** with the production environment:
   ```bash
   npm run build
   ```

3. **Serve the static files** from a web server (nginx, Apache, etc.)

4. **Ensure your Governance Hub API** is accessible from client browsers

**Important Notes:**
- Environment variables are compiled into the JavaScript bundle at build time
- Different builds are required for different environments (dev/staging/prod)
- API keys are embedded in the client-side code, so use appropriate keys for each environment
- Consider using CI/CD pipelines to manage environment-specific builds securely

## License

This project is part of the Tyk Governance Hub and follows the same licensing terms.
