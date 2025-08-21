import { ChevronRight, Home } from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  current?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav 
      className={cn("flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400", className)}
      aria-label="Breadcrumb"
      data-testid="breadcrumb-nav"
    >
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        {items.map((item, index) => (
          <li key={index} className="inline-flex items-center">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 mx-1 text-gray-400 dark:text-gray-600" />
            )}
            {item.href && !item.current ? (
              <Link href={item.href}>
                <a className="inline-flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {item.icon}
                  <span data-testid={`breadcrumb-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}>
                    {item.label}
                  </span>
                </a>
              </Link>
            ) : (
              <span 
                className={cn(
                  "inline-flex items-center space-x-1",
                  item.current 
                    ? "text-gray-900 dark:text-white font-medium" 
                    : "text-gray-500 dark:text-gray-400"
                )}
                data-testid={`breadcrumb-current-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// Hook to generate breadcrumbs based on current route
export function useBreadcrumbs() {
  const [location] = useLocation();
  
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      {
        label: "Home",
        href: "/",
        icon: <Home className="w-4 h-4" />
      }
    ];

    // Add breadcrumbs based on route
    if (pathSegments.length === 0) {
      breadcrumbs[0].current = true;
      return breadcrumbs;
    }

    pathSegments.forEach((segment, index) => {
      const href = '/' + pathSegments.slice(0, index + 1).join('/');
      const isLast = index === pathSegments.length - 1;
      
      let label = segment.charAt(0).toUpperCase() + segment.slice(1);
      
      // Customize labels for specific routes
      switch (segment) {
        case 'dashboard':
          label = 'Dashboard';
          break;
        case 'vehicles':
          label = 'Vehicles';
          break;
        case 'maintenance':
          label = 'Maintenance';
          break;
        case 'modifications':
          label = 'Modifications';
          break;
        case 'community':
          label = 'Community';
          break;
        case 'admin':
          label = 'Admin Panel';
          break;
        case 'profile':
          label = 'Profile';
          break;
      }

      breadcrumbs.push({
        label,
        href: isLast ? undefined : href,
        current: isLast
      });
    });

    return breadcrumbs;
  };

  return getBreadcrumbs();
}