import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LegalCase, LegalCaseDetail } from '../models/legal-case.model';
import { API_BASE } from '../../../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class LegalCaseService {
  private http = inject(HttpClient);
  private apiUrl = `${API_BASE}/legal-cases`;

  getRecentCases(): Observable<LegalCase[]> {
    return this.http.get<LegalCase[]>(this.apiUrl);
  }

  getCaseByFilingNumber(filingNumber: string): Observable<LegalCaseDetail> {
    return this.http.get<LegalCaseDetail>(`${this.apiUrl}/filing-number/${filingNumber}`);
  }
}