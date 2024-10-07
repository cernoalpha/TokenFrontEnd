import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    // NavigationMenuIndicator,
    // NavigationMenuViewport,
} from "@/components/ui/navigation-menu"

const NavBar = () => {
    return (
        <NavigationMenu>
            <NavigationMenuList>
                <NavigationMenuItem>
                    <NavigationMenuTrigger>Item One</NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <NavigationMenuLink>Link</NavigationMenuLink>
                    </NavigationMenuContent>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>

    )

}
export default NavBar