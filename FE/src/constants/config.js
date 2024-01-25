import CustomerSvg from 'src/components/Icons/CustomerSvg'
import DashboardSvg from 'src/components/Icons/DashboardSvg'
import DeliveredCheckSvg from 'src/components/Icons/DeliveredCheckSvg'
import FailedCircleSvg from 'src/components/Icons/FailedCircleSvg'
import InventorySvg from 'src/components/Icons/InventorySvg'
import InvoiceSvg from 'src/components/Icons/InvoiceSvg'
import QuotationSvg from 'src/components/Icons/QuotationSvg'
import ScrapSvg from 'src/components/Icons/ScrapSvg'
import SendCheckSvg from 'src/components/Icons/SendCheckSvg'
import SettingSvg from 'src/components/Icons/SettingSvg'
import UserSvg from 'src/components/Icons/UserSvg'
import PulsedLoading from 'src/components/PulsedLoading'

export const REGEX_NUMBER = /^(-)?[0-9]*$/

export const REGEX_NAME = /^[\p{L}\p{M}0-9.\s]+$/u

export const REGEX_USERNAME = /^[a-zA-Z0-9@/./_/]+$/

export const REGEX_SPECIAL_CHARACTERS = /^[a-zA-Z0-9@./_ ;: &+$-]+$/;

export const REGEX_NATURAL_NUMBER = /^[1-9]\d*$/;

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const REGEX_PHONE_NUMBER = /^((\+84|84|0|0084)[0-9]{8,10})|((\+65|65|0|0065)[0-9]{8,10})$/

export const REGEX_PASSWORD = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

export const REGEX_EMAIL = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

export const REGEX_IMAGE = /\.(jpg|jpeg|png|gif|svg|webp)$/i;

export const PUSHER_CHANEL = 'whatsapp-message-channel';

export const PUSHER_EVENT = 'whatsapp-message-event';

export const MESSAGE_DROP_DOWN_HEIGHT = 300;

export const IMAGE_FILE_MAX_SIZE = 20971520; //20MB

export const DOCUMENT_FILE_MAX_SIZE = 20971520; //20MB

export const CHAT_FILE_MAX_SIZE = 67108864; // 64MB in bytes

export const CHAT_INPUT_LINE_HEIGHT = 30;

export const HIDDEN_MESSAGE_LENGTH = 765;

export const HIDDEN_UN_STARRED_MESSAGE_LENGTH = 80;

export const CHAT_INPUT_MAX_LINE = 5;

export const INITIAL_CHAT_INPUT_HEIGHT = 50;

export const INITIAL_NOTE_INPUT_HEIGHT = 50;

export const CHANGE_NOTE_INPUT_POINT_HEIGHT = 80;

export const SELECT_BOX_HEIGHT_UNIT = 35;

export const SELECT_BOX_MAX_HEIGHT = 200;

export const TEXT_MAX_LENGTH = 255;

export const FONT_SIZE_CHAT = 16;

export const LINE_HEIGHT_CHAT_TEXT = 1.5;

export const ALLOWED_FILE_FORMATS = ['pdf', 'png', 'jpeg', 'cad'];

export const EMOJI_BOX_SECTION = {
  ALL: 'ALL',
  CUSTOMER: 'CUSTOMER',
  BUSINESS: 'BUSINESS'
}

export const QUOTATION_HEADER_FILTER = {
  THIS_MONTH: 'This Month',
  LAST_MONTH: 'Last Month',
  THIS_YEAR: 'This Year',
  LAST_YEAR: 'Last Year',
}

export const USER_PER_PAGE = 10;

export const EMPTY_VALUE = 0;

export const DEFAULT_VALUE = 1;

export const CONVERSATION_PER_PAGE = 15;

