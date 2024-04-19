<?php

namespace App\Services;

use App\Events\NotificationPusherEvent;
use App\Exports\ExportQuotation;
use App\Models\Activity;
use App\Repositories\ActivityRepository;
use App\Repositories\CustomerRepository;
use App\Repositories\NotificationRepository;
use App\Repositories\OtherFeeRepository;
use App\Repositories\QuotationNoteRepository;
use App\Repositories\QuotationRepository;
use App\Repositories\TermConditionRepository;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Excel as ExcelExcel;
use Maatwebsite\Excel\Facades\Excel;
use ZipArchive;

class QuotationService
{
    private $quotationRepository;
    private $activityRepository;
    private $customerRepository;
    private $quotationNoteRepository;
    private $otherFeeRepository;
    private $termConditionRepository;
    private $notificationRepository;

    public function __construct(
        QuotationRepository $quotationRepository,
        CustomerRepository $customerRepository,
        ActivityRepository $activityRepository,
        QuotationNoteRepository $quotationNoteRepository,
        OtherFeeRepository $otherFeeRepository,
        TermConditionRepository $termConditionRepository,
        NotificationRepository $notificationRepository
    ) {
        $this->quotationRepository = $quotationRepository;
        $this->customerRepository = $customerRepository;
        $this->activityRepository = $activityRepository;
        $this->quotationNoteRepository = $quotationNoteRepository;
        $this->otherFeeRepository = $otherFeeRepository;
        $this->termConditionRepository = $termConditionRepository;
        $this->notificationRepository = $notificationRepository;
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

    public function getAllQuotationsForInvoices($searchParams)
    {
        $quotations = $this->quotationRepository->getAllQuotationsForInvoices($searchParams);
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
                'status' => config('quotation.status.draft'),
                'issue_date' => $credentials['issue_date'],
                'valid_till' => $credentials['valid_till'],
                'terms_of_payment_confirmation' => $credentials['terms_of_payment_confirmation'],
                'terms_of_payment_balance' => $credentials['terms_of_payment_balance'],
                'description' => $credentials['description'],
                'quotation_description' => $credentials['quotation_description'],
                'created_at' => Carbon::now(),
            ];
            $result = $this->quotationRepository->create($quotation);
            // data default quotation note
            $quotation_note_data = config("quotation.info_note_data");
            foreach ($quotation_note_data as $note_data) {
                $data = [
                  'quotation_id' => $result->id,
                  'order' => $note_data['order'],
                  'description' => $note_data['description'],
                  'type' => $note_data['type'],
                ];
                $this->quotationNoteRepository->create($data);

            }
            // data default quotation note
            $other_fee_data = config("quotation.other_fee_data");
            foreach ($other_fee_data as $fee_data) {
                $dataCreate = [
                  'quotation_id' => $result->id,
                  'order_number' => $fee_data['order_number'],
                  'description' => $fee_data['description'],
                  'type' => $fee_data['type'],
                  'amount' => $fee_data['amount'],
                ];
                $this->otherFeeRepository->create($dataCreate);

            }
            // data default term & conditions
            $term_condition_data = config("quotation.term_condition_data");
            foreach ($term_condition_data as $data) {
                $dataCreate = [
                  'quotation_id' => $result->id,
                  'order_number' => $data['order_number'],
                  'description' => $data['description'],
                ];
                $this->termConditionRepository->create($dataCreate);

            }
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
                'status' => $credentials['status'],
                'issue_date' => $credentials['issue_date'],
                'valid_till' => $credentials['valid_till'],
                'terms_of_payment_confirmation' => $credentials['terms_of_payment_confirmation'],
                'terms_of_payment_balance' => $credentials['terms_of_payment_balance'],
                'description' => $credentials['description'],
                'quotation_description' => $credentials['quotation_description'],
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

    public function updateStatusQuotation($credentials)
    {
        try {
            DB::beginTransaction();
            $updateData = [
                'status' => config('quotation.status.pending_approval'),
                'updated_at' => Carbon::now(),
            ];

            $result = $this->quotationRepository->update($credentials['quotation_id'], $updateData);
            if (!$result) {
                return false;
            }
            $user = Auth::guard('api')->user();
            $activity_logs = [
                'quotation_id' => $credentials['quotation_id'],
                'type'         => Activity::TYPE_QUOTATION,
                'user_id'      => $user->id,
                'action_type'  => Activity::ACTION_SEND_APPROVAL,
                'created_at'   => $updateData['updated_at'],
            ];
            $this->activityRepository->create($activity_logs);

            $notificationData = [
                'user_id' => $user->id,
                'quotation_id' => $credentials['quotation_id'],
                'type' => config('quotation.status.pending_approval'),
                'status' => config('common.notification_status.unread'),
                'created_at' => Carbon::now(),
            ];
            $data = $this->notificationRepository->create($notificationData, $credentials['quotation_id']);
            $notification = $this->notificationRepository->getNotificationDetail($data->id);
            $notificationData['reference_no'] = $notification->reference_no;
            $notificationData['name'] = $notification->name;
            $notificationData['username'] = $notification->username;
            event(New NotificationPusherEvent($notificationData));

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('CLASS "QuotationService" FUNCTION "updateStatusQuotation" ERROR: ' . $e->getMessage());
        }

        return false;
    }

    public function updateApproveQuotation($credentials)
    {
        try {
            DB::beginTransaction();
            $updateData = [
                'status' => $credentials['status'],
                'reject_reason' => isset($credentials['reject_reason']) ? $credentials['reject_reason'] : null,
                'updated_at' => Carbon::now(),
            ];

            $result = $this->quotationRepository->update($credentials['quotation_id'], $updateData);
            if (!$result) {
                return false;
            }

            $user = Auth::guard('api')->user();
            $actionType = (($credentials['status'] === config("quotation.status.approved"))
                ? Activity::ACTION_APPROVE_QUOTE
                : (($credentials['status'] === config("quotation.status.rejected"))
                    ? Activity::ACTION_REJECT_QUOTE : Activity::ACTION_CANCEL_QUOTE));
            $activity_logs = [
                'quotation_id' => $credentials['quotation_id'],
                'type'         => Activity::TYPE_QUOTATION,
                'user_id'      => $user->id,
                'action_type'  => $actionType,
                'created_at'   => $updateData['updated_at'],
            ];
            $this->activityRepository->create($activity_logs);

            $notificationData = [
                'user_id' => $user->id,
                'quotation_id' => $credentials['quotation_id'],
                'type' => $credentials['status'],
                'status' => config('common.notification_status.unread'),
                'created_at' => Carbon::now(),
            ];
            $data = $this->notificationRepository->create($notificationData, $credentials['quotation_id']);
            $notification = $this->notificationRepository->getNotificationDetail($data->id);
            $notificationData['reference_no'] = $notification->reference_no;
            $notificationData['name'] = $notification->name;
            $notificationData['username'] = $notification->username;
            event(New NotificationPusherEvent($notificationData));

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('CLASS "QuotationService" FUNCTION "updateApproveQuotation" ERROR: ' . $e->getMessage());
        }

        return false;
    }

    public function getEstimatedRevenue($time = 'this_month')
    {
        list($start, $end) = getFirstAndLastDay($time);
        $draft_revenue = $this->quotationRepository->estimatedRevenue($start, $end, 'draft');
        $pending_approval_revenue = $this->quotationRepository->estimatedRevenue($start, $end, 'pending_approval');
        $approved_revenue = $this->quotationRepository->estimatedRevenue($start, $end, 'approved');
        $rejected_revenue = $this->quotationRepository->estimatedRevenue($start, $end, 'rejected');
        $cancelled_revenue = $this->quotationRepository->estimatedRevenue($start, $end, 'cancelled');

        return [
            'draft'          => $draft_revenue,
            'pending_approval' => $pending_approval_revenue,
            'approved'            => $approved_revenue,
            'rejected'        => $rejected_revenue,
            'cancelled'       => $cancelled_revenue
        ];
    }

    public function getTotalQuotationAmount($time = 'this_month')
    {
        list($start, $end) = getFirstAndLastDay($time);
        $result = $this->quotationRepository->getTotalQuotationAmount($start, $end);

        return $result;
    }

    public function update($credentials) {
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
            Log::error('CLASS "QuotationService" FUNCTION "update" ERROR: ' . $e->getMessage());
        }
    }

