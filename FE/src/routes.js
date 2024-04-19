import { lazy } from "react"

const Vendor = lazy(() => import('./views/Vendors'))
const Scrap = lazy(() => import('./views/Scrap'))
const Chats = lazy(() => import('./views/Chats'))
const Login = lazy(() => import('./views/Login'))
const Roles = lazy(() => import('./views/Roles'))
const Claims = lazy(() => import('./views/Claims'))
const Invoice = lazy(() => import('./views/Invoice'))
const EditRole = lazy(() => import('./views/EditRole'))
const EditUser = lazy(() => import('./views/EditUser'))
const Quotation = lazy(() => import('./views/Quotation'))
const Dashboard = lazy(() => import('./views/Dashboard'))
const Customers = lazy(() => import('./views/Customers'))
const Materials = lazy(() => import('./views/Materials'))
const CreateUser = lazy(() => import('./views/CreateUser'))
const CreateRole = lazy(() => import('./views/CreateRole'))
const EditScrap = lazy(() => import('./views/Scrap/EditScrap'))
const TemplateForm = lazy(() => import('./views/TemplateForm'))
const InvoiceDetail = lazy(() => import('./views/InvoiceDetail'))
const ResetPassword = lazy(() => import('./views/ResetPassword'))
const CreateInvoice = lazy(() => import('./views/CreateInvoice'))
const InventoryForm = lazy(() => import('./views/InventoryForm'))
const CreateCustomer = lazy(() => import('./views/CreateCustomer'))
const CustomerDetail = lazy(() => import('./views/CustomerDetail'))
const ForgotPassword = lazy(() => import('./views/ForgotPassword'))
const UserManagement = lazy(() => import('./views/UserManagement'))
const QuotationDetail = lazy(() => import('./views/QuotationDetail'))
const CreateQuotation = lazy(() => import('./views/CreateQuotation'))
const ProductTemplate = lazy(() => import('./views/ProductTemplates'))
const VendorDetail = lazy(() => import('./views/Vendors/VendorDetail'))
const ClaimActions = lazy(() => import('./views/ClaimDetail/ClaimActions'))
const PurchaseOrderDetail = lazy(() => import('./views/Vendors/PurchaseOrderDetail'))

const routes = [
  // dashboard
  { path: '/', exact: true, name: 'Dashboard', component: Dashboard },

  // authentication
  { path: '/login', name: 'Login', component: Login },
  { path: '/forgot-password', name: 'Forgot Password', component: ForgotPassword },
  { path: '/reset-password', name: 'Reset Password', component: ResetPassword },

  // customer
  { path: '/customers/create-customer', name: 'Create Customer', component: CreateCustomer },
  { path: '/customers/chats/:id', name: 'Chats', component: Chats },
  { path: '/customers/chats', name: 'Chats', component: Chats },
  { path: '/customers/:id', name: 'Customer Detail', component: CustomerDetail },
  { path: '/customers', name: 'Customers', component: Customers },

  // quotation
  { path: '/quotation/create-quotation', name: 'Quotation Create', component: CreateQuotation },
  { path: '/quotation/:id', name: 'Quotation Detail', component: QuotationDetail },
  { path: '/quotation', name: 'Quotation', component: Quotation },

  // invoice
  { path: '/invoice/create-invoice', name: 'Invoice Create', component: CreateInvoice },
  { path: '/invoice/:id', name: 'Invoice Detail', component: InvoiceDetail },
  { path: '/invoice', name: 'Invoice', component: Invoice },

  // inventory
  { path: '/inventory/product-templates/create', name: 'Create Product Templates', component: TemplateForm },
  { path: '/inventory/product-templates/:id', name: 'Edit Product Templates', component: TemplateForm },
  { path: '/inventory/product-templates', name: 'Product Templates', component: ProductTemplate },
  { path: '/inventory/materials/create', name: 'Create Material Item', component: InventoryForm },
  { path: '/inventory/materials/:id', name: 'Edit Inventory Item', component: InventoryForm },
  { path: '/inventory/materials', name: 'Materials', component: Materials },
  { path: '/inventory/vendors/:vendorId/purchase-order/:purchaseId', name: 'Purchase Order Detail', component: PurchaseOrderDetail },
  { path: '/inventory/vendors/create', name: 'Vendor Create', component: VendorDetail },
  { path: '/inventory/vendors/:id', name: 'Vendor Detail', component: VendorDetail },
  { path: '/inventory/vendors', name: 'Vendors', component: Vendor },

  // user
  { path: '/user-management/create-user', name: 'Create User', component: CreateUser },
  { path: '/user-management/:id', name: 'Edit User', component: EditUser },
  { path: '/user-management', name: 'User Management', component: UserManagement },

  // role
  { path: '/roles-setting/create-role', name: 'Roles Setting', component: CreateRole },
  { path: '/roles-setting/:id', name: 'Roles Editing', component: EditRole },
  { path: '/roles-setting', name: 'Roles', component: Roles },

  // scrap-management
  { path: '/scrap-management/:id', name: 'Scrap Management', component: EditScrap },
  { path: '/scrap-management', name: 'Scrap Management', component: Scrap },

  //claims
  { path: '/claims/create', name: 'Create Claim', component: ClaimActions },
  { path: '/claims/:id', name: 'Create Claim', component: ClaimActions },
  { path: '/claims', name: 'Claims Management', component: Claims },
]

export default routes
