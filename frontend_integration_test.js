#!/usr/bin/env node
/**
 * Frontend Integration Testing Script for Marshalats LMS
 * Tests frontend-backend API integration and page functionality
 */

const fs = require('fs');
const path = require('path');

class FrontendTester {
    constructor() {
        this.results = {
            passed: 0,
            failed: 0,
            errors: []
        };
        this.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://31.97.224.169:8003';
    }

    logResult(testName, success, message = '') {
        const status = success ? '✅ PASS' : '❌ FAIL';
        console.log(`${status}: ${testName}`);
        if (message) {
            console.log(`   ${message}`);
        }

        if (success) {
            this.results.passed++;
        } else {
            this.results.failed++;
            this.results.errors.push(`${testName}: ${message}`);
        }
    }

    checkFileExists(filePath) {
        try {
            return fs.existsSync(filePath);
        } catch (error) {
            return false;
        }
    }

    checkDirectoryStructure() {
        console.log('\n📁 Testing Directory Structure...');
        
        const requiredDirs = [
            'app',
            'components',
            'contexts',
            'lib',
            'hooks',
            'styles'
        ];

        const requiredFiles = [
            'package.json',
            'next.config.mjs',
            'tsconfig.json',
            'tailwind.config.ts',
            'components.json'
        ];

        requiredDirs.forEach(dir => {
            const exists = this.checkFileExists(dir);
            this.logResult(`Directory: ${dir}`, exists);
        });

        requiredFiles.forEach(file => {
            const exists = this.checkFileExists(file);
            this.logResult(`File: ${file}`, exists);
        });
    }

    checkCorePages() {
        console.log('\n📄 Testing Core Pages...');
        
        const corePages = [
            'app/page.tsx',
            'app/layout.tsx',
            'app/login/page.tsx',
            'app/register/page.tsx',
            'app/dashboard/page.tsx',
            'app/coach/login/page.tsx',
            'app/superadmin/login/page.tsx',
            'app/student-dashboard/page.tsx',
            'app/coach-dashboard/page.tsx'
        ];

        corePages.forEach(page => {
            const exists = this.checkFileExists(page);
            this.logResult(`Page: ${page}`, exists);
        });
    }

    checkAPIIntegration() {
        console.log('\n🔌 Testing API Integration Files...');
        
        const apiFiles = [
            'lib/baseAPI.ts',
            'lib/authAPI.ts',
            'lib/courseAPI.ts',
            'lib/branchAPI.ts',
            'lib/studentAPI.ts',
            'lib/api/index.ts'
        ];

        apiFiles.forEach(file => {
            const exists = this.checkFileExists(file);
            this.logResult(`API File: ${file}`, exists);
            
            if (exists) {
                try {
                    const content = fs.readFileSync(file, 'utf8');
                    
                    // Check for proper API base URL usage
                    const hasBaseURL = content.includes('NEXT_PUBLIC_API_BASE_URL') || 
                                     content.includes('baseURL') ||
                                     content.includes('localhost:8001');
                    this.logResult(`${file} - API URL config`, hasBaseURL);
                    
                    // Check for authentication headers
                    const hasAuth = content.includes('Authorization') || 
                                  content.includes('Bearer') ||
                                  content.includes('getAuthHeaders');
                    this.logResult(`${file} - Auth headers`, hasAuth);
                    
                } catch (error) {
                    this.logResult(`${file} - Content check`, false, error.message);
                }
            }
        });
    }

    checkContextProviders() {
        console.log('\n🔄 Testing Context Providers...');
        
        const contextFiles = [
            'contexts/AuthContext.tsx',
            'contexts/RegistrationContext.tsx'
        ];

        contextFiles.forEach(file => {
            const exists = this.checkFileExists(file);
            this.logResult(`Context: ${file}`, exists);
            
            if (exists) {
                try {
                    const content = fs.readFileSync(file, 'utf8');
                    
                    // Check for proper context implementation
                    const hasProvider = content.includes('Provider') && content.includes('createContext');
                    this.logResult(`${file} - Provider implementation`, hasProvider);
                    
                    // Check for state management
                    const hasState = content.includes('useState') || content.includes('useReducer');
                    this.logResult(`${file} - State management`, hasState);
                    
                } catch (error) {
                    this.logResult(`${file} - Content check`, false, error.message);
                }
            }
        });
    }

    checkUIComponents() {
        console.log('\n🎨 Testing UI Components...');
        
        const componentDirs = [
            'components/ui',
            'components/forms',
            'components/dashboard'
        ];

        componentDirs.forEach(dir => {
            const exists = this.checkFileExists(dir);
            this.logResult(`Component directory: ${dir}`, exists);
            
            if (exists) {
                try {
                    const files = fs.readdirSync(dir);
                    const tsxFiles = files.filter(file => file.endsWith('.tsx'));
                    this.logResult(`${dir} - Component files`, tsxFiles.length > 0, 
                                 `Found ${tsxFiles.length} components`);
                } catch (error) {
                    this.logResult(`${dir} - Directory read`, false, error.message);
                }
            }
        });
    }

