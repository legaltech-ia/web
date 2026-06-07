import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { AdminLogRequestService } from './core/services/admin-log-request.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="min-h-screen flex flex-col bg-slate-100">
      <div class="flex-1 min-h-0">
        <router-outlet></router-outlet>
      </div>
    </div>
  `
})
export class AppComponent {
  showAdminConsole$!: Observable<boolean>;

  constructor(private adminLogRequestService: AdminLogRequestService) {
    this.showAdminConsole$ = this.adminLogRequestService.visible$;
  }
}
