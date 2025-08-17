import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import 'react-native-url-polyfill/auto'

const supabaseUrl = 'https://ftlyedhyigcqyuebzzmu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0bHllZGh5aWdjcXl1ZWJ6em11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MDQzMzAsImV4cCI6MjA3MDE4MDMzMH0.3zZ6B4dr92ZWRvhb8hJkVNapRkbKZtPsy5ku56cVGmk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
