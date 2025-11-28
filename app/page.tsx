import { redirect } from 'next/navigation'

/**
 * Home Page - Redirects to /search
 * =================================
 *
 * The home route (/) now redirects to /search
 */

export default function Home() {
  redirect('/whatsapp-search-latest')
}