export const SIDEBAR_URLS = [
  {
    list: [
      {
        id: 1,
        title: 'Dashboard',
        link: '/',
        icon: <DashboardSvg />,
      },
    ]
  },
  {
    caption: 'SALES',
    list: [
      {
        id: 1,
        key: 'customer',
        title: 'Customers',
        link: '/customers',
        redirect: '/customers/create-customer',
        createNew: 'Customer',
        icon: <CustomerSvg />,
      },
      {
        id: 2,
        key: 'quotation',
        title: 'Quotation',
        link: '/quotation',
        redirect: '/quotation/create-quotation',
        createNew: 'Quotation',
        icon: <QuotationSvg />,
      },
      {
        id: 3,
        key: 'invoice',
        title: 'Invoice',
        link: '/invoice',
        redirect: '/invoice/create-invoice',
        createNew: 'Invoice',
        icon: <InvoiceSvg />,
      },
    ]
  },
  {
    caption: 'PROCUREMENT',
    list: [
      {
        id: 1,
        key: 'inventory',
        title: 'Inventory',
        link: '/inventory',
        redirect: '/inventory/materials/create',
        createNew: 'Item',
        icon: <InventorySvg />,
        sub: [
          {
            key: 'materials',
            title: 'Materials',
            link: '/inventory/materials',
            redirect: '/inventory/materials/create',
          },
          {
            key: 'product-templates',
            title: 'Product Templates',
            link: '/inventory/product-templates',
            redirect: '/inventory/materials/create',
          },
        ]
      },
      {
        id: 2,
        key: 'scrap_management',
        title: 'Scrap Management',
        link: '/scrap-management',
        redirect: '/scrap-management/create-scrap',
        createNew: 'Scrap',
        icon: <ScrapSvg />,
      },
    ]
  },
  {
    caption: 'ORGANIZATION',
    list: [
      {
        id: 1,
        key: 'user_management',
        title: 'User Management',
        link: '/user-management',
        redirect: '/user-management/create-user',
        createNew: 'User',
        icon: <UserSvg />,
      },
      {
        id: 2,
        key: 'role_setting',
        title: 'Roles Setting',
        link: '/roles-setting',
        redirect: '/roles-setting/create-new-role',
        createNew: 'Role',
        icon: <SettingSvg />,
      },
    ]
  },
]

const SIDEBAR_URL_LIST = SIDEBAR_URLS.flatMap(section => section.list.map(route => route.link))

export const CUSTOMERS = {
  STATUS: {
    NEW: {
      VALUE: 1,
      LABEL: 'New',
      CLASS: 'customers__status--new'
    },
    IN_PROCESS: {
      VALUE: 2,
      LABEL: 'In Progress',
      CLASS: 'customers__status--progress'
    },
    COMPLETED: {
      VALUE: 3,
      LABEL: 'Completed',
      CLASS: 'customers__status--completed'
    },
  },
  TAB: [
    { VALUE: 1, LABEL: 'details', BUTTON: null },
    { VALUE: 2, LABEL: 'quotation', BUTTON: 'new quotation' },
    { VALUE: 3, LABEL: 'invoice', BUTTON: 'new invoice' },
    { VALUE: 4, LABEL: 'documents', BUTTON: 'upload' },
  ],
  VIEW: {
    DETAILS: 1,
    QUOTATION: 2,
    INVOICE: 3,
    DOCUMENTS: 4,
  },
  LOGS: {
    ICON: [
      'emptyItem',
      '/icons/brown-customer.svg',
      '/icons/brown-quotation.svg',
      '/icons/brown-invoice.svg',
      '/icons/brown-document.svg',
    ],
    LABEL: [
      'emptyItem',
      'customer',
      'quotation',
      'invoice',
      'document',
    ],
    ACTION: [
      'emptyItem',
      'created',
      'updated',
      'uploaded',
      'deleted',
    ],
  },
  ACTION_CREATE_VALUE: 1,
  TYPE_VALUE: {
    CUSTOMER: 1,
    QUOTATION: 2,
    INVOICE: 3,
    DOCUMENT: 4,
  },
}

