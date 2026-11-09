import { CanActivateFn, Router, RouterLink } from '@angular/router';
import { inject } from '@angular/core';
import { SupabaseAuth } from './supabase-auth';


export const authGuard: CanActivateFn = async (route, state) => {
    const supabase = inject(SupabaseAuth);
    const router = inject(Router);

    if (await supabase.isLoggedIn()) {
        return true;
    } else {
        return router.navigate(['']);
    }
};