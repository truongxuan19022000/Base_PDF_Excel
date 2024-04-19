<?php

namespace App\Repositories;
use App\Models\Vendor;

class VendorRepository
{
    public function create(array $request)
    {
        return Vendor::create($request);
    }

    public function getVendors($searchParams, $paginate = true)
    {
        $sql = Vendor::select([
                'id',
                'vendor_name',
                'company_name',
                'phone',
                'email',
                'address',
                'postal_code',
                'created_at',
            ])->where(function ($query) use ($searchParams) {
                if (isset($searchParams['search'])) {
                    $query->where('vendor_name', 'LIKE', '%'. $searchParams['search'] .'%')
                        ->orWhere('phone', 'LIKE', '%' . $searchParams['search'] . '%')
                        ->orWhere('email', 'LIKE', '%' . $searchParams['search'] . '%');
                }
            });

        if (isset($searchParams['vendor_id']) && is_array($searchParams['vendor_id'])) {
            $sql->whereIn('vendors.id', $searchParams['vendor_id']);
        }

        if (isset($searchParams['start_date'])) {
            $sql->whereDate('created_at', '>=', $searchParams['start_date']);
        }
        if (isset($searchParams['end_date'])) {
            $sql->whereDate('created_at', '<=', $searchParams['end_date']);
        }

        if (isset($searchParams['sort_name']) && in_array($searchParams['sort_name'], ['asc', 'desc'])) {
            $sql->orderBy('vendor_name', $searchParams['sort_name']);
        } else {
            $sql->orderBy('created_at', 'DESC');
        }

        if (!$paginate) {
            return $sql->get();
        }

        return $sql->paginate(config('common.paginate'));
    }

    public function getVendorsForQuotations()
    {
        return Vendor::select(['id', 'name'])->get();
    }

    public function getVendorInformation($email)
    {
        return Vendor::where('email', $email)->first();
    }

    public function getVendorDetail($vendorId)
    {
        return Vendor::select([
            'id',
            'vendor_name',
            'company_name',
            'phone',
            'email',
            'address',
            'postal_code',
            'created_at',
        ])->where('id', $vendorId)->first();
    }

    public function getVendorById($vendorId)
    {
        return Vendor::select([
                'id',
                'vendor_name',
                'company_name',
                'phone',
                'email',
                'address',
                'created_at',
            ])->where('id', $vendorId)->first();
    }

    public function getVendorByPhone($vendorPhone)
    {
        return Vendor::select([
                'id',
                'vendor_name',
                'company_name',
                'phone',
                'email',
                'address',
            ])->where('phone_number', $vendorPhone)->first();
    }

    public function update($vendorId, $updateData)
    {
        return Vendor::where('id', $vendorId)->update($updateData);
    }

    public function delete($vendorId)
    {
        return Vendor::where('id', $vendorId)->delete();
    }

    public function multiDeleteVendor($vendorId)
    {
        return Vendor::whereIn('id', $vendorId)->delete();
    }
}
