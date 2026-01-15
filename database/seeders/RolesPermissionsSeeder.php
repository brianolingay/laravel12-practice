<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RolesPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            'view_ledger',
            'manage_pricing',
            'generate_statements',
            'approve_statements',
            'export_financials',
        ];

        $permissionRecords = collect($permissions)->mapWithKeys(function (string $permission): array {
            return [$permission => Permission::firstOrCreate(['name' => $permission])];
        });

        $roles = [
            'super_admin' => $permissions,
            'tenant_admin' => $permissions,
            'account_admin' => ['view_ledger', 'generate_statements', 'export_financials'],
            'finance_viewer' => ['view_ledger', 'export_financials'],
        ];

        foreach ($roles as $roleName => $rolePermissions) {
            $role = Role::firstOrCreate(['name' => $roleName]);
            $role->permissions()->sync(
                collect($rolePermissions)
                    ->map(fn (string $name) => $permissionRecords[$name]->id)
                    ->all()
            );
        }
    }
}