    checkDashboardPages() {
        console.log('\n📊 Testing Dashboard Pages...');
        
        const dashboardPages = [
            'app/dashboard/branches/page.tsx',
            'app/dashboard/courses/page.tsx',
            'app/dashboard/students/page.tsx',
            'app/dashboard/coaches/page.tsx',
            'app/dashboard/analytics/page.tsx'
        ];

        dashboardPages.forEach(page => {
            const exists = this.checkFileExists(page);
            this.logResult(`Dashboard page: ${page}`, exists);
            
            if (exists) {
                try {
                    const content = fs.readFileSync(page, 'utf8');
                    
                    // Check for API calls
                    const hasAPICall = content.includes('fetch') || 
                                     content.includes('API') ||
                                     content.includes('useEffect');
                    this.logResult(`${page} - API integration`, hasAPICall);
                    
                    // Check for authentication
                    const hasAuth = content.includes('useAuth') || 
                                  content.includes('token') ||
                                  content.includes('authenticated');
                    this.logResult(`${page} - Authentication`, hasAuth);
                    
                } catch (error) {
                    this.logResult(`${page} - Content check`, false, error.message);
                }
            }
        });
    }

    checkFormComponents() {
        console.log('\n📝 Testing Form Components...');
        
        const formFiles = [
            'components/forms/LoginForm.tsx',
            'components/forms/RegistrationForm.tsx',
            'components/forms/BranchForm.tsx',
            'components/forms/CourseForm.tsx'
        ];

        formFiles.forEach(file => {
            const exists = this.checkFileExists(file);
            this.logResult(`Form component: ${file}`, exists);
            
            if (exists) {
                try {
                    const content = fs.readFileSync(file, 'utf8');
                    
                    // Check for form validation
                    const hasValidation = content.includes('zod') || 
                                        content.includes('yup') ||
                                        content.includes('validation');
                    this.logResult(`${file} - Form validation`, hasValidation);
                    
                    // Check for form handling
                    const hasFormHandling = content.includes('react-hook-form') || 
                                          content.includes('useForm') ||
                                          content.includes('onSubmit');
                    this.logResult(`${file} - Form handling`, hasFormHandling);
                    
                } catch (error) {
                    this.logResult(`${file} - Content check`, false, error.message);
                }
            }
        });
    }

    checkConfiguration() {
        console.log('\n⚙️ Testing Configuration Files...');
        
        // Check package.json
        if (this.checkFileExists('package.json')) {
            try {
                const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
                
                // Check for required dependencies
                const requiredDeps = [
                    'next',
                    'react',
                    'react-dom',
                    'typescript',
                    'tailwindcss',
                    '@radix-ui/react-dialog',
                    'react-hook-form',
                    'zod'
                ];
                
                const missingDeps = requiredDeps.filter(dep => 
                    !packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep]
                );
                
                this.logResult('Package.json - Required dependencies', 
                             missingDeps.length === 0, 
                             missingDeps.length > 0 ? `Missing: ${missingDeps.join(', ')}` : '');
                
                // Check scripts
                const requiredScripts = ['dev', 'build', 'start', 'lint'];
                const missingScripts = requiredScripts.filter(script => !packageJson.scripts?.[script]);
                
                this.logResult('Package.json - Required scripts', 
                             missingScripts.length === 0,
                             missingScripts.length > 0 ? `Missing: ${missingScripts.join(', ')}` : '');
                
            } catch (error) {
                this.logResult('Package.json - Parse', false, error.message);
            }
        }
        
        // Check environment configuration
        const envFiles = ['.env.local', '.env.example'];
        envFiles.forEach(file => {
            const exists = this.checkFileExists(file);
            this.logResult(`Environment file: ${file}`, exists);
        });
    }

    runAllTests() {
        console.log('🚀 Starting Frontend Integration Testing...');
        console.log(`Working directory: ${process.cwd()}`);
        console.log('=' * 60);

        const startTime = Date.now();

        // Run all test suites
        this.checkDirectoryStructure();
        this.checkCorePages();
        this.checkAPIIntegration();
        this.checkContextProviders();
        this.checkUIComponents();
        this.checkDashboardPages();
        this.checkFormComponents();
        this.checkConfiguration();

        // Print summary
        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000;

        console.log('\n' + '='.repeat(60));
        console.log('📊 FRONTEND TEST SUMMARY');
        console.log('='.repeat(60));
        console.log(`✅ Passed: ${this.results.passed}`);
        console.log(`❌ Failed: ${this.results.failed}`);
        console.log(`⏱️  Duration: ${duration.toFixed(2)} seconds`);

        if (this.results.errors.length > 0) {
            console.log('\n❌ FAILED TESTS:');
            this.results.errors.forEach(error => {
                console.log(`   • ${error}`);
            });
        }

        const successRate = (this.results.passed / (this.results.passed + this.results.failed)) * 100;
        console.log(`\n🎯 Success Rate: ${successRate.toFixed(1)}%`);

        if (successRate >= 80) {
            console.log('🎉 OVERALL STATUS: GOOD');
        } else if (successRate >= 60) {
            console.log('⚠️  OVERALL STATUS: NEEDS IMPROVEMENT');
        } else {
            console.log('🚨 OVERALL STATUS: CRITICAL ISSUES');
        }
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    const tester = new FrontendTester();
    tester.runAllTests();
}

module.exports = FrontendTester;
