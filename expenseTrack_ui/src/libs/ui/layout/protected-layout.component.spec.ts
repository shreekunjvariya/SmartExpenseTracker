import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { AuthService } from '../../data-access/auth/auth.service';
import { ProtectedLayoutComponent } from './protected-layout.component';
import { SidebarComponent } from './sidebar.component';

describe('ProtectedLayoutComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [ProtectedLayoutComponent, SidebarComponent],
      providers: [
        {
          provide: AuthService,
          useValue: {
            logout: jest.fn(),
            user$: of(null),
            user: null,
            token: null,
            me: jest.fn(() => of(null)),
            resetSession: jest.fn(),
          },
        },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ProtectedLayoutComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
