<?php

namespace App\Http\Controllers\Api\Admin;

use App\Exports\ExportUser;
use App\Http\Controllers\Controller;
use App\Services\MailService;
use App\Services\UserService;
use App\Services\RolePermissionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Maatwebsite\Excel\Excel as ExcelExcel;
use Maatwebsite\Excel\Facades\Excel;

class UserController extends Controller
{
    private $userService;
    private $mailService;
    private $rolePermissionService;

    public function __construct(
        UserService $userService,
        MailService $mailService,
        RolePermissionService $rolePermissionService
    ) {
        $this->userService = $userService;
        $this->mailService = $mailService;
        $this->rolePermissionService = $rolePermissionService;
    }

    /**
     * @OA\Get(
     *     path="/admin/users",
     *     tags={"Users"},
     *     summary="Get a list of users",
     *     description="Get a list of all registered users.",
     *     security={{"bearer":{}}},
     *     @OA\Response(
     *         response="200",
     *         description="Successful.",
     *     )
     * )
     *
     */
    public function getUsers(Request $request)
    {
        $searchParams = $request->all();
        $results = $this->userService->getUsers($searchParams);
        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $results,
        ]);
    }

    /**
     * @OA\Post(
     *     path="/admin/users/create",
     *     tags={"Users"},
     *     summary="Create new user",
     *     description="Create new user",
     *     security={{"bearer":{}}},
     * @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="name", type="string"),
     *                 @OA\Property(property="role_id", type="string"),
     *                 @OA\Property(property="username", type="string"),
     *                 @OA\Property(property="password", type="string"),
     *                 @OA\Property(property="email", type="string", format="email"),
     *                 @OA\Property(property="profile_picture", type="file")
     *             )
     *         )
     *     ),
     * @OA\Response(
     *         response="200",
     *         description="Successful operation",
     *     )
     * )
     *
     */
    public function createUser(Request $request)
    {
        $code = 'user_management';
        $mode = config('role.role_mode.create');
        $this->authorize('create', [User::class, $code, $mode]);
        $user = $request->only([
            'name',
            'role_id',
            'username',
            'password',
            'email',
            'profile_picture',
        ]);

        $rule = [
            'name' => 'required|string|max:100',
            'role_id' => 'required|string|max:100',
            'username' => [
                'required',
                'string',
                'max:100',
                Rule::unique('users','username')
            ],
            'password' => 'required|string|max:255',
            'email' => [
                'required',
                'email',
                'string',
                'max:255',
                Rule::unique('users', 'email')->where(function ($query) {
                    return $query->whereNull('deleted_at');
                })
            ],
            'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg|max:5120',
        ];

        $validator = Validator::make($user, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        }

        if (isset($user['profile_picture'])) {
            $baseUrl = 'users';
            $imageUrl = uploadToLocalStorage($user['profile_picture'], $baseUrl);
            if (!$imageUrl) {
                return response()->json([
                    'status' => config('common.response_status.failed'),
                    'message' => trans('message.upload_image_failed')
                ]);
            }

            $user['profile_picture'] = $imageUrl;
        }

        $result = $this->userService->createUser($user);
        if (!$result['status']) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => trans('message.create_user_failed'),
                'data' => null
            ]);
        }

        $this->mailService->sendMailUserDetail($user);
        return response()->json([
            'status' => config('common.response_status.success'),
            'message' => trans('message.create_user_success'),
            'data' => $result['data']
        ]);
    }

    /**
     * @OA\Get(
     *     path="/admin/users/{userId}/edit",
     *     tags={"Users"},
     *     summary="Get user detail",
     *     description="Get user detail",
     *     security={{"bearer":{}}},
     * @OA\Parameter(
     *     name="userId",
     *     in="path",
     *     description="ID of the user to edit",
     *     @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response="200",
     *         description="Successful.",
     *     )
     * )
     *
     */
    public function edit($userId)
    {
        $user = $this->userService->getUserDetail($userId);
        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $user
        ]);
    }

    /**
     * @OA\Post(
     *     path="/admin/users/update",
     *     tags={"Users"},
     *     summary="Update user",
     *     description="Update user",
     *     security={{"bearer":{}}},
     * @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="user_id", type="integer"),
     *                 @OA\Property(property="name", type="string"),
     *                 @OA\Property(property="role_id", type="string"),
     *                 @OA\Property(property="username", type="string"),
     *                 @OA\Property(property="password", type="string"),
     *                 @OA\Property(property="email", type="string", format="email"),
     *                 @OA\Property(property="profile_picture", type="file")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response="200",
     *         description="Successful",
     *     )
     * )
     *
     */
    public function updateUser(Request $request)
    {
        $code = 'user_management';
        $mode = config('role.role_mode.update');
        $this->authorize('update', [User::class, $code, $mode]);
        $credentials = $request->all();

        $rule = [
            'user_id' => 'required',
            'name' => 'required|string|max:100',
            'role_id' => 'required|string|max:100',
            'username' => [
                'required',
                'string',
                'max:100',
                Rule::unique('users','username')->ignore($credentials['user_id'])
            ],
            'password' => 'nullable|string|max:255',
            'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg|max:5120',
            'email' => [
                'required',
                'email',
                'string',
                'max:255',
                Rule::unique('users', 'email')->where(function ($query) use ($credentials) {
                    return $query->where('id', '!=', $credentials['user_id'])->whereNull('deleted_at');
                })
            ],
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        }

        if (isset($credentials['profile_picture'])) {
            $baseUrl = 'users';
            $imageUrl = uploadToLocalStorage($credentials['profile_picture'], $baseUrl);
            if (!$imageUrl) {
                return response()->json([
                    'status' => config('common.response_status.failed'),
                    'message' => trans('message.upload_image_failed')
                ]);
            }

            $credentials['profile_picture'] = $imageUrl;
        }

        $result = $this->userService->updateUser($credentials);
        if (!$result) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => trans('message.cannot_update')
            ]);
        }

        return response()->json([
            'status' => config('common.response_status.success'),
            'message' => trans('message.update_success')
        ]);
    }

    /**
     * @OA\Delete(
     *     path="/admin/users/delete",
     *     tags={"Users"},
     *     summary="Delete user",
     *     description="Delete user",
     *     security={{"bearer":{}}},
     * @OA\RequestBody(
     *
     *     @OA\JsonContent(
     *         @OA\Property(property="user_id", example=1),
     *     )
     * ),
     * @OA\Response(
     *         response="200",
     *         description="Successful.",
     *     )
     * )
     *
     */
    public function delete(Request $request)
    {
        $code = 'user_management';
        $mode = config('role.role_mode.delete');
        $this->authorize('delete', [User::class, $code, $mode]);
        $credentials = $request->all();
        $rule = [
            'user_id' => 'required',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        };

        $result = $this->userService->delete($credentials['user_id']);
        if (!$result) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => trans('message.delete_failed')
            ]);
        }

        return response()->json([
            'status' => config('common.response_status.success'),
            'message' => trans('message.delete_success')
        ]);
    }

    /**
     * @OA\Post(
     *     path="/admin/users/multi-delete",
     *     tags={"Users"},
     *     summary="Multiple delete user",
     *     description="Multiple Delete user",
     *     security={{"bearer":{}}},
     * @OA\RequestBody(
     *
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="user_id", type="array", @OA\Items(type="number"), example="1"),
     *             )
     *         )
     *     ),
     * @OA\Response(
     *         response="200",
     *         description="Successful.",
     *     )
     * )
     *
     */
    public function multiDeleteUser(Request $request)
    {
        $credentials = $request->all();
        $rule = [
            'user_id' => 'required|array',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        };

        $result = $this->userService->multiDeleteUser($credentials['user_id']);
        if (!$result) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => trans('message.delete_failed')
            ]);
        }

        return response()->json([
            'status' => config('common.response_status.success'),
            'message' => trans('message.delete_success')
        ]);
    }

    /**
     * @OA\Get(
     *     path="/admin/users/profile",
     *     tags={"Users"},
     *     summary="Get profile",
     *     description="Get profile",
     *     security={{"bearer":{}}},
     *     @OA\Response(
     *         response="200",
     *         description="Successful.",
     *     )
     * )
     *
     */
    public function getUserInformation()
    {
        $auth = \Illuminate\Support\Facades\Auth::guard('api')->user();
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
            'status' => config('common.response_status.success'),
            'data' => $userInformation,
        ]);
    }

    /**
     * @OA\Get(
     *     path="/admin/users/export",
     *     tags={"Users"},
     *     summary="Export list of Users",
     *     description="Export list of Users.",
     *     security={{"bearer":{}}},
     *     @OA\Parameter(
     *          name="search",
     *          in="query",
     *          description="Search with name, username, email",
     *          @OA\Schema(type="string"),
     *     ),
     *     @OA\Parameter(
     *          name="sort_name",
     *          in="query",
     *          description="asc, desc, latest",
     *          @OA\Schema(type="string"),
     *          example="latest"
     *     ),
     *     @OA\Parameter(
     *          name="role_id",
     *          in="query",
     *          @OA\Schema(
     *               @OA\Property(property="role_id[0]", type="array", @OA\Items(type="number"), example="1"),
     *               @OA\Property(property="role_id[1]", type="array", @OA\Items(type="number"), example="2"),
     *          )
     *     ),
     *     @OA\Response(
     *         response="200",
     *         description="Successful operation",
     *     )
     * )
     *
     */
    public function exportUsers(Request $request)
    {
        $searchs = $request->all();
        return Excel::download(new ExportUser($searchs), 'users.csv', ExcelExcel::CSV);
    }
}
