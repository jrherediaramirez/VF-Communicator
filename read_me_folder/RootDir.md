/ (Root Directory)
.env.local - Stores local environment variables, including Firebase API keys. Never commit this file.
.eslintrc.json (or .js) - Configuration for ESLint, helping to enforce code style and catch errors.
.gitignore - Specifies intentionally untracked files that Git should ignore (e.g., node_modules, .env.local, .next).
firebase.json - Configuration for Firebase CLI, defining deployment targets for Firestore rules, Hosting, Functions.
firestore.indexes.json - Defines composite indexes for Firestore queries to ensure optimal performance.
firestore.rules - Security rules for Cloud Firestore, controlling data access based on user authentication and roles.
jsconfig.json (or tsconfig.json if using TypeScript) - Configures JavaScript (or TypeScript) project settings, enabling path aliases and better editor integration.
next.config.js - Configuration file for Next.js, allowing customization of its behavior (e.g., redirects, environment variables).
package.json - Lists project dependencies, scripts (build, dev, start), and project metadata.
README.md - Provides an overview of the project, setup instructions, and other relevant documentation.
components/ - Contains all React components, organized by feature/domain or common UI elements.
auth/ - UI components related to user authentication.
LoginForm.jsx - Component for the user login form, handling input and submission.
LoginForm.css - Styles specific to the LoginForm component.
RoleGuard.jsx - A higher-order component or wrapper to protect routes/UI based on user roles.
RoleGuard.css - Styles for any UI elements within RoleGuard, if necessary.
batch/ - UI components related to batch management and display.
BatchTable.jsx - Renders a table of batch data (Active, QA, or Archive).
BatchTable.css - Styles for the BatchTable component.
BatchRow.jsx - Component representing a single row in the BatchTable.
BatchRow.css - Styles for the BatchRow component.
BatchForm.jsx - Form component for creating or editing batch details.
BatchForm.css - Styles for the BatchForm component.
BatchDetailDrawer.jsx - Component displaying detailed information and history for a selected batch, often in a drawer/modal.
BatchDetailDrawer.css - Styles for the BatchDetailDrawer component.
SampleList.jsx - Component to display a list of samples associated with a batch.
SampleList.css - Styles for the SampleList component.
SampleForm.jsx - Form for processors to submit new samples for a batch.
SampleForm.css - Styles for the SampleForm component.
qa/ - UI components specific to Quality Assurance actions.
QAActionBar.jsx - Component providing QA users with actions like approve, deny, or place batch on-hold.
QAActionBar.css - Styles for the QAActionBar component.
admin/ - UI components for the administration panel.
AdminPanel.jsx - Main container component for admin-specific functionalities.
AdminPanel.css - Styles for the AdminPanel component.
UserTable.jsx - Component to display and manage users (if handled in-app).
UserTable.css - Styles for the UserTable component.
common/ (or ui/) - Reusable, generic UI components across the application.
Button.jsx - A general-purpose button component with variants.
Button.css - Styles for the Button component.
Modal.jsx - A reusable modal/dialog component.
Modal.css - Styles for the Modal component.
Input.jsx - A generic input field component with validation and labeling.
Input.css - Styles for the Input component.
Spinner.jsx - A loading spinner component.
Spinner.css - Styles for the Spinner component.
Table.jsx - A generic, reusable table structure component.
Table.css - Styles for the Table component.
layout/ - Components responsible for the overall page structure and layout.
AppLayout.jsx - Main application layout component (e.g., includes Navbar, Sidebar, and content area).
AppLayout.css - Styles for the AppLayout component.
Navbar.jsx - Navigation bar component, typically at the top of the page.
Navbar.css - Styles for the Navbar component.
Sidebar.jsx - Sidebar navigation component, if applicable.
Sidebar.css - Styles for the Sidebar component.
constants/ - Stores application-wide constant values.
index.js - Exports all constants, or can be broken into files like batchStatuses.js, roles.js, firestoreCollections.js.
contexts/ - React Context API providers for managing global state.
AuthContext.jsx - Manages user authentication state (user object, role, loading status) and provides it to the app.
AppContext.jsx - Optional: for other global states like notifications, theme, or shared UI states.
hooks/ - Custom React Hooks to encapsulate and reuse stateful logic.
useAuth.js - Hook to easily access authentication status and user data from AuthContext.
useFirestoreQuery.js - A reusable hook for subscribing to Firestore collections/documents with real-time updates.
useForm.js - Hook to manage form state, validation, and submission logic.
lib/ - Contains core logic, service integrations, and utility functions.
firebase/ - Modules related to Firebase integration.
config.js - Initializes the Firebase app with project configuration and exports Firebase services (auth, firestore).
auth.js - Wrapper functions for Firebase Authentication (e.g., sign-in, sign-out, password reset, custom claim handling).
firestore.js - Functions for interacting with Firestore (e.g., fetching, creating, updating batches and samples).
storage.js - (If using Firebase Cloud Storage directly for exports) Functions for interacting with Firebase Storage.
utils/ - General utility functions used across the application.
dateUtils.js - Helper functions for formatting, parsing, and manipulating dates and timestamps.
validationUtils.js - Contains input validation logic (e.g., isValidFormula, email validation).
exportUtils.js - Client-side utilities for data export, such as converting JSON to CSV.
logger.js - (Optional) A custom logger for more structured client-side or server-side logging.
pages/ - Contains all Next.js pages and API routes. Each file typically maps to a route.
api/ - Backend API routes handled by Next.js.
export/ - API routes related to data exportation.
batches.js - API endpoint to trigger server-side generation of batch data exports (e.g., as CSV).
admin/ - API routes for administrative actions.
setRole.js - Example API route for an admin to set custom roles for users.
_app.jsx - Custom Next.js App component; wraps all pages, ideal for global layouts, context providers, and global CSS.
_document.jsx - Custom Next.js Document component; allows customization of the <html> and <body> tags.
index.jsx - The main landing page of the application; often redirects to /login or /dashboard.
login.jsx - Page for user authentication/login.
reset-password.jsx - Page for users to request a password reset.
dashboard.jsx - The main dashboard page displaying "Active / Priority" batches.
archive.jsx - Page displaying archived batches (older approved or rejected).
qa-queue.jsx - Page specifically for QA users, showing batches awaiting QA.
batches/ - Sub-directory for batch-related pages.
new.jsx - Page with a form for Processors to start a new batch.
[batchId]/ - Dynamic route for individual batch views.
index.jsx - Page displaying detailed information for a specific batch.
print.jsx - A printer-friendly version of the batch details page.
admin/ - Pages related to application administration.
index.jsx - The main admin panel page for tasks like user management or system-wide settings.
profile.jsx - User profile page where users can manage their account details (e.g., change password).
public/ - Stores static assets that are served directly (e.g., images, fonts, favicon).
images/ - Directory for static image files like logos or illustrative graphics.
favicon.ico - The favicon for the application.
styles/ - Contains global CSS files and style-related configurations.
globals.css - Global stylesheets, CSS resets, and base HTML element styling.
variables.css - Defines CSS custom properties (variables) for theming (colors, fonts, spacing).
functions/ (Optional, sibling to Next.js app root) - If using Firebase Cloud Functions, this directory would contain their source code, typically managed separately.