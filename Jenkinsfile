pipeline {
    agent any

    environment {
        APP_NAME = "hr-backend"
    }

    stages {

        stage('Build Docker Image') {
            steps {
                sh '''
                  docker build -t nest-backend .
                '''
            }
        }

        stage('Deploy with Docker Compose') {
            steps {
                sh '''
                  docker compose down
                  docker compose up -d
                '''
            }
        }

    }

    post {
        success {
            echo '✅ Deployment successful'
        }
        failure {
            echo '❌ Deployment failed'
        }
    }
}

