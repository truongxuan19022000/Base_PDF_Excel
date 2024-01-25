<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCustomersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name', 100);
            $table->string('email', 255);
            $table->string('phone_number', 50);
            $table->text('address');
            $table->string('postal_code', 50);
            $table->string('company_name', 255);
            $table->tinyInteger('status')->nullable();
            $table->datetime('status_updated_at')->nullable();
            $table->datetime('created_at');
            $table->datetime('updated_at')->nullable();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('customers');
    }
}
