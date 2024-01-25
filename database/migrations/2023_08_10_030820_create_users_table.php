<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('role_id')->unsigned()->nullable();
            $table->string('username', 100)->nullable();
            $table->string('name', 255)->nullable();
            $table->string('email', 255);
            $table->string('password', 255);
            $table->string('phone_number', 50)->nullable();
            $table->string('profile_picture', 255)->nullable();
            $table->string('reset_password_token', 255)->nullable();
            $table->string('token_expires_time', 255)->nullable();
            $table->datetime('created_at');
            $table->datetime('updated_at')->nullable();
            $table->softDeletes();

            $table->foreign('role_id')->references('id')->on('roles');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('users');
    }
}
