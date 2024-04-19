<?php

namespace App\Services;

use App\Exports\ExportClaim;
use App\Models\Activity;
use App\Repositories\ActivityRepository;
use App\Repositories\ClaimLogsRepository;
use App\Repositories\ClaimProgressRepository;
use App\Repositories\CustomerRepository;
use App\Repositories\ClaimRepository;
use App\Repositories\OtherFeeRepository;
use App\Repositories\ProductRepository;
use App\Repositories\QuotationSectionRepository;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Facades\Excel;
use ZipArchive;

class ClaimService
{
    private $claimRepository;
    private $customerRepository;
    private $activityRepository;
    private $claimProgressRepository;
    private $claimLogsRepository;
    /**
     * @var QuotationSectionRepository
     */
    private $quotationSectionRepository;
    /**
     * @var ProductRepository
     */
    private $productRepository;
    /**
     * @var OtherFeeRepository
     */
    private $otherFeeRepository;

    public function __construct(
        ClaimRepository $claimRepository,
        CustomerRepository $customerRepository,
        ActivityRepository $activityRepository,
        ClaimProgressRepository $claimProgressRepository,
        ClaimLogsRepository $claimLogsRepository,
        QuotationSectionRepository $quotationSectionRepository,
        ProductRepository $productRepository,
        OtherFeeRepository $otherFeeRepository
    )
    {
        $this->claimRepository = $claimRepository;
        $this->customerRepository = $customerRepository;
        $this->activityRepository = $activityRepository;
        $this->claimProgressRepository = $claimProgressRepository;
        $this->claimLogsRepository = $claimLogsRepository;
        $this->quotationSectionRepository = $quotationSectionRepository;
        $this->productRepository = $productRepository;
        $this->otherFeeRepository = $otherFeeRepository;
    }

    public function getClaims($searchParams)
    {
        $paginate = true;
        if (isset($searchParams['paginate']) && $searchParams['paginate'] == 0) {
            $paginate = false;
        }

        $claims = $this->claimRepository->getClaims($searchParams, $paginate);
        $new_claims = $this->claimRepository->countNewClaim();
        $total_revenue = $this->getTotalRevenue();
        $results = [
            'claims' => $claims,
            'total_revenue' => $total_revenue,
            'new_claims' => $new_claims
        ];

        return $results;
    }

    public function getClaimById($claimId)
    {
        $claim = $this->claimRepository->getClaimDetail($claimId);
        $activities = $this->activityRepository->getActivities(['claim_id' => $claimId]);
        $results = [
            'claim' => $claim,
            'activities' => $activities
        ];

        return $results;
    }

    public function getClaimProgress($credentials)
    {
        try {
            $results = $this->claimProgressRepository->getClaimProgress($credentials);
            return $results;
        } catch (\Exception $e) {
            Log::error('CLASS "ClaimService" FUNCTION "getClaimProgress" ERROR: ' . $e->getMessage());
        }
        return false;
    }

    public function getClaimByQuotationId($claim_id)
    {
        $results = $this->claimRepository->getClaimByQuotationId($claim_id);
        if (isset($results->claim_progress)) {
            foreach ($results->quotation->quotation_sections as $quotation_section) {
                if (isset($quotation_section->products)) {
                    foreach ($quotation_section->products as $product) {
                        $product_claim_progress = [];
                        foreach ($results->claim_progress as $claim_progress_item) {
                            if ($claim_progress_item->product_id === $product->id) {
                                $product_claim_progress[] = $claim_progress_item;
                            }
                        }
                        usort($product_claim_progress, function ($a, $b) {
                            return $b->id - $a->id;
                        });
                        $product->setAttribute('claim_progress', $product_claim_progress);
                    }
                }
            }

            if (isset($results->quotation->other_fees)) {
                foreach ($results->quotation->other_fees as $other_fee) {
                    $other_claim_progress = [];
                    foreach ($results->claim_progress as $claim_progress_item) {
                        if ($claim_progress_item->other_fee_id === $other_fee->id) {
                            $other_claim_progress[] = $claim_progress_item;
                        }
                    }
                    usort($other_claim_progress, function ($a, $b) {
                        return $b->id - $a->id;
                    });
                    $other_fee->setAttribute('claim_progress', $other_claim_progress);
                }
            }

            if ($results->quotation->discount) {
                $discount_claim_progress = [];
                foreach ($results->claim_progress as $claim_progress_item) {
                    if (!empty($claim_progress_item->quotation_id)) {
                        $discount_claim_progress[] = $claim_progress_item;
                    }
                }
                usort($discount_claim_progress, function ($a, $b) {
                    return $b->id - $a->id;
                });
                $results->quotation->discount->setAttribute('claim_progress', $discount_claim_progress);
            }
        }
        return $results;

    }

