import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LegalBasisService } from '../../services/legal-basis.service';
import { LegalBasis, LegalBasisDetail } from '../../models/legal-basis.model';

@Component({
  selector: 'app-national-norms',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './national-norms.component.html'
})
export class NationalNormsComponent implements OnInit {
  private legalBasisService = inject(LegalBasisService);

  norms: LegalBasis[] = [];
  searchTerm: string = '';
  public isLoading: boolean = false;
  showDetailModal = false;
  selectedNormDetail: LegalBasisDetail | null = null;

  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalItems = 0;
  pages: number[] = [];
  sortBy = 'publishedAt';
  sortDir: 'asc' | 'desc' = 'asc';

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData(): void {
    this.isLoading = true;
    this.legalBasisService
      .getNationalNorms(this.searchTerm.trim(), this.currentPage, this.pageSize, this.sortBy, this.sortDir)
      .subscribe({
        next: (data) => {
          this.norms = data.content;
          this.currentPage = data.number ?? this.currentPage;
          this.pageSize = data.size ?? this.pageSize;
          this.totalPages = data.totalPages ?? 0;
          this.totalItems = data.totalElements ?? 0;
          this.pages = Array.from({ length: this.totalPages }, (_, i) => i);
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error al cargar normas nacionales', err);
          this.isLoading = false;
        }
      });
  }

  applyFilter(): void {
    this.currentPage = 0;
    this.fetchData();
  }

  changeSort(field: string): void {
    if (this.sortBy === field) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortDir = 'asc';
    }

    this.fetchData();
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages || page === this.currentPage) {
      return;
    }
    this.currentPage = page;
    this.fetchData();
  }

  viewDetails(id: string | number): void {
    this.isLoading = true;
    this.legalBasisService.getNormativeById(id).subscribe({
      next: (data) => {
        this.selectedNormDetail = data;
        this.showDetailModal = true;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar detalle normativo', err);
        this.isLoading = false;
      }
    });
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedNormDetail = null;
  }
}
