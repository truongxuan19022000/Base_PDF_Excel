<?php

namespace App\Providers;

use App\Models\Claim;
use App\Models\Invoice;
use App\Models\Material;
use App\Models\ProductTemplate;
use App\Models\Quotation;
use App\Models\Scrap;
use App\Models\Vendor;
use App\Policies\ClaimPolicy;
use App\Policies\InvoicePolicy;
use App\Policies\MaterialPolicy;
use App\Policies\ProductTemplatePolicy;
use App\Policies\QuotationPolicy;
use App\Policies\ScrapPolicy;
use App\Policies\VendorPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;
use App\Models\Role;
use App\Models\Customer;
use App\Models\Inventory;
use App\Models\User;
use App\Policies\RolePolicy;
use App\Policies\CustomerPolicy;
use App\Policies\InventoryPolicy;
use App\Policies\UserPolicy;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        // 'App\Models\Model' => 'App\Policies\ModelPolicy',
        Role::class => RolePolicy::class,
        Customer::class => CustomerPolicy::class,
        Inventory::class => InventoryPolicy::class,
        User::class => UserPolicy::class,
        Claim::class => ClaimPolicy::class,
        Invoice::class => InvoicePolicy::class,
        Material::class => MaterialPolicy::class,
        ProductTemplate::class => ProductTemplatePolicy::class,
        Quotation::class => QuotationPolicy::class,
        Scrap::class => ScrapPolicy::class,
        Vendor::class => VendorPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     *
     * @return void
     */
    public function boot()
    {
        $this->registerPolicies();

        //
    }
}
