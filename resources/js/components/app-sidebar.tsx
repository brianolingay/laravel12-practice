import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    Folder,
    LayoutGrid,
    List,
    Receipt,
    ShieldCheck,
    Tag,
} from 'lucide-react';

import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import auditLog from '@/routes/audit-log';
import ledger from '@/routes/ledger';
import pricing from '@/routes/pricing';
import statements from '@/routes/statements';
import { type NavItem, type SharedData } from '@/types';

import AppLogo from './app-logo';

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { permissions } = usePage<SharedData>().props;
    const canManagePricing = permissions.includes('manage_pricing');

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
        {
            title: 'Ledger',
            href: ledger.index(),
            icon: List,
        },
        ...(canManagePricing
            ? [
                  {
                      title: 'Pricing',
                      href: pricing.index(),
                      icon: Tag,
                  },
              ]
            : []),
        {
            title: 'Statements',
            href: statements.index(),
            icon: Receipt,
        },
        {
            title: 'Audit Log',
            href: auditLog.index(),
            icon: ShieldCheck,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <ScrollArea className="h-full px-2">
                    <NavMain items={mainNavItems} />
                </ScrollArea>
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
            </SidebarFooter>
        </Sidebar>
    );
}
