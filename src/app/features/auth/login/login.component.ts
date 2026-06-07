import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MESSAGES } from '../../../constants/messages';
import { API_BASE } from '../../../config/api.config';

interface LoginResponseDTO {
  status: string;
  message: string;
  username?: string;
  accessToken?: string;
  idToken?: string;
  refreshToken?: string;
  mfaRequired?: boolean;
  mfaToken?: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  mfaRequired = false;
  errorMessage: string | null = null;
  private mfaToken: string | null = null;
  private baseUrl = API_BASE; // Centralized API base
  public isLoading = false; // Se cambia a public para que sea accesible desde el template
  messages = MESSAGES;

  constructor(private fb: FormBuilder, private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
    this.loginForm.valueChanges.subscribe(() => {
      this.errorMessage = null;
    });
  }

  onSubmit(): void {
    if (!this.loginForm.valid) return;

    this.isLoading = true; // Activar el estado de carga
    this.errorMessage = null;
    const payload = {
      username: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    if (!this.mfaRequired) {
      this.http.post<LoginResponseDTO>(`${this.baseUrl}/public/auth/login`, payload).subscribe({
        next: (res) => {
          if (res?.mfaRequired) {
            this.mfaRequired = true;
            this.mfaToken = res.mfaToken ?? null;
            this.loginForm.addControl('code', this.fb.control('', Validators.required));
            this.isLoading = false; // Desactivar si se requiere MFA y no hay redirección inmediata
            return;
          }

          if (res?.status === 'SUCCESS' && res.accessToken) {
            this.isLoading = false; // Desactivar al finalizar con éxito
            this.saveSession(res);
            this.router.navigate(['/dashboard']);
          } else {
            this.errorMessage = res?.message || MESSAGES.login.mfaError;
          }
        },
        error: (err) => {
          this.isLoading = false; // Desactivar en caso de error
          this.handleLoginError(err);
        }
      });
    } else {
      const mfaPayload = {
        mfaToken: this.mfaToken,
        code: this.loginForm.value.code
      };
      // No es necesario activar isLoading aquí de nuevo, ya está activo desde el primer onSubmit
      debugger; // Punto de interrupción para depuración
      this.http.post<LoginResponseDTO>(`${this.baseUrl}/public/auth/login/mfa`, mfaPayload).subscribe({
        next: (res) => {
          if (res?.status === 'SUCCESS' && res.accessToken) {
            this.saveSession(res);
            this.isLoading = false; // Desactivar al finalizar con éxito
            this.router.navigate(['/dashboard']);
          } else {
            this.errorMessage = res?.message || MESSAGES.login.genericError;
          }
        },
        error: (err) => {
          this.isLoading = false; // Desactivar en caso de error
          this.handleMfaError(err);
        }
      });
    }
  }

  private handleLoginError(err: any): void {
    if (err.status === 401) {
      this.errorMessage = MESSAGES.login.invalidCredentials;
    } else if (err.status === 0) {
      this.errorMessage = MESSAGES.login.connectionError;
    } else if (err.status >= 500) {
      this.errorMessage = MESSAGES.login.serverError;
    } else if (err.error?.message) {
      this.errorMessage = err.error.message;
    } else {
      this.errorMessage = MESSAGES.login.genericError;
    }
  }

  private handleMfaError(err: any): void {
    if (err.status === 401) {
      this.errorMessage = MESSAGES.login.invalidMfaCode;
    } else if (err.status === 0) {
      this.errorMessage = MESSAGES.login.connectionError;
    } else if (err.status >= 500) {
      this.errorMessage = MESSAGES.login.serverError;
    } else if (err.error?.message) {
      this.errorMessage = err.error.message;
    } else {
      this.errorMessage = MESSAGES.login.mfaError;
    }
  }

  private saveSession(response: LoginResponseDTO): void {
    const sessionData = {
      status: response.status,
      message: response.message,
      username: response.username ?? '',
      accessToken: response.accessToken ?? '',
      idToken: response.idToken ?? '',
      refreshToken: response.refreshToken ?? ''
    };
    console.log('Guardando sesión:', sessionData);
    sessionStorage.setItem('authSession', JSON.stringify(sessionData));
  }

  goToRegister(): void {
    this.router.navigate(['/registro']);
  }
}
