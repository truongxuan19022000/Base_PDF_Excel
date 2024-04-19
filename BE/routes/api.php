<?php

use App\Http\Controllers\Api\Admin\AdminController;
use App\Http\Controllers\Api\Admin\AuthController as AdminAuthController;
use App\Http\Controllers\Api\Admin\ConversationController;
use App\Http\Controllers\Api\Admin\CustomerController;
use App\Http\Controllers\Api\Admin\ClaimController;
use App\Http\Controllers\Api\Admin\DocumentController;
use App\Http\Controllers\Api\Admin\MaterialController;
use App\Http\Controllers\Api\Admin\NotificationController;
use App\Http\Controllers\Api\Admin\OtherFeesController;
use App\Http\Controllers\Api\Admin\ProductTemplateController;
use App\Http\Controllers\Api\Admin\PurchaseOrderController;
use App\Http\Controllers\Api\Admin\QuotationController;
use App\Http\Controllers\Api\Admin\InvoiceController;
use App\Http\Controllers\Api\Admin\InventoryController;
use App\Http\Controllers\Api\Admin\ScrapController;
use App\Http\Controllers\Api\Admin\TermConditionsController;
use App\Http\Controllers\Api\Admin\UserController;
use App\Http\Controllers\Api\Admin\RoleController;
use App\Http\Controllers\Api\Admin\RolePermissionController;
use App\Http\Controllers\Api\Admin\MessageController;
use App\Http\Controllers\Api\Admin\ProductController;
use App\Http\Controllers\Api\Admin\ProductItemController;
use App\Http\Controllers\Api\Admin\QuotationNoteController;
use App\Http\Controllers\Api\Admin\QuotationSectionController;
use App\Http\Controllers\Api\Admin\VendorController;
use App\Http\Controllers\Api\Admin\WhatsappBusinessController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::prefix('v1')->group(function () {
    // Admin
    Route::group(['prefix' => 'admin'], function () {
        Route::post('/login', [AdminAuthController::class, 'login']);
        Route::post('/forgot-password', [AdminAuthController::class, 'resetPassword']);
        Route::post('/reset-password', [AdminAuthController::class, 'recoverPassword']);
        Route::group(['middleware' => ['assign.guard:api', 'jwt.auth']], function () {
            Route::post('/logout', [AdminAuthController::class, 'logout']);
            Route::get('/users', [AdminController::class, 'getUserList']);
            //Vendor
            Route::group(['prefix' => 'vendors'], function () {
                Route::get('/', [VendorController::class, 'getVendors']);
                Route::post('/create', [VendorController::class, 'createVendor']);
                Route::get('/{vendorId}/detail', [VendorController::class, 'getVendorDetail']);
                Route::post('/update', [VendorController::class, 'updateVendor']);
                Route::delete('/delete', [VendorController::class, 'delete']);
                Route::post('/multi-delete', [VendorController::class, 'multiDeleteVendor']);
                Route::get('/export',[VendorController::class,'exportVendors']);
            });
            // Customer
            Route::group(['prefix' => 'customers'], function () {
                Route::get('/', [CustomerController::class, 'getCustomers']);
                Route::get('/all', [CustomerController::class, 'getCustomersForQuotations']);
                Route::get('/new/count', [CustomerController::class, 'getTotalNewCustomers']);
                Route::post('/create', [CustomerController::class, 'createCustomer']);
                Route::get('/{customerId}/detail', [CustomerController::class, 'getCustomerDetail']);
                Route::get('/{customerId}/detail/quotations', [CustomerController::class, 'getQuotationsByCustomer']);
                Route::get('/{customerId}/detail/documents', [CustomerController::class, 'getDocumentsByCustomer']);
                Route::get('/{customerId}/detail/invoices', [CustomerController::class, 'getInvoicesByCustomer']);
                Route::get('/{customerId}/detail/claims', [CustomerController::class, 'getClaimsByCustomer']);
                Route::get('/{customerId}/edit', [CustomerController::class, 'edit']);
                Route::post('/update', [CustomerController::class, 'updateCustomer']);
                Route::delete('/delete', [CustomerController::class, 'delete']);
                Route::post('/multi-delete', [CustomerController::class, 'multiDeleteCustomer']);
                Route::get('/export',[CustomerController::class,'exportCustomers']);
            });

            // Claims
            Route::group(['prefix' => 'claims'], function () {
                Route::get('/', [ClaimController::class, 'getClaims']);
                Route::post('/create', [ClaimController::class, 'createClaim']);
                Route::post('/copy', [ClaimController::class, 'copyClaim']);
                Route::post('/update-claim-progress', [ClaimController::class, 'updateClaimProgress']);
                Route::post('/update-order-number', [ClaimController::class, 'updateOrderNumber']);
                Route::get('/claim-progress', [ClaimController::class, 'getClaimProgress']);
                Route::get('/{claimId}/detail', [ClaimController::class, 'getClaimDetail']);
                Route::get('/{claimId}/detail/quotations', [ClaimController::class, 'getClaimByQuotationId']);
                Route::post('/update', [ClaimController::class, 'updateClaim']);
                Route::post('/update-tax', [ClaimController::class, 'updateTax']);
                Route::delete('/delete', [ClaimController::class, 'delete']);
                Route::post('/multi-delete', [ClaimController::class, 'multiDeleteClaims']);
                Route::get('/total-revenue',[ClaimController::class, 'getTotalRevenue']);
                Route::get('/total-amount', [ClaimController::class, 'getTotalClaimAmount']);
                Route::get('/total-amount-per-month', [ClaimController::class, 'getTotalClaimAmountPerMonth']);
                Route::get('/export',[ClaimController::class, 'exportClaims']);
                Route::get('/export-pdf',[ClaimController::class, 'exportPDF']);
            });

            // Scraps
            Route::group(['prefix' => 'scraps'], function () {
                Route::get('/', [ScrapController::class, 'getScraps']);
                Route::get('/scrap-managements', [ScrapController::class, 'getScrapManagements']);
                Route::post('/create', [ScrapController::class, 'createScrap']);
                Route::get('/{scrapsId}/detail', [ScrapController::class, 'getScrapDetail']);
                Route::post('/update', [ScrapController::class, 'updateScrap']);
                Route::delete('/delete', [ScrapController::class, 'delete']);
                Route::get('/export',[ScrapController::class, 'exportScraps']);
                Route::post('/multi-delete', [ScrapController::class, 'multiDeleteScraps']);
            });

            // Quotation
            Route::group(['prefix' => 'quotations'], function () {
                Route::get('/', [QuotationController::class, 'getQuotations']);
                Route::get('/total-amount', [QuotationController::class, 'getTotalQuotationAmount']);
                Route::get('/all', [QuotationController::class, 'getAllQuotationsForInvoices']);
                Route::post('/create', [QuotationController::class, 'createQuotation']);
                Route::get('/{quotationId}/detail', [QuotationController::class, 'getQuotationDetail']);
                Route::post('/send-approve', [QuotationController::class, 'sendApproveQuotation']);
                Route::post('/approve', [QuotationController::class, 'approveQuotation']);
                Route::post('/update', [QuotationController::class, 'updateQuotation']);
                Route::post('/overview', [QuotationController::class, 'getQuotationOverview']);
                Route::delete('/delete', [QuotationController::class, 'delete']);
                Route::post('/multi-delete', [QuotationController::class, 'multiDeleteQuotation']);
                Route::get('/export',[QuotationController::class, 'exportQuotations']);
                Route::get('/estimated-revenue',[QuotationController::class, 'estimatedRevenue']);
                Route::post('/update-discount',[QuotationController::class, 'updateDiscount']);
                Route::get('/export-pdf', [QuotationController::class, 'exportPDF']);
            });

            // Quotation notes
            Route::group(['prefix' => 'quotation-notes'], function () {
                Route::get('/', [QuotationNoteController::class, 'getQuotationNotes']);
                Route::post('/handle', [QuotationNoteController::class, 'handleQuotationNotes']);
                Route::delete('/delete-all', [QuotationNoteController::class, 'deleteAllQuotationNotes']);
            });

            // Other Fees
            Route::group(['prefix' => 'other-fees'], function () {
                Route::get('/', [OtherFeesController::class, 'getOtherFees']);
                Route::post('/update-order-number', [OtherFeesController::class, 'updateOrderNumber']);
                Route::post('/handle', [OtherFeesController::class, 'handleOtherFees']);
                Route::delete('/delete-all', [OtherFeesController::class, 'deleteAllOtherFees']);
            });

            // Terms & Conditions
            Route::group(['prefix' => 'term-conditions'], function () {
                Route::get('/', [TermConditionsController::class, 'getTermConditions']);
                Route::post('/update-order-number', [TermConditionsController::class, 'updateOrderNumber']);
                Route::post('/handle', [TermConditionsController::class, 'handleTermConditions']);
                Route::delete('/delete-all', [TermConditionsController::class, 'deleteAllTermAndConditions']);
            });

            // Quotation-Sections
            Route::group(['prefix' => 'quotation-sections'], function () {
                Route::get('/', [QuotationSectionController::class, 'getQuotationSections']);
                Route::post('/handle', [QuotationSectionController::class, 'handleQuotationSections']);
                Route::post('/create', [QuotationSectionController::class, 'createQuotationSection']);
                Route::post('/update', [QuotationSectionController::class, 'updateQuotationSection']);
                Route::post('/update-order-number', [QuotationSectionController::class, 'updateOrderNumber']);
                Route::delete('/delete', [QuotationSectionController::class, 'delete']);

                // Products
                Route::group(['prefix' => 'products'], function () {
                    Route::post('/create', [ProductController::class, 'createProduct']);
                    Route::post('/update', [ProductController::class, 'updateProduct']);
                    Route::post('/detail', [ProductController::class, 'getProductDetail']);
                    Route::post('/update-order-number', [ProductController::class, 'updateOrderNumber']);
                    Route::delete('/delete', [ProductController::class, 'deleteProduct']);

                    // items
                    Route::group(['prefix' => 'items'], function () {
                        Route::post('/create', [ProductItemController::class, 'createProductItem']);
                        Route::post('/update', [ProductItemController::class, 'updateProductItem']);
                        Route::delete('/delete', [ProductItemController::class, 'deleteProductItem']);
                        Route::post('/calculate-amount', [ProductItemController::class, 'updateCalculate']);
                    });
                    // material-item
                    Route::group(['prefix' => 'material-item'], function () {
                        Route::post('/create', [ProductItemController::class, 'createMaterialItem']);
                        Route::post('/update', [ProductItemController::class, 'updateMaterialItem']);
                        Route::post('/delete', [ProductItemController::class, 'deleteMaterialItem']);
                    });
                });
            });

            // Invoice
            Route::group(['prefix' => 'invoices'], function () {
                Route::get('/', [InvoiceController::class, 'getInvoices']);
                Route::post('/create', [InvoiceController::class, 'createInvoice']);
                Route::post('/update', [InvoiceController::class, 'updateInvoice']);
                Route::post('/update-tax', [InvoiceController::class, 'updateTax']);
                Route::get('{invoiceId}/detail', [InvoiceController::class, 'getInvoiceDetail']);
                Route::get('{invoiceId}/bill-schedule', [InvoiceController::class, 'getBillScheduleByInvoiceId']);
                Route::post('{invoiceId}/bill-schedule/handle', [InvoiceController::class, 'handleBillSchedule']);
                Route::post('{invoiceId}/bill-schedule/update-order-number', [InvoiceController::class, 'updateOrderNumber']);
                Route::post('/overview', [InvoiceController::class, 'getInvoiceOverview']);
                Route::delete('/delete', [InvoiceController::class, 'delete']);
                Route::post('/multi-delete', [InvoiceController::class, 'multiDeleteInvoice']);
                Route::get('/export',[InvoiceController::class, 'exportInvoices']);
                Route::get('/export-pdf',[InvoiceController::class, 'exportPDF']);
            });

            // Document
            Route::group(['prefix' => 'documents'], function () {
                Route::get('/', [DocumentController::class, 'getDocuments']);
                Route::post('/create', [DocumentController::class, 'createDocument']);
                Route::post('/detail', [DocumentController::class, 'getDocumentDetail']);
                Route::delete('/delete', [DocumentController::class, 'delete']);
                Route::post('/multi-delete', [DocumentController::class, 'multiDeleteDocument']);
                Route::get('/export', [DocumentController::class, 'exportDocuments']);
                Route::get('/download', [DocumentController::class, 'downloadDocuments']);
            });

            // Inventory
            Route::group(['prefix' => 'inventories'], function () {
                Route::get('/', [InventoryController::class, 'getInventories']);
                Route::post('/create', [InventoryController::class, 'createInventory']);
                Route::get('/{inventoryId}/edit', [InventoryController::class, 'edit']);
                Route::post('/update', [InventoryController::class, 'updateInventory']);
                Route::delete('/delete', [InventoryController::class, 'delete']);
                Route::post('/multi-delete', [InventoryController::class, 'multiDeleteInventory']);
                Route::get('/export',[InventoryController::class, 'exportInventories']);
            });

            // Purchase Order
            Route::group(['prefix' => 'purchase-orders'], function () {
                Route::get('/', [PurchaseOrderController::class, 'getPurchaseOrders']);
                Route::post('/create', [PurchaseOrderController::class, 'createPurchaseOrder']);
                Route::get('/{purchaseOrderId}/edit', [PurchaseOrderController::class, 'edit']);
                Route::post('/update', [PurchaseOrderController::class, 'updatePurchaseOrder']);
                Route::delete('/delete', [PurchaseOrderController::class, 'delete']);
                Route::post('/multi-delete', [PurchaseOrderController::class, 'multiDeletePurchaseOrder']);
                Route::post('/handle-items', [PurchaseOrderController::class, 'handlePurchaseOrderItems']);
                Route::post('/update-shipping', [PurchaseOrderController::class, 'updateShippingFee']);
                Route::post('/update-discount', [PurchaseOrderController::class, 'updateDiscountAmount']);
                Route::post('/update-tax', [PurchaseOrderController::class, 'updateTax']);
                Route::get('/export-pdf', [PurchaseOrderController::class, 'exportPDF']);
                Route::get('/export',[PurchaseOrderController::class, 'exportPurchaseOrder']);
                Route::post('/update-status',[PurchaseOrderController::class, 'updateStatus']);
            });

            // Material
            Route::group(['prefix' => 'materials'], function () {
                Route::get('/', [MaterialController::class, 'getMaterials']);
                Route::get('/all', [MaterialController::class, 'getMaterialsForQuotation']);
                Route::post('/create', [MaterialController::class, 'createMaterial']);
                Route::get('/{materialId}/edit', [MaterialController::class, 'edit']);
                Route::post('/update', [MaterialController::class, 'updateMaterial']);
                Route::delete('/delete', [MaterialController::class, 'delete']);
                Route::post('/multi-delete', [MaterialController::class, 'multiDeleteMaterial']);
                Route::get('/export',[MaterialController::class, 'exportMaterials']);
                Route::post('/import',[MaterialController::class, 'importMaterials']);
            });

            // Notifications
            Route::group(['prefix' => 'notifications'], function () {
                Route::get('/', [NotificationController::class, 'getNotifications']);
                Route::post('/update', [NotificationController::class, 'updateNotification']);
            });

            // Product Material
            Route::group(['prefix' => 'product-templates'], function () {
                Route::get('/', [ProductTemplateController::class, 'getProductTemplates']);
                Route::get('/all', [ProductTemplateController::class, 'getProductTemplatesForQuotations']);
                Route::post('/create', [ProductTemplateController::class, 'createProductTemplate']);
                Route::post('/update', [ProductTemplateController::class, 'updateProductTemplate']);
                Route::get('/detail', [ProductTemplateController::class, 'getProductTemplateDetail']);
                Route::delete('/delete', [ProductTemplateController::class, 'delete']);
                Route::post('/multi-delete', [ProductTemplateController::class, 'multiDeleteProductTemplate']);
                Route::get('/export', [ProductTemplateController::class, 'exportProductTemplates']);
            });

            // User
            Route::group(['prefix' => 'users'], function () {
                Route::get('/', [UserController::class, 'getUsers']);
                Route::post('/create', [UserController::class, 'createUser']);
                Route::get('/{userId}/edit', [UserController::class, 'edit']);
                Route::post('/update', [UserController::class, 'updateUser']);
                Route::delete('/delete', [UserController::class, 'delete']);
                Route::post('/multi-delete', [UserController::class, 'multiDeleteUser']);
                Route::get('/profile', [UserController::class, 'getUserInformation']);
                Route::get('/export',[UserController::class, 'exportUsers']);
            });

            // Rule
            Route::group(['prefix' => 'roles'], function () {
                Route::get('/', [RoleController::class, 'getRoles']);
                Route::post('/create', [RoleController::class, 'createRole']);
                Route::get('/{roleId}/edit', [RoleController::class, 'edit']);
                Route::post('/update', [RoleController::class, 'updateRole']);
                Route::delete('/delete', [RoleController::class, 'delete']);
                Route::get('/role-list', [RoleController::class, 'getRoleList']);
                Route::get('/permission-list', [RoleController::class, 'getPermissions']);
                Route::post('/multi-delete', [RoleController::class, 'multiDeleteRole']);
                Route::get('/export',[RoleController::class, 'exportRoles']);
            });
        });

        // WhatsApp
        Route::group(['prefix' => 'whatsapp'], function () {
            Route::get('webhook', [MessageController::class, 'verifyWebhook']);
            Route::post('webhook', [MessageController::class, 'handleWebhook']);

            Route::group(['middleware' => ['assign.guard:api', 'jwt.auth']], function () {
                //Message
                Route::group(['prefix' => 'messages'], function () {
                    Route::post('send-message', [MessageController::class, 'sendMessage']);
                    Route::delete('delete', [MessageController::class, 'delete']);
                    Route::post('multi-delete', [MessageController::class, 'multiDeleteMessage']);
                    Route::post('starred', [MessageController::class, 'starred']);
                    Route::post('multi-starred', [MessageController::class, 'multiStarredMessage']);
                    Route::post('multi-unstar-messages', [MessageController::class, 'multiUnstarMessages']);
                    Route::get('list-message-with-customer', [MessageController::class, 'getMessagesWithCustomer']);
                    Route::get('list-message-with-conversation', [MessageController::class, 'getMessagesWithConversation']);
                    Route::get('list-message-with-starred', [MessageController::class, 'getStarredMessagesOfConversations']);
                    Route::get('media/{mediaId}', [MessageController::class, 'getMediaUploadWhatsApp']);
                });

                //Conversations
                Route::group(['prefix' => 'conversations'], function () {
                    Route::get('/', [ConversationController::class, 'getConversations']);
                    Route::get('/unread-message', [ConversationController::class, 'getUnreadConversations']);
                    Route::get('/latest-unread-message', [ConversationController::class, 'getLatestUnreadMessage']);
                    Route::get('/search', [ConversationController::class, 'searchConversations']);
                    Route::post('pin', [ConversationController::class, 'pinConversation']);
                    Route::post('/clean', [ConversationController::class, 'cleanConversation']);
                    Route::delete('/delete', [ConversationController::class, 'delete']);
                });

                //Business Account
                Route::group(['prefix' => 'business-accounts'], function () {
                    Route::get('/', [WhatsappBusinessController::class, 'getListWhatsappBusiness']);
                    Route::post('/create', [WhatsappBusinessController::class, 'createWhatsappBusiness']);
                    Route::get('/{businessId}/edit', [WhatsappBusinessController::class, 'edit']);
                    Route::post('/update', [WhatsappBusinessController::class, 'updateWhatsappBusiness']);
                    Route::post('/switch-status', [WhatsappBusinessController::class, 'switchStatusWhatsappBusiness']);
                    Route::delete('/delete', [WhatsappBusinessController::class, 'delete']);
                    Route::post('/multi-delete', [WhatsappBusinessController::class, 'multiDeleteWhatsappBusiness']);
                });
            });
        });
    });
});
