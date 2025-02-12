import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ItemListComponent } from '../../../components/item-list/item-list.component';
import { ItemListConfig } from '../../../components/item-list/item-list.types';
import { TenantAccessService } from '../../../services/tenant-access.service';

@Component({
  selector: 'app-users-tenant-list',
  standalone: true,
  imports: [CommonModule, ItemListComponent],
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
        type: 'text',
        sortable: true,
      },
    ],
    dataService: {
      parseParams: (params, queryParams) => ({
        skip: queryParams['skip'] || 0,
        take: queryParams['take'] || 10,
        userId: this.userId,
      }),
      loadItems: (params) => this.tenantAccessService.getTenants(params),
      deleteItem: (params, item) =>
        this.tenantAccessService.removeTenantAccess(item.id, this.userId),
    },
  };

  constructor(
    private tenantAccessService: TenantAccessService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.userId = this.route.snapshot.params['id'];
    console.log('userId', this.userId);
  }
}