export const QUOTATION = {
  ITEM_TYPE: {
    PIECE: 1,
    SQUARE_METER: 2,
    METER: 3,
    PANEL: 4,
  },
  GLASS: 'glass',
  PRODUCT: 'product',
  EXTRA_ORDER: 'extra-order',
  SERVICE_TYPE: {
    OTHER: 5,
  },
  PRODUCT_FIELD: {
    INPUT: ['product_code', 'quantity', 'width', 'height', 'glass_type'],
    SELECT: ['profile', 'storey', 'area'],
  },
  MATERIAL_VALUE: {
    PRODUCT: 1,
    GLASS: 2,
    EXTRA_ORDER: 3,
    ALUMINIUM: 1,
  },
  NEW_ITEM_MODAL: [
    {
      value: 0,
      label: 'Empty Item'
    },
    {
      value: 1,
      label: 'New Material - Product'
    },
    {
      value: 2,
      label: 'New Material - Glass'
    },
    {
      value: 3,
      label: 'New Material - Extra Order (E/O)'
    },
  ],
  MATERIAL_TITLE: [
    {
      value: 0,
      label: 'EMPTY TITLE',
    },
    {
      value: 1,
      label: 'PRODUCT TITLE',
    },
    {
      value: 2,
      label: 'GLASS TITLE',
    },
    {
      value: 3,
      label: 'E/O TITLE',
    },
  ],
  DEFAULT_NOTE_TYPE: 1,
  TAB_LABEL: {
    DETAIL: 'details',
    NOTES: 'information-notes',
    QUOTATION: 'quotation',
  },
  NOTE_ACTION: [
    {
      value: 0,
      label: 'Empty Item',
      action: 'emptyItem',
    },
    {
      value: 1,
      label: 'Excluded',
      action: 'excluded',
    },
    {
      value: 2,
      label: 'Information',
      action: 'information',
    },
  ],
  OTHER_FEES_ACTION: {
    EXCLUDE: {
      value: 1,
      label: 'Excluded',
      action: 'excluded',
    },
    INCLUDE: {
      value: 2,
      label: 'Include',
      action: 'include',
    },
  },
  KEYS: {
    PAYMENT_TERM: 'terms_of_payment_confirmation',
    DESCRIPTION: 'description'
  },
  DRAG_AND_DROP_TYPE: 'quotationSection',
  MESSAGE_ERROR: {
    PAYMENT_TERM: 'Terms of Payment must be a number between 0 and 100.',
    DESCRIPTION: 'Description must be less than 255 digits.'
  },
  TERM_UNIT: [
    {
      value: 1,
      label: '%',
    },
  ],
  TAB: [
    { value: 1, label: 'details', tab: 'details' },
    { value: 2, label: 'information & notes', tab: 'information-notes' },
    { value: 3, label: 'quotation', tab: 'quotation' },
    { value: 4, label: 'Other Fees', tab: 'other-fees' },
  ],
  VIEW: {
    DETAILS: 1,
    INFORMATION_NOTE: 2,
    QUOTATION: 3,
    OTHER_FEES: 4,
  },
  ACTIONS: [
    {
      value: 1,
      icon: '/icons/save-quotation.svg',
      label: 'Save as Draft',
      action: 'draft',
    },
    {
      value: 2,
      icon: '/icons/download-quotation.svg',
      label: 'Download PDF',
      action: 'download',
    },
    {
      value: 3,
      icon: '/icons/send-quotation.svg',
      label: 'Send Email',
      action: 'mail',
    },
    {
      value: 4,
      icon: '/icons/create-quotation.svg',
      label: 'Create Invoice',
      action: 'create',
    },
  ],
  STATUS: [
    { value: 0, label: 'Empty Item', },
    { value: 1, label: 'Unpaid', },
    { value: 2, label: 'Partial Payment' },
    { value: 3, label: 'Paid' },
    { value: 4, label: 'Rejected' },
    { value: 5, label: 'Cancelled' },
  ],
  SAVE_AS_DRAFT: 'draft',
  DOWNLOAD_PDF: 'download',
  SEND_EMAIL: 'mail',
  CREATE_INVOICE: 'create',
  TAX_GST_PERCENTAGE: 9 / 100,
  UNIT_RATE_DEFAULT: 305,
  CONVERT_TO_METER_SQUARE_VALUE: 1000000,
  STOREY: [
    {
      value: 0,
      label: 'emptyItem',
    },
    {
      value: 1,
      label: '1st Storey',
    },
    {
      value: 2,
      label: '2nd Storey',
    },
    {
      value: 3,
      label: '3rd Storey',
    },
    {
      value: 4,
      label: 'Mezzanine',
    },
  ],
  AREA: [
    {
      value: 0,
      label: 'emptyItem',
    },
    {
      value: 1,
      label: 'Living Room',
    },
    {
      value: 2,
      label: 'Balcony',
    },
    {
      value: 3,
      label: 'Kitchen',
    },
    {
      value: 4,
      label: 'Dinning Area',
    },
    {
      value: 5,
      label: 'Common Toilet',
    },
    {
      value: 6,
      label: 'Master Room Toilet',
    },
    {
      value: 7,
      label: 'Master Room',
    },
    {
      value: 8,
      label: 'Bedroom 1',
    },
    {
      value: 9,
      label: 'Bedroom 2',
    },
    {
      value: 10,
      label: 'Bedroom 3',
    },
    {
      value: 11,
      label: 'Store Room',
    },
  ],
  DISCOUNT_TYPE: {
    PERCENT: {
      id: 1,
      label: 'Percentage'
    },
    AMOUNT: {
      id: 2,
      label: 'Amount'
    }
  },
}

export const INVOICE = {
  TAB: [
    { VALUE: 1, LABEL: 'details' },
    { VALUE: 2, LABEL: 'invoice' },
    { VALUE: 3, LABEL: 'claim' },
  ],
  VIEW: {
    DETAILS: 1,
    INVOICE: 2,
    CLAIM: 3,
  },
  ROUTE: {
    DETAILS: 'details',
    INVOICE: 'invoice',
    CLAIM: 'claim',
  }
}

