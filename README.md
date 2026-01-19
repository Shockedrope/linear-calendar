# Linear Calendar

A modern, interactive calendar application that displays the entire year in a linear timeline format. Track events across months with customizable categories and two different view modes.

## Features

- **Year-Long Timeline View**: See all 12 months in a single linear layout
- **Two View Modes**:
  - Align by Weekday: Align dates by day of the week
  - Align by First Day: Start all months from the same column
- **Event Management**: Create, edit, and delete events with date ranges
- **Category System**: Organize events with customizable categories and colors
- **Smart Event Display**: Events automatically stack to prevent overflow
- **Visual Highlights**:
  - Today's date is highlighted
  - Weekends are visually distinguished
- **Persistent Storage**: All events and categories are saved in browser localStorage

## Setup

### Requirements

- A modern web browser (Chrome, Firefox, Safari, Edge)
- No additional dependencies or build tools required

### Installation

1. Clone or download this repository to your local machine:
   ```bash
   git clone <repository-url>
   cd linear-calendar
   ```

2. Open `index.html` in your web browser:
   - Double-click the `index.html` file, or
   - Right-click and select "Open with" your preferred browser, or
   - Use a local web server:
     ```bash
     # Using Python 3
     python -m http.server 8000

     # Using Node.js with http-server
     npx http-server
     ```
   - Then navigate to `http://localhost:8000` in your browser

That's it! The app runs entirely in the browser with no server required.

## Usage

### Navigating the Calendar

- **Change Year**: Use the "← Previous Year" and "Next Year →" buttons at the top
- **Current Year**: Displayed in the header
- **View Modes**: Toggle between "Align by Weekday" and "Align by First Day" using the view control buttons

### Creating Events

1. Click the **"+ Add Event"** button in the header, or
2. Click on any date cell in the calendar
3. Fill in the event details:
   - **Event Title**: Name of your event (required)
   - **Start Date**: When the event begins (required)
   - **End Date**: When the event ends (required)
   - **Category**: Select from predefined categories or use a custom color
   - **Custom Color**: Choose a specific color if not using a category
   - **Description**: Optional additional details
4. Click **"Save Event"**

### Editing Events

1. Click on any event marker in the calendar, or
2. Click on an event in the "Upcoming Events" list
3. Modify the details in the modal that appears
4. Click **"Save Event"** to update or **"Delete"** to remove the event

### Managing Categories

1. Click the **"Manage Categories"** button in the header
2. The categories panel will display all existing categories with event counts
3. **Add a Category**:
   - Click **"+ Add Category"**
   - Enter a name and choose a color
   - Click **"Save Category"**
4. **Edit a Category**:
   - Click on any category in the list
   - Modify the name or color
   - Click **"Save Category"**
5. **Delete a Category**:
   - Click on the category to edit
   - Click **"Delete"**
   - Confirm the deletion (you'll be warned if events use this category)

### Default Categories

The app comes with six default categories:
- **Personal** (Green)
- **Work** (Blue)
- **Important** (Orange)
- **Family** (Purple)
- **Urgent** (Red)
- **Event** (Cyan)

### Event Display

- Events appear as colored bars spanning their date range
- Multi-day events automatically span across days and months
- Events stack intelligently to prevent overlapping
- Click any event to view details or edit
- The "Upcoming Events" sidebar shows all future events in chronological order

### View Modes Explained

**Align by Weekday Mode** (Default):
- All months align dates by day of the week
- Same weekday appears in the same column across all months
- Helps visualize weekly patterns

**Align by First Day Mode**:
- All months start from the same column
- Easier to compare dates across months
- More compact visual layout

## Data Storage

- All data is stored locally in your browser using localStorage
- Events persist between sessions
- Categories persist between sessions
- Data is stored under the keys:
  - `linearCalendarEvents`: Your events
  - `linearCalendarCategories`: Your categories

### Backing Up Your Data

To backup your calendar data:
1. Open browser Developer Tools (F12)
2. Go to Console
3. Run these commands to export your data:
   ```javascript
   // Export events
   console.log(localStorage.getItem('linearCalendarEvents'));

   // Export categories
   console.log(localStorage.getItem('linearCalendarCategories'));
   ```
4. Copy and save the output to a text file

### Restoring Data

To restore your calendar data:
1. Open browser Developer Tools (F12)
2. Go to Console
3. Run these commands with your backed-up data:
   ```javascript
   // Restore events
   localStorage.setItem('linearCalendarEvents', 'PASTE_YOUR_EVENTS_JSON_HERE');

   // Restore categories
   localStorage.setItem('linearCalendarCategories', 'PASTE_YOUR_CATEGORIES_JSON_HERE');
   ```
4. Refresh the page

## Browser Compatibility

- Chrome/Edge: ✅ Fully supported
- Firefox: ✅ Fully supported
- Safari: ✅ Fully supported
- Opera: ✅ Fully supported

## File Structure

```
linear-calendar/
├── index.html       # Main HTML structure
├── styles.css       # All styling and layout
├── script.js        # Calendar logic and event handling
└── README.md        # This file
```

## Keyboard Shortcuts

- **ESC**: Close any open modal
- **Click date**: Quick-add event for that date
- **Click event**: Edit existing event

## Troubleshooting

**Events not appearing:**
- Check that the correct year is selected
- Verify the event dates are in the displayed year
- Refresh the page to reload from localStorage

**Data lost:**
- Check if you're using the same browser
- Verify localStorage is enabled in browser settings
- Check if browser privacy mode (incognito) was used (data won't persist)

**Visual issues:**
- Try refreshing the page
- Clear browser cache
- Ensure you're using a modern browser version

## Privacy

This application runs entirely in your browser. No data is sent to any server. All events and categories are stored locally on your device.

## License

This project is open source and available for personal and commercial use.

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests.
