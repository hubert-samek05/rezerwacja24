import { redirect } from 'next/navigation'

// Redirect /firmy to homepage - katalog firm jest teraz stroną główną
export default function FirmyPage() {
  redirect('/')
}