export const INVENTORY = {
  UNIT_LABEL: {
    METER: 'm',
    PIECE: 'pcs',
    PANEL: 'panel',
    SQUARE_METER: 'm²',
  },
  UNIT: [
    {
      value: 0,
      label: 'empty'
    },
    {
      value: 1,
      label: 'pcs'
    },
    {
      value: 2,
      label: 'm²'
    },
    {
      value: 3,
      label: 'm'
    },
    {
      value: 4,
      label: 'panel'
    },
  ],
  FIELD: {
    COATING: ['coating_price'],
    DEFAULT: ['category', 'item', 'price'],
    ALUMINIUM: ['profile', 'weight', 'raw_length', 'raw_girth', 'door_window_type'],
  },
  MESSAGE_FILL_IN: 'Please fill in',
  MESSAGE_SELECT: 'Please select',
  MESSAGE_ERROR: {
    NO_CHANGED: 'There was no changed.',
    ADD_ITEM: 'Please select item to add.',
    REMOVE_ITEM: 'Please select item to remove.',
    CHANGE_QUANTITY: 'Quantity must be greater than 0.',
    SELECT_ITEM: ' already included in the product list.',
    ITEM_SELECTED_EXISTED: 'Some selected items already included in the product list.',
  },
  LABEL: {
    ITEM: 'item',
    CODE: 'code',
    PRICE: 'price',
    WEIGHT: 'weight',
    PROFILE: 'profile',
    MIN_SIZE: 'min_size',
    PRICE_UNIT: 'price_unit',
    RAW_LENGTH: 'raw_length',
    INNER_SIDE: 'inner_side',
    OUTER_SIDE: 'outer_side',
    SERVICE_TYPE: 'service_type',
    COATING_PRICE: 'coating_price',
    DOOR_WINDOW_TYPE: 'door_window_type',
    COATING_PRICE_UNIT: 'coating_price_unit',
  },
  GLASS: 'Glass',
  HARDWARE: 'Hardware',
  SERVICES: 'Services',
  ALUMINIUM: 'Aluminium',
  EMPTY: 1,
  CHECKED: 1,
  UN_CHECK: 2,
  INNER_SIDE: 1,
  OUTER_SIDE: 2,
  PROFILES: [
    {
      value: 0,
      label: 'emptyItem',
    },
    {
      value: 1,
      label: 'Euro',
    },
    {
      value: 2,
      label: 'Local',
    },
  ],
  SIDE: [
    {
      value: 0,
      label: 'emptyItem',
    },
    {
      value: 1,
      label: 'Inner',
    },
    {
      value: 2,
      label: 'Outer',
    },
  ],
  ACTIONS: [
    {
      value: 1,
      url: 'aluminium',
      label: 'Aluminium',
    },
    {
      value: 2,
      url: 'glass',
      label: 'Glass',
    },
    {
      value: 3,
      url: 'hardware',
      label: 'Hardware',
    },
    {
      value: 4,
      url: 'services',
      label: 'Services',
    },
    {
      value: 5,
      url: 'upload-csv',
      icon: '/icons/upload.svg',
      label: 'Upload CSV',
    },
  ],
  WINDOW_TYPE: [
    {
      value: 0,
      label: 'emptyItem',
    },
    {
      value: 1,
      label: 'Swing Door (SWD)',
    },
    {
      value: 2,
      label: 'Sliding Door / Window (SLD)',
    },
    {
      value: 3,
      label: 'Top Hung / Fixed Panel (FTC)',
    },
    {
      value: 4,
      label: 'Slide & Fold Door (S&F)',
    },
    {
      value: 5,
      label: `Fixed / Hung Window (FTC-70's)`,
    },
    {
      value: 6,
      label: `Sliding Door / Window (SLD-80's)`,
    },
    {
      value: 7,
      label: `Sliding Door (SLD-80's)`,
    },
    {
      value: 8,
      label: `Fixed / Hung Window (FTC-70's)`,
    },
    {
      value: 9,
      label: 'Flush Door',
    },
    {
      value: 10,
      label: 'Louvre Insert',
    },
    {
      value: 11,
      label: 'Substation Door',
    },
    {
      value: 12,
      label: 'Slide & Fold Door (S&F-DR)',
    },
    {
      value: 13,
      label: 'Adj. Glass Louvre Window',
    },
    {
      value: 14,
      label: 'BF-TH & Fixed',
    },
  ],
  SERVICE: [
    {
      value: 0,
      label: 'emptyItem',
    },
    {
      value: 1,
      label: 'Aluminium',
    },
    {
      value: 2,
      label: 'Glass',
    },
    {
      value: 3,
      label: 'Hardware',
    },
    {
      value: 4,
      label: 'Services',
    },
    {
      value: 5,
      label: 'Others',
    },
  ],
  WEIGHT_UNIT: [
    {
      value: 1,
      label: 'kg/m',
    },
  ],
  LENGTH_UNIT: [
    {
      value: 1,
      label: 'm',
    },
  ],
  PRICE_UNIT: [
    {
      value: 0,
      label: 'emptyItem',
    },
    {
      value: 1,
      label: '/pcs',
    },
    {
      value: 2,
      label: '/m²',
    },
    {
      value: 3,
      label: '/m',
    },
    {
      value: 4,
      label: '/panel',
    },
  ],
  QUANTITY_UNIT: [
    {
      value: 0,
      label: 'emptyItem',
    },
    {
      value: 1,
      label: 'pcs',
    },
    {
      value: 2,
      label: 'm²',
    },
    {
      value: 3,
      label: 'm',
    },
    {
      value: 4,
      label: 'panel',
    },
  ],
  COATING_PRICE_STATUS_VALUE: [
    {
      value: 0,
      label: 'emptyItem',
    },
    {
      value: 1,
      label: 'Checked',
    },
    {
      value: 2,
      label: 'Uncheck',
    },
  ],
  COATING_PRICE_UNIT: [
    {
      value: 0,
      label: 'emptyItem',
    },
    {
      value: 1,
      label: '/m²',
    },
    {
      value: 2,
      label: '/pcs',
    },
  ],
  COATING_PRICE_STATUS: [
    {
      value: 1,
      label: 'Applicable',
    },
  ],
  SIZE_UNIT: [
    {
      value: 1,
      label: 'm²',
    },
  ],
  ACTIVITY: {
    FIELD_NAME: [
      {
        value: 'item',
        label: 'Item'
      },
      {
        value: 'code',
        label: 'Code'
      },
      {
        value: 'category',
        label: 'Category'
      },
      {
        value: 'profile',
        label: 'Profile'
      },
      {
        value: 'door_window_type',
        label: 'Door/Window type'
      },
      {
        value: 'inner_side',
        label: 'Inner side'
      },
      {
        value: 'outer_side',
        label: 'Outer side'
      },
      {
        value: 'weight',
        label: 'Weight',
      },
      {
        value: 'raw_length',
        label: 'Raw length'
      },
      {
        value: 'price',
        label: 'Price'
      },
      {
        value: 'price_unit',
        label: 'Price unit'
      },
      {
        value: 'coating_price_status',
        label: 'Coating price status'
      },
      {
        value: 'coating_price',
        label: 'Coating price'
      },
      {
        value: 'coating_price_unit',
        label: 'Coating price unit'
      },
      {
        value: 'min_size',
        label: 'Min size'
      },
      {
        value: 'service_type',
        label: 'Service type'
      },
    ]
  }
}

