pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = 'dockerhub-credentials'
        IMAGE_NAME = 'prasadjagtap2515/asteshare'
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Build & Test (Lint)') {
            steps {
                bat 'npm ci'
                bat 'npm run lint'
            }
        }

        stage('Docker Build') {
            steps {
                bat "docker build -t ${IMAGE_NAME}:latest -t ${IMAGE_NAME}:${BUILD_NUMBER} ."
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: "${DOCKERHUB_CREDENTIALS}", usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    bat 'docker login -u %DOCKER_USER% -p %DOCKER_PASS%'
                    bat "docker push ${IMAGE_NAME}:latest"
                    bat "docker push ${IMAGE_NAME}:${BUILD_NUMBER}"
                }
            }
        }

        stage('Deploy to Minikube') {
            steps {
                bat 'kubectl apply -f k8s/deployment.yaml'
                bat 'kubectl apply -f k8s/service.yaml'
                bat 'kubectl rollout restart deployment/asteshare-deployment'
                bat 'kubectl rollout status deployment/asteshare-deployment --timeout=120s'
                bat 'kubectl get pods'
                bat 'kubectl get deployment'
                bat 'kubectl get svc'
            }
        }
    }

    post {
        success {
            echo "Build ${BUILD_NUMBER} deployed successfully as ${IMAGE_NAME}:${BUILD_NUMBER}"
        }
        failure {
            echo "Build ${BUILD_NUMBER} failed. Check the stage logs above."
        }
    }
}