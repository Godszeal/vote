import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Vote, CheckCircle, Users, Lock, BarChart3 } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Vote className="text-primary text-2xl mr-3" />
              <span className="text-xl font-bold text-gray-900">Student Elections</span>
            </div>
            <Button onClick={handleLogin} data-testid="button-login">
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Secure Student Election Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Your voice matters. Participate in student elections with complete confidence in a secure, 
            transparent, and auditable voting system.
          </p>
          <Button onClick={handleLogin} size="lg" className="text-lg px-8 py-3" data-testid="button-get-started">
            Get Started
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <Shield className="w-12 h-12 text-success mx-auto mb-4" />
              <CardTitle className="text-center">Secure & Encrypted</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Every vote is encrypted and securely stored with blockchain-level security. 
                Your privacy is guaranteed.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-center">One Person, One Vote</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Robust verification ensures each eligible voter can cast only one ballot per election.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="w-12 h-12 text-warning mx-auto mb-4" />
              <CardTitle className="text-center">Transparent Results</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Real-time result tracking with complete audit trails for full transparency.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="w-12 h-12 text-purple-500 mx-auto mb-4" />
              <CardTitle className="text-center">Voter Verification</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Automatic eligibility verification ensures only registered students can participate.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Lock className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <CardTitle className="text-center">Tamper-Proof</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Advanced security measures prevent any form of vote manipulation or tampering.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Vote className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
              <CardTitle className="text-center">User-Friendly</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Intuitive interface makes voting simple and accessible for all students.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Security Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <Shield className="w-8 h-8 text-blue-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Bank-Level Security</h3>
          <p className="text-blue-700">
            Our platform uses the same security standards as financial institutions to protect your vote 
            and personal information. All data is encrypted in transit and at rest.
          </p>
        </div>
      </div>
    </div>
  );
}
