# Supabase Setup Guide

This guide will help you set up Supabase for the Right Wing Tracker application.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Node.js and npm installed
- Your CSV data files in the Downloads folder

## Step 1: Create Supabase Project

1. Go to https://supabase.com and sign in
2. Create a new project
3. Note your project's database URL and password
4. Go to Project Settings > API to get your API keys

## Step 2: Set Up Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
# Database connection (for migrations and imports)
DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@db.yeyytxdwwgraesyiyqfl.supabase.co:5432/postgres

# Supabase API (for client-side and API routes)
NEXT_PUBLIC_SUPABASE_URL=https://yeyytxdwwgraesyiyqfl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_ANON_KEY]
SUPABASE_SERVICE_KEY=[YOUR_SERVICE_ROLE_KEY]
```

**Project Reference**: `yeyytxdwwgraesyiyqfl`

Replace:
- `[YOUR_PASSWORD]` with your database password
- `[YOUR_ANON_KEY]` with your anon/public key (safe to expose to client)
- `[YOUR_SERVICE_ROLE_KEY]` with your service role key (keep secret, server-side only)

### Verify Your Configuration

After setting up your `.env.local` file, you can verify the connection:

**PowerShell:**
```powershell
.\scripts\verify-supabase-url.ps1
```

**Or test the connection:**
```powershell
npm run test-supabase
```

## Step 3: Create Database Tables

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the SQL from `supabase/migrations/001_initial_schema.sql`

Alternatively, you can run it via the Supabase CLI or directly through the SQL editor.

## Step 4: Import CSV Data

1. Make sure your CSV files are in your Downloads folder:
   - `Right wing tracker prelim spreadsheet - People.csv`
   - `Right wing tracker prelim spreadsheet - Organisations.csv`
   - `Right wing tracker prelim spreadsheet - Topics.csv`
   - `Right wing tracker prelim spreadsheet - Sources.csv`
   - `Right wing tracker prelim spreadsheet - Statements.csv`

2. Run the import script:
   ```bash
   npm run import-data
   ```

   Or manually:
   ```bash
   tsx scripts/import-csv-data.ts
   ```

## Step 5: Verify Data

1. Go to your Supabase project dashboard
2. Navigate to Table Editor
3. Verify that data has been imported into all tables:
   - people
   - organizations
   - topics
   - sources
   - statements

## Step 6: Set Up Row Level Security (Optional)

By default, the tables are accessible via the service role key. For production, you should set up Row Level Security (RLS) policies to control access.

1. Go to Authentication > Policies in your Supabase dashboard
2. Create policies for each table as needed
3. For now, you can disable RLS for development, but enable it for production

## Step 7: Run the Application

```bash
npm run dev
```

The application should now be connected to Supabase and displaying real data from your database.

## Troubleshooting

### Database Connection Errors

- Verify your DATABASE_URL is correct
- Check that your database password doesn't contain special characters that need URL encoding
- Ensure your Supabase project is active and not paused

### Import Errors

- Check that CSV files are in the correct location (Downloads folder)
- Verify CSV file names match exactly (including capitalization)
- Check that CSV files have the correct headers
- Look for empty rows or malformed data in CSV files

### API Errors

- Verify NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY are set correctly
- Check that tables exist in your database
- Verify that data has been imported successfully
- Check browser console and server logs for specific error messages

### Missing Data

- Verify that the import script completed successfully
- Check that all CSV files were processed
- Verify that data exists in the database using the Supabase dashboard

## Next Steps

- Set up Row Level Security (RLS) for production
- Add indexes for better query performance (already included in migration)
- Set up database backups
- Configure environment variables for production deployment
- Add data validation and error handling

## API Endpoints

The application exposes the following API endpoints:

- `GET /api/people` - Get list of people
- `GET /api/organizations` - Get list of organizations
- `GET /api/topics` - Get list of topics
- `GET /api/sources` - Get list of sources
- `GET /api/statements` - Get list of statements
- `GET /api/stats` - Get statistics and counts

All endpoints support query parameters for filtering and pagination.

