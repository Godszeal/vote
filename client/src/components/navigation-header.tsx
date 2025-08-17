import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Vote, Shield, Settings } from "lucide-react";

export default function NavigationHeader() {
  const { user } = useAuth();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Vote className="text-primary text-2xl mr-3" />
              <span className="text-xl font-bold text-gray-900">Student Elections</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm text-gray-600">
              <Shield className="text-success mr-2 h-4 w-4" />
              <span>Secure Session</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-700" data-testid="text-user-name">
                {user?.firstName} {user?.lastName}
              </span>
              
              {user?.profileImageUrl && (
                <img 
                  className="h-8 w-8 rounded-full object-cover" 
                  src={user.profileImageUrl} 
                  alt="Profile picture"
                  data-testid="img-profile"
                />
              )}
              
              {user?.isAdmin && (
                <Link href="/admin">
                  <Button variant="ghost" size="sm" data-testid="button-admin">
                    <Settings className="h-4 w-4 mr-2" />
                    Admin
                  </Button>
                </Link>
              )}
              
              <Button variant="ghost" size="sm" onClick={handleLogout} data-testid="button-logout">
                <i className="fas fa-sign-out-alt"></i>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
