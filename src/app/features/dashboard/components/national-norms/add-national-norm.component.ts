import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LegalBasisService } from '../../services/legal-basis.service';
import { LegalBasisDetail, NationalNormArticle } from '../../models/legal-basis.model';

@Component({
  selector: 'app-add-national-norm',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-national-norm.component.html'
})
export class AddNationalNormComponent implements OnChanges {
  private legalBasisService = inject(LegalBasisService);

  @Input() initialNorm: LegalBasisDetail | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  isLoading = false;
  showNormValidation = false;
  showArticleValidation = false;
  showArticleModal = false;

  articleFilter = '';
  articleSortBy: 'number' | 'title' | 'content' = 'number';
  articleSortDir: 'asc' | 'desc' = 'asc';
  articlePage = 0;
  articlePageSize = 10;

  createNorm: LegalBasisDetail = this.resetCreateNorm();
  articleForm: NationalNormArticle = this.resetArticleForm();
  articleFormMode: 'new' | 'edit' = 'new';
  articleEditIndex: number | null = null;

  openArticleModal(): void {
    this.articleFormMode = 'new';
    this.articleEditIndex = null;
    this.articleForm = this.resetArticleForm();
    this.showArticleValidation = false;
    this.showArticleModal = true;
  }

  closeModal(): void {
    this.close.emit();
  }

  saveNorm(): void {
    this.showNormValidation = true;
    if (
      !this.createNorm.title.trim() ||
      !this.createNorm.type.trim() ||
      !this.createNorm.publishedAt.trim() ||
      !this.createNorm.description.trim()
    ) {
      return;
    }

    this.isLoading = true;
    this.legalBasisService.saveNationalNorm(this.createNorm).subscribe({
      next: () => {
        this.isLoading = false;
        this.saved.emit();
      },
      error: (err) => {
        console.error('Error al guardar norma nacional', err);
        this.isLoading = false;
      }
    });
  }

  editArticle(article: NationalNormArticle, index: number): void {
    this.articleFormMode = 'edit';
    this.articleEditIndex = index;
    this.articleForm = { ...article };
    this.showArticleModal = true;
  }

  removeArticle(index: number): void {
    if (!this.createNorm.articles) {
      return;
    }
    this.createNorm.articles.splice(index, 1);
  }

  saveArticle(): void {
    this.showArticleValidation = true;
    if (!this.articleForm.number.trim() || !this.articleForm.title.trim() || !this.articleForm.content.trim()) {
      return;
    }

    if (!this.createNorm.articles) {
      this.createNorm.articles = [];
    }

    if (this.articleFormMode === 'edit' && this.articleEditIndex !== null) {
      this.createNorm.articles[this.articleEditIndex] = { ...this.articleForm };
    } else {
      this.createNorm.articles.push({ ...this.articleForm });
    }

    this.closeArticleModal();
  }

  closeArticleModal(): void {
    this.showArticleModal = false;
    this.articleForm = this.resetArticleForm();
    this.showArticleValidation = false;
    this.articleEditIndex = null;
  }

  get filteredArticles(): NationalNormArticle[] {
    const query = this.articleFilter.trim().toLowerCase();
    const articles = this.createNorm.articles || [];
    if (!query) {
      return articles;
    }
    return articles.filter((article) =>
      article.title.toLowerCase().includes(query) ||
      article.number.toLowerCase().includes(query) ||
      article.content.toLowerCase().includes(query)
    );
  }

  get sortedArticles(): NationalNormArticle[] {
    const sorted = [...this.filteredArticles];
    sorted.sort((a, b) => {
      const valueA = String(a[this.articleSortBy]).toLowerCase();
      const valueB = String(b[this.articleSortBy]).toLowerCase();
      if (valueA === valueB) {
        return 0;
      }
      const comparison = valueA > valueB ? 1 : -1;
      return this.articleSortDir === 'asc' ? comparison : -comparison;
    });
    return sorted;
  }

  get displayedArticles(): NationalNormArticle[] {
    const start = this.articlePage * this.articlePageSize;
    return this.sortedArticles.slice(start, start + this.articlePageSize);
  }

  get articleTotalPages(): number {
    return Math.max(1, Math.ceil(this.sortedArticles.length / this.articlePageSize));
  }

  get articlePageStart(): number {
    return this.articlePage * this.articlePageSize;
  }

  applyArticleFilter(): void {
    this.articlePage = 0;
  }

  changeArticleSort(field: 'number' | 'title' | 'content'): void {
    if (this.articleSortBy === field) {
      this.articleSortDir = this.articleSortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.articleSortBy = field;
      this.articleSortDir = 'asc';
    }
  }

  goToArticlePage(page: number): void {
    if (page < 0 || page >= this.articleTotalPages) {
      return;
    }
    this.articlePage = page;
  }

  resetCreateNorm(): LegalBasisDetail {
    return {
      id: '',
      title: '',
      type: '',
      publishedAt: '',
      sourceUrl: '',
      description: '',
      articles: []
    };
  }

  resetArticleForm(): NationalNormArticle {
    return {
      number: '',
      title: '',
      content: ''
    };
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.initialNorm) {
      if (this.initialNorm) {
        this.createNorm = {
          ...this.initialNorm,
          articles: this.initialNorm.articles ? [...this.initialNorm.articles] : []
        };
        this.showNormValidation = false;
        this.showArticleValidation = false;
        this.articleFilter = '';
        this.articleSortBy = 'number';
        this.articleSortDir = 'asc';
        this.articlePage = 0;
      } else {
        this.createNorm = this.resetCreateNorm();
      }
    }
  }
}