export const AUTHENTICATION = {
  URLS: [
    'reset-password',
    'forgot-password',
  ]
}

export const VISIBLE_URL_LIST = [...SIDEBAR_URL_LIST]

export const TIMER = {
  BLOCK_RESEND_MAIL: 5,
}

export const COUNTRY_CODE = [
  {
    value: 0,
    label: 'emptyItem',
  },
  {
    value: 1,
    label: '+65',
  },
  {
    value: 2,
    label: '+84',
  },
]

export const PHONE_CODE = {
  SINGAPORE: '+65',
  VIETNAM: '+84',
}

export const DEFAULT_IMAGE_SRC = '/icons/add-image.svg'

export const TOP_BAR_TITLES = [
  {
    BASE_URL: '',
    TITLE: 'Dashboard',
    VALUE: 1,
  },
  {
    BASE_URL: 'customers',
    TITLE: 'Customers',
    VALUE: 2,
  },
  {
    BASE_URL: 'quotation',
    TITLE: 'Quotation',
    VALUE: 3,
  },
  {
    BASE_URL: 'invoice',
    TITLE: 'Invoice',
    VALUE: 4,
  },
  {
    BASE_URL: 'inventory',
    TITLE: 'Inventory',
    VALUE: 5,
  },
  {
    BASE_URL: 'scrap-management',
    TITLE: 'Scrap Management',
    VALUE: 6,
  },
  {
    BASE_URL: 'user-management',
    TITLE: 'User Management',
    VALUE: 7,
  },
  {
    BASE_URL: 'roles-setting',
    TITLE: 'Roles',
    VALUE: 8,
  },
]

