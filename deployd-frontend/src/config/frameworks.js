export const FRAMEWORK_CONFIG = {
    Java: {
        versions: ['11', '17', '21'],
        buildSystems: ['Maven', 'Gradle'],
        'Service': {
            'HTTP REST': {
                'Spring Boot': ['3.2.1', '3.1.2', '2.7.5'],
                'Dropwizard': ['4.0.0', '3.0.0', '2.1.4']
            },
            'gRPC': {
                'gRPC-Java': ['1.64.0', '1.56.1', '1.45.0']
            }
        }
    },
    Golang: {
        versions: ['1.22', '1.21', '1.20'],
        'Service': {
            'HTTP REST': {
                'Gin': ['1.10.0', '1.9.1', '1.8.2'],
                'Echo': ['4.12.0', '4.10.2', '4.9.0'],
                'Chi': ['5.0.12', '5.0.8']
            },
            'gRPC': {
                'gRPC-Go': ['1.64.0', '1.62.1', '1.58.3']
            }
        }
    }
};

export const initialFormData = {
    appName: '',
    language: 'Java',
    appType: 'Service',

    // Java specific
    javaVersion: FRAMEWORK_CONFIG.Java.versions[0],
    buildSystem: FRAMEWORK_CONFIG.Java.buildSystems[0],

    // Golang specific
    goVersion: FRAMEWORK_CONFIG.Golang.versions[0],

    // Service specific
    serviceType: 'HTTP REST',

    // HTTP REST specific
    framework: 'Spring Boot',
    frameworkVersion: FRAMEWORK_CONFIG.Java['Service']['HTTP REST']['Spring Boot'][0],

    // gRPC specific
    grpcFramework: 'gRPC-Java',
    grpcVersion: FRAMEWORK_CONFIG.Java['Service']['gRPC']['gRPC-Java'][0],

    // Git
    gitProvider: 'GitHub',
    repoName: ''
};
