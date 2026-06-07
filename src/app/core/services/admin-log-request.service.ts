import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface AdminRequestLogEntry {
  id: string;
  method: string;
  url: string;
  curl: string;
  startTime: string;
  startTimestamp: number;
  endTime?: string;
  durationMs?: number;
  status?: number;
  responseSummary?: string;
  error?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AdminLogRequestService {
  private logsSubject = new BehaviorSubject<AdminRequestLogEntry[]>([]);
  logs$ = this.logsSubject.asObservable();

  private visibilitySubject = new BehaviorSubject<boolean>(false);
  visible$ = this.visibilitySubject.asObservable();

  private themeModeSubject = new BehaviorSubject<'light' | 'dark'>('dark');
  themeMode$ = this.themeModeSubject.asObservable();

  // Expose dynamic height so other layout parts can adapt when the footer is shown
  private heightSubject = new BehaviorSubject<number>(384);
  height$ = this.heightSubject.asObservable();

  toggleVisibility(): void {
    this.visibilitySubject.next(!this.visibilitySubject.getValue());
  }

  toggleTheme(): void {
    const nextTheme = this.themeModeSubject.getValue() === 'dark' ? 'light' : 'dark';
    this.themeModeSubject.next(nextTheme);
  }

  setTheme(mode: 'light' | 'dark'): void {
    this.themeModeSubject.next(mode);
  }

  setVisibility(value: boolean): void {
    this.visibilitySubject.next(value);
  }

  setHeight(px: number): void {
    this.heightSubject.next(px);
  }

  logRequestStart(id: string, method: string, url: string, curl: string): void {
    const now = new Date();
    const newEntry: AdminRequestLogEntry = {
      id,
      method,
      url,
      curl,
      startTime: now.toLocaleTimeString(),
      startTimestamp: now.getTime()
    };
    this.logsSubject.next([newEntry, ...this.logsSubject.getValue()]);
  }

  logRequestComplete(id: string, status: number, responseSummary: string): void {
    const now = new Date();
    this.updateLog(id, {
      endTime: now.toLocaleTimeString(),
      durationMs: this.calculateDuration(id, now),
      status,
      responseSummary,
      error: false
    });
  }

  logRequestError(id: string, status: number, responseSummary: string): void {
    const now = new Date();
    this.updateLog(id, {
      endTime: now.toLocaleTimeString(),
      durationMs: this.calculateDuration(id, now),
      status,
      responseSummary,
      error: true
    });
  }

  clearLogs(): void {
    this.logsSubject.next([]);
  }

  private calculateDuration(id: string, endTime: Date): number | undefined {
    const logs = this.logsSubject.getValue();
    const existing = logs.find((entry) => entry.id === id);
    if (!existing) {
      return undefined;
    }
    return endTime.getTime() - existing.startTimestamp;
  }

  private updateLog(id: string, patch: Partial<AdminRequestLogEntry>): void {
    const logs = this.logsSubject.getValue();
    const updatedLogs = logs.map((entry) =>
      entry.id === id ? { ...entry, ...patch } : entry
    );
    this.logsSubject.next(updatedLogs);
  }
}