export const ROLES = {
  ACCEPTED: 1,
  NOT_ACCEPT: 0,
  ADMIN: 'admin',
  CATEGORY: {
    SALE: 'sales',
    PROCUREMENT: 'procurement',
    ORGANIZATION: 'organization'
  },
  ADMIN_ACCOUNT: [
    {
      role_name: 'admin',
      role_id: 1,
    }
  ],
  CODE_HAVE_SEND_FEATURE: ['customer', 'quotation', 'invoice'],
  PERMISSION: [
    {
      id: 1,
      key: 'customer',
      code: 'customer',
      title: 'customers',
      label: 'customer',
      category: 'sales',
      icon: '/icons/role-customer.svg',
      create: 0,
      update: 0,
      delete: 0,
      send: 0,
    },
    {
      id: 2,
      key: 'quotation',
      code: 'quotation',
      title: 'quotation',
      label: 'quotation',
      category: 'sales',
      icon: '/icons/role-quotation.svg',
      create: 0,
      update: 0,
      delete: 0,
      send: 0,
    },
    {
      id: 3,
      key: 'invoice',
      code: 'invoice',
      title: 'invoice',
      label: 'invoice',
      category: 'sales',
      icon: '/icons/role-invoice.svg',
      create: 0,
      update: 0,
      delete: 0,
      send: 0,
    },
    {
      id: 4,
      key: 'scrap_management',
      code: 'scrap_management',
      title: 'scrap management',
      label: 'scrap',
      category: 'procurement',
      icon: '/icons/role-scrap.svg',
      create: 0,
      update: 0,
      delete: 0,
    },
    {
      id: 5,
      key: 'inventory',
      code: 'inventory',
      title: 'inventory',
      label: 'inventory',
      category: 'procurement',
      icon: '/icons/role-inventory.svg',
      create: 0,
      update: 0,
      delete: 0,
    },
    {
      id: 6,
      key: 'user_management',
      code: 'user_management',
      title: 'user management',
      label: 'user',
      category: 'organization',
      icon: '/icons/role-user.svg',
      create: 0,
      update: 0,
      delete: 0,
    },
    {
      id: 7,
      key: 'role_setting',
      code: 'role_setting',
      title: 'roles setting',
      label: 'role',
      category: 'organization',
      icon: '/icons/role-setting.svg',
      create: 0,
      update: 0,
      delete: 0,
    },
  ],
}

export const USER = {
  DEFAULT_AVATAR: {
    SOURCE: '/images/avatar.png',
    NAME: 'default-avatar',
  },
  AVATAR: {
    DELETE_VALUE: 1,
    DEFAULT_VALUE: 0,
    NO_PICTURE_URL: 'http://multi-contracts.api.axalize.vn/',
  }
}

export const MESSAGE = {
  ERROR: {
    DEFAULT: 'There was something wrong.',
    INFO_NO_CHANGE: 'There was no changed.',
    SELF_DELETE: 'Cannot delete your account.',
    ADMIN_DELETE: 'Cannot delete "Admin" role.',
    ADMIN_EDIT: 'Cannot change Role Name to "Admin".',
    USER_EXIST: 'Cannot delete Role with active users.',
    NO_DELETE_ID: 'Please select delete item before take action.',
    UN_SAVE_CHANGED: 'Please save your changes before take other action.',
  },
  SUCCESS: {
    CHANGE: 'Your changes had been saved.',
    CREATE: 'Create success.',
    DELETE: 'Delete success.',
    ACTION: 'Action success.',
  }
}

export const ACTIONS = {
  NAME: {
    MULTI_DELETE: 'multiDelete',
    EXPORT_CSV: 'exportCSV',
    DOWNLOAD: 'download',
    DELETE: 'delete',
    UPDATE: 'update',
    CREATE: 'create',
    EDIT: 'edit',
    SEND: 'send',
  },
  MAIN: [
    {
      action: 'multiDelete',
      label: 'delete',
      value: 1,
    },
    {
      action: 'exportCSV',
      label: 'export CSV',
      value: 2,
    },
  ],
  EXTEND: [
    {
      action: 'multiDelete',
      label: 'delete',
      value: 1,
    },
    {
      action: 'download',
      label: 'download',
      value: 2,
    },
    {
      action: 'exportCSV',
      label: 'export CSV',
      value: 3,
    },
  ],
}

export const DASHBOARD = {
  SUMMARY: [
    {
      value: '4',
      title: 'New Customers',
      iconUrl: '/icons/circle-user.svg',
      iconName: 'list'
    },
    {
      value: '150K',
      title: 'Quotation Amount (In Progress)',
      iconUrl: '/icons/circle-list.svg',
      iconName: 'list'
    },
    {
      value: '105k',
      title: 'Quotation (Completed)',
      iconUrl: '/icons/circle-list.svg',
      iconName: 'list'
    },
  ],
}

export const PAGINATION = {
  NUM_PER_PAGE: {
    LONG: 10,
    SHORT: 7,
  },
  START_PAGE: 1,
  HIDDEN: 1,
  GET_ALL_LIST: 0,
}

