import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ItemListComponent } from '../../../components/item-list/item-list.component';
import { ItemListConfig } from '../../../components/item-list/item-list.types';
import { TenantAccessService } from '../../../services/tenant-access.service';
import { AccountService } from '../../../services/account.service';
import { firstValueFrom } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-users-tenant-list',
  standalone: true,
  imports: [CommonModule, ItemListComponent, ToastModule],
  providers: [
    TenantAccessService,
    AccountService,
    MessageService,
    ConfirmationService,
  ],
  template: `<app-item-list [config]="listConfig"></app-item-list>`,
})
export class UsersTenantListComponent implements OnInit {
  userId: string = '';

  listConfig: ItemListConfig = {
    header: 'User Tenants',
    supportsAdd: false,
    supportsEdit: false,
    supportsDelete: true,
    defaultSortField: 'name',
    customToolbarItems: [
      {
        label: 'Add Tenant',
        icon: 'pi pi-plus',
        onClick: () => this.addTenant(),
      },
    ],
    columns: [
      {
        field: 'name',
        header: 'Name',
        type: 'text',
        sortable: true,
      },
      {
        field: 'id',
        header: 'ID',
        type: 'id',
        sortable: true,
      },
    ],
    dataService: {
      parseParams: (params, queryParams) => ({
        skip: queryParams['skip'] || 0,
        take: queryParams['take'] || 10,
        userId: this.userId,
      }),
      loadItems: (params) => {
        const tenants = this.tenantAccessService.getTenants(params);
        return tenants;
      },
      deleteItem: (params, item) =>
        this.tenantAccessService.removeTenantAccess(item.id, this.userId),
      updateHeader: async (params, items) => {
        const user = await firstValueFrom(
          this.accountService.getAccount(this.userId)
        );
        if (!user) {
          return '';
        }
        return `User Tenants (${user.username})`;
      },
    },
  };

  constructor(
    private tenantAccessService: TenantAccessService,
    private accountService: AccountService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.userId = this.route.snapshot.params['id'];
    console.log('userId', this.userId);
  }

  addTenant() {
    console.log('Add tenant for user:', this.userId);
    // TODO: Implement tenant addition logic
  }
}
