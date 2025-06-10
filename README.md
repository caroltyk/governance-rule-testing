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

**⚠️ Important: Before using the application, you must configure your API settings.**

1. **Start your Governance Hub API server** (if not already running)
2. **Open the application** in your browser at `http://localhost:3001`
3. **Navigate to the Settings tab** (third tab in the navigation)
4. **Configure your API connection:**
   - **API URL**: Enter your Governance Hub API URL (default: `http://localhost:8080/api`)
   - **API Key**: Enter your API authentication key
5. **Test the connection** using the "Test Connection" button
6. **Save your settings** - they will be stored locally in your browser

### Backend Setup

The application is designed to work with the Tyk Governance Hub API. By default, it expects the API to be running on `http://localhost:8080`. 

To set up the backend:

1. **Start the Governance Hub API server** on port 8080
2. **Obtain an API key** from your Governance Hub instance
3. **Configure the connection** in the Settings page of this application

The application uses a Vite proxy for local development to avoid CORS issues when connecting to `localhost:8080`.

## Usage Guide

### Initial Setup

1. **Configure API Settings** (Required before first use):
   - Click on the "Settings" tab
   - Enter your Governance Hub API URL
   - Enter your API key
   - Test the connection and save

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
The application stores API configuration in your browser's local storage:
- **API URL**: Automatically configured from `VITE_GOVERNANCE_URL` environment variable
- **API Key**: Authentication key for API access (must be configured in Settings)
- **Non-modifiable URL**: The API URL field is read-only in the Settings page

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
3. **Start your Governance Hub API** on port 8080
4. **Start the development server**: `npm run dev`
5. **Configure API settings** in the Settings tab
6. **Begin using the application**

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

- API keys are stored locally in browser storage
- No API keys are hardcoded in the application
- All API communication uses HTTPS in production
- Settings are isolated per browser/device

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
1. Build the application
2. Serve the static files from a web server
3. Users will configure their API settings through the Settings page
4. Ensure your Governance Hub API is accessible from client browsers

## License

This project is part of the Tyk Governance Hub and follows the same licensing terms.