export const FILTER = {
  LABEL: {
    START_DATE: 'startDate',
    END_DATE: 'endDate',
  },
  DEFAULT: {
    NAME: 'latest',
    DOCUMENTS: 'pdf',
  },
  REQUEST: {
    SEARCH: 'search',
    FILTER: 'filter',
    CHANGE_PAGE: 'changePage',
  },
  HIDDEN_FILTER_OPTION_ROUTER: ['user-management', 'inventory'],
  NAME: [
    {
      value: 1,
      text: 'latest',
      filter: 'latest',
    },
    {
      value: 2,
      text: 'Alphabetical A - Z',
      filter: 'asc',
    },
    {
      value: 3,
      text: 'Alphabetical Z - A',
      filter: 'desc',
    }
  ],
  STATUS: [
    {
      value: 1,
      text: 'unpaid',
      filter: 1,
    },
    {
      value: 2,
      text: 'partial payment',
      filter: 2,
    },
    {
      value: 3,
      text: 'paid',
      filter: 3,
    },
    {
      value: 4,
      text: 'rejected',
      filter: 4,
    },
    {
      value: 5,
      text: 'cancelled',
      filter: 5,
    },
  ],
  DOCUMENTS: [
    {
      value: 1,
      text: 'PDF',
      filter: 'pdf',
    },
    {
      value: 2,
      text: 'CAD',
      filter: 'cad',
    },
    {
      value: 3,
      text: 'JPEG',
      filter: 'jpeg',
    },
    {
      value: 4,
      text: 'PNG',
      filter: 'png',
    }
  ],
  INVENTORY: [
    {
      value: 1,
      text: 'Aluminium',
      filter: 'Aluminium',
    },
    {
      value: 2,
      text: 'Glass',
      filter: 'Glass',
    },
    {
      value: 3,
      text: 'Hardware',
      filter: 'Hardware',
    },
    {
      value: 4,
      text: 'Services',
      filter: 'Services',
    }
  ],
}

export const ACTIVITY = {
  LOGS: {
    LABEL: [
      'emptyItem',
      'Customer',
      'Quotation',
      'Invoice',
      'Document',
      'Information & Notes',
    ],
    ACTION: [
      'emptyItem',
      'created',
      'save as draft',
      'uploaded',
      'deleted',
      'downloaded',
      'send to customer',
    ],
    MATERIAL_ACTION: [
      'emptyItem',
      'created',
      'edited',
      'uploaded',
      'deleted',
      'downloaded',
      'send to customer',
    ],
    ACTION_VALUE: {
      CREATE: 1,
      UPDATE: 2,
      UPLOAD: 3,
      DELETE: 4,
      DOWNLOAD: 5,
      SEND_MAIL: 6,
    },
    TYPE_VALUE: {
      CUSTOMER: 1,
      QUOTATION: 2,
      INVOICE: 3,
      DOCUMENT: 4,
      NOTE: 5,
    }
  },
  INVENTORY: {
    LABEL: [
      'emptyItem',
      'Price',
      'Coating Price',
    ],
    ACTION: [
      'emptyItem',
      'created',
      'edited',
      'deleted',
    ]
  }
}

export const STATUS = {
  QUOTATION: [
    {
      value: 0,
      label: 'empty',
      class: 'empty',
    },
    {
      value: 1,
      label: 'unpaid',
      class: 'unpaid',
    },
    {
      value: 2,
      label: 'partial payment',
      class: 'partial',
    },
    {
      value: 3,
      label: 'paid',
      class: 'paid',
    },
    {
      value: 4,
      label: 'rejected',
      class: 'rejected',
    },
    {
      value: 5,
      label: 'cancelled',
      class: 'cancelled',
    },
  ]
}

export const LINKS = {
  SUB_KEYS: {
    MATERIALS: 'materials',
    TEMPLATE: 'product-templates',
  },
  CREATE: {
    CUSTOMER: '/customers/create-customer',
    QUOTATION: '/quotation/create-quotation',
    INVOICE: '/invoice/create-invoice',
    MATERIAL: '/inventory/materials/create',
    TEMPLATE: '/inventory/product-templates/create',
    USER: '/user-management/create-user',
    ROLE: '/roles-setting/create-role',
  },
  SUB: [
    {
      key: 'materials',
      label: 'Materials'
    },
    {
      key: 'product-templates',
      label: 'Product Templates'
    },
  ]
}

