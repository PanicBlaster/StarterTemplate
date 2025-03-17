@Component({
  template: `
    <pb-item-detail
      [config]="detailConfig"
      [item]="customer"
      (onCreate)="handleCreate($event)"
      (onUpdate)="handleUpdate($event)"
      (onDelete)="handleDelete()"
    ></pb-item-detail>
  `,
})
export class CustomerDetailComponent {
  customer = {
    name: 'John Doe',
    email: 'john@example.com',
    age: 30,
    joinDate: new Date(),
    type: 'premium',
  };

  detailConfig: ItemDetailConfig = {
    header: 'Customer Details',
    isEditable: true,
    supportsDelete: true,
    metrics: [
      { icon: 'pi-shopping-cart', value: '47', label: 'Orders' },
      { icon: 'pi-dollar', value: '1,234', label: 'Total Spent' },
    ],
    formLayout: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'text', required: true },
      { key: 'age', label: 'Age', type: 'number' },
      { key: 'joinDate', label: 'Join Date', type: 'date' },
      {
        key: 'type',
        label: 'Customer Type',
        type: 'select',
        options: [
          { label: 'Standard', value: 'standard' },
          { label: 'Premium', value: 'premium' },
        ],
      },
    ],
  };

  handleCreate(newCustomer: any) {
    console.log('Create:', newCustomer);
  }

  handleUpdate(updatedCustomer: any) {
    console.log('Update:', updatedCustomer);
  }

  handleDelete() {
    console.log('Delete customer');
  }
}
