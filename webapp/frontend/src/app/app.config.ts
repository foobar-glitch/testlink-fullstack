import { APP_INITIALIZER, ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { credentialsInterceptor, errorInterceptor } from './core/interceptors/http.interceptor';
import { AuthService } from './core/services/auth.service';
import { firstValueFrom } from 'rxjs';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([credentialsInterceptor, errorInterceptor])),
    {
      provide: APP_INITIALIZER,
      useFactory: (authService: AuthService) => () => firstValueFrom(authService.initialize()),
      deps: [AuthService],
      multi: true,
    },
  ],
};
