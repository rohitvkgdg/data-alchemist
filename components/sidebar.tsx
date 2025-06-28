import { Upload, BarChart3, Table, FileText, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarHeader,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { useSidebar } from "@/components/ui/sidebar";

const navigation = [
    { name: "Upload Data", href: "/", icon: Upload },
    { name: "Data Table", href: "/data-table", icon: Table },
    { name: "Visualize", href: "/analytics", icon: BarChart3 },
    { name: "Rules", href: "/rules", icon: FileText },
];

export function AppSidebar() {
    const { state, isMobile } = useSidebar();
    const pathname = usePathname();
    
    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                {isMobile ? (
                    <div className="flex items-center justify-between p-2">
                        <h2 className="text-lg font-extrabold">Data Alchemist</h2>
                        <SidebarTrigger />
                    </div>
                ) : (
                    // Desktop behavior with collapse
                    state === "collapsed" ? (
                        <SidebarTrigger className="w-8 h-8 mt-2">
                            <span className="sr-only">Toggle Sidebar</span>
                        </SidebarTrigger>
                    ) : (
                        <div className="flex items-center justify-between p-2">
                            <h2 className="text-lg font-extrabold">Data Alchemist</h2>
                            <SidebarTrigger />
                        </div>
                    )
                )}

            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu className="flex flex-col gap-1">
                            {navigation.map((item) => (
                                <SidebarMenuItem key={item.name}>
                                    <SidebarMenuButton asChild isActive={pathname === item.href} className="py-5">
                                        <Link href={item.href}>
                                            <item.icon />
                                            <span>{item.name}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}
