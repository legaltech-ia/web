import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProcessService } from '../../services/process.service';
import { ProcessRequest } from '../../models/process.model';
import { AdminLogRequestService } from '../../../../core/services/admin-log-request.service';

@Component({
  selector: 'app-new-process',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './new-process.component.html'
})
export class NewProcessComponent implements OnInit {
  private fb = inject(FormBuilder);
  private processService = inject(ProcessService);
  private themeService = inject(AdminLogRequestService);

  processForm!: FormGroup;
  isDarkTheme = false;
  isLoading: boolean = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  rawResponse: string | null = null; // Almacenará el string estructurado del backend
  showResponseModal: boolean = false;
  modalResponse: string | null = null;
  modalResponseHtml: string | null = null;
  selectedEvidences: File[] = [];

  ngOnInit(): void {
    this.processForm = this.fb.group({
      generalInformation: ['', [Validators.required, Validators.minLength(10)]]
    });

    this.themeService.themeMode$.subscribe((mode) => {
      this.isDarkTheme = mode === 'dark';
    });
  }

  getCurrentDateCO(): string {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}-${month}-${year}`;
  }

  onSubmit(): void {
    if (this.processForm.invalid) return;

    this.isLoading = true;
    this.successMessage = null;
    this.errorMessage = null;
    this.rawResponse = null;
    this.showResponseModal = false;
    this.modalResponse = null;
    this.modalResponseHtml = null;

    const dataPart: ProcessRequest = {
      generalInformation: this.processForm.value.generalInformation,
      fecha: this.getCurrentDateCO()
    };

    // Construimos el FormData para enviar archivos y datos mixtos
    const formData = new FormData();
    
    // Agregamos la información judicial como un Blob con tipo JSON
    formData.append('data', new Blob([JSON.stringify(dataPart)], { type: 'application/json' }));

    // Agregamos todos los archivos de evidencia seleccionados
    this.selectedEvidences.forEach(file => formData.append('files', file));

    this.processService.sendProcess(formData).subscribe({
      next: (response) => {
        this.successMessage = 'Conexión exitosa. El análisis ha concluido.';
        // Formateamos la respuesta de forma legible e identada en el área de texto
        this.rawResponse = JSON.stringify(response, null, 2);
        const dataValue = response?.data ?? response;
        const dataText = typeof dataValue === 'string' ? dataValue : JSON.stringify(dataValue, null, 2);
        this.modalResponse = dataText;
        this.modalResponseHtml = this.formatModalResponse(dataText);
        this.showResponseModal = true;
        this.isLoading = false;
        this.selectedEvidences = []; // Limpiamos las evidencias tras una radicación exitosa
      },
      error: (err) => {
        this.errorMessage = 'Imposible establecer conexión REST con localhost:8080.';
        // Si el backend falla o no está arriba, le mostramos el trazo del error en la caja
        this.rawResponse = JSON.stringify({
          error: "HttpErrorResponse",
          status: err.status,
          statusText: err.statusText,
          message: "Asegúrate de que tu servicio Spring Boot esté levantado en el puerto 8080.",
          url: err.url
        }, null, 2);
        this.isLoading = false;
      }
    });
  }

  onFilesSelected(event: any): void {
    const files: FileList = event.target.files;
    if (files) {
      this.selectedEvidences = [...this.selectedEvidences, ...Array.from(files)];
    }
    // Reseteamos el valor del input para permitir volver a seleccionar archivos eliminados
    event.target.value = '';
  }

  removeEvidence(index: number): void {
    this.selectedEvidences.splice(index, 1);
  }

  exportResponseToWord(): void {
    if (!this.modalResponse) return;

    const htmlContent = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Radicación y Análisis Clínico de Procesos</title></head><body><h2>Radicación y Análisis Clínico de Procesos</h2><pre style="font-family: Consolas, monospace; white-space: pre-wrap;">${this.escapeHtml(this.modalResponse)}</pre></body></html>`;
    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'radicacion-analisis-proceso.doc';
    anchor.click();
    window.URL.revokeObjectURL(url);
  }

  closeResponseModal(): void {
    this.showResponseModal = false;
  }

  acceptSentence(): void {
    this.successMessage = 'Sentencia aceptada. La respuesta fue confirmada en el modal.';
    this.showResponseModal = false;
  }

  private formatModalResponse(value: string): string {
    const escaped = this.escapeHtml(value);
    const bolded = escaped.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-100 text-base block">$1</strong>');
    return bolded.replace(/\r\n|\r|\n/g, '<br>');
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}
