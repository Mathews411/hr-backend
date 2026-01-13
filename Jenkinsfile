pipeline {
    agent any

    environment {
        APP_NAME = "hr-backend"
        COMPOSE_DIR = "/home/mat/hr-backend"
    }

    stages {

        stage('Build Docker Image') {
            steps {
                sh '''
                  cd $COMPOSE_DIR
                  docker build -t nest-backend .
                '''
            }
        }

        stage('Deploy with Docker Compose') {
            steps {
                sh '''
                  cd $COMPOSE_DIR
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

