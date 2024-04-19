<?php

namespace App\Repositories;
use App\Models\Customer;

class CustomerRepository
{
    public function create(array $request)
    {
        return Customer::create($request);
    }

    public function getCustomers($searchParams, $paginate = true)
    {
        $sql = Customer::select([
                'id',
                'name',
                'phone_number',
                'email',
                'status',
                'created_at',
                'status_updated_at'
            ])->where(function ($query) use ($searchParams) {
                if (isset($searchParams['search'])) {
                    $query->where('name', 'LIKE', '%'. $searchParams['search'] .'%')
                        ->orWhere('phone_number', 'LIKE', '%' . $searchParams['search'] . '%')
                        ->orWhere('email', 'LIKE', '%' . $searchParams['search'] . '%')
                        ->orWhere('status', 'LIKE', '%' . $searchParams['search'] . '%');
                }
            });

        if (isset($searchParams['customer_id']) && is_array($searchParams['customer_id'])) {
            $sql->whereIn('customers.id', $searchParams['customer_id']);
        }

        if (isset($searchParams['start_date'])) {
            $sql->whereDate('created_at', '>=', $searchParams['start_date']);
        }
        if (isset($searchParams['end_date'])) {
            $sql->whereDate('created_at', '<=', $searchParams['end_date']);
        }

        if (isset($searchParams['sort_name']) && in_array($searchParams['sort_name'], ['asc', 'desc'])) {
            $sql->orderBy('name', $searchParams['sort_name']);
        } else {
            $sql->orderBy('created_at', 'DESC');
        }

        if (!$paginate) {
            return $sql->get();
        }

        return $sql->paginate(config('common.paginate'));
    }

    public function getCustomersForQuotations()
    {
        return Customer::select(['id', 'name'])->get();
    }

    public function getCustomerInformation($email)
    {
        return Customer::where('email', $email)->first();
    }

    public function getCustomerDetail($customerId)
    {
        return Customer::select([
            'name',
            'phone_number',
            'email',
            'address',
            'postal_code',
            'company_name',
            'created_at',
            'status_updated_at'
        ])->where('id', $customerId)->first();
    }

    public function getCustomerById($customerId)
    {
        return Customer::select([
                'id',
                'name',
                'phone_number',
                'email',
                'address',
                'postal_code',
                'company_name',
                'created_at',
                'status_updated_at'
            ])->where('id', $customerId)->first();
    }

    public function getCustomerByPhone($customerPhone)
    {
        return Customer::select([
                'id',
                'name',
                'phone_number',
                'email',
                'address',
                'postal_code',
                'company_name'
            ])->where('phone_number', $customerPhone)->first();
    }

    public function update($customerId, $updateData)
    {
        return Customer::where('id', $customerId)->update($updateData);
    }

    public function delete($customerId)
    {
        return Customer::where('id', $customerId)->delete();
    }

    public function multiDeleteCustomer($customerId)
    {
        return Customer::whereIn('id', $customerId)->delete();
    }

    public function countCustomersNew($start, $end)
    {
        return Customer::whereBetween('created_at', [$start, $end])->count();
    }
}
