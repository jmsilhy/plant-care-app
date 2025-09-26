import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cfvvdyukqfuisixyzycr.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmdnZkeXVrcWZ1aXNpeHl6eWNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0OTQ0OTYsImV4cCI6MjA3MjA3MDQ5Nn0.vNulzzMytcsMSUG2wMmOMLTe3Bk1V_HTmcNCrlO4IAg'

export const supabase = createClient(supabaseUrl, supabaseKey)