import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from '../../../config/api.config';
import { LegalBasis, LegalBasisDetail, NationalNormsPage } from '../models/legal-basis.model';

@Injectable({
  providedIn: 'root'
})
export class LegalBasisService {
  private http = inject(HttpClient);
  private apiUrl = `${API_BASE}/national-norms`;

  getNationalNorms(
    search: string = '',
    page: number = 0,
    size: number = 10,
    sortBy: string = 'publishedAt',
    sortDir: string = 'asc'
  ): Observable<NationalNormsPage> {
    const params = new HttpParams()
      .set('search', search)
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    return this.http.get<NationalNormsPage>(this.apiUrl, { params });
  }

  getNormativeById(normative: string | number): Observable<LegalBasisDetail> {
    return this.http.get<LegalBasisDetail>(`${this.apiUrl}/normative/${normative}`);
  }
}
