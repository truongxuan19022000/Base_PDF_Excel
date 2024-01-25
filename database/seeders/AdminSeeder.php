<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        User::create([
            'role_id' => 1,
            'username' => 'multicontract',
            'email' => 'multicontract@crm.com',
            'password' => Hash::make('123456'),
            'profile_picture' => 'https://multi-contracts.s3.ap-southeast-1.amazonaws.com/users/THkN6SNvLxXCuHXoDTkGjq7bES9bFAwybvkJYCNQ.jpg',
            'created_at' => now()
        ]);

        User::create([
            'role_id' => 1,
            'username' => 'hainv',
            'email' => 'hainv@axalize.vn',
            'password' => Hash::make('123456'),
            'profile_picture' => 'https://multi-contracts.s3.ap-southeast-1.amazonaws.com/users/THkN6SNvLxXCuHXoDTkGjq7bES9bFAwybvkJYCNQ.jpg',
            'created_at' => now()
        ]);

        User::create([
            'role_id' => 1,
            'username' => 'hieptv',
            'email' => 'hieptv@axalize.vn',
            'password' => Hash::make('123456'),
            'profile_picture' => 'https://multi-contracts.s3.ap-southeast-1.amazonaws.com/users/THkN6SNvLxXCuHXoDTkGjq7bES9bFAwybvkJYCNQ.jpg',
            'created_at' => now()
        ]);

        User::create([
            'role_id' => 2,
            'username' => 'hoanghiep',
            'email' => 'viethai.dev@gmail.com',
            'password' => Hash::make('123456'),
            'profile_picture' => 'https://multi-contracts.s3.ap-southeast-1.amazonaws.com/users/THkN6SNvLxXCuHXoDTkGjq7bES9bFAwybvkJYCNQ.jpg',
            'created_at' => now()
        ]);
    }
}
