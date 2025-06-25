import { createClient } from '@supabase/supabase-js';

    const supabaseUrl = 'https://blkydrwxirlgyykpyeef.supabase.co';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsa3lkcnd4aXJsZ3l5a3B5ZWVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxMDExODksImV4cCI6MjA2MjY3NzE4OX0.MLvNgwj5oox_WzvEkDsmBp49yL8NoEWnrKj7DK0U26g';

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase URL and Anon Key are required.");
    }

    export const supabase = createClient(supabaseUrl, supabaseAnonKey);