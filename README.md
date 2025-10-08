# Zefix Scraper

## Installation

```bash
npm install
```

## Usage

```bash
npm start
```

## Configuration

Edit the configuration variables in `main.js`:

```javascript
const searchparameter = "AB"; // Change this to your desired search term
const RATE_LIMIT_DELAY = 1000; // Delay between requests in milliseconds
```

## Database Schema

The scraper creates a table `firmen` with the following columns:

- `uid` - Unique company identifier (Primary Key)
- `firma` - Company name
- `rechtsform` - Legal form
- `zweck` - Company purpose
- `sitz` - Legal seat
- `adresse` - Street address
- `ort` - City with postal code
- `kanton` - Swiss canton abbreviation
- `status` - Company status

## Legal Notice

This tool is for educational and research purposes. Please respect the Zefix API terms of service and rate limits.