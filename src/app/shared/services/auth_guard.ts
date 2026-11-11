import { CanActivateFn, Router, RouterLink } from '@angular/router';
import { inject } from '@angular/core';
import { SupabaseAuth } from './supabase-auth';

// Protects the dashboard: only logged-in users may enter

export const authGuard: CanActivateFn = async () => {
  const supabase_auth = inject(SupabaseAuth);
  const router = inject(Router);

  if (await supabase_auth.isLoggedIn()) {
    return true;
  }
  return router.createUrlTree(['/']);
};

// Protects login and signup: logged-in users are sent to the dashboard
export const loggedOutGuard: CanActivateFn = async () => {
  const supabase_auth = inject(SupabaseAuth);
  const router = inject(Router);

  if (await supabase_auth.isLoggedIn()) {
    return router.createUrlTree(['/dashboard']);
  }

  return true;
};
