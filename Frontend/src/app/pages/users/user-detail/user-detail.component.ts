import { Component } from '@angular/core';
import { ItemDetailComponent } from '../../../components/item-detail/item-detail.component';
import { ItemDetailConfig } from '../../../components/item-detail/item-detail.types';
import { AuthService } from '../../../services/auth.service';
import { AccountService } from '../../../services/account.service';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { ThemeUtils } from '@primeng/themes';
@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, ItemDetailComponent, ToastModule],
  providers: [MessageService],
  template: `<pb-item-detail [config]="detailConfig"></pb-item-detail>`,
})
export class UserDetailComponent {
  detailConfig: ItemDetailConfig = {
    header: 'User Details',
    isEditable: true,
    supportsAdd: false,
    supportsDelete: true,
    updateSuccessMessage: 'User updated successfully',
    breadcrumbField: 'username',
    formLayout: [
      { key: 'username', label: 'Username', type: 'text', required: true },
      {
        key: 'password',
        label: 'Password',
        type: 'password',
        required: true,
        newOnly: true,
      },
      { key: 'email', label: 'Email', type: 'text', required: true },
      { key: 'firstName', label: 'First Name', type: 'text', required: true },
      { key: 'lastName', label: 'Last Name', type: 'text', required: true },
      {
        key: 'role',
        label: 'Role',
        type: 'select',
        required: true,
        options: [
          { label: 'Admin', value: 'admin' },
          { label: 'User', value: 'user' },
        ],
      },
    ],
    customToolbarItems: [
      {
        label: 'Reset Password',
        icon: 'pi pi-lock',
        onClick: () => this.resetPassword(),
      },
      {
        label: 'Tenants',
        icon: 'pi pi-sitemap',
        onClick: () => this.showTenants(),
      },
    ],
    dataService: {
      parseParams: (params, queryParams) => ({
        id: params['id'],
        where: { tenantId: this.authService.getCurrentTenant()?.id },
        isNew: params['id'] === 'new',
      }),
      loadItem: (params) => this.accountService.getAccount(params.id || ''),
      createItem: (params, item) => this.accountService.createAccount(item),
      updateItem: (params, item) =>
        this.accountService.updateAccount(params.id || '', item),
      deleteItem: (params) =>
        this.accountService.deleteAccount(params.id || ''),
    },
  };

  constructor(
    private accountService: AccountService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    console.log('User detail Constructor');
  }

  ngOnInit() {
    console.log('User detail ngOnInit');

    this.route.snapshot.data['label'] = 'goodbye';
  }

  resetPassword() {
    console.log('Reset password');
  }

  showTenants() {
    console.log('Show tenants');
    this.router.navigate(['tenants'], { relativeTo: this.route });
  }
}
