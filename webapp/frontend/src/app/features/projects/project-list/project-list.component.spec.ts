import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ProjectListComponent } from './project-list.component';
import { ProjectService } from '../../../core/services/project.service';
import { AuthService } from '../../../core/services/auth.service';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { ErrorBannerComponent } from '../../../shared/components/error-banner/error-banner.component';
import { Project } from '../../../core/models/project';

describe('ProjectListComponent', () => {
  let component: ProjectListComponent;
  let fixture: ComponentFixture<ProjectListComponent>;
  let projectServiceMock: jasmine.SpyObj<ProjectService>;
  let authServiceMock: jasmine.SpyObj<AuthService>;

  const mockProjects: Project[] = [
    {
      id: 1,
      name: 'E-Commerce Platform',
      prefix: 'ECP',
      description: 'Frontend & backend testing',
      createdAt: '2024-01-15T09:00:00Z',
      stats: { suiteCount: 12, testCaseCount: 148, testRunCount: 34 }
    },
    {
      id: 2,
      name: 'Mobile App iOS',
      prefix: 'IOS',
      description: 'iOS native app test suite',
      createdAt: '2024-02-01T10:00:00Z',
      stats: { suiteCount: 8, testCaseCount: 92, testRunCount: 21 }
    }
  ];

  beforeEach(async () => {
    projectServiceMock = jasmine.createSpyObj('ProjectService', ['getProjects', 'selectProject']);
    authServiceMock = jasmine.createSpyObj('AuthService', ['logout'], {
      currentUser: { id: 1, username: 'admin', email: 'admin@test.com', role: 'admin' }
    });

    await TestBed.configureTestingModule({
      imports: [
        ProjectListComponent,
        SpinnerComponent,
        ErrorBannerComponent
      ],
      providers: [
        { provide: ProjectService, useValue: projectServiceMock },
        { provide: AuthService, useValue: authServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load projects on init', () => {
    projectServiceMock.getProjectMemberships.and.returnValue(of(mockProjects));
    fixture.detectChanges(); // triggers ngOnInit

    expect(component.loading).toBeFalse();
    expect(component.projects).toEqual(mockProjects);
    expect(component.projects.length).toBe(2);
  });

  it('should handle error when loading projects fails', () => {
    const error = new Error('Failed to load projects');
    projectServiceMock.getProjectMemberships.and.returnValue(throwError(() => error));
    fixture.detectChanges();

    expect(component.loading).toBeFalse();
    expect(component.errorMessage).toBe('Failed to load projects');
    expect(component.projects.length).toBe(0);
  });

  it('should call projectService.selectProject when a project is selected', () => {
    projectServiceMock.getProjectMemberships.and.returnValue(of(mockProjects));
    fixture.detectChanges();

    const project = mockProjects[0];
    component.selectProject(project);

    expect(projectServiceMock.selectProject).toHaveBeenCalledWith(project);
  });

  it('should call authService.logout when logout is clicked', () => {
    component.logout();
    expect(authServiceMock.logout).toHaveBeenCalled();
  });

  it('should display projects in the template', () => {
    projectServiceMock.getProjectMemberships.and.returnValue(of(mockProjects));
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const cards = compiled.querySelectorAll('.project-card');
    expect(cards.length).toBe(2);
    expect(cards[0].querySelector('h3')?.textContent).toContain('E-Commerce Platform');
  });
});
