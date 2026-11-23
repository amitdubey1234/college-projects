# CivicFix

**See an issue. Report it. Make your city better.**

CivicFix is a frontend-based civic issue reporting and tracking website. It allows users to browse reported issues, submit new reports, support existing issues and view community impact statistics.

The project demonstrates how a civic issue reporting platform can work using HTML, CSS and JavaScript.

**Note:** CivicFix is a demonstration project, not an official government portal. It does not connect to any municipal authority. All sample reports and locations are provided for demonstration purposes.

## Features

- Browse and search civic issues.
- Filter and sort reports by category, severity and status.
- Submit new reports with descriptions, locations and optional photos.
- View individual issue details and status timelines.
- Support existing issues.
- View community impact statistics through a dashboard.
- Responsive design with mobile navigation.
- Save reports and support information using browser LocalStorage.

## Project Pages

| Page | File | Purpose |
|---|---|---|
| Home | `index.html` | Homepage and featured issues |
| Explore Issues | `issues.html` | Search, filter and browse reports |
| Report an Issue | `report.html` | Submit a new civic issue |
| Issue Details | `issue-details.html` | View report details and support issues |
| Community Impact | `impact.html` | Display issue statistics |

## Technologies Used

- **HTML5** – Structure and page content.
- **CSS3** – Styling, layouts and responsive design.
- **JavaScript** – Functionality and interactive features.
- **LocalStorage** – Saving reports and support data in the browser.
- **SVG** – Icons and illustrations.

## Project Structure

```text
CivicFix/
│
├── index.html
├── issues.html
├── report.html
├── issue-details.html
├── impact.html
├── README.md
│
├── assets/
│   ├── icons/
│   └── images/
│
├── css/
│   ├── style.css
│   ├── components.css
│   ├── polish.css
│   └── responsive.css
│
└── js/
    ├── data.js
    ├── common.js
    ├── home.js
    ├── issues.js
    ├── report.js
    ├── issue-details.js
    └── impact.js
```

## How to Run

1. Download and extract the project folder.
2. Open the project folder in Visual Studio Code.
3. Install the Live Server extension if it is not already installed.
4. Open `index.html` using Live Server.
5. Navigate through the website using the navigation menu.

## Data Storage

CivicFix uses the browser's LocalStorage to store reports and support information.

- Sample reports are loaded when the website is opened for the first time.
- Newly submitted reports are saved in the browser.
- Changes are available across the website pages in the same browser.
- Clearing browser storage will remove the saved project data.

## Limitations

- The project does not have a backend or database.
- Data is stored locally in the user's browser.
- Reports are not submitted to any government authority.
- Sample reports and statistics are for demonstration purposes.
- There is no user authentication or real-time status tracking.

