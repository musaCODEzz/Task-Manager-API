pipeline {
    agent any

    tools {
        nodejs "node-24"   // must match the name configured in Jenkins global tools
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Test') {
            steps {
                sh 'npm test'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    // name your app and version
                    def imageName = "task-manager-api"
                    def version = "v1.0.0"

                    sh "docker build -t ${imageName}:${version} ."
                }
            }
        }
    }
}
