import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const authSession = sessionStorage.getItem('authSession');

    if (authSession) {
      try {
        const session = JSON.parse(authSession);
        if (session?.accessToken) {
          return true;
        }
      } catch (error) {
        // Si hay error al parsear, considerar como no autenticado
      }
    }

    // No hay sesión válida, redirigir a login
    this.router.navigate(['/login']);
    return false;
  }
}
