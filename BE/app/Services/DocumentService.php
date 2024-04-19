<?php

namespace App\Services;

use App\Models\Activity;
use App\Repositories\ActivityRepository;
use App\Repositories\DocumentRepository;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use ZipArchive;

class DocumentService
{
    private $documentRepository;
    private $activityRepository;

    public function __construct(
        DocumentRepository $documentRepository,
        ActivityRepository $activityRepository
    ){
        $this->documentRepository = $documentRepository;
        $this->activityRepository = $activityRepository;
    }

    public function getDocuments($searchParams)
    {
        $documents = $this->documentRepository->getDocuments($searchParams);
        $results = [
            'documents' => $documents,
        ];

        return $results;
    }

    public function getDocumentDetail($documentId)
    {
        $document = $this->documentRepository->getDocumentDetail($documentId);
        $results = [
            'document' => $document,
        ];

        return $results;
    }

    public function delete($documentId)
    {
        try {
            $result = $this->documentRepository->delete($documentId);
            if (!$result) {
                return false;
            }
            $user = Auth::guard('api')->user();
            $document = $this->documentRepository->findDocumentDeleted($documentId);
            $activity_logs = [
                'customer_id' => $document->customer_id,
                'document_id' => $document->id,
                'type'        => Activity::TYPE_DOCUMENT,
                'user_id'     => $user->id,
                'action_type' => Activity::ACTION_DELETED,
                'created_at'  => Carbon::now(),
            ];
            $this->activityRepository->create($activity_logs);

            return true;
        } catch (\Exception $e) {
            Log::error('CLASS "DocumentService" FUNCTION "delete" ERROR: ' . $e->getMessage());
        }
        return false;
    }

    public function multiDeleteDocument($documentId)
    {
        try {
            $result = $this->documentRepository->multiDeleteDocument($documentId);
            if (!$result) {
                return false;
            }
            $user = Auth::guard('api')->user();
            $documents = $this->documentRepository->findDocumentMultiDeleted($documentId);
            foreach ($documents as $document) {
                $activity_logs = [
                    'customer_id'  => $document->customer_id,
                    'document_id' => $document->id,
                    'type'         => Activity::TYPE_DOCUMENT,
                    'user_id'      => $user->id,
                    'action_type'  => Activity::ACTION_DELETED,
                    'created_at'   => Carbon::now(),
                ];
                $this->activityRepository->create($activity_logs);
            }

            return true;
        } catch (\Exception $e) {
            Log::error('CLASS "DocumentService" FUNCTION "multiDeleteDocument" ERROR: ' . $e->getMessage());
        }
        return false;
    }

    public function createDocument($credentials)
    {
        try {
            $document = [
                'document_name' => $credentials['document_name'],
                'customer_id'   => $credentials['customer_id'],
                'quotation_id'   => $credentials['quotation_id'],
                'file'          => $credentials['file'],
                'file_type'     => $credentials['file_type'],
                'created_at'    => Carbon::now(),
            ];
            $result = $this->documentRepository->create($document);

            $user = Auth::guard('api')->user();
            $activity_logs = [
                'customer_id'  => $document['customer_id'],
                'quotation_id'  => $document['quotation_id'],
                'document_id'  => $result->id,
                'type'         => Activity::TYPE_DOCUMENT,
                'user_id'      => $user->id,
                'action_type'  => Activity::ACTION_CREATED,
                'created_at'   => $document['created_at'],
            ];
            $this->activityRepository->create($activity_logs);

            return [
                'status' => true,
                'data' => $result
            ];
        } catch (\Exception $e) {
            Log::error('CLASS "DocumentService" FUNCTION "createDocument" ERROR: ' . $e->getMessage());
        }
        return [
            'status' => false,
        ];
    }

    public function updateDocument($credentials)
    {
        try {
            $updateData = [
                'document_name' => $credentials['document_name'],
                'customer_id'   => $credentials['customer_id'],
                'file'          => $credentials['file'],
                'file_type'     => $credentials['file_type'],
                'updated_at'    => Carbon::now(),
            ];

            $result = $this->documentRepository->update($credentials['document_id'], $updateData);
            if (!$result) {
                return false;
            }

            $user = Auth::guard('api')->user();
            $activity_logs = [
                'customer_id' => $updateData['customer_id'],
                'document_id' => $credentials['document_id'],
                'type'        => Activity::TYPE_DOCUMENT,
                'user_id'     => $user->id,
                'action_type' => Activity::ACTION_UPDATED,
                'created_at'  => $updateData['updated_at'],
            ];
            $this->activityRepository->create($activity_logs);

            return true;
        } catch (\Exception $e) {
            Log::error('CLASS "DocumentService" FUNCTION "updateDocument" ERROR: ' . $e->getMessage());
        }

        return false;
    }

    public function handleMultiDownload($credentials)
    {
        try {
            $documents = $this->documentRepository->getDocumentsForDownload($credentials);
            //make file rar
            $zip = new ZipArchive();
            $zipFileName = storage_path('app/documents.zip');
            if ($zip->open($zipFileName, ZipArchive::CREATE | ZipArchive::OVERWRITE) === true) {
                foreach ($documents as $document) {
                    $documentFile = "public/documents/" . basename($document->file);
                    $contents = Storage::path(($documentFile));
                    $zip->addFile($contents, basename($contents));
                }
                $zip->close();
            }

            return $zipFileName;
        } catch (\Exception $e) {
            Log::error('CLASS "DocumentService" FUNCTION "handleMultiDownload" ERROR: ' . $e->getMessage());
            return false;
        }
    }
}


