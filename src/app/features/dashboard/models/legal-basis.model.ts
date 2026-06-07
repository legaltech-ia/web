export interface LegalBasis {
  id: string | number;
  title: string;
  type: string;
  publishedAt: string;
  sourceUrl: string;
}

export interface LegalBasisDetail extends LegalBasis {
  description: string;
}

export interface NationalNormsPage {
  content: LegalBasis[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
