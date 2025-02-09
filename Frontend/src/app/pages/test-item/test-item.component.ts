import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemDetailComponent } from '../../components/item-detail/item-detail.component';
import { ItemDetailConfig } from '../../components/item-detail/item-detail.types';
import { AuthService } from '../../services/auth.service';
import { Profile } from '../../dto/auth.dto';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { QueryOptions } from '../../dto/query.dto';
import { AccountService } from '../../services/account.service';
import { UserDto } from '../../dto/user.dto';

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
    dataService: {
      loadItem: (params: QueryOptions) =>
        this.accountService.getAccount(params.id || ''),
      createItem: (item: UserDto) => this.accountService.createAccount(item),
      updateItem: (id: string, item: UserDto) =>
        this.accountService.updateAccount(id, item),
      deleteItem: (id: string) => this.accountService.deleteAccount(id),
    },
  };

  constructor(
    private authService: AuthService,
    private messageService: MessageService,
    private accountService: AccountService
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
