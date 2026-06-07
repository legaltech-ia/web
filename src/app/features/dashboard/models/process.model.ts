export interface ProcessRequest {
  generalInformation: string;
  fecha: string;
}

export interface ProcessResponse {
  status?: string;
  message?: string;
  analisisResult?: string;
  [key: string]: any; // Permite capturar cualquier estructura JSON dinámica adicional
}
