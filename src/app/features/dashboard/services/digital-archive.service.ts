import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from '../../../config/api.config';

export interface DigitalArchiveRequest {
  title: string;
  description: string;
  type: 'Querella' | 'Queja' | 'Apelacion';
}

export interface DigitalArchiveResponse {
  status: string;
  message: string;
  id?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DigitalArchiveService {
  private http = inject(HttpClient);
  private apiUrl = `${API_BASE}/national-norms`;

  saveArchive(data: DigitalArchiveRequest, file: File): Observable<DigitalArchiveResponse> {
    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    formData.append('file', file);

    return this.http.post<DigitalArchiveResponse>(`${this.apiUrl}/save`, formData);
  }
}
