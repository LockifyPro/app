import requests
import sys
import json
from datetime import datetime

class PasswordAndLockAPITester:
    def __init__(self, base_url="https://stylesheet-convert.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            print(f"   Status: {response.status_code}")
            
            success = response.status_code == expected_status
            details = ""
            
            if not success:
                details = f"Expected {expected_status}, got {response.status_code}"
                try:
                    error_data = response.json()
                    details += f" - {error_data.get('detail', 'No error details')}"
                except:
                    details += f" - Response: {response.text[:200]}"
            
            self.log_test(name, success, details)
            
            return success, response.json() if success and response.content else {}

        except requests.exceptions.Timeout:
            self.log_test(name, False, "Request timeout")
            return False, {}
        except requests.exceptions.ConnectionError:
            self.log_test(name, False, "Connection error")
            return False, {}
        except Exception as e:
            self.log_test(name, False, f"Error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test health endpoint"""
        success, response = self.run_test(
            "Health Check",
            "GET",
            "health",
            200
        )
        return success

    def test_api_root(self):
        """Test API root endpoint"""
        success, response = self.run_test(
            "API Root",
            "GET",
            "",
            200
        )
        return success

    def test_user_registration(self):
        """Test user registration"""
        test_email = f"test_{datetime.now().strftime('%Y%m%d_%H%M%S')}@example.com"
        test_data = {
            "email": test_email,
            "password": "TestPassword123!",
            "name": "Test User"
        }
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data=test_data
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            if 'user' in response:
                self.user_id = response['user'].get('id')
            print(f"   ✓ Token obtained: {self.token[:20]}...")
            return True
        return False

    def test_user_login(self):
        """Test user login with existing credentials"""
        # First register a user
        test_email = f"login_test_{datetime.now().strftime('%Y%m%d_%H%M%S')}@example.com"
        register_data = {
            "email": test_email,
            "password": "LoginTest123!",
            "name": "Login Test User"
        }
        
        # Register user
        success, _ = self.run_test(
            "Pre-register for Login Test",
            "POST",
            "auth/register",
            200,
            data=register_data
        )
        
        if not success:
            return False
        
        # Now test login
        login_data = {
            "email": test_email,
            "password": "LoginTest123!"
        }
        
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        return success and 'access_token' in response

    def test_get_current_user(self):
        """Test getting current user info"""
        if not self.token:
            self.log_test("Get Current User", False, "No auth token available")
            return False
            
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200
        )
        
        return success and 'email' in response

    def test_subscription_status(self):
        """Test subscription status endpoint"""
        if not self.token:
            self.log_test("Subscription Status", False, "No auth token available")
            return False
            
        success, response = self.run_test(
            "Subscription Status",
            "GET",
            "subscription/status",
            200
        )
        
        return success and 'is_pro' in response

    def test_subscription_checkout(self):
        """Test subscription checkout creation"""
        if not self.token:
            self.log_test("Subscription Checkout", False, "No auth token available")
            return False
            
        checkout_data = {
            "origin_url": "https://example.com",
            "plan": "monthly"
        }
        
        success, response = self.run_test(
            "Subscription Checkout",
            "POST",
            "subscription/checkout",
            200,
            data=checkout_data
        )
        
        return success and 'checkout_url' in response

    def test_vault_items_unauthorized(self):
        """Test vault items endpoint without Pro subscription (should fail)"""
        if not self.token:
            self.log_test("Vault Items (Unauthorized)", False, "No auth token available")
            return False
            
        success, response = self.run_test(
            "Vault Items (Should Fail - No Pro)",
            "GET",
            "vault/items",
            403  # Should fail with 403 Forbidden
        )
        
        return success

    def test_invalid_login(self):
        """Test login with invalid credentials"""
        invalid_data = {
            "email": "nonexistent@example.com",
            "password": "wrongpassword"
        }
        
        success, response = self.run_test(
            "Invalid Login",
            "POST",
            "auth/login",
            401,  # Should fail with 401 Unauthorized
            data=invalid_data
        )
        
        return success

    def test_registration_duplicate_email(self):
        """Test registration with duplicate email"""
        # Use the same email as the first registration
        if not hasattr(self, '_test_email'):
            self._test_email = f"duplicate_test_{datetime.now().strftime('%Y%m%d_%H%M%S')}@example.com"
            
            # First registration
            first_data = {
                "email": self._test_email,
                "password": "FirstPassword123!",
                "name": "First User"
            }
            
            success, _ = self.run_test(
                "First Registration (for duplicate test)",
                "POST",
                "auth/register",
                200,
                data=first_data
            )
            
            if not success:
                return False
        
        # Try to register again with same email
        duplicate_data = {
            "email": self._test_email,
            "password": "SecondPassword123!",
            "name": "Second User"
        }
        
        success, response = self.run_test(
            "Duplicate Email Registration",
            "POST",
            "auth/register",
            409,  # Should fail with 409 Conflict
            data=duplicate_data
        )
        
        return success

def main():
    print("🚀 Starting PasswordAndLock API Tests")
    print("=" * 50)
    
    tester = PasswordAndLockAPITester()
    
    # Basic API tests
    tester.test_health_check()
    tester.test_api_root()
    
    # Authentication tests
    tester.test_user_registration()
    tester.test_user_login()
    tester.test_get_current_user()
    tester.test_invalid_login()
    tester.test_registration_duplicate_email()
    
    # Subscription tests
    tester.test_subscription_status()
    tester.test_subscription_checkout()
    
    # Vault tests (should fail without Pro)
    tester.test_vault_items_unauthorized()
    
    # Print summary
    print("\n" + "=" * 50)
    print(f"📊 Test Summary: {tester.tests_passed}/{tester.tests_run} passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print(f"⚠️  {tester.tests_run - tester.tests_passed} tests failed")
        
        # Print failed tests
        print("\nFailed tests:")
        for result in tester.test_results:
            if not result['success']:
                print(f"  ❌ {result['test']}: {result['details']}")
        
        return 1

if __name__ == "__main__":
    sys.exit(main())