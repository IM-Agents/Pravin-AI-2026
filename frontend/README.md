# OMA Frontend - Order Management Automation

React-based frontend application for the Order Management Automation system.

## Tech Stack

- **React**: 17.0.2
- **React Router**: 5.3.4
- **Axios**: 1.5.0
- **Node.js**: 18.16.1

## Project Structure

```
frontend/
├── public/
│   └── index.html              # HTML template
├── src/
│   ├── components/             # Reusable React components
│   │   ├── StatusBadge.jsx     # Order status display
│   │   ├── DownloadButton.jsx  # PDF download button
│   │   ├── TimelineModal.jsx   # Timeline event viewer
│   │   ├── IgnoreOrderButton.jsx # Order ignore toggle
│   │   └── OrderTable.jsx      # Order list table
│   ├── pages/                  # Page components
│   │   ├── ActionRequiredPage.jsx  # Action required orders
│   │   ├── AllOrdersPage.jsx       # All orders view
│   │   └── PrinterManagementPage.jsx # Printer configuration
│   ├── services/               # API services
│   │   ├── api.js              # Axios configuration
│   │   ├── orderService.js     # Order API methods
│   │   └── printerService.js   # Printer API methods
│   ├── utils/                  # Utility functions
│   │   ├── constants.js        # Application constants
│   │   └── helpers.js          # Helper functions
│   ├── styles/                 # CSS stylesheets
│   │   ├── index.css
│   │   ├── App.css
│   │   ├── OrderPage.css
│   │   ├── OrderTable.css
│   │   ├── StatusBadge.css
│   │   ├── DownloadButton.css
│   │   ├── TimelineModal.css
│   │   ├── IgnoreOrderButton.css
│   │   └── PrinterManagement.css
│   ├── App.jsx                 # Main app component
│   └── index.js                # Entry point
├── package.json
├── .env.example
└── .gitignore
```

## Features

### 1. Order Management
- **Action Required Tab**: View orders needing attention (Pending, Failed, In-Progress)
- **All Orders Tab**: View complete order history
- Real-time polling for order updates (30 seconds interval)
- Order timeline viewing with complete event history

### 2. Department Status Tracking
Each order displays status for three departments:
- **DM** (Delivery Management)
- **Confectionery** (Cake Production)
- **Design** (Cake Design Team)

Status types:
- `Pending` - Awaiting processing
- `In-Progress` - Currently being processed
- `Success` - Completed successfully
- `Failure` - Processing failed
- `NA` - Not applicable for this department

### 3. PDF Downloads
- Separate download buttons for each department
- Downloads disabled for `NA` status
- Automatic file naming: `order_{orderId}_{department}.pdf`

### 4. Order Actions
- **Timeline View**: Complete event history for each order
- **Ignore Order**: Mark orders to be ignored (Action Required tab only)
- **Unignore Order**: Restore ignored orders

### 5. Printer Management
- View all detected printers
- Assign printers to departments
- Activate/Deactivate printers
- Monitor printer status (online/offline)

## Setup Instructions

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
REACT_APP_API_BASE_URL=http://localhost:3000
REACT_APP_POLLING_INTERVAL=30000
```

### 3. Start Development Server

```bash
npm start
```

The app will open at `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
```

Production files will be in the `build/` directory.

## API Integration

The frontend connects to the backend API with the following endpoints:

### Order Endpoints
- `GET /api/orders/action-required` - Get orders requiring action
- `GET /api/orders` - Get all orders
- `GET /api/orders/:orderId/timeline` - Get order timeline
- `GET /api/orders/:orderId/department/:department/download-pdf` - Download PDF
- `POST /api/orders/:orderId/ignore` - Toggle order ignore status

### Printer Endpoints
- `GET /api/printers` - Get all printers
- `POST /api/printers/assign` - Assign printer to department
- `POST /api/printers/toggle-active` - Toggle printer active status

## Component Documentation

### StatusBadge
Displays order status with color coding.

**Props:**
- `status` (string) - Order status

**Colors:**
- Pending: Orange (#FFA500)
- In-Progress: Blue (#2196F3)
- Success: Green (#4CAF50)
- Failure: Red (#F44336)
- NA: Gray (#9E9E9E)

### DownloadButton
PDF download button for department orders.

**Props:**
- `orderId` (number) - Order ID
- `department` (string) - Department name
- `status` (string) - Current status

**Behavior:**
- Disabled when status is `NA`
- Shows loading state during download
- Triggers browser download

### TimelineModal
Modal displaying order event timeline.

**Props:**
- `orderId` (number) - Order ID
- `onClose` (function) - Close callback

**Features:**
- Loads timeline on mount
- Shows loading/error states
- Displays events in reverse chronological order

### IgnoreOrderButton
Toggle button for ignoring orders.

**Props:**
- `orderId` (number) - Order ID
- `isIgnored` (boolean) - Current ignore status
- `onUpdate` (function) - Refresh callback

**Behavior:**
- Confirmation dialog before toggle
- Updates order ignore status
- Triggers parent refresh

### OrderTable
Main table component for displaying orders.

**Props:**
- `orders` (array) - Array of order objects
- `showIgnoreButton` (boolean) - Show ignore column
- `onRefresh` (function) - Refresh callback

**Features:**
- Displays all order columns
- Integrates all sub-components
- Handles timeline modal

## Routing

The app uses React Router with the following routes:

- `/orders/action-required` - Action Required page
- `/orders/all` - All Orders page
- `/settings/printers` - Printer Management page
- `/` - Redirects to Action Required

## Styling

All components use modular CSS files for styling:
- Consistent color scheme
- Responsive design
- Hover effects and transitions
- Mobile-friendly layout

## Development Notes

### Polling Mechanism
Orders are automatically refreshed every 30 seconds (configurable via `REACT_APP_POLLING_INTERVAL`).

### Error Handling
- API errors are logged to console
- User-friendly error messages displayed
- Graceful fallbacks for missing data

### State Management
- Local component state using React Hooks
- No global state management (can add Redux if needed)
- Parent-child communication via callbacks

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Future Enhancements

- WebSocket support for real-time updates
- Advanced filtering and search
- Export orders to CSV/Excel
- Print preview before download
- Bulk operations on orders
- User authentication and roles
- Dark mode support

## Troubleshooting

### API Connection Issues
- Verify backend is running on correct port
- Check `REACT_APP_API_BASE_URL` in `.env`
- Check browser console for CORS errors

### PDF Download Not Working
- Verify backend PDF generation is working
- Check browser download settings
- Ensure popup blocker is disabled

### Printers Not Showing
- Ensure Electron desktop app is running
- Verify printers are synced with backend
- Check printer detection in Electron app

## License

Proprietary - Order Management Automation System

