import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemListComponent } from '../../../components/item-list/item-list.component';
import { ItemListConfig } from '../../../components/item-list/item-list.types';
import { TenantAccessService } from '../../../services/tenant-access.service';

@Component({
  selector: 'app-admin-tenant-list',
  standalone: true,
  imports: [CommonModule, ItemListComponent],
  template: `<app-item-list [config]="listConfig"></app-item-list>`,
})
export class AdminTenantListComponent {
  listConfig: ItemListConfig = {
    header: 'All Tenants',
    supportsAdd: true,
    supportsEdit: true,
    supportsDelete: true,
    enableSearch: true,
    defaultSortField: 'name',
    columns: [
      {
        field: 'id',
        header: 'ID',
        type: 'id',
        sortable: true,
        mobileHide: true,
      },
      {
        field: 'name',
        header: 'Name',
        type: 'text',
        sortable: true,
      },
      {
        field: 'createdAt',
        header: 'Created',
        type: 'date',
        format: 'short',
        sortable: true,
        mobileHide: true,
      },
    ],
    dataService: {
      parseParams: (params, queryParams) => ({
        skip: queryParams['skip'] || 0,
        take: queryParams['take'] || 10,
        all: true,
      }),
      loadItems: (params) => this.tenantService.getTenants(params),
      deleteItem: (params, item) => this.tenantService.deleteTenant(item.id),
    },
  };

  constructor(private tenantService: TenantAccessService) {}
}
