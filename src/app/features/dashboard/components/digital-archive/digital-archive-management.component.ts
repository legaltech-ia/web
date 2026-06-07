import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DigitalArchiveService, DigitalArchiveRequest } from '../../services/digital-archive.service';
import { AdminLogRequestService } from '../../../../core/services/admin-log-request.service';

@Component({
  selector: 'app-digital-archive-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './digital-archive-management.component.html'
})
export class DigitalArchiveManagementComponent implements OnInit {
  private fb = inject(FormBuilder);
  private archiveService = inject(DigitalArchiveService);
  private themeService = inject(AdminLogRequestService);

  archiveForm!: FormGroup;
  isDarkTheme = false;
  isLoading: boolean = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  selectedFile: File | null = null;
  fileError: string | null = null;

  archiveTypes = ['Querella', 'Queja', 'Apelacion'];
  allowedFileTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/gif'];
  allowedFileExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.gif'];

  ngOnInit(): void {
    this.archiveForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      type: ['', Validators.required]
    });

    this.themeService.themeMode$.subscribe((mode) => {
      this.isDarkTheme = mode === 'dark';
    });
  }

  onFileSelected(event: any): void {
    const files: FileList = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];

      // Validar tipo de archivo
      if (!this.allowedFileTypes.includes(file.type)) {
        this.fileError = 'Tipo de archivo no permitido. Usa PDF, DOC, DOCX o imágenes (JPG, PNG, GIF).';
        this.selectedFile = null;
        event.target.value = '';
        return;
      }

      // Validar tamaño (máx 10MB)
      if (file.size > 10 * 1024 * 1024) {
        this.fileError = 'El archivo no debe exceder 10MB.';
        this.selectedFile = null;
        event.target.value = '';
        return;
      }

      this.fileError = null;
      this.selectedFile = file;
    }
  }

  onSubmit(): void {
    if (this.archiveForm.invalid || !this.selectedFile) {
      if (!this.selectedFile) {
        this.fileError = 'Debes adjuntar un archivo.';
      }
      return;
    }

    this.isLoading = true;
    this.successMessage = null;
    this.errorMessage = null;

    const archiveData: DigitalArchiveRequest = {
      title: this.archiveForm.value.title,
      description: this.archiveForm.value.description,
      type: this.archiveForm.value.type
    };

    this.archiveService.saveArchive(archiveData, this.selectedFile).subscribe({
      next: (response) => {
        this.successMessage = `Archivo "${this.archiveForm.value.title}" guardado exitosamente.`;
        this.isLoading = false;
        this.archiveForm.reset();
        this.selectedFile = null;
        this.fileError = null;

        // Limpiar mensaje de éxito después de 4 segundos
        setTimeout(() => {
          this.successMessage = null;
        }, 4000);
      },
      error: (err) => {
        this.errorMessage = 'Error al guardar el archivo. Intenta de nuevo.';
        console.error('Error:', err);
        this.isLoading = false;
      }
    });
  }

  clearForm(): void {
    this.archiveForm.reset();
    this.selectedFile = null;
    this.fileError = null;
  }

  getFileInputLabel(): string {
    return this.selectedFile ? this.selectedFile.name : 'Selecciona un archivo (PDF, DOC, imagen)';
  }
}
