# Scripts

This directory contains utility scripts for managing camp data and other administrative tasks.

## Export Camps to CSV

Export all camp data from the Supabase database to a CSV file.

### Usage

```bash
npm run export-camps
```

### Requirements

- Node.js environment with access to `.env` file
- Valid Supabase credentials in environment variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

### Output

The script generates a file called `camp_data_from_database.csv` in the project root directory with all camp records.

### Features

- **Dynamic headers**: Automatically derives CSV columns from database schema
- **Excel compatibility**: Includes BOM (Byte Order Mark) for proper Excel encoding
- **Proper CSV escaping**: Handles commas, quotes, and newlines in data
- **JSON field handling**: Automatically serializes complex fields (arrays, objects)
- **Summary output**: Displays exported camps in console

### Security Notes

⚠️ **Important**: This script uses the public anonymous key and is subject to Row Level Security (RLS) policies.

- Only run this script in secure, server-side environments
- Ensure RLS policies are properly configured in Supabase
- For administrative exports requiring elevated permissions, consider using a service role key with proper access controls

### Template File

See `camp_data_template.csv` in the project root for an example of the expected CSV format. This can be used as a reference for bulk imports or data migrations.
