import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { User, LoginRequest } from '../models';
import { MOCK_USERS } from '../mock/mock-data';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly STORAGE_KEY = 'tf_user';
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private _currentUser$ = new BehaviorSubject<User | null>(this.loadFromStorage());

  readonly currentUser$ = this._currentUser$.asObservable();

  get currentUser(): User | null {
    return this._currentUser$.value;
  }

  get isAuthenticated(): boolean {
    return this._currentUser$.value !== null;
  }

  login(credentials: LoginRequest): Observable<User> {
    // Mock API call – in production replace with:
    // return this.http.post<ApiResponse<User>>('/api/auth/login', credentials, { withCredentials: true })
    const found = MOCK_USERS.find(
      u => u.username === credentials.username && credentials.password === credentials.username
    );

    if (!found) {
      return throwError(() => new Error('Invalid username or password')).pipe(delay(400));
    }

    return of(found).pipe(
      delay(500),
      tap(user => {
        this._currentUser$.next(user);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
      })
    );
  }

  logout(): void {
    // In production: this.http.post('/api/auth/logout', {}, { withCredentials: true }).subscribe()
    this._currentUser$.next(null);
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem('tf_project');
    this.router.navigate(['/login']);
  }

  private loadFromStorage(): User | null {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) as User : null;
    } catch {
      return null;
    }
  }
}
/*
import { environment } from '../../environments/environment';

// Inside the service
login(credentials: LoginRequest): Observable<User> {
  return this.http.post<ApiResponse<User>>(`${environment.apiUrl}auth/login`, credentials, { withCredentials: true });
}
*/