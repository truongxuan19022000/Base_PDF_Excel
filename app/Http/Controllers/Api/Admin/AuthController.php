<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\AdminService;
use App\Services\MailService;
use App\Services\UserService;
use App\Services\RolePermissionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Tymon\JWTAuth\Exceptions\JWTException;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    private $adminService;
    private $mailService;
    private $userService;
    private $rolePermissionService;

    public function __construct(
        AdminService $adminService,
        MailService $mailService,
        UserService $userService,
        RolePermissionService $rolePermissionService
    ) {
        $this->adminService = $adminService;
        $this->mailService = $mailService;
        $this->userService = $userService;
        $this->rolePermissionService = $rolePermissionService;
    }

    /**
     * @OA\Post(
     *      path="/admin/login",
     *      operationId="login",
     *      tags={"Authentication"},
     *      summary="Login",
     *      @OA\RequestBody(
     *          @OA\JsonContent(
     *              @OA\Property(property="username", type="string", example="hainv"),
     *              @OA\Property(property="password", type="string", example="123456")
     *          )
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Successful login",
     *          @OA\JsonContent(
     *              @OA\Property(property="access_token", type="string"),
     *              @OA\Property(property="token_type", type="string"),
     *              @OA\Property(property="expires_in", type="integer"),
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Unauthenticated",
     *      ),
     * )
     */
    public function login(Request $request)
    {
        $credentials = $request->all();
        $validator = Validator::make($credentials, [
            'username' => 'required',
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        }

        $expireTime = Auth::guard('api')->factory()->setTTL(config('common.jwt_token_default_expires_in'));
        $token = Auth::guard('api')->attempt([
            'username' => $request->username,
            'password' => $request->password,
            'deleted_at' => null
        ]);

        if (!$token) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => trans('message.incorrect_email_password')
            ]);
        }

        $expireTime = Auth::guard('api')->factory()->getTTL();
        $auth = Auth::guard('api')->user();
        $permissions = config('role.mode');
        $roleTemp = [];
        $rolePermissions = $this->rolePermissionService->getRolePermissionByRoleId($auth->role_id);
        foreach ($rolePermissions as $rolePermission) {
            $roleTemp[] = [
                $rolePermission->permission->code => $permissions[$rolePermission->mode]
            ];
        }

        $userInformation = [
            'id' => $auth->id,
            'username' => $auth->username,
            'role_id' => $auth->role_id,
            'name' => $auth->name,
            'email' => $auth->email,
            'phone_number' => $auth->phone_number,
            'profile_picture' => $auth->profile_picture,
            'permission' => $roleTemp
        ];

        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => $expireTime,
            'user_information' => $userInformation
        ]);
    }

    /**
     * @OA\Post(
     *      path="/admin/logout",
     *      operationId="logout",
     *      tags={"Admin"},
     *      summary="Logout",
     *      security={{ "bearer":{} }},
     *      @OA\Response(
     *          response=200,
     *          description="Successfully logged out",
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Unauthenticated",
     *      ),
     * )
     */

    public function logout()
    {
        try {
            if (Auth::guard('api')->check()) {
                Auth::guard('api')->logout();
                return response()->json([
                    'status' => config('common.response_status.success'),
                    'message' => trans('message.logout_successful')
                ], 200);
            }

            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => trans('message.unauthorized')
            ], 401);
        } catch (JWTException $e) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => trans('message.logout_failed'),
            ], 200);
        }
    }

    /**
     * @OA\Post(
     *      path="/admin/forgot-password",
     *      operationId="forgot password",
     *      tags={"Authentication"},
     *      summary="Forgot Password",
     *      @OA\RequestBody(
     *          @OA\JsonContent(
     *              @OA\Property(property="email", type="string", format="email", example="hainv@axalize.vn"),
     *          )
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Successful.",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string"),
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Unauthenticated",
     *      ),
     * )
     */
    public function resetPassword(Request $request)
    {
        $rule = [
            'email' => 'required'
        ];

        $validator = Validator::make($request->all(), $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        }

        $email = $request->email;
        $checkEmailExists = $this->adminService->checkEmailExists($email);

        if (!$checkEmailExists['status']) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => trans('message.email_not_found'),
            ]);
        }

        $admin = $checkEmailExists['data'];
        $resetToken = generateResetPasswordToken();

        $storeToken = $this->adminService->storeResetTokenPassword($admin->id, $resetToken);
        if (!$storeToken['status']) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => trans('message.can_not_generate_token')
            ]);
        }

        $renewPassword = $this->mailService->renewPassword($admin, $resetToken);
        if (!$renewPassword['status']) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => trans('message.can_not_send_mail')
            ]);
        }

        return response()->json([
            'status' => config('common.response_status.success'),
            'message' => trans('message.link_has_been_sent')
        ]);
    }

    /**
     * @OA\Post(
     *      path="/admin/reset-password",
     *      tags={"Authentication"},
     *      summary="Reset Password",
     *      @OA\RequestBody(
     *          @OA\JsonContent(
     *              @OA\Property(property="reset_password_token", type="string", example=""),
     *              @OA\Property(property="new_password", type="string", format="email", example="123456"),
     *              @OA\Property(property="confirm_password", type="string", format="email", example="123456"),
     *          )
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Reset Password Successfully.",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string"),
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Unauthenticated",
     *      ),
     * )
     */
    public function recoverPassword(Request $request)
    {
        $credentials = $request->all();
        $rule = [
            'reset_password_token' => 'required',
            'new_password' => [
                'required',
                'max:50',
                Password::min(8)
                    ->mixedCase()
                    ->letters()
                    ->numbers()
                    ->symbols()
                    ->uncompromised()
            ],
            'confirm_password' => [
                'required',
                'same:new_password',
                'max:50',
                Password::min(8)
                    ->mixedCase()
                    ->letters()
                    ->numbers()
                    ->symbols()
                    ->uncompromised()
            ],
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        }

        $admin = $this->adminService->getAdminByResetToken($credentials['reset_password_token']);

        if (!$admin) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => trans('message.token_invalid')
            ]);
        }

        $admin['new_password'] = $credentials['new_password'];

        $result = $this->adminService->recoverPassword($admin['id'], $credentials['new_password']);
        if (!$result['status']) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => trans('message.recover_password_failed')
            ]);
        }

        return response()->json([
            'status' => config('common.response_status.success'),
            'message' => trans('message.recover_password_success')
        ]);
    }
}
