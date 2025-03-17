import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountService } from '../../services/account.service';
import { AuthService } from '../../services/auth.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ItemDetailComponent } from '../../components/item-detail/item-detail.component';
import { ItemDetailConfig } from '../../components/item-detail/item-detail.types';
import { of } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ToastModule, ItemDetailComponent],
  providers: [MessageService],
  template: `<pb-item-detail [config]="detailConfig"></pb-item-detail>`,
})
export class ProfileComponent {
  userId: string = '';

  detailConfig: ItemDetailConfig = {
    header: 'My Profile',
    isEditable: true,
    supportsAdd: false,
    supportsDelete: false,
    updateSuccessMessage: 'Profile updated successfully',
    formLayout: [
      { key: 'username', label: 'Username', type: 'text', disabled: true },
      { key: 'email', label: 'Email', type: 'text', disabled: true },
      { key: 'firstName', label: 'First Name', type: 'text', required: true },
      { key: 'lastName', label: 'Last Name', type: 'text', required: true },
    ],
    dataService: {
      parseParams: () => {
        this.userId = this.authService.getUserId();
        return {
          id: this.userId,
          isNew: false,
        };
      },
      loadItem: (params) =>
        this.accountService.getAccount(this.authService.getUserId()),
      updateItem: (params, item) =>
        this.accountService.updateAccount(this.userId, item),
      createItem: () =>
        of({ success: false, message: 'Create not supported', id: '' }),
      deleteItem: () =>
        of({ success: false, message: 'Delete not supported', id: '' }),
    },
  };

  constructor(
    private accountService: AccountService,
    private authService: AuthService
  ) {}
}
