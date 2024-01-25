<?php

namespace App\Http\Middleware;

use Closure;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;
use Tymon\JWTAuth\Exceptions\JWTException;
use Illuminate\Http\Request;

class AssignGuard
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        try {
            $tokenRole = auth()->parseToken()->getClaim('role');
            $user = auth()->guard('api')->user();
            if ($user) {
                if ($user->deleted_at != null) {
                    throw new UnauthorizedHttpException('jwt-auth');
                }
            }
        } catch (JWTException $e) {
            return $next($request);
        }
        if ($tokenRole != 'api') {
            throw new UnauthorizedHttpException('jwt-auth');
        }

        return $next($request);
    }
}