export const CHATS = {
  MAX_SIZE_IN_BYTE: 20 * 1024 * 1024,
  SELECT_MESSAGE: 'select-message',
  MUTE_NOTIFY: 'mute-notify',
  CLEAR_CHAT: 'clear-chat',
  PIN_CHAT: 'pin-chat',
  UN_STAR_ALL: 'un-star-all',
  DELETE_CHAT: 'delete-chat',
  DELETE_MESSAGE: 'delete-message',
  DELETE_SELECTED_MESSAGES: 'delete-selected-messages',
  MESSAGE_IS_SENDING: 4,
  BUSINESS: 0,
  PINNED: 1,
  STARRED: 1,
  UN_PINNED: 0,
  SCROLL_UP: 1,
  SCROLL_DOWN: 2,
  FORWARDED: 1,
  NO_STARRED: 0,
  MAX_CHAT_SHOW: 11,
  SEND_MESSAGE_FAILED: 3,
  MEDIA_TYPES: ['video', 'image_video', 'audio', 'contacts'],
  MESSAGE: {
    ALL_MESS: 0,
    STARRED: 1,
  },
  SENDER: {
    ADMIN: 0,
    IS_CUSTOMER: 1,
  },
  UN_STAR_ACTION: {
    value: 3,
    action: 'un-star-all',
    label: 'Unstar all messages',
    title: 'Unstar all messages?',
    button: 'Unstar',
    icon: '/icons/star-slash.svg',
    data: [],
  },
  STATUS: [
    {
      value: 0,
      status: 'sent',
      color: '#1877DE',
      icon: <SendCheckSvg />,
    },
    {
      value: 1,
      status: 'delivered',
      color: '#1877DE',
      icon: <DeliveredCheckSvg color="#1877DE" />,
    },
    {
      value: 2,
      status: 'read',
      color: '#25D366',
      icon: <DeliveredCheckSvg color="#25D366" />,
    },
    {
      value: 3,
      status: 'failed',
      color: '#ff0000',
      icon: <FailedCircleSvg />,
    },
    {
      value: 4,
      status: 'loading',
      color: '#ff0000',
      icon: <PulsedLoading />,
    },
  ],
  ACTIONS: {
    DELETE_MESSAGE: {
      action: 'delete-message',
      label: 'Delete message',
      title: 'Delete this message?',
      button: 'Delete for me',
      icon: '/icons/brown-trash.svg',
    },
    DELETE_SELECTED_MESSAGES: {
      action: 'delete-selected-messages',
      label: 'Delete selected messages',
      title: 'Delete the selected messages?',
      button: 'Delete for me',
      icon: '/icons/brown-trash.svg',
    },
    CHATS: [
      {
        value: 0,
        action: 'select-message',
        label: 'Select messages',
        title: '',
        button: '',
        icon: '',
        data: [],
      },
      {
        value: 1,
        action: 'clear-chat',
        label: 'Clear chat',
        title: 'Clear this chat?',
        button: 'Clear for me',
        icon: '/icons/clean-chat.svg',
        data: [],
      },
      {
        value: 2,
        action: 'delete-chat',
        label: 'Delete chat',
        title: 'Delete this chat?',
        button: 'Delete for me',
        icon: '/icons/brown-trash.svg',
        data: [],
      },
    ],
    INPUT: [
      {
        value: 'document',
        icon: '/icons/document.svg',
        label: 'Document',
      },
      {
        value: 'media',
        icon: '/icons/media.svg',
        label: 'Photos & Video',
      },
    ],
    MESSAGE: [
      {
        value: 'starred',
        label: 'Mark Star',
      },
      {
        value: 'unStarred',
        label: 'Remove Star',
      },
      {
        value: 'delete',
        label: 'Delete message',
      },
    ],
    CONVERSATION: [
      {
        value: 1,
        action: 'delete-chat',
        label: 'Delete chat',
        title: 'Delete this chat?',
        button: 'Delete chat',
        icon: '/icons/brown-trash.svg',
        data: [],
      },
      {
        value: 2,
        action: 'pin-chat',
        label: 'Pin chat',
        title: '',
        button: 'P',
        icon: '/icons/brown-trash.svg',
        data: [],
      },
    ],
  },
  TYPE: [
    {
      value: 0,
      type: 'text',
      class: 'text',
      valid_type: 'text',
    },
    {
      value: 1,
      type: 'image',
      class: 'image',
      valid_type: 'jpeg, png, jpg',
    },
    {
      value: 2,
      type: 'document',
      class: 'document',
      valid_type: 'txt,pdf,ppt,doc,xls,docx,pptx,xlsx',
    },
    {
      value: 3,
      type: 'audio',
      class: 'audio',
      valid_type: 'aac,mp3,mpeg,amr,ogg',
    },
    {
      value: 4,
      type: 'video',
      class: 'video',
      valid_type: 'mp4,3gp',
    },
  ],
}
