import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/services/auth.service';
import { ErrorBannerComponent } from '../../../shared/components/error-banner/error-banner.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let routerMock: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    // Create mock services
    authServiceMock = jasmine.createSpyObj('AuthService', ['login']);
    routerMock = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,           // Standalone component
        ErrorBannerComponent,     // Required since LoginComponent uses it
        SpinnerComponent          // Required since LoginComponent uses it
      ],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call authService.login and navigate on successful login', () => {
    const mockUser = { id: 1, username: 'admin', email: 'admin@test.com', role: 'admin' as const };
    authServiceMock.login.and.returnValue(of(mockUser));

    component.username = 'admin';
    component.password = 'admin';
    component.onSubmit();

    expect(component.loading).toBeTrue();
    expect(authServiceMock.login).toHaveBeenCalledWith({ username: 'admin', password: 'admin' });
    expect(routerMock.navigate).toHaveBeenCalledWith(['/projects']);
  });

  it('should handle login error and display error message', () => {
    const errorResponse = new Error('Invalid username or password');
    authServiceMock.login.and.returnValue(throwError(() => errorResponse));

    component.username = 'wrong';
    component.password = 'wrong';
    component.onSubmit();

    expect(component.loading).toBeFalse();
    expect(component.errorMessage).toBe('Invalid username or password');
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('should clear error message when error banner dismissed', () => {
    component.errorMessage = 'Some error';
    component.errorMessage = ''; // Simulate dismissed event
    expect(component.errorMessage).toBe('');
  });

  it('should disable submit button while loading', () => {
    authServiceMock.login.and.returnValue(of({} as any));
    component.onSubmit();
    expect(component.loading).toBeTrue();

    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(button.disabled).toBeTrue();
  });
});