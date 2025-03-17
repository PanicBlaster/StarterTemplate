import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemDetailComponent } from '../../components/item-detail/item-detail.component';
import { ItemDetailConfig } from '../../components/item-detail/item-detail.types';
import { AuthService } from '../../services/auth.service';
import { Profile } from '../../dto/auth.dto';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { QueryOptions } from '../../components/common-dto/query.dto';
import { AccountService } from '../../services/account.service';
import { UserDto } from '../../dto/user.dto';
import { Params } from '@angular/router';

@Component({
  selector: 'app-test-item',
  standalone: true,
  imports: [CommonModule, ItemDetailComponent, ToastModule],
  providers: [MessageService],
  template: `
    <pb-item-detail [config]="detailConfig"></pb-item-detail>
    <p-toast></p-toast>
  `,
})
export class TestItemComponent implements OnInit {
  detailConfig: ItemDetailConfig = {
    header: 'User Profile',
    isEditable: true,
    supportsAdd: false,
    supportsDelete: false,
    updateSuccessMessage: 'Profile updated successfully',
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
      parseParams: (params: Params) => {
        return {
          id: this.authService.getUserId(),
        };
      },
      loadItem: (params: QueryOptions) =>
        this.accountService.getAccount(params.id || ''),
      createItem: (params: QueryOptions, item: UserDto) =>
        this.accountService.createAccount(item),
      updateItem: (params: QueryOptions, item: UserDto) =>
        this.accountService.updateAccount(params.id || '', item),
      deleteItem: (params: QueryOptions) =>
        this.accountService.deleteAccount(params.id || ''),
    },
  };

  constructor(
    private authService: AuthService,
    private messageService: MessageService,
    private accountService: AccountService
  ) {}

  ngOnInit() {}
}
