import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LegalCaseService } from '../../services/legal-case.service';
import { LegalCase, LegalCaseDetail } from '../../models/legal-case.model';

@Component({
  selector: 'app-recent-cases',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recent-cases.component.html'
})
export class RecentCasesComponent implements OnInit {
  private legalCaseService = inject(LegalCaseService);
  
  cases: LegalCase[] = [];
  filteredCases: LegalCase[] = [];
  searchTerm: string = '';
  public isLoading: boolean = false;
  showDetailModal = false;
  selectedCaseDetail: LegalCaseDetail | null = null;

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData(): void {
    this.isLoading = true;
    this.legalCaseService.getRecentCases().subscribe({
      next: (data: any) => {
        this.cases = Array.isArray(data) ? data : (data?.content ?? []);
        this.applyFilter();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar expedientes', err);
        this.isLoading = false;
      }
    });
  }

  viewDetails(filingNumber: string): void {
    this.isLoading = true;
    this.legalCaseService.getCaseByFilingNumber(filingNumber).subscribe({
      next: (data) => {
        this.selectedCaseDetail = data;
        this.showDetailModal = true;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar detalle del expediente', err);
        this.isLoading = false;
      }
    });
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedCaseDetail = null;
  }

  applyFilter(): void {
    const term = this.searchTerm?.toLowerCase().trim() ?? '';
    if (!term) {
      this.filteredCases = Array.isArray(this.cases) ? [...this.cases] : [];
      return;
    }
    this.filteredCases = (this.cases ?? []).filter(c => 
      (c.filingNumber ?? '').toString().toLowerCase().includes(term) ||
      (c.caseType ?? '').toString().toLowerCase().includes(term) ||
      (c.judicialOfficeId ?? '').toString().toLowerCase().includes(term)
    );
  }
}