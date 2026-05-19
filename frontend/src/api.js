// Central API base URL
// In development: empty string → uses CRA proxy (localhost:8000)
// In production: set REACT_APP_API_URL to your Railway backend URL
const API_BASE = process.env.REACT_APP_API_URL || '';

export default API_BASE;
