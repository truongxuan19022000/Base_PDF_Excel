<?php

namespace App\Services;

use App\Models\Activity;
use App\Repositories\ActivityRepository;
use App\Repositories\CustomerRepository;
use App\Repositories\QuotationRepository;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class QuotationService
{
    private $quotationRepository;
    private $activityRepository;
    private $customerRepository;

    public function __construct(
        QuotationRepository $quotationRepository,
        CustomerRepository $customerRepository,
        ActivityRepository $activityRepository
    ) {
        $this->quotationRepository = $quotationRepository;
        $this->customerRepository = $customerRepository;
        $this->activityRepository = $activityRepository;
    }

    public function getQuotations($searchParams)
    {
        $paginate = true;
        if (isset($searchParams['paginate']) && $searchParams['paginate'] == 0) {
            $paginate = false;
        }
        $quotations = $this->quotationRepository->getQuotations($searchParams,$paginate);
        $estimatedRevenue = $this->getEstimatedRevenue();
        $numberQuotationsNew = $this->quotationRepository->countQuotationsNew();

        $results = [
            'estimated_revenue' => $estimatedRevenue,
            'number_quotation_new' => $numberQuotationsNew,
            'quotations' => $quotations
        ];

        return $results;
    }

    public function getAllQuotationsForInvoices($conditions)
    {
        $quotations = $this->quotationRepository->getAllQuotationsForInvoices($conditions);
        $results = [
            'quotations' => $quotations
        ];

        return $results;
    }

    public function getQuotationById($quotationId)
    {
        $quotation = $this->quotationRepository->getQuotationDetail($quotationId);
        $activities_quotation = $this->activityRepository->getActivitiesByQuotationId($quotationId)->toArray();
        $activities_note = $this->activityRepository->getActivitiesByQuotationandNote($quotationId)->toArray();
        $activities = array_merge($activities_quotation,$activities_note);

        $results = [
            'quotation' => $quotation,
            'activities' => $activities,
        ];

        return $results;
    }

    public function getQuotationOverview($quotationId)
    {
        $quotation = $this->quotationRepository->getQuotationDetail($quotationId);

        $results = [
            'quotation' => $quotation,
        ];

        return $results;
    }

    public function delete($quotationId)
    {
        try {
            $result = $this->quotationRepository->delete($quotationId);
            if (!$result) {
                return false;
            }
            $user = Auth::guard('api')->user();
            $quotation = $this->quotationRepository->findQuotationDeleted($quotationId);
            $activity_logs = [
                'customer_id'  => $quotation->customer_id,
                'quotation_id' => $quotation->id,
                'type'         => Activity::TYPE_QUOTATION,
                'user_id'      => $user->id,
                'action_type'  => Activity::ACTION_DELETED,
                'created_at'   => Carbon::now(),
            ];
            $this->activityRepository->create($activity_logs);

            return true;
        } catch (\Exception $e) {
            Log::error('CLASS "QuotationService" FUNCTION "delete" ERROR: ' . $e->getMessage());
        }
        return false;
    }

    public function multiDeleteQuotation($quotationId)
    {
        try {
            $result = $this->quotationRepository->multiDeleteQuotation($quotationId);
            if (!$result) {
                return false;
            }
            $user = Auth::guard('api')->user();
            $quotations = $this->quotationRepository->findQuotationMultiDeleted($quotationId);
            foreach ($quotations as $quotation) {
                $activity_logs = [
                    'customer_id'  => $quotation->customer_id,
                    'quotation_id' => $quotation->id,
                    'type'         => Activity::TYPE_QUOTATION,
                    'user_id'      => $user->id,
                    'action_type'  => Activity::ACTION_DELETED,
                    'created_at'   => Carbon::now(),
                ];
                $this->activityRepository->create($activity_logs);
            }

            return true;
        } catch (\Exception $e) {
            Log::error('CLASS "QuotationService" FUNCTION "multiDeleteQuotation" ERROR: ' . $e->getMessage());
        }
        return false;
    }

    public function createQuotation($credentials)
    {
        try {
            DB::beginTransaction();
            $user = Auth::guard('api')->user();
            if (empty($credentials['customer_id'])) {
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
                $customer = $this->customerRepository->create($customer);
                $activity_logs = [
                    'customer_id'   => $customer->id,
                    'type'          => Activity::TYPE_CUSTOMER,
                    'user_id'       => $user->id,
                    'action_type'   => Activity::ACTION_CREATED,
                    'created_at'    => $customer['created_at'],
                ];
                $this->activityRepository->create($activity_logs);
            }

            $quotation = [
                'customer_id' => !empty($customer->id) ? $customer->id : $credentials['customer_id'],
                'reference_no' => $credentials['reference_no'],
                'status' => config('quotation.status.unpaid'),
                'issue_date' => $credentials['issue_date'],
                'valid_till' => $credentials['valid_till'],
                'terms_of_payment_confirmation' => $credentials['terms_of_payment_confirmation'],
                'terms_of_payment_balance' => $credentials['terms_of_payment_balance'],
                'description' => $credentials['description'],
                'created_at' => Carbon::now(),
            ];
            $result = $this->quotationRepository->create($quotation);

            $activity_logs = [
                'customer_id'  => $quotation['customer_id'],
                'quotation_id' => $result->id,
                'type'         => Activity::TYPE_QUOTATION,
                'user_id'      => $user->id,
                'action_type'  => Activity::ACTION_CREATED,
                'created_at'   => $quotation['created_at'],
            ];
            $this->activityRepository->create($activity_logs);
            DB::commit();
            return [
                'status' => true,
                'data' => $result
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('CLASS "QuotationService" FUNCTION "createQuotation" ERROR: ' . $e->getMessage());
        }
        return [
            'status' => false,
        ];
    }

    public function updateQuotation($credentials)
    {
        try {
            DB::beginTransaction();
            $updateData = [
                'reference_no' => $credentials['reference_no'],
                'customer_id' => $credentials['customer_id'],
                'status' => $credentials['payment_status'],
                'issue_date' => $credentials['issue_date'],
                'valid_till' => $credentials['valid_till'],
                'terms_of_payment_confirmation' => $credentials['terms_of_payment_confirmation'],
                'terms_of_payment_balance' => $credentials['terms_of_payment_balance'],
                'description' => $credentials['description'],
                'updated_at' => Carbon::now(),
            ];

            $result = $this->quotationRepository->update($credentials['quotation_id'], $updateData);
            if (!$result) {
                return false;
            }

            $user = Auth::guard('api')->user();
            $activity_logs = [
                'customer_id'  => $updateData['customer_id'],
                'quotation_id' => $credentials['quotation_id'],
                'type'         => Activity::TYPE_QUOTATION,
                'user_id'      => $user->id,
                'action_type'  => Activity::ACTION_UPDATED,
                'created_at'   => $updateData['updated_at'],
            ];
            $this->activityRepository->create($activity_logs);
            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('CLASS "QuotationService" FUNCTION "updateQuotation" ERROR: ' . $e->getMessage());
        }

        return false;
    }

    public function getEstimatedRevenue($time = 'this_month')
    {
        list($start, $end) = getFirstAndLastDay($time);
        $unpaid_revenue = $this->quotationRepository->estimatedRevenue($start, $end, 'unpaid');
        $partial_payment_revenue = $this->quotationRepository->estimatedRevenue($start, $end, 'partial_payment');
        $paid_revenue = $this->quotationRepository->estimatedRevenue($start, $end, 'paid');
        $rejected_revenue = $this->quotationRepository->estimatedRevenue($start, $end, 'rejected');
        $cancelled_revenue = $this->quotationRepository->estimatedRevenue($start, $end, 'cancelled');

        return [
            'unpaid'          => $unpaid_revenue,
            'partial_payment' => $partial_payment_revenue,
            'paid'            => $paid_revenue,
            'rejected'        => $rejected_revenue,
            'cancelled'       => $cancelled_revenue
        ];
    }

    public function updateDiscount($credentials) {
        try {
            $quotationId = $credentials['quotation_id'];
            unset($credentials['quotation_id']);
            $result = $this->quotationRepository->update($quotationId, $credentials);
            if (!$result) {
                return false;
            }
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('CLASS "QuotationService" FUNCTION "updateDiscount" ERROR: ' . $e->getMessage());
        }
    }
}
