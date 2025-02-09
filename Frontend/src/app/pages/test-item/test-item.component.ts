import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemDetailComponent } from '../../components/item-detail/item-detail.component';
import { ItemDetailConfig } from '../../components/item-detail/item-detail.types';
import { AuthService } from '../../services/auth.service';
import { Profile } from '../../dto/auth.dto';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-test-item',
  standalone: true,
  imports: [CommonModule, ItemDetailComponent, ToastModule],
  providers: [MessageService],
  template: `
    <app-item-detail
      [config]="detailConfig"
      [item]="userData"
      (onUpdate)="handleUpdate($event)"
    ></app-item-detail>
    <p-toast></p-toast>
  `,
})
export class TestItemComponent implements OnInit {
  userData: Profile | null = null;

  detailConfig: ItemDetailConfig = {
    header: 'User Profile',
    isEditable: true,
    supportsAdd: false,
    supportsDelete: false,
    metrics: [
      { icon: 'pi-user', value: '', label: 'Active' },
      { icon: 'pi-clock', value: '3', label: 'months' },
    ],
    formLayout: [
      { key: 'username', label: 'Username', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'text', required: true },
      { key: 'firstName', label: 'First Name', type: 'text', required: true },
      { key: 'lastName', label: 'Last Name', type: 'text', required: true },
    ],
  };

  constructor(
    private authService: AuthService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.userData = this.authService.getCurrentProfile();
  }

  handleUpdate(updatedUser: Profile) {
    // In a real app, you would call a service to update the user
    console.log('Updating user:', updatedUser);
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'User profile updated successfully',
    });
  }
}
