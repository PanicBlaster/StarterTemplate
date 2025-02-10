@Component({
  template: ` <app-item-list [config]="listConfig"></app-item-list> `,
})
export class UserListComponent {
  listConfig: ItemListConfig = {
    header: 'Users',
    supportsAdd: true,
    supportsEdit: true,
    supportsDelete: true,
    defaultSortField: 'createdAt',
    defaultSortOrder: -1,
    metrics: [
      { icon: 'pi-users', value: '332', label: 'Total Users' },
      { icon: 'pi-clock', value: '45', label: 'Active Now' },
    ],
    columns: [
      { field: 'username', header: 'Username', sortable: true },
      { field: 'email', header: 'Email', sortable: true },
      { field: 'firstName', header: 'First Name', sortable: true },
      { field: 'lastName', header: 'Last Name', sortable: true },
      {
        field: 'role',
        header: 'Role',
        type: 'select',
        sortable: true,
        options: [
          { label: 'Admin', value: 'admin' },
          { label: 'User', value: 'user' },
        ],
      },
      {
        field: 'createdAt',
        header: 'Created',
        type: 'date',
        format: 'short',
        sortable: true,
      },
    ],
    dataService: {
      parseParams: (params: Params, queryParams: Params) => {
        return {
          ...queryParams,
          where: { tenantId: this.authService.getCurrentTenant()?.id },
        };
      },
      loadItems: (params: QueryOptions) => this.userService.getUsers(params),
      deleteItem: (id: string) => this.userService.deleteUser(id),
    },
  };

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {}
}
