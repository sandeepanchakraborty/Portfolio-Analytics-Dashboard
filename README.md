# Portfolio Management System

This is a full-stack web application for managing a portfolio, built with React (frontend) and Express (backend). The backend uses an Excel file as the database via the `xlsx` library.

## Features

- View, add, edit, and delete portfolio entries
- Analytics and visualizations based on portfolio data
- No MongoDB required; all data is stored in the Excel file

## Project Structure

- `client/` - React frontend
- `server/` - Express backend
- `Sample Portfolio Dataset for Assignment.xlsx` - Excel file used as the database

## Getting Started

1. Install dependencies in both `client` and `server` folders:
   - `cd client && npm install`
   - `cd ../server && npm install`
2. Start the backend:
   - `node index.js` (from the `server` folder)
3. Start the frontend:
   - `npm start` (from the `client` folder)

## Customization

- Update the Excel file as needed for your data.
- Backend endpoints are defined in `server/index.js`.

## Assignment Details

See `Full-Stack Developer Intern Assignment.pdf` for requirements.
