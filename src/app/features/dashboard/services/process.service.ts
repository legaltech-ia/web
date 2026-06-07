import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProcessResponse } from '../models/process.model';
import { API_BASE } from '../../../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class ProcessService {
  private http = inject(HttpClient);
  private apiUrl = `${API_BASE}/legal/analize-with-history`;

  sendProcess(data: FormData): Observable<ProcessResponse> {
    // Al pasar FormData, el HttpClient de Angular configura automáticamente 
    // el Content-Type como multipart/form-data con el boundary correcto.
    return this.http.post<ProcessResponse>(this.apiUrl, data);
  }
}
