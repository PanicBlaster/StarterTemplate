import { Component } from '@angular/core';
import { ItemListComponent } from '../../../components/item-list/item-list.component';
import { ItemListConfig } from '../../../components/item-list/item-list.types';
import { AuthService } from '../../../services/auth.service';
import { AccountService } from '../../../services/account.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [ItemListComponent],
  template: `<pb-item-list [config]="listConfig"></pb-item-list>`,
})
export class UserListComponent {
  listConfig: ItemListConfig = {
    header: 'Users',
    supportsAdd: true,
    supportsEdit: true,
    supportsDelete: true,
    defaultSortField: 'username',
    columns: [
      {
        field: 'username',
        header: 'Username',
        type: 'text',
        sortable: true,
      },
      { field: 'email', header: 'Email', type: 'text', sortable: true },

      {
        field: 'createdAt',
        header: 'Created',
        type: 'date',
        format: 'short',
        sortable: true,
      },
    ],
    dataService: {
      parseParams: (params, queryParams) => ({
        skip: queryParams['skip'] || 0,
        take: queryParams['take'] || 10,
        where: { tenantId: this.authService.getCurrentTenant()?.id },
      }),
      loadItems: (params) => this.accountService.getAccounts(params),
      deleteItem: (params, item) => this.accountService.deleteAccount(item.id),
    },
  };

  constructor(
    private accountService: AccountService,
    private authService: AuthService
  ) {}
}
