import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import 'react-native-url-polyfill/auto'
import Constants from 'expo-constants'

// Prefer Expo public env, fallback to app.json extra.expoPublic via Constants
let supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
let supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  const extra = Constants.expoConfig?.extra || Constants.manifest?.extra || {}
  const expoPublic = extra.expoPublic || {}
  supabaseUrl = supabaseUrl || expoPublic.SUPABASE_URL
  supabaseAnonKey = supabaseAnonKey || expoPublic.SUPABASE_ANON_KEY
}

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables: EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})