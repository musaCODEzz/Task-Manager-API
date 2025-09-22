pipeline {
    agent any   // This means Jenkins can run on any available agent (executor)

    stages {
        stage('Checkout') {
            steps {
                // This pulls the source code from the repo configured in Jenkins
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                // Installs all packages from package.json
                sh 'npm install'
            }
        }

        stage('Test') {
            steps {
                // Runs your Mocha tests (npm test should be defined in package.json)
                sh 'npm test'
            }
        }

        stage('Build') {
            steps {
                // Runs the build script, right now just echoes something
                sh 'npm run build'
            }
        }
    }
}