    public function delete($claimId)
    {
        try {
            DB::beginTransaction();
            $claim = $this->claimRepository->getClaimDetail($claimId);
            $this->claimRepository->update($claim->copied_claim_id, ['is_copied' => 0]);

            $result = $this->claimRepository->delete($claimId);
            if (!$result) {
                return false;
            }

            $user = Auth::guard('api')->user();
            $activity_logs = [
                'customer_id' => $claim->customer_id,
                'claim_id' => $claimId,
                'type' => Activity::TYPE_CLAIM,
                'user_id' => $user->id,
                'action_type' => Activity::ACTION_DELETED,
                'created_at' => Carbon::now(),
            ];
            $this->activityRepository->create($activity_logs);
            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('CLASS "ClaimService" FUNCTION "delete" ERROR: ' . $e->getMessage());
        }
        return false;
    }

    public function multiDeleteClaims($claimIds)
    {
        try {
            DB::beginTransaction();
            foreach ($claimIds as $id) {
                $claim = $this->claimRepository->getClaimDetail($id);
                $this->claimRepository->update($claim->copied_claim_id, ['is_copied' => 0]);
                $user = Auth::guard('api')->user();
                $activity_logs = [
                    'customer_id' => $claim->customer_id,
                    'claim_id' => $id,
                    'type' => Activity::TYPE_CLAIM,
                    'user_id' => $user->id,
                    'action_type' => Activity::ACTION_DELETED,
                    'created_at' => Carbon::now(),
                ];
                $this->activityRepository->create($activity_logs);
            }
            $result = $this->claimRepository->multiDeleteClaims($claimIds);
            if (!$result) {
                return false;
            }

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('CLASS "ClaimService" FUNCTION "multiDeleteClaim" ERROR: ' . $e->getMessage());
        }
        return false;
    }

