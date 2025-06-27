import { NButton, NIcon, NPopconfirm, NSpace, NTag} from 'naive-ui'
import { TrashOutline as DeleteIcon, PencilOutline as EditIcon } from '@vicons/ionicons5';
import { h } from 'vue';

export const customerColumns=(openEditDrawer:any, handleDelete:any)=> [
  {
    title: 'Name',
    key: 'name',
    width: 140
  },
  {
    title: 'Entity Type',
    key: 'entityType',
    width: 140
  },
  {
    title: 'Payment Terms',
    key: 'paymentTerms',
    width: 130
  },
  {
    title: 'Credit Balance',
    key: 'creditBalance',
    width: 130,
    render(row: any) {
      const statusType = row.creditBalance >= 0 ? 'success' : 'error';
      return h(
        NTag,
        {
          bordered: false,
          type: statusType,
          size: 'small'
        },
        {
          default: () => `Rs. ${row.creditBalance.toFixed(0)}`
        }
      );
    }
  },
  {
    title: 'City',
    key: 'city',
    width: 130
  },
  {
    title: 'Status',
    key: 'isActive',
    width: 100,
    render(row: any) {
      const isActive = row.isActive === true;
      const statusType = isActive ? 'success' : 'error';
      const statusText = isActive ? 'Active' : 'Inactive';

      return h(
        NTag,
        {
          type: statusType,
          size: 'small',
          bordered: false
        },
        {
          default: () => statusText
        }
      );
    }
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 120,
    render(row: any) {
      return h(
        NSpace,
        {
          justify: 'center',
          align: 'center'
        },
        {
          default: () => [
            h(
              NButton,
              {
                quaternary: true,
                circle: true,
                onClick: () => openEditDrawer(row)
              },
              {
                default: () => h(
                  NIcon,
                  {
                    color: 'rgb(0, 82, 204)'
                  },
                  {
                    default: () => h(EditIcon)
                  }
                )
              }
            ),
            h(
              NPopconfirm,
              {
                onPositiveClick: () => handleDelete(row.id),
                negativeText: 'Cancel',
                positiveText: 'Delete'
              },
              {
                trigger: () => h(
                  NButton,
                  {
                    quaternary: true,
                    circle: true
                  },
                  {
                    default: () => h(
                      NIcon,
                      {
                        color: 'rgb(255, 86, 48)'
                      },
                      {
                        default: () => h(DeleteIcon)
                      }
                    )
                  }
                ),
                default: () => 'Are you sure you want to delete this customer?'
              }
            )
          ]
        }
      );
    }
  }
];