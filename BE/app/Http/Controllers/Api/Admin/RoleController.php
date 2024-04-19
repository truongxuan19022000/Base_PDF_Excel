<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\RoleService;
use App\Services\PermissionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class RoleController extends Controller
{
    private $roleService;
    private $permissionService;

    public function __construct(
        RoleService $roleService,
        PermissionService $permissionService
    ) {
        $this->roleService = $roleService;
        $this->permissionService = $permissionService;
    }

    /**
     * @OA\Get(
     *     path="/admin/roles",
     *     tags={"Roles"},
     *     summary="Get roles",
     *     description="Get roles",
     *     security={{"bearer":{}}},
     *     @OA\Parameter(
     *          name="search",
     *          in="query",
     *          description="Search with role name",
     *          @OA\Schema(type="string"),
     *     ),
     *     @OA\Response(
     *         response="200",
     *         description="Successful operation",
     *     )
     * )
     *
     */
    public function getRoles(Request $request)
    {
        $searchParams = $request->all();
        $results = $this->roleService->getRoles($searchParams);
        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $results,
        ]);
    }

    /**
     * @OA\Post(
     *     path="/admin/roles/create",
     *     tags={"Roles"},
     *     summary="Create new role",
     *     description="Create new role",
     *     security={{"bearer":{}}},
     *     @OA\RequestBody(
     *         @OA\JsonContent(
     *             @OA\Property(property="role_name", type="string", example="Sales"),
     *             @OA\Property(property="role_setting", type="object",
     *                 @OA\Property(property="customer", type="object",
     *                     @OA\Property(property="code", type="string", example="customer"),
     *                     @OA\Property(property="create", type="integer", example=1),
     *                     @OA\Property(property="update", type="integer", example=1),
     *                     @OA\Property(property="delete", type="integer", example=1),
     *                     @OA\Property(property="send", type="integer", example=1),
     *                 ),
     *                 @OA\Property(property="quotation", type="object",
     *                     @OA\Property(property="code", type="string", example="quotation"),
     *                     @OA\Property(property="create", type="integer", example=1),
     *                     @OA\Property(property="update", type="integer", example=1),
     *                     @OA\Property(property="delete", type="integer", example=1),
     *                     @OA\Property(property="send", type="integer", example=1),
     *                 ),
     *             ),
     *         )
     *     ),
     *     @OA\Response(
     *         response="200",
     *         description="Successful",
     *     )
     * )
     *
     */
    public function createRole(Request $request)
    {
        $code = 'role_setting';
        $mode = config('role.role_mode.create');
        $this->authorize('create', [Role::class, $code, $mode]);
        $credentials = $request->all();
        $rule = [
            'role_name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('roles', 'role_name')->where(function ($query) use ($credentials) {
                    return $query->where('deleted_at', null);
                })
            ],
        ];
        $messages = [
            'role_name.unique' => 'This role name has already been taken.',
        ];

        $validator = Validator::make($credentials, $rule, $messages);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        }

        $result = $this->roleService->createRole($credentials);
        if (!$result['status']) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => trans('message.create_role_failed'),
                'data' => null
            ]);
        }

        return response()->json([
            'status' => config('common.response_status.success'),
            'message' => trans('message.create_role_success'),
            'data' => $result['data']
        ]);
    }

    /**
     * @OA\Post(
     *     path="/admin/roles/update",
     *     tags={"Roles"},
     *     summary="Update role",
     *     description="Update role",
     *     security={{"bearer":{}}},
     *     @OA\RequestBody(
     *         @OA\JsonContent(
     *             @OA\Property(property="role_id", type="integer", example="1"),
     *             @OA\Property(property="role_name", type="string", example="Sales"),
     *             @OA\Property(property="role_setting", type="object",
     *                 @OA\Property(property="customer", type="object",
     *                     @OA\Property(property="code", type="string", example="customer"),
     *                     @OA\Property(property="create", type="integer", example=1),
     *                     @OA\Property(property="update", type="integer", example=1),
     *                     @OA\Property(property="delete", type="integer", example=1),
     *                     @OA\Property(property="send", type="integer", example=1),
     *                 ),
     *                 @OA\Property(property="quotation", type="object",
     *                     @OA\Property(property="code", type="string", example="quotation"),
     *                     @OA\Property(property="create", type="integer", example=1),
     *                     @OA\Property(property="update", type="integer", example=1),
     *                     @OA\Property(property="delete", type="integer", example=1),
     *                     @OA\Property(property="send", type="integer", example=1),
     *                 ),
     *             ),
     *         )
     *     ),
     *     @OA\Response(
     *         response="200",
     *         description="Successful",
     *     )
     * )
     *
     */
    public function updateRole(Request $request)
    {
        $code = 'role_setting';
        $mode = config('role.role_mode.update');
        $this->authorize('update', [Role::class, $code, $mode]);
        $credentials = $request->all();

        $rule = [
            'role_id' => 'required',
            'role_name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('roles', 'role_name')->where(function ($query) use ($credentials) {
                    return $query->where('id', '!=', $credentials['role_id']);
                })
            ],
        ];
        $messages = [
            'role_name.unique' => 'This role name has already been taken.',
        ];

        $validator = Validator::make($credentials, $rule, $messages);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        }

        $result = $this->roleService->updateRole($credentials);
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
     * @OA\Get(
     *     path="/admin/roles/{roleId}/edit",
     *     tags={"Roles"},
     *     summary="Get role detail",
     *     description="Get role detail",
     *     security={{"bearer":{}}},
     * @OA\Parameter(
     *     name="roleId",
     *     in="path",
     *     description="ID of the role to edit",
     *     @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response="200",
     *         description="Successful.",
     *     )
     * )
     *
     */
    public function edit($roleId)
    {
        $role = $this->roleService->edit($roleId);
        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $role
        ]);
    }

    /**
     * @OA\Delete(
     *     path="/admin/roles/delete",
     *     tags={"Roles"},
     *     summary="Delete role",
     *     description="Delete role",
     *     security={{"bearer":{}}},
     * @OA\RequestBody(
     *     @OA\JsonContent(
     *         @OA\Property(property="role_id", example=1),
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
        $code = 'role_setting';
        $mode = config('role.role_mode.delete');
        $this->authorize('delete', [Role::class, $code, $mode]);
        $credentials = $request->all();
        $rule = [
            'role_id' => 'required',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        };

        $result = $this->roleService->delete($credentials['role_id']);
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
     *     path="/admin/roles/role-list",
     *     tags={"Roles"},
     *     summary="Get roles",
     *     description="Get roles",
     *     security={{"bearer":{}}},
     *     @OA\Response(
     *         response="200",
     *         description="Successful operation",
     *     )
     * )
     *
     */
    public function getRoleList(Request $request)
    {
        $results = $this->roleService->getRoleList();
        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $results,
        ]);
    }

    /**
     * @OA\Get(
     *     path="/admin/roles/permission-list",
     *     tags={"Roles"},
     *     summary="Get permissions",
     *     description="Get permissions",
     *     security={{"bearer":{}}},
     *     @OA\Response(
     *         response="200",
     *         description="Successful operation",
     *     )
     * )
     *
     */
    public function getPermissions()
    {
        $results = $this->permissionService->getPermissions();
        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $results,
        ]);
    }

    /**
     * @OA\Post(
     *     path="/admin/roles/multi-delete",
     *     tags={"Roles"},
     *     summary="Multiple delete role",
     *     description="Multiple Delete role",
     *     security={{"bearer":{}}},
     * @OA\RequestBody(
     *
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="role_id", type="array", @OA\Items(type="number"), example="1"),
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
    public function multiDeleteRole(Request $request)
    {
        $code = 'role_setting';
        $mode = config('role.role_mode.delete');
        $this->authorize('delete', [Role::class, $code, $mode]);
        $credentials = $request->all();
        $rule = [
            'role_id' => 'required|array',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        };

        $result = $this->roleService->multiDeleteRole($credentials['role_id']);
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
     *     path="/admin/roles/export",
     *     tags={"Roles"},
     *     summary="Exports list of Roles",
     *     description="Exports list of Roles.",
     *     security={{"bearer":{}}},
     *     @OA\Parameter(
     *          name="role_ids",
     *          in="query",
     *          @OA\Schema(
     *               @OA\Property(property="role_ids[0]", type="array", @OA\Items(type="number"), example="1"),
     *               @OA\Property(property="role_ids[1]", type="array", @OA\Items(type="number"), example="2"),
     *          )
     *     ),
     *     @OA\Response(
     *         response="200",
     *         description="Successful operation",
     *     )
     * )
     *
     */
    public function exportRoles(Request $request)
    {
        $credentials = $request->all();
        $roleIdsString = isset($credentials['role_ids']) ? implode(',', $credentials['role_ids']) : 'all';
        return response()->json([
            'status' => config('common.response_status.success'),
            'url' => env('APP_URL') . '/export-csv/role/' . $roleIdsString,
        ]);
    }
}