    public function createClaim($credentials)
    {
        try {
            DB::beginTransaction();
            $user = Auth::guard('api')->user();
            $claim = [
                'claim_no' => $credentials['claim_no'],
                'quotation_id' => $credentials['quotation_id'],
                'issue_date' => !empty($credentials['issue_date']) ? $credentials['issue_date'] : Carbon::now(),
                'created_at' => Carbon::now(),
            ];
            $result = $this->claimRepository->create($claim);

            // make claim progress by quotation
            $quotations = $this->claimRepository->getClaimByQuotationId($result->id)->quotation;
            $activity_logs = [
                'customer_id' => $quotations->customer_id,
                'claim_id' => $result->id,
                'type' => Activity::TYPE_CLAIM,
                'user_id' => $user->id,
                'action_type' => Activity::ACTION_CREATED,
                'created_at' => Carbon::now()
            ];
            $this->activityRepository->create($activity_logs);
            foreach ($quotations->quotation_sections as $quotation_section) {
                foreach ($quotation_section->products as $product) {
                    // create product
                    $product_progress_data = [
                        'quotation_section_id' => $quotation_section->id,
                        'product_id' => $product->id,
                        'claim_number' => $credentials['claim_no'],
                        'claim_percent' => 0,
                        'current_amount' => 0,
                        'previous_amount' => 0,
                        'accumulative_amount' => 0,
                        'created_at' => Carbon::now()
                    ];
                    $claim_progress = $this->claimProgressRepository->create($product_progress_data);
                    $claim_log_data = [
                        'claim_id' => $result->id,
                        'claim_progress_id' => $claim_progress->id,
                        'created_at' => Carbon::now()
                    ];
                    $this->claimLogsRepository->create($claim_log_data);
                }
            }
            foreach ($quotations->other_fees as $fee) {
                $fee_data = [
                    'other_fee_id' => $fee->id,
                    'claim_number' => $credentials['claim_no'],
                    'claim_percent' => 0,
                    'current_amount' => 0,
                    'previous_amount' => 0,
                    'accumulative_amount' => 0,
                    'created_at' => Carbon::now(),
                ];
                $claim_progress = $this->claimProgressRepository->create($fee_data);
                $claim_log_data = [
                    'claim_id' => $result->id,
                    'claim_progress_id' => $claim_progress->id
                ];
                $this->claimLogsRepository->create($claim_log_data);
            }
            //discount
            $discount_data = [
                'quotation_id' => $quotations->id,
                'claim_number' => $credentials['claim_no'],
                'claim_percent' => 0,
                'current_amount' => 0,
                'previous_amount' => 0,
                'accumulative_amount' => 0,
                'created_at' => Carbon::now(),
            ];
            $claim_progress = $this->claimProgressRepository->create($discount_data);
            $claim_log_data = [
                'claim_id' => $result->id,
                'claim_progress_id' => $claim_progress->id
            ];
            $this->claimLogsRepository->create($claim_log_data);

            DB::commit();
            return [
                'status' => true,
                'data' => $result
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('CLASS "ClaimService" FUNCTION "createClaim" ERROR: ' . $e->getMessage());
        }
        return [
            'status' => false,
        ];
    }

    public function copyClaim($credentials)
    {
        try {
            DB::beginTransaction();
            $user = Auth::guard('api')->user();
            $claim = [
                'claim_no' => $credentials['claim_no'],
                'quotation_id' => $credentials['quotation_id'],
                'copied_claim_id' => $credentials['claim_id'],
                'issue_date' => !empty($credentials['issue_date']) ? $credentials['issue_date'] : Carbon::now(),
                'created_at' => Carbon::now(),
            ];
            $result = $this->claimRepository->create($claim);
            $this->claimRepository->update($credentials['claim_id'], ['is_copied' => 1]);
            $claim = $this->getClaimByQuotationId($credentials['claim_id']);

            $activity_logs = [
                'customer_id' => $claim->quotation->customer_id,
                'claim_id' => $result->id,
                'type' => Activity::TYPE_CLAIM,
                'user_id' => $user->id,
                'action_type' => Activity::ACTION_CREATED,
                'created_at' => Carbon::now()
            ];
            $this->activityRepository->create($activity_logs);
            // make claim progress by quotation
            $claim_logs = $this->claimLogsRepository->getClaimLogByClaimId($credentials['claim_id']);
            $claim_log_data = [
                'claim_id' => $result->id,
            ];
            // create old claim progress
            foreach ($claim_logs as $claim_log) {
                $claim_progress = $this->claimProgressRepository->getClaimProgressByClaimLog($claim_log->claim_progress_id);
                if (!empty($claim_progress->product_id)) {
                    $claim_log_data['claim_progress_id'] = $claim_progress->id;
                    $this->claimLogsRepository->create($claim_log_data);
                } else {
                    $claim_log_data['claim_progress_id'] = $claim_progress->id;
                    $this->claimLogsRepository->create($claim_log_data);
                }

            }

            // create new claim progress
            if (isset($claim)) {
                foreach ($claim->quotation->quotation_sections as $quotation_section) {
                    if (isset($quotation_section->products)) {
                        foreach ($quotation_section->products as $product) {
                            if (isset($product->claim_progress)) {
                                $claim_progress = $product->claim_progress[0];
                                $product_progress_data = [
                                    'quotation_section_id' => $claim_progress->quotation_section_id,
                                    'product_id' => $claim_progress->product_id,
                                    'claim_number' => $credentials['claim_no'],
                                    'claim_percent' => $claim_progress['claim_percent'],
                                    'current_amount' => 0,
                                    'previous_amount' => $claim_progress['accumulative_amount'],
                                    'accumulative_amount' => $claim_progress['accumulative_amount'],
                                    'created_at' => Carbon::now()
                                ];
                                $new_claim_progress = $this->claimProgressRepository->create($product_progress_data);
                                $claim_log_data['claim_progress_id'] = $new_claim_progress->id;
                                $this->claimLogsRepository->create($claim_log_data);
                            }
                        }
                    }
                }
                if (isset($claim->quotation->other_fees)) {
                    foreach ($claim->quotation->other_fees as $other_fee) {
                        if (isset($other_fee->claim_progress)) {
                            $claim_progress = $other_fee->claim_progress[0];
                            $fee_data = [
                                'other_fee_id' => $claim_progress->other_fee_id,
                                'claim_number' => $credentials['claim_no'],
                                'claim_percent' => $claim_progress['claim_percent'],
                                'current_amount' => 0,
                                'previous_amount' => $claim_progress['accumulative_amount'],
                                'accumulative_amount' => $claim_progress['accumulative_amount'],
                                'created_at' => Carbon::now(),
                            ];
                            $claim_progress = $this->claimProgressRepository->create($fee_data);
                            $claim_log_data['claim_progress_id'] = $claim_progress->id;
                            $this->claimLogsRepository->create($claim_log_data);
                        }
                    }
                }
                if ($claim->quotation->discount && $claim->quotation->discount->claim_progress) {
                    $claim_progress = $claim->quotation->discount->claim_progress[0];
                    $discount_data = [
                        'quotation_id' => $claim->quotation->id,
                        'claim_number' => $credentials['claim_no'],
                        'claim_percent' => $claim_progress['claim_percent'],
                        'current_amount' => 0,
                        'previous_amount' => $claim_progress['accumulative_amount'],
                        'accumulative_amount' => $claim_progress['accumulative_amount'],
                        'created_at' => Carbon::now(),
                    ];
                    $claim_progress = $this->claimProgressRepository->create($discount_data);
                    $claim_log_data = [
                        'claim_id' => $result->id,
                        'claim_progress_id' => $claim_progress->id
                    ];
                    $this->claimLogsRepository->create($claim_log_data);
                }
            }
            DB::commit();
            return [
                'status' => true,
                'data' => $result
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('CLASS "ClaimService" FUNCTION "createClaim" ERROR: ' . $e->getMessage());
        }
        return [
            'status' => false,
        ];
    }

    public function updateClaim($credentials)
    {
        try {
            DB::beginTransaction();
            $updateData = [
                'claim_no' => $credentials['claim_no'],
                'quotation_id' => $credentials['quotation_id'],
                'issue_date' => $credentials['issue_date'],
                'updated_at' => Carbon::now(),
            ];
            if (!empty($credentials['payment_received_date'])) {
                $updateData['payment_received_date'] = $credentials['payment_received_date'];
                $updateData['actual_paid_amount'] = isset($credentials['actual_paid_amount']) ? $credentials['actual_paid_amount'] : 0;
                $updateData['status'] = config('claim.status.paid');
            }

            $result = $this->claimRepository->update($credentials['claim_id'], $updateData);
            $user = Auth::guard('api')->user();
            $activity_logs = [
                'claim_id' => $credentials['claim_id'],
                'type' => Activity::TYPE_CLAIM,
                'user_id' => $user->id,
                'action_type' => Activity::ACTION_UPDATED,
                'created_at' => Carbon::now(),
            ];
            $this->activityRepository->create($activity_logs);
            if (!$result) {
                return false;
            }
            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('CLASS "ClaimService" FUNCTION "updateClaim" ERROR: ' . $e->getMessage());
        }

        return false;
    }

    public function updateTax($credentials)
    {
        try {
            DB::beginTransaction();
            $claim = $this->claimRepository->getClaimDetail($credentials['claim_id']);
            $actual_paid_amount = ROUND((floatval($claim->subtotal_from_claim ?? 0) + (floatval($claim->subtotal_from_claim ?? 0) * intval($credentials['gst_rates'] ?? 9) / 100)), 2);
            $updateData = [
                'tax' => $credentials['gst_rates'],
                'actual_paid_amount' => $actual_paid_amount ?? 0,
                'updated_at' => Carbon::now(),
            ];

            $result = $this->claimRepository->update($credentials['claim_id'], $updateData);
            $user = Auth::guard('api')->user();
            $activity_logs = [
                'claim_id' => $credentials['claim_id'],
                'type' => Activity::TYPE_CLAIM,
                'user_id' => $user->id,
                'action_type' => Activity::ACTION_UPDATED,
                'created_at' => Carbon::now(),
            ];
            $this->activityRepository->create($activity_logs);
            if (!$result) {
                return false;
            }
            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('CLASS "ClaimService" FUNCTION "updateTax" ERROR: ' . $e->getMessage());
        }

        return false;
    }

    public function updateClaimProgress($credentials)
    {
        try {
            DB::beginTransaction();
            $data = [
                'claim_number' => $credentials['claim_number'],
                'claim_percent' => $credentials['claim_percent'],
                'current_amount' => $credentials['current_amount'],
                'previous_amount' => $credentials['previous_amount'],
                'accumulative_amount' => $credentials['accumulative_amount'],
                'updated_at' => Carbon::now()
            ];
            $result = $this->claimProgressRepository->update($credentials['claim_progress_id'], $data);
            if (!$result) {
                return false;
            }
            $actual_paid_amount = ROUND((floatval($credentials['subtotal_from_claim']) + (floatval($credentials['subtotal_from_claim']) * intval($credentials['tax'] ?? 9) / 100)), 2);
            $this->claimRepository->update($credentials['claim_id'], [
                'subtotal_from_claim' => $credentials['subtotal_from_claim'],
                'accumulative_from_claim' => $credentials['accumulative_from_claim'],
                'actual_paid_amount' => $actual_paid_amount
            ]);
            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('CLASS "ClaimService" FUNCTION "updateClaimProgress" ERROR: ' . $e->getMessage());
        }

        return false;
    }

    public function handleTotalFromClaim($credentials)
    {
        $claim_id = $credentials['claim_id'];
        $claim = $this->getClaimByQuotationId($claim_id);
        if (isset($claim)) {
            $total_from_claim = 0;
            foreach ($claim->quotation->quotation_sections as $quotation_section) {
                if (isset($quotation_section->products)) {
                    foreach ($quotation_section->products as $product) {
                        if (isset($product->claim_progress)) {
                            $total_from_claim += round(floatval($product->claim_progress[0]->current_amount), 2);
                        }
                    }
                }
            }
            if (isset($claim->quotation->other_fees)) {
                foreach ($claim->quotation->other_fees as $other_fee) {
                    if (isset($other_fee->claim_progress)) {
                        $total_from_claim += round(floatval($other_fee->claim_progress[0]->current_amount), 2);
                    }
                }
            }
            $total_claim = round(floatval($total_from_claim), 2);
            $this->claimRepository->update($claim_id, [
                'subtotal_from_claim' => $total_claim,
                'accumulative_from_claim' => $credentials['accumulative_from_claim']
            ]);
        }
    }

    public function checkExistClaim($quotationId)
    {
        try {
            $result = $this->claimRepository->checkExistClaim($quotationId);
            if (!$result) {
                return false;
            }
            return $result;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('CLASS "ClaimService" FUNCTION "checkExistClaim" ERROR: ' . $e->getMessage());
        }

        return false;
    }

    public function getTotalRevenue($time = 'this_month')
    {
        list($start, $end) = getFirstAndLastDay($time);
        $paid_revenue = $this->claimRepository->getTotalRevenue($start, $end, true);
        $pending_revenue = $this->claimRepository->getTotalRevenue($start, $end, false);

        return [
            'paid_revenue' => $paid_revenue,
            'pending_revenue' => $pending_revenue
        ];
    }

    public function getTotalClaimAmount($time = 'this_month')
    {
        list($start, $end) = getFirstAndLastDay($time);
        $result = $this->claimRepository->getTotalClaimAmount($start, $end);

        return $result;
    }

    public function getTotalClaimAmountPerMonth($time = 'this_year')
    {
        list($start, $end) = getFirstAndLastDay($time);
        $total_amounts = $this->claimRepository->getTotalClaimAmountPerMonth($start, $end);
        $result = [];

        for ($month = 1; $month <= 12; $month++) {
            $result[$month] = 0;
        }

        foreach ($total_amounts as $amount) {
            $result[$amount->month] = $amount->total_amount;
        }

        return $result;
    }

    public function updateOrderNumber($credentials)
    {
        try {
            DB::beginTransaction();
            if (!empty($credentials['quotation_sections'])) {
                foreach ($credentials['quotation_sections'] as $updateData) {
                    $this->quotationSectionRepository->update($updateData['quotation_section_id'], ['claim_order_number' => $updateData['claim_order_number']]);
                }
            }
            if (!empty($credentials['products'])) {
                foreach ($credentials['products'] as $updateData) {
                    $this->productRepository->update($updateData['product_id'], ['claim_order_number' => $updateData['claim_order_number']]);
                }
            }
            if (!empty($credentials['other_fees'])) {
                foreach ($credentials['other_fees'] as $updateData) {
                    $this->otherFeeRepository->update($updateData['other_fee_id'], ['claim_order_number' => $updateData['claim_order_number']]);
                }
            }

            DB::commit();
            return [
                'status' => true,
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('CLASS "ClaimService" FUNCTION "updateOrderNumber" ERROR: ' . $e->getMessage());
            return [
                'status' => false,
            ];
        }
    }

    public function handleMultiCsvDownload($credentials)
    {
        try {
            // make file csv from claim
            foreach ($credentials['claim_ids'] as $claim_id) {
                $claim = $claim = $this->claimRepository->getClaimDetail($claim_id);
                $claim_no = replace_special_characters($claim->claim_no);
                $export = new ExportClaim($claim_id);
                $csvFilePath = "csv" . '/' . $claim_no . '.csv';
                Excel::store($export, $csvFilePath, 'local');
            }

            //make file rar
            $zip = new ZipArchive();
            $zipFileName = storage_path('app/claim-csv.zip');
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
            Log::error('CLASS "ClaimService" FUNCTION "handleMultiCsvDownload" ERROR: ' . $e->getMessage());
            return false;
        }
    }

}
