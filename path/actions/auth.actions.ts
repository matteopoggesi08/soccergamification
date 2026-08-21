'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

/**
 * Login unico tramite Google OAuth. Non esistono account
 * email/password: chi non ha un profilo viene creato automaticamente
 * al primo accesso (vedi trigger handle_new_user in migration 0002,
 * aggiornato in 0006 per leggere i metadati di Google).
 */
export async function signInWithGoogleAction() {
  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (error || !data?.url) {
    redirect('/login?error=oauth');
  }

  redirect(data.url);
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
