<?php

namespace App\Services;

use App\Models\Activity;
use App\Repositories\ActivityRepository;
use App\Repositories\BillScheduleRepository;
use App\Repositories\InvoiceRepository;
use App\Repositories\QuotationRepository;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class InvoiceService
{
    private $invoiceRepository;
    private $activityRepository;
    private $billScheduleRepository;
    private $quotationRepository;

    public function __construct(
        InvoiceRepository $invoiceRepository,
        ActivityRepository $activityRepository,
        BillScheduleRepository $billScheduleRepository,
        QuotationRepository $quotationRepository
    ){
        $this->invoiceRepository = $invoiceRepository;
        $this->activityRepository = $activityRepository;
        $this->billScheduleRepository = $billScheduleRepository;
        $this->quotationRepository = $quotationRepository;
    }

    public function getInvoices($searchParams)
    {
        $paginate = true;
        if (isset($searchParams['paginate']) && $searchParams['paginate'] == 0) {
            $paginate = false;
        }
        $invoices = $this->invoiceRepository->getInvoices($searchParams,$paginate);
        $results = [
            'invoices' => $invoices
        ];

        return $results;

    }

    public function getInvoiceDetail($invoiceId)
    {
        $conditions['status'] = config('quotation.status.unpaid');
        $invoice = $this->invoiceRepository->getInvoiceDetail($invoiceId, $conditions);
        $activities = $this->activityRepository->getActivitiesByInvoiceId($invoiceId);
        $results = [
            'invoice' => $invoice,
            'activities' => $activities
        ];

        return $results;
    }

    public function getBillScheduleByInvoiceId($invoiceId)
    {
        $conditions['status'] = config('quotation.status.unpaid');
        $results = $this->invoiceRepository->getBillScheduleByInvoiceId($invoiceId, $conditions);

        return $results;
    }

    public function handleBillSchedule($credentials)
    {
        try {
            DB::beginTransaction();
            $total_amount = round(floatval($credentials['total_amount']), 2) + (round(floatval($credentials['total_amount']), 2) * 9 / 100);
            $this->invoiceRepository->update($credentials['invoice_id'], ['total_amount' => $total_amount]);
            //delete
            if (!empty($credentials['delete'])) {
                $this->billScheduleRepository->multiDeleteBillSchedule($credentials['delete']);
            }

            //create
            foreach ($credentials['create'] as $createData) {
                $createData['invoice_id'] = $credentials['invoice_id'];
                $this->billScheduleRepository->create($createData);
            }

            //update
            foreach ($credentials['update'] as $updateData) {
                $bill_schedule_id = $updateData['id'];
                unset($updateData['id']);
                $updateData['invoice_id'] = $credentials['invoice_id'];
                $this->billScheduleRepository->update($bill_schedule_id, $updateData);
            }

            $result = $this->invoiceRepository->getBillScheduleByInvoiceId($credentials['invoice_id']);
            DB::commit();
            return [
                'status' => true,
                'data' => $result
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('CLASS "InvoiceService" FUNCTION "handleBillSchedule" ERROR: ' . $e->getMessage());
            return [
                'status' => false,
            ];
        }
    }

    public function updateOrderNumber($credentials)
    {
        try {
            $result = false;
            foreach ($credentials['bill_schedules'] as $updateData) {
                $bill_schedule_id = $updateData['id'];
                unset($updateData['id']);
                $result = $this->billScheduleRepository->update($bill_schedule_id, $updateData);
            }

            return [
                'status' => true,
                'data' => $result
            ];
        } catch (\Exception $e) {
            Log::error('CLASS "InvoiceService" FUNCTION "updateOrderNumber" ERROR: ' . $e->getMessage());
            return [
                'status' => false,
            ];
        }
    }

    public function getInvoiceOverview($invoiceId)
    {
        $results = $this->invoiceRepository->getInvoiceOverview($invoiceId);
        return $results;
    }

    public function delete($invoiceId)
    {
        try {
            $result = $this->invoiceRepository->delete($invoiceId);
            if (!$result) {
                return false;
            }
            $user = Auth::guard('api')->user();
            $invoice = $this->invoiceRepository->findInvoiceDeleted($invoiceId);
            $activity_logs = [
                'customer_id' => $invoice->customer_id,
                'invoice_id'  => $invoice->id,
                'type'        => Activity::TYPE_INVOICE,
                'user_id'     => $user->id,
                'action_type' => Activity::ACTION_DELETED,
                'created_at'  => Carbon::now(),
            ];
            $this->activityRepository->create($activity_logs);

            return true;
        } catch (\Exception $e) {
            Log::error('CLASS "InvoiceService" FUNCTION "delete" ERROR: ' . $e->getMessage());
        }
        return false;
    }

    public function multiDeleteInvoice($invoiceId)
    {
        try {
            $result = $this->invoiceRepository->multiDeleteInvoice($invoiceId);
            if (!$result) {
                return false;
            }
            $user = Auth::guard('api')->user();
            $invoices = $this->invoiceRepository->findInvoiceMultiDeleted($invoiceId);
            foreach ($invoices as $invoice) {
                $activity_logs = [
                    'customer_id' => $invoice->customer_id,
                    'invoice_id'  => $invoice->id,
                    'type'        => Activity::TYPE_INVOICE,
                    'user_id'     => $user->id,
                    'action_type' => Activity::ACTION_DELETED,
                    'created_at'  => Carbon::now(),
                ];
                $this->activityRepository->create($activity_logs);
            }

            return true;
        } catch (\Exception $e) {
            Log::error('CLASS "InvoiceService" FUNCTION "multiDeleteInvoice" ERROR: ' . $e->getMessage());
        }
        return false;
    }

    public function createInvoice($credentials)
    {
        try {
            $quotation = $this->quotationRepository->getQuotationDetail($credentials['quotation_id']);
            $amount = floatval($quotation->amount) * intval($quotation->terms_of_payment_confirmation) / 100;
            $total_amount = floatval($amount) + (round(floatval($amount), 2) * 9 / 100);
            $invoice = [
                'invoice_no'   => $credentials['invoice_no'],
                'quotation_id' => $credentials['quotation_id'],
                'issue_date' => !empty($credentials['issue_date']) ? $credentials['issue_date'] : Carbon::now(),
                'total_amount' => $total_amount,
                'created_at'   => Carbon::now(),
            ];
            $result = $this->invoiceRepository->create($invoice);
            $bill_schedule_data = [
                'order_number' => 1,
                'invoice_id' => $result->id,
                'type_invoice_statement' => "To claim " . $quotation->terms_of_payment_confirmation . "% on confirmation.",
                'type_percentage' => intval($quotation->terms_of_payment_confirmation),
                'amount' => $amount,
                'created_at'   => Carbon::now(),
            ];
            $this->billScheduleRepository->create($bill_schedule_data);
            $user = Auth::guard('api')->user();
            $activity_logs = [
                'invoice_id'  => $result->id,
                'type'        => Activity::TYPE_INVOICE,
                'user_id'     => $user->id,
                'action_type' => Activity::ACTION_CREATED,
                'created_at'  => $invoice['created_at'],
            ];
            $this->activityRepository->create($activity_logs);

            return [
                'status' => true,
                'data' => $result
            ];
        } catch (\Exception $e) {
            Log::error('CLASS "InvoiceService" FUNCTION "createInvoice" ERROR: ' . $e->getMessage());
        }
        return [
            'status' => false,
        ];
    }

    public function updateInvoice($credentials)
    {
        try {
            $updateData = [
                'invoice_no'   => $credentials['invoice_no'],
                'quotation_id' => $credentials['quotation_id'],
                'issue_date' => !empty($credentials['issue_date']) ? $credentials['issue_date'] : Carbon::now(),
                'updated_at'   => Carbon::now(),
            ];

            $result = $this->invoiceRepository->update($credentials['invoice_id'], $updateData);
            if (!$result) {
                return false;
            }

            $user = Auth::guard('api')->user();
            $activity_logs = [
                'invoice_id'  => $credentials['invoice_id'],
                'type'        => Activity::TYPE_INVOICE,
                'user_id'     => $user->id,
                'action_type' => Activity::ACTION_UPDATED,
                'created_at'  => $updateData['updated_at'],
            ];
            $this->activityRepository->create($activity_logs);

            return true;
        } catch (\Exception $e) {
            Log::error('CLASS "InvoiceService" FUNCTION "updateInvoice" ERROR: ' . $e->getMessage());
        }

        return false;
    }
}


