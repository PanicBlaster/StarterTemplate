@Component({
  template: `
    <app-page-toolbar
      header="Customers"
      [supportsAdd]="true"
      [metrics]="metrics"
      [actions]="toolbarActions"
      (onAdd)="handleAdd()"
    ></app-page-toolbar>

    <!-- Rest of your customers component -->
  `,
})
export class CustomersComponent {
  metrics: Metric[] = [
    { icon: 'pi-users', value: '332', label: 'Active Users' },
    { icon: 'pi-clock', value: '9402', label: 'Sessions' },
    { icon: 'pi-stopwatch', value: '2.32m', label: 'Avg. Duration' },
  ];

  toolbarActions: ToolbarAction[] = [
    {
      label: 'Export',
      icon: 'pi-download',
      onClick: () => this.exportData(),
    },
  ];

  handleAdd() {
    // Handle add action
  }

  exportData() {
    // Handle export action
  }
}
