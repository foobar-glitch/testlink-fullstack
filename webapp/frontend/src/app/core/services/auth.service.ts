import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, of, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthResponse, Authentication, LoginRequest } from '../models/authentication';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = environment.apiUrl;

  private _currentUser$ = new BehaviorSubject<Authentication | null>(null);
  readonly currentUser$ = this._currentUser$.asObservable();

  private isInitialized = false;

  get currentUser(): Authentication | null {
    return this._currentUser$.value;
  }

  get isAuthenticated(): boolean {
    return this._currentUser$.value !== null;
  }

  /**
   * Initialize the service by fetching the current user from the backend.
   * Call this once during app startup (e.g., in APP_INITIALIZER).
   */
  initialize(): Observable<Authentication | null> {
    if (this.isInitialized) {
      return of(this.currentUser);
    }
    return this.http.get<Authentication>(`${this.apiUrl}auth/me`, { withCredentials: true }).pipe(
      tap(user => {
        this._currentUser$.next(user);
        this.isInitialized = true;
      }),
      catchError(() => {
        this._currentUser$.next(null);
        this.isInitialized = true;
        return of(null);
      })
    );
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}auth/login`, credentials, {
        withCredentials: true,
      })
      .pipe(
        tap(response => {
          const user = this.extractUserFromResponse(response);
          if (user) {
            this._currentUser$.next(user);
          }
        })
      );
  }

  logout(): void {
    this.http.post(`${this.apiUrl}auth/logout`, {}, { withCredentials: true }).subscribe({
      next: () => this.clearSession(),
      error: () => this.clearSession(),
    });
  }

  private clearSession(): void {
    this._currentUser$.next(null);
    this.router.navigate(['/login']);
  }

  private extractUserFromResponse(response: AuthResponse): Authentication | null {
    if (response && (response as any).user) {
      return (response as any).user;
    }
    if (response && (response as any).data?.user) {
      return (response as any).data.user;
    }
    if (response && 'id' in response && 'username' in response) {
      return response as unknown as Authentication;
    }
    console.warn('Unable to extract user from AuthResponse', response);
    return null;
  }
}
