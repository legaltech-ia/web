export interface NationalNormArticle {
  id?: string | number;
  number: string;
  title: string;
  content: string;
}

export interface LegalBasis {
  id: string | number;
  title: string;
  type: string;
  publishedAt: string;
  sourceUrl: string;
}

export interface LegalBasisDetail extends LegalBasis {
  description: string;
  articles?: NationalNormArticle[];
}

export interface NationalNormsPage {
  content: LegalBasis[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
