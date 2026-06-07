import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { NewProcessComponent } from './components/new-process/new-process.component';
import { RecentCasesComponent } from './components/recent-process/recent-cases.component';
import { DigitalArchiveManagementComponent } from './components/digital-archive/digital-archive-management.component';
import { NationalNormsComponent } from './components/national-norms/national-norms.component';
import { AdminLogRequestComponent } from './components/admin-log-request.component';
import { AdminLogRequestService } from '../../core/services/admin-log-request.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NewProcessComponent, RecentCasesComponent, DigitalArchiveManagementComponent, NationalNormsComponent, AdminLogRequestComponent],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  fechaHoy: Date = new Date();
  archivoOpen = false;
  currentView: 'dashboard' | 'nuevo-proceso' | 'expedientes' | 'archivo-registrar' | 'archivo-visualizar' = 'dashboard';
  isSidebarVisible = true;
  themeMode: 'light' | 'dark' = 'dark';
  isDarkTheme = true;
  username: string = '';
  isAdmin = true;
  showAdminConsole$!: Observable<boolean>;

  constructor(private router: Router, private adminLogRequestService: AdminLogRequestService) {
    this.showAdminConsole$ = this.adminLogRequestService.visible$;
    this.adminLogRequestService.themeMode$.subscribe(mode => {
      this.themeMode = mode;
      this.isDarkTheme = mode === 'dark';
    });
  }

  ngOnInit(): void {
    const session = sessionStorage.getItem('authSession');
    if (session) {
      try {
        const data = JSON.parse(session);
        this.username = data.username || 'Abg. Litigante';
      } catch (e) {
        this.username = 'Abg. Litigante';
      }
    }
  }

  setView(view: 'dashboard' | 'nuevo-proceso' | 'expedientes' | 'archivo-registrar' | 'archivo-visualizar'): void {
    this.currentView = view;
    this.archivoOpen = view === 'archivo-registrar' || view === 'archivo-visualizar';
  }

  toggleArchivoMenu(): void {
    this.archivoOpen = !this.archivoOpen;
  }

  toggleSidebar(): void {
    this.isSidebarVisible = !this.isSidebarVisible;
  }

  toggleAdminConsole(): void {
    this.adminLogRequestService.toggleVisibility();
  }

  logout(): void {
    const confirmed = window.confirm('¿Deseas cerrar sesión? Se limpiarán todos los datos de tu sesión actual.');
    if (confirmed) {
      sessionStorage.removeItem('authSession');
      this.router.navigate(['/login']);
    }
  }
}
