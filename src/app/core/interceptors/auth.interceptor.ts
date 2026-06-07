import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpRequest, HttpHandlerFn, HttpEvent, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, throwError, tap } from 'rxjs';
import { AdminLogRequestService } from '../services/admin-log-request.service';

interface AuthSession {
  accessToken?: string;
}

function buildCurlCommand(req: HttpRequest<any>): string {
  const method = req.method;
  const url = req.urlWithParams;
  const headers = req.headers.keys().map((key) => {
    const values = req.headers.getAll(key)?.join(', ') ?? '';
    return `-H "${key}: ${values}"`;
  });
  const body = req.body && typeof req.body === 'object'
    ? `-d '${JSON.stringify(req.body).replace(/'/g, "\\'")}'`
    : req.body != null
      ? `-d '${String(req.body).replace(/'/g, "\\'")}'`
      : '';

  return [`curl -X ${method} "${url}"`, ...headers, body].filter(Boolean).join(' ');
}

function extractResponseSummary(response: any): string {
  if (response == null) {
    return 'Empty response';
  }
  if (typeof response === 'string') {
    return response;
  }
  try {
    return JSON.stringify(response);
  } catch {
    return String(response);
  }
}

export function AuthInterceptor(req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> {
  const adminLogRequestService = inject(AdminLogRequestService);
  const router = inject(Router);
  
  const requestId = `${Date.now()}-${Math.random().toString(36).substring(2)}`;
  const sessionData = sessionStorage.getItem('authSession');
  const auth: AuthSession | null = sessionData ? JSON.parse(sessionData) : null;
  const token = auth?.accessToken;
  const url = req.url || '';

  console.log('[AuthInterceptor] sessionData:', sessionData);
  console.log('[AuthInterceptor] parsed auth:', auth);
  console.log('[AuthInterceptor] token:', token);

  const isAuthEndpoint = /\/public\/auth\/(login|register)/.test(url);
  
  let requestToSend: HttpRequest<any>;
  if (token && !isAuthEndpoint) {
    console.log('[AuthInterceptor] ✅ AGREGANDO HEADER Authorization: Bearer', token);
    requestToSend = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  } else {
    console.log('[AuthInterceptor] ❌ NO se agrega header (token falsy o es auth endpoint)');
    requestToSend = req;
  }

  // CONSTRUIR CURL DESPUÉS DE AGREGAR EL HEADER
  const curl = buildCurlCommand(requestToSend);
  adminLogRequestService.logRequestStart(requestId, req.method, url, curl);

  console.log(' isAuthEndpoint:', isAuthEndpoint);
  console.log(' willAddAuth:', token && !isAuthEndpoint);
  console.log(' finalRequest headers:', requestToSend.headers.keys());
  console.log(' reques:', requestToSend);
  
  return next(requestToSend).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        const responseSummary = extractResponseSummary(event.body);
        adminLogRequestService.logRequestComplete(requestId, event.status, responseSummary);
      }
    }),
    catchError((err: HttpErrorResponse) => {
      const responseSummary = extractResponseSummary(err.error) || err.message || 'Request failed';
      adminLogRequestService.logRequestError(requestId, err.status ?? 0, responseSummary);

      if (err.status === 401) {
        sessionStorage.removeItem('authSession');
        router.navigate(['/login']);
      }

      return throwError(() => err);
    })
  );
}

