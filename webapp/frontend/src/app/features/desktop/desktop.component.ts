import { Component, inject, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ContextService } from '../../core/services/context.service';

@Component({
  selector: 'app-desktop',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './desktop.component.html',
  styleUrls: ['./desktop.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DesktopComponent implements OnInit, OnDestroy {
  private ctx = inject(ContextService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  projectName = '';
  projectQueryParams: Record<string, string> = {};

  ngOnInit(): void {
    this.ctx.ctx$  // <-- corrected: was this.ctx.context$
      .pipe(takeUntil(this.destroy$))
      .subscribe(ctx => {
        this.projectName = ctx.projectKey ?? '';
        this.projectQueryParams = ctx.projectKey
          ? { project: ctx.projectKey, ...(ctx.testPlanId ? { plan: ctx.testPlanId } : {}) }
          : {};
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
