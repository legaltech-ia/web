import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MESSAGES } from '../../../constants/messages';
import { API_BASE } from '../../../config/api.config';
import { COLOMBIAN_MUNICIPALITIES } from '../../../constants/municipalities';

interface Municipality {
  name: string;
  code: string;
  department: string;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './register.component.html'
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isLoading = false;
  isSubmitting = false;
  municipalities: Municipality[] = COLOMBIAN_MUNICIPALITIES;
  filteredMunicipalities: Municipality[] = [];
  showMunicipalityDropdown = false;
  // use relative API paths so dev proxy handles CORS
  messages = MESSAGES;

  constructor(private fb: FormBuilder, private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group(
      {
        username: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
        phoneNumber: ['', [Validators.required, this.phoneValidator.bind(this)]],
        municipalityName: ['', [Validators.required]],
        municipalityCode: ['', [Validators.required]]
      },
      { validators: this.passwordMatchValidator }
    );

    this.registerForm.get('municipalityName')?.valueChanges.subscribe((value) => {
      this.filterMunicipalities(value);
    });
  }

  filterMunicipalities(searchTerm: string): void {
    if (!searchTerm || searchTerm.length < 1) {
      this.filteredMunicipalities = [];
      this.showMunicipalityDropdown = false;
      return;
    }

    const term = searchTerm.toLowerCase();
    this.filteredMunicipalities = this.municipalities.filter((m) =>
      m.name.toLowerCase().includes(term) || m.department.toLowerCase().includes(term)
    );
    this.showMunicipalityDropdown = this.filteredMunicipalities.length > 0;
  }

  selectMunicipality(municipality: Municipality): void {
    this.registerForm.patchValue({
      municipalityName: `${municipality.name}, ${municipality.department}`,
      municipalityCode: municipality.code
    });
    this.showMunicipalityDropdown = false;
    this.filteredMunicipalities = [];
  }

  phoneValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const phonePattern = /^\+57\d{9,10}$/;
    return phonePattern.test(control.value) ? null : { invalidPhone: true };
  }

  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (!this.registerForm.valid || this.isSubmitting) return;

    this.isSubmitting = true;
    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;
    this.registerForm.disable();

    const payload = {
      username: this.registerForm.value.username,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      phoneNumber: this.registerForm.value.phoneNumber,
      municipalityCode: this.registerForm.value.municipalityCode
    };

    this.http.post<any>(`${API_BASE}/public/auth/register`, payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.isLoading = false;
        this.registerForm.enable();

        if (res?.status === 'SUCCESS') {
          this.successMessage = MESSAGES.general.registrationSuccess;
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else {
          this.errorMessage = res?.message || MESSAGES.general.registrationFailed;
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        this.isLoading = false;
        this.registerForm.enable();
        this.errorMessage = err?.error?.message || MESSAGES.general.registrationError;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/login']);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  formatPhoneNumber(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 0 && !value.startsWith('57')) {
      if (value.startsWith('1')) {
        value = '57' + value.substring(1);
      } else {
        value = '57' + value;
      }
    }
    event.target.value = value ? '+' + value : '+57';
    this.registerForm.get('phoneNumber')?.setValue(event.target.value);
  }
}
