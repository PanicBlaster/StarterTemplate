import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ItemListComponent } from '../../../components/item-list/item-list.component';
import { ItemListConfig } from '../../../components/item-list/item-list.types';
import { TenantAccessService } from '../../../services/tenant-access.service';
import { AccountService } from '../../../services/account.service';
import { firstValueFrom, forkJoin, of } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService } from 'primeng/api';
import { SelectDialogComponent } from '../../../components/select-dialog/select-dialog.component';
import { SelectDialogConfig } from '../../../components/select-dialog/select-dialog.types';
import { DialogModule } from 'primeng/dialog'; // Add this

@Component({
  selector: 'app-users-tenant-list',
  standalone: true,
  imports: [
    CommonModule,
    ItemListComponent,
    ToastModule,
    SelectDialogComponent, // Make sure this is imported correctly
    DialogModule, // Add this
  ],
  providers: [
    TenantAccessService,
    AccountService,
    MessageService,
    ConfirmationService,
  ],
  template: `
    <app-item-list [config]="listConfig"></app-item-list>
    <app-select-dialog
      #selectDialog
      [config]="selectDialogConfig"
    ></app-select-dialog>
  `,
})
export class UsersTenantListComponent implements OnInit {
  @ViewChild('selectDialog') selectDialog!: SelectDialogComponent;

  userId: string = '';

  listConfig: ItemListConfig = {
    header: 'User Tenants',
    supportsAdd: false,
    supportsEdit: false,
    supportsDelete: true,
    defaultSortField: 'name',
    customToolbarItems: [
      {
        label: 'Link Tenant',
        icon: 'pi pi-link',
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

  selectDialogConfig: SelectDialogConfig<any> = {
    header: 'Select Tenants',
    columns: [
      {
        field: 'name',
        header: 'Name',
        type: 'text',
      },
      {
        field: 'id',
        header: 'ID',
        type: 'id',
      },
    ],
    dataService: {
      loadItems: (params) => {
        return this.tenantAccessService.getTenants({
          ...params,
          all: true,
        });
      },
      selectItems: (items) => {
        const requests = items.map((item) =>
          this.tenantAccessService.addTenantAccess(item.id, this.userId)
        );
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
    this.selectDialog.show();
  }
}