    public function updateDiscount($credentials) {
        try {
            $discountData = [
                'discount_type' => isset($credentials['discount_type']) ? $credentials['discount_type'] : 1,
                'discount_amount' => $credentials['discount_amount'],
                'price' => $credentials['grand_total'],
            ];
            $result = $this->quotationRepository->update($credentials['quotation_id'], $discountData);
            if (!$result) {
                return false;
            }

            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('CLASS "QuotationService" FUNCTION "updateDiscount" ERROR: ' . $e->getMessage());
        }
    }

    public function handleMultiCsvDownload($credentials)
    {
        try {
            // make file csv from quotation
            foreach ($credentials['quotation_ids'] as $quotation_id) {
                $credentials['quotation_id'] = $quotation_id;
                $quotation = $this->getQuotationById($credentials['quotation_id'])['quotation'];
                $reference_no = replace_special_characters($quotation->reference_no);
                $export = new ExportQuotation($credentials['quotation_id']);
                $csvFilePath = "csv" . '/' . $reference_no . '.csv';
                Excel::store($export, $csvFilePath, 'local');
            }

            //make file rar
            $zip = new ZipArchive();
            $zipFileName = storage_path('app/quotation-csv.zip');
            if ($zip->open($zipFileName, ZipArchive::CREATE | ZipArchive::OVERWRITE) === true) {
                $files = Storage::files('csv');
                foreach ($files as $file) {
                    $contents = Storage::path($file);
                    $zip->addFile($contents, basename($contents));
                }
                $zip->close();
                Storage::deleteDirectory('csv');
            }

            return $zipFileName;
        } catch (\Exception $e) {
            Log::error('CLASS "QuotationService" FUNCTION "handleMultiCsvDownload" ERROR: ' . $e->getMessage());
            return false;
        }
    }
}
