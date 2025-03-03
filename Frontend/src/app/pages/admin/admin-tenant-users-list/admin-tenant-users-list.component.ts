import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ItemListComponent } from '../../../components/item-list/item-list.component';
import { ItemListConfig } from '../../../components/item-list/item-list.types';
import { AccountService } from '../../../services/account.service';
import { TenantAccessService } from '../../../services/tenant-access.service';
import { SelectDialogComponent } from '../../../components/select-dialog/select-dialog.component';
import { SelectDialogConfig } from '../../../components/select-dialog/select-dialog.types';
import { firstValueFrom } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-admin-tenant-users-list',
  standalone: true,
  imports: [
    CommonModule,
    ItemListComponent,
    SelectDialogComponent,
    ToastModule,
  ],
  providers: [MessageService],
  template: `
    <app-item-list #list [config]="listConfig"></app-item-list>
    <app-select-dialog
      #selectDialog
      [config]="selectDialogConfig"
    ></app-select-dialog>
  `,
})
export class AdminTenantUsersListComponent implements OnInit {
  @ViewChild('selectDialog') selectDialog!: SelectDialogComponent;
  @ViewChild('list') list!: ItemListComponent;

  tenantId: string = '';
  tenantName: string = '';

  listConfig: ItemListConfig = {
    header: 'Tenant Users',
    supportsAdd: false,
    supportsEdit: false,
    supportsDelete: true,
    enableSearch: true,
    searchPlaceholder: 'Search users...',
    customToolbarItems: [
      {
        label: 'Add Users',
        icon: 'pi pi-user-plus',
        onClick: () => this.addUsers(),
      },
    ],
    columns: [
      {
        field: 'id',
        header: 'ID',
        type: 'id',
        mobileHide: true,
      },
      {
        field: 'username',
        header: 'Username',
        type: 'text',
      },
      {
        field: 'email',
        header: 'Email',
        type: 'text',
      },
      {
        field: 'firstName',
        header: 'First Name',
        type: 'text',
        mobileHide: true,
      },
      {
        field: 'lastName',
        header: 'Last Name',
        type: 'text',
        mobileHide: true,
      },
      {
        field: 'createdAt',
        header: 'Created',
        type: 'date',
        format: 'short',
        mobileHide: true,
      },
    ],
    dataService: {
      parseParams: (params, queryParams) => ({
        skip: queryParams['skip'] || 0,
        take: queryParams['take'] || 10,
        filter: queryParams['filter'] || '',
        tenantId: this.tenantId,
      }),
      loadItems: (params) => this.accountService.getAccounts(params),
      deleteItem: (params, item) =>
        this.tenantAccessService.removeTenantAccess(this.tenantId, item.id),
      updateHeader: async (params, items) => {
        try {
          if (!this.tenantName && this.tenantId) {
            const tenant = await firstValueFrom(
              this.tenantAccessService.getTenant(this.tenantId)
            );
            this.tenantName = tenant.name;
          }
          return `Users in ${this.tenantName} Tenant`;
        } catch (error) {
          console.error('Error loading tenant details:', error);
          return 'Tenant Users';
        }
      },
    },
  };

  selectDialogConfig: SelectDialogConfig<any> = {
    header: 'Select Users to Add',
    columns: [
      {
        field: 'username',
        header: 'Username',
        type: 'text',
      },
      {
        field: 'email',
        header: 'Email',
        type: 'text',
      },
      {
        field: 'firstName',
        header: 'First Name',
        type: 'text',
      },
      {
        field: 'lastName',
        header: 'Last Name',
        type: 'text',
      },
    ],
    dataService: {
      loadItems: (params) => {
        return this.accountService.getAccounts({
          ...params,
          all: true,
          tenantId: this.tenantId,
          excludeMine: true,
        });
      },
      selectItems: async (items) => {
        const promises = items.map(async (user) => {
          return firstValueFrom(
            this.tenantAccessService.addTenantAccess(this.tenantId, user.id)
          );
        });

        try {
          await Promise.all(promises);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `${items.length} users added to tenant`,
          });
          this.list.refresh();
        } catch (error) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to add users to tenant',
          });
          console.error('Error adding users to tenant', error);
        }
      },
    },
  };

  constructor(
    private accountService: AccountService,
    private tenantAccessService: TenantAccessService,
    private messageService: MessageService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.tenantId = this.route.snapshot.params['id'];
    this.loadTenantInfo();
  }

  private async loadTenantInfo() {
    try {
      const tenant = await firstValueFrom(
        this.tenantAccessService.getTenant(this.tenantId)
      );
      this.tenantName = tenant.name;
    } catch (error) {
      console.error('Error loading tenant details:', error);
    }
  }

  addUsers() {
    this.selectDialog.show();
  }
}
