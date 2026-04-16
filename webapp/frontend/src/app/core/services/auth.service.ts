import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { User, LoginRequest, AuthResponse } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly STORAGE_KEY = 'tf_user';
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly apiUrl = environment.apiUrl;

  private _currentUser$ = new BehaviorSubject<User | null>(this.loadFromStorage());
  readonly currentUser$ = this._currentUser$.asObservable();

  get currentUser(): User | null {
    return this._currentUser$.value;
  }

  get isAuthenticated(): boolean {
    return this._currentUser$.value !== null;
  }

  /**
   * Authenticate with the backend.
   * Expects the backend to return an AuthResponse containing the User object.
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}auth/login`, credentials, {
        withCredentials: true,
      })
      .pipe(
        tap((response) => {
          // Assuming the backend returns { user: User } or { data: { user: User } }
          // Adjust according to your actual API response shape.
          const user = this.extractUserFromResponse(response);
          if (user) {
            this.setCurrentUser(user);
          }
        }),
      );
  }

  /**
   * Log out the current user.
   * Optionally calls the backend logout endpoint.
   */
  logout(): void {
    this.http.post(`${this.apiUrl}auth/logout`, {}, { withCredentials: true }).subscribe({
      next: () => this.clearSession(),
      error: () => this.clearSession(), // Still clear local session even if backend fails
    });
  }

  /**
   * Manually set the current user (used after login, or when restoring from storage).
   */
  private setCurrentUser(user: User): void {
    this._currentUser$.next(user);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
  }

  /**
   * Clear all authentication state.
   */
  private clearSession(): void {
    this._currentUser$.next(null);
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem('tf_project');
    this.router.navigate(['/login']);
  }

  /**
   * Load user from localStorage on application startup.
   */
  private loadFromStorage(): User | null {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }

  /**
   * Safely extract the User object from various possible API response shapes.
   * Customize this based on your actual backend response.
   */
  private extractUserFromResponse(response: AuthResponse): User | null {
    // Case 1: Direct user property (e.g., { user: {...} })
    if (response && (response as any).user) {
      return (response as any).user;
    }
    // Case 2: Wrapped in data (e.g., { data: { user: {...} } })
    if (response && (response as any).data?.user) {
      return (response as any).data.user;
    }
    // Case 3: Response itself is the user (unlikely, but possible)
    if (response && 'id' in response && 'username' in response) {
      return response as unknown as User;
    }
    console.warn('Unable to extract user from AuthResponse', response);
    return null;
  }
}
