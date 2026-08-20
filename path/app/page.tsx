import { redirect } from 'next/navigation';

/**
 * Non esiste una vera "home" pubblica: la radice del sito reindirizza
 * sempre a /dashboard, che si occupa a cascata di mandare a /login chi
 * non è autenticato e a /onboarding chi non ha ancora una squadra.
 */
export default function RootPage() {
  redirect('/dashboard');
}
