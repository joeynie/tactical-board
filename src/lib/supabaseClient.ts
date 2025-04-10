import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ygttvzaawyhspmfcgqet.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlndHR2emFhd3loc3BtZmNncWV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzMDY1NjcsImV4cCI6MjA1OTg4MjU2N30.T0p2fVBlU0RXKdbcopKL4x5-wuQnFhqoAGxltDDg9jc'; // 来自 Supabase Project Settings

export const supabase = createClient(supabaseUrl, supabaseKey);