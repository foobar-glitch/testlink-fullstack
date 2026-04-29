import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-not-implemented',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './not-implemented.component.html',
  styleUrls: ['./not-implemented.component.scss'],
})
export class NotImplementedComponent {
  private route = inject(ActivatedRoute);
  get label(): string {
    return this.route.snapshot.data['label'] ?? 'This page';
  }
}
