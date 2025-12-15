# Apply Camp Address Migration

## Issue
The `camp_address` column is missing from the `camps` table, causing saves to fail.

## Solution
Run the migration to add the missing column.

### Option 1: Using Supabase Studio (Easiest)

1. Open **Supabase Studio** (your database dashboard)
2. Go to **SQL Editor**
3. Copy and paste this SQL:

```sql
-- Add camp_address column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'camps'
        AND column_name = 'camp_address'
    ) THEN
        ALTER TABLE camps ADD COLUMN camp_address TEXT;

        COMMENT ON COLUMN camps.camp_address IS 'Complete physical address of the camp venue (optional)';
    END IF;
END $$;
```

4. Click **Run** (or press Cmd+Enter)
5. You should see: "Success. No rows returned"

### Option 2: Using Supabase CLI

```bash
# If you have Supabase CLI and Docker running:
npx supabase db push

# Or apply the specific migration:
npx supabase migration up
```

### Verify

After running the migration, verify it worked:

```sql
-- Check if column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'camps'
AND column_name = 'camp_address';
```

You should see:
```
column_name   | data_type | is_nullable
camp_address  | text      | YES
```

## After Migration

1. Refresh your browser
2. Try creating a camp again
3. It should now save successfully!
