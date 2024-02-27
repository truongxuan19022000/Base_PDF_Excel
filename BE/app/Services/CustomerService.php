<?php

namespace App\Services;

use App\Models\Activity;
use App\Repositories\ActivityRepository;
use App\Repositories\CustomerRepository;
use App\Repositories\DocumentRepository;
use App\Repositories\InvoiceRepository;
use App\Repositories\QuotationRepository;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use App\Repositories\ClaimRepository;
use Illuminate\Support\Facades\Auth;

class CustomerService
{
    private $customerRepository;
    private $quotationRepository;
    private $invoiceRepository;
    private $documentRepository;
    private $activityRepository;
    private $claimRepository;

    public function __construct(
        CustomerRepository $customerRepository,
        QuotationRepository $quotationRepository,
        InvoiceRepository $invoiceRepository,
        DocumentRepository $documentRepository,
        ActivityRepository $activityRepository,
        ClaimRepository $claimRepository
    ) {
        $this->customerRepository = $customerRepository;
        $this->quotationRepository = $quotationRepository;
        $this->invoiceRepository = $invoiceRepository;
        $this->documentRepository = $documentRepository;
        $this->activityRepository = $activityRepository;
        $this->claimRepository = $claimRepository;
    }

    public function getCustomers($searchParams)
    {
        $paginate = true;
        if (isset($searchParams['paginate']) && $searchParams['paginate'] == 0) {
            $paginate = false;
        }
        $customers = $this->customerRepository->getCustomers($searchParams, $paginate);

        $results = [
            'customers' => $customers,
        ];

        return $results;
    }

    public function getCustomersForQuotations()
    {
        $customers = $this->customerRepository->getCustomersForQuotations();
        $results = [
            'customers' => $customers,
        ];

        return $results;
    }

    public function checkEmailExists($email)
    {
        $customer = $this->customerRepository->getCustomerInformation($email);
        return [
            'status' => !is_null($customer),
            'data' => $customer
        ];
    }

    public function createCustomer($credentials)
    {
        try {
            $customer = [
                'name' => $credentials['name'],
                'email' => $credentials['email'],
                'phone_number' => $credentials['phone_number'],
                'address' => json_encode([
                    'address_1' => $credentials['address_1'],
                    'address_2' => $credentials['address_2'],
                ]),
                'postal_code' => $credentials['postal_code'],
                'company_name' => isset($credentials['company_name']) ? $credentials['company_name'] : '',
                'status' => config('customer.status.new'),
                'created_at' => Carbon::now(),
            ];
            $result = $this->customerRepository->create($customer);

            $user = Auth::guard('api')->user();
            $activity_logs = [
                'customer_id'   => $result->id,
                'type'          => Activity::TYPE_CUSTOMER,
                'user_id'       => $user->id,
                'action_type'   => Activity::ACTION_CREATED,
                'created_at'    => $customer['created_at'],
            ];
            $this->activityRepository->create($activity_logs);

            return [
                'status' => true,
                'data' => $result
            ];
        } catch (\Exception $e) {
            Log::error('CLASS "CustomerService" FUNCTION "createCustomer" ERROR: ' . $e->getMessage());
        }
        return [
            'status' => false,
        ];
    }

    public function getCustomerDetail($customerId)
    {
        $customer = $this->customerRepository->getCustomerDetail($customerId);
        $quotations = $this->quotationRepository->getQuotationsByCustomerId($customerId);
        $invoices = $this->invoiceRepository->getInvoicesByCustomerId($customerId);
        $documents = $this->documentRepository->getDocumentsByCustomerId($customerId);
        $activities = $this->activityRepository->getActivitiesByCustomerId($customerId);
        $claims = $this->claimRepository->getClaimByCustomerId($customerId);
        $results = [
            'customer' => $customer,
            'quotations' => $quotations,
            'invoices' => $invoices,
            'documents' => $documents,
            'activities' => $activities,
            'claims' => $claims
        ];

        return $results;
    }

    public function getCustomerById($inventoryId)
    {
        return $this->customerRepository->getCustomerById($inventoryId);
    }

    public function updateCustomer($credentials)
    {
        try {
            $updateData = [
                'name' => $credentials['name'],
                'email' => $credentials['email'],
                'phone_number' => $credentials['phone_number'],
                'address' => json_encode([
                    'address_1' => $credentials['address_1'],
                    'address_2' => $credentials['address_2'],
                ]),
                'postal_code' => $credentials['postal_code'],
                'company_name' => isset($credentials['company_name']) ? $credentials['company_name'] : '',
                'status' => config('customer.status.new'),
                'status_updated_at' => now(),
                'updated_at' => now()
            ];

            $result = $this->customerRepository->update($credentials['customer_id'], $updateData);
            if (!$result) {
                return false;
            }

            $user = Auth::guard('api')->user();
            $activity_logs = [
                'customer_id'   => $credentials['customer_id'],
                'type'          => Activity::TYPE_CUSTOMER,
                'user_id'       => $user->id,
                'action_type'   => Activity::ACTION_UPDATED,
                'created_at'    => $updateData['updated_at'],
            ];
            $this->activityRepository->create($activity_logs);

            return true;
        } catch (\Exception $e) {
            Log::error('CLASS "CustomerService" FUNCTION "updateCustomer" ERROR: ' . $e->getMessage());
        }

        return false;
    }

    public function delete($customerId)
    {
        try {
            $result = $this->customerRepository->delete($customerId);
            if (!$result) {
                return false;
            }

            return true;
        } catch (\Exception $e) {
            Log::error('CLASS "CustomerService" FUNCTION "delete" ERROR: ' . $e->getMessage());
        }
        return false;
    }

    public function multiDeleteCustomer($customerId)
    {
        try {
            $result = $this->customerRepository->multiDeleteCustomer($customerId);
            if (!$result) {
                return false;
            }

            return true;
        } catch (\Exception $e) {
            Log::error('CLASS "CustomerService" FUNCTION "multiDeleteCustomer" ERROR: ' . $e->getMessage());
        }
        return false;
    }

    public function getQuotationsByCustomer($searchParams, $customerId)
    {
        $paginate = true;
        if (isset($searchParams['paginate']) && $searchParams['paginate'] == 0) {
            $paginate = false;
        }
        $quotations = $this->quotationRepository->getQuotationsByCustomer($searchParams, $paginate, $customerId);

        $results = [
            'quotations' => $quotations,
        ];

        return $results;
    }

    public function getDocumentsByCustomer($searchParams, $customerId)
    {
        $paginate = true;
        if (isset($searchParams['paginate']) && $searchParams['paginate'] == 0) {
            $paginate = false;
        }
        $documents = $this->documentRepository->getDocumentsByCustomer($searchParams, $paginate, $customerId);

        $results = [
            'documents' => $documents,
        ];

        return $results;
    }

    public function getInvoicesByCustomer($searchParams, $customerId)
    {
        $paginate = true;
        if (isset($searchParams['paginate']) && $searchParams['paginate'] == 0) {
            $paginate = false;
        }
        $invoices = $this->invoiceRepository->getInvoicesByCustomer($searchParams, $paginate, $customerId);

        $results = [
            'invoices' => $invoices,
        ];

        return $results;
    }

    public function getClaimsByCustomer($searchParams, $customerId)
    {
        $paginate = true;
        if (isset($searchParams['paginate']) && $searchParams['paginate'] == 0) {
            $paginate = false;
        }
        $invoices = $this->claimRepository->getClaimByCustomer($searchParams, $paginate, $customerId);

        $results = [
            'invoices' => $invoices,
        ];

        return $results;
    }
}


