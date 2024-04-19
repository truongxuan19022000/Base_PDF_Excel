<?php

use App\Http\Controllers\Exports\ExportMaterialController;
use App\Http\Controllers\Exports\ExportProductTemplateController;
use App\Http\Controllers\Exports\ExportPurchaseOrderController;
use App\Http\Controllers\Exports\ExportCustomerController;
use App\Http\Controllers\Exports\ExportDocumentController;
use App\Http\Controllers\Exports\ExportRoleController;
use App\Http\Controllers\Exports\ExportScrapController;
use App\Http\Controllers\Exports\ExportUserController;
use App\Http\Controllers\Exports\ExportVendorController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Exports\ExportQuotationController;
use App\Http\Controllers\Exports\ExportInvoiceController;
use App\Http\Controllers\Exports\ExportClaimController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});

Route::group(['prefix' => 'export-csv'], function () {
    Route::get('/customer/{customerIds}', [ExportCustomerController::class, 'exportCSV']);
    Route::get('/document/{customerId}/{documentIds}', [ExportDocumentController::class, 'exportCSV']);
    Route::get('/product-template/{productTemplateIds}', [ExportProductTemplateController::class, 'exportCSV']);
    Route::get('/material/{materialIds}', [ExportMaterialController::class, 'exportCSV']);
    Route::get('/quotation/{quotationIds}', [ExportQuotationController::class, 'exportCSV']);
    Route::get('/quotation/{customerId}/{quotationIds}', [ExportQuotationController::class, 'exportCSV']);
    Route::get('/invoice/{customerId}/{invoiceIds}', [ExportInvoiceController::class, 'exportCSV']);
    Route::get('/claim/{customerId}/{claimIds}', [ExportClaimController::class, 'exportCSV']);
    Route::get('/invoice/{invoiceIds}', [ExportInvoiceController::class, 'exportCSV']);
    Route::get('/claim/{claimIds}', [ExportClaimController::class, 'exportCSV']);
    Route::get('/user/{userIds}', [ExportUserController::class, 'exportCSV']);
    Route::get('/role/{roleIds}', [ExportRoleController::class, 'exportCSV']);
    Route::get('/vendor/{vendorIds}', [ExportVendorController::class, 'exportCSV']);
    Route::get('/scrap/{scrapIds}', [ExportScrapController::class, 'exportCSV']);
    Route::get('/purchase-order/{purchaseOrderIds}', [ExportPurchaseOrderController::class, 'exportCSV']);

});

Route::group(['prefix' => 'export-pdf'], function () {
    Route::get('/quotation/{quotationIds}', [ExportQuotationController::class, 'exportPDF']);
    Route::get('/invoice/{invoiceId}', [ExportInvoiceController::class, 'exportPDF']);
    Route::get('/claim/{claimId}', [ExportClaimController::class, 'exportPDF']);
    Route::get('/purchase-order/{purchaseOrderId}', [ExportPurchaseOrderController::class, 'exportPDF']);

});

Route::group(['prefix' => 'download'], function () {
    Route::get('/documents/{documentIds}', [ExportDocumentController::class, 'downloadDocuments'])->name('download.documents');
});
